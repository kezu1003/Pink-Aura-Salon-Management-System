import fs from "fs";
import path from "path";
import Review from "../models/Review.js";
import { v2 as cloudinary } from "cloudinary";

const USE_CLOUDINARY =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

function isAdmin(user) {
  if (!user?.role) return false;
  return String(user.role).toLowerCase().includes("admin");
}

// --- CREATE ---
export async function createReview(req, res) {
  try {
    const { rating, title, comment, anonymous = false, category, tags = {}, media = [] } = req.body;

    // Basic validation (keep server dependency-free)
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Invalid rating" });
    if (!title || title.length < 2 || title.length > 80) return res.status(400).json({ success: false, message: "Invalid title" });
    if (!comment || comment.length < 2 || comment.length > 2000) return res.status(400).json({ success: false, message: "Invalid comment" });
    if (media?.length > 4) return res.status(400).json({ success: false, message: "Max 4 media files" });

    const userName = req.user?.name || req.user?.username || "User";
    const userId = req.user?._id || req.user?.id;

    const review = await Review.create({
      user: { id: userId, name: userName },
      anonymous: !!anonymous,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      category,
      tags: { staffIds: Array.isArray(tags?.staffIds) ? tags.staffIds : [] },
      media,
      status: "approved", // auto-approve by default
    });

    return res.json({ success: true, review });
  } catch (err) {
    console.error("createReview error", err);
    return res.status(500).json({ success: false, message: "Failed to create review" });
  }
}

// --- LIST PUBLIC ---
export async function listPublicReviews(req, res) {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = "newest",
      rating,
      category,
      staffId,
      hasMedia,
      q,
    } = req.query;

    const filter = { status: "approved" };
    if (rating) {
      const arr = String(rating)
        .split(",")
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => n >= 1 && n <= 5);
      if (arr.length) filter.rating = { $in: arr };
    }
    if (category) filter.category = category;
    if (staffId) filter["tags.staffIds"] = staffId;
    if (hasMedia === "true") filter.media = { $exists: true, $not: { $size: 0 } };
    if (q) filter.$text = { $search: q };

    const sort = sortBy === "rating" ? { rating: -1, createdAt: -1 } : { createdAt: -1 };

    const docs = await Review.find(filter).sort(sort).skip((page - 1) * limit).limit(Number(limit));
    const totalDocs = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: docs.map(sanitizePublic),
      page: Number(page),
      totalPages: Math.ceil(totalDocs / limit),
      totalDocs,
    });
  } catch (err) {
    console.error("listPublicReviews error", err);
    res.status(500).json({ success: false, message: "Failed to load reviews" });
  }
}

// Hide private fields for anonymous users on PUBLIC endpoints
function sanitizePublic(r) {
  const obj = r.toObject({ virtuals: true });
  if (obj.anonymous) obj.user = { name: "Anonymous" }; // keep id hidden
  else obj.user = { name: obj.user?.name || "User" };
  return obj;
}

// --- LIST MINE ---
export async function listMyReviews(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { page = 1, limit = 12 } = req.query;
    const filter = { "user.id": userId };

    const docs = await Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));

    const totalDocs = await Review.countDocuments(filter);
    res.json({
      success: true,
      data: docs,
      page: Number(page),
      totalPages: Math.ceil(totalDocs / limit),
      totalDocs,
    });
  } catch (err) {
    console.error("listMyReviews error", err);
    res.status(500).json({ success: false, message: "Failed to load my reviews" });
  }
}

// --- UPDATE (owner or admin) ---
export async function updateReview(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    const isOwner = String(review.user.id) === String(req.user?._id || req.user?.id);
    if (!isOwner && !isAdmin(req.user)) return res.status(403).json({ success: false, message: "Forbidden" });

    // editable fields
    const editable = ["rating", "title", "comment", "anonymous", "category", "media", "tags"];
    for (const k of editable) if (k in body) review[k] = body[k];

    if (review.media?.length > 4) return res.status(400).json({ success: false, message: "Max 4 media files" });

    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    console.error("updateReview error", err);
    res.status(500).json({ success: false, message: "Failed to update review" });
  }
}

// --- DELETE (owner soft-delete or admin hard) ---
export async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    const hard = req.query.hard === "true";

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    const owner = String(review.user.id) === String(req.user?._id || req.user?.id);
    if (hard) {
      if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: "Admin only" });
      // delete provider media if any
      await deleteMediaBatch(review.media);
      await Review.deleteOne({ _id: id });
      return res.json({ success: true, message: "Review deleted" });
    } else {
      if (!owner && !isAdmin(req.user)) return res.status(403).json({ success: false, message: "Forbidden" });
      review.status = "hidden";
      await review.save();
      return res.json({ success: true, message: "Review hidden" });
    }
  } catch (err) {
    console.error("deleteReview error", err);
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
}

// --- ADMIN LIST ---
export async function adminListReviews(req, res) {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: "Admin only" });

    const {
      page = 1,
      limit = 20,
      sortBy = "newest",
      rating,
      category,
      staffId,
      hasMedia,
      q,
      status, // approved|pending|hidden
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (rating) {
      const arr = String(rating).split(",").map((n) => parseInt(n.trim(), 10)).filter((n) => n >= 1 && n <= 5);
      if (arr.length) filter.rating = { $in: arr };
    }
    if (category) filter.category = category;
    if (staffId) filter["tags.staffIds"] = staffId;
    if (hasMedia === "true") filter.media = { $exists: true, $not: { $size: 0 } };
    if (q) filter.$text = { $search: q };

    const sort = sortBy === "rating" ? { rating: -1, createdAt: -1 } : { createdAt: -1 };

    const docs = await Review.find(filter).sort(sort).skip((page - 1) * limit).limit(Number(limit));
    const totalDocs = await Review.countDocuments(filter);

    res.json({ success: true, data: docs, page: Number(page), totalPages: Math.ceil(totalDocs / limit), totalDocs });
  } catch (err) {
    console.error("adminListReviews error", err);
    res.status(500).json({ success: false, message: "Failed to load admin reviews" });
  }
}

// --- ADMIN SET STATUS ---
export async function adminSetStatus(req, res) {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: "Admin only" });
    const { id } = req.params;
    const { status } = req.body;
    if (!["approved", "hidden", "pending"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    res.json({ success: true, review });
  } catch (err) {
    console.error("adminSetStatus error", err);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
}

// --- UPLOAD MEDIA ---
export async function handleUploadResult(req, res) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file" });

    if (USE_CLOUDINARY) {
      // already uploaded in middleware to Cloudinary; info on req.file.uploaded
      return res.json({ success: true, media: req.file.uploaded });
    } else {
      // Local file info
      const fileUrl = `/uploads/${req.file.filename}`;
      const type = req.file.mimetype.startsWith("video/") ? "video" : "image";
      return res.json({
        success: true,
        media: { type, url: fileUrl, providerId: "", thumbnailUrl: "" },
      });
    }
  } catch (err) {
    console.error("handleUploadResult error", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
}

async function deleteMediaBatch(mediaArr = []) {
  if (!mediaArr.length) return;
  if (!USE_CLOUDINARY) return; // local files left as-is to avoid deleting unrelated files accidentally
  const ids = mediaArr.map((m) => m.providerId).filter(Boolean);
  for (const pid of ids) {
    try {
      await cloudinary.uploader.destroy(pid, { resource_type: "image" });
      await cloudinary.uploader.destroy(pid, { resource_type: "video" });
    } catch (e) {
      // ignore best-effort
    }
  }
}
