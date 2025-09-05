import mongoose from "mongoose";
import Review from "../models/Review.js";
import User from "../models/userModel.js";


function toCsv(rows) {
  if (!rows?.length) return "";
  const headers = Object.keys(rows[0]);
  const escapeCell = (v) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return s.includes(",") || s.includes("\n") ? `"${s}"` : s;
  };
  const out = [headers.join(",")];
  for (const r of rows) out.push(headers.map((h) => escapeCell(r[h])).join(","));
  return out.join("\n");
}

// POST /api/reviews
export async function createReview(req, res) {
  const { staff, category, rating, comment } = req.body;
  if (!staff || !category || !rating)
    return res.status(400).json({ success: false, message: "Missing fields" });


  // Ensure staff exists and is allowed role
 const staffUser = await User.findOne({ _id: staff, role: 'staff' });
 
  if (!staffUser) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid staff member" });
  }

  const doc = await Review.create({
    user: req.user.id,
    staff,
    category,
    rating,
    comment,
  });
  const populated = await doc.populate([{ path: "user", select: "name role" }, { path: "staff", select: "name role" }]);
  res.json({ success: true, review: populated });
}


export async function listReviews(req, res) {
  const { category, staffId, mine, search, sort } = req.query;
  const q = {};
  if (category) q.category = category;
  if (staffId && mongoose.isValidObjectId(staffId)) q.staff = staffId;
  if (mine === "1" && req.user?.id) q.user = req.user.id;
  if (search) q.comment = { $regex: search, $options: "i" };

  let c = Review.find(q)
    .populate([{ path: "user", select: "name role" }, { path: "staff", select: "name role" }]);
  if (sort === "rating") c = c.sort({ rating: -1, createdAt: -1 });
  else c = c.sort({ createdAt: -1 });

  const reviews = await c.exec();

  // mark ownership for client convenience
  const userId = req.user?.id || "";
  const payload = reviews.map((r) => ({
    ...r.toObject(),
    isOwner: String(r.user?._id) === String(userId),
  }));
  res.json({ success: true, reviews: payload });
}

//  owner only
export async function updateOwnReview(req, res) {
  const { id } = req.params;
  const { rating, comment, category, staff } = req.body;

  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ success: false, message: "Not found" });
  if (String(review.user) !== req.user.id)
    return res.status(403).json({ success: false, message: "Not your review" });

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  if (category !== undefined) review.category = category;
  if (staff !== undefined) {
    const staffUser = await User.findOne({
      _id: staff,
      role: { $nin: ["receptionist", "supplier"] },
    });
    if (!staffUser) return res.status(400).json({ success: false, message: "Invalid staff member" });
    review.staff = staff;
  }

  await review.save();
  const populated = await review.populate([{ path: "user", select: "name role" }, { path: "staff", select: "name role" }]);
  res.json({ success: true, review: populated });
}

// DELETE 
export async function deleteReview(req, res) {
  const { id } = req.params;
  const r = await Review.findById(id);
  if (!r) return res.status(404).json({ success: false, message: "Not found" });
  const isOwner = String(r.user) === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin)
    return res.status(403).json({ success: false, message: "Forbidden" });
  await r.deleteOne();
  res.json({ success: true });
}

// GET
export async function exportReportCsv(req, res) {
  const { from, to, category, staffId } = req.query;
  const q = {};
  if (category) q.category = category;
  if (staffId && mongoose.isValidObjectId(staffId)) q.staff = staffId;
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      q.createdAt.$lte = end;
    }
  }

  const rows = await Review.find(q)
    .populate([{ path: "user", select: "name" }, { path: "staff", select: "name" }])
    .lean();

  const data = rows.map((r) => ({
    id: r._id.toString(),
    createdAt: r.createdAt?.toISOString() ?? "",
    user: r.user?.name ?? "-",
    userId: r.user?._id?.toString() ?? "-",
    staff: r.staff?.name ?? "-",
    staffId: r.staff?._id?.toString() ?? "-",
    category: r.category,
    rating: r.rating,
    comment: (r.comment || "").replace(/\n/g, " "),
  }));

  const csv = toCsv(data);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=reviews_report.csv");
  res.send(csv);
}
