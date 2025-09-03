import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import {
  createReview,
  listPublicReviews,
  listMyReviews,
  updateReview,
  deleteReview,
  adminListReviews,
  adminSetStatus,
  handleUploadResult,
} from "../controllers/reviewsController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// ----- Storage config -----
const USE_CLOUDINARY =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

let upload;
if (USE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Store to tmp and immediately upload in a custom middleware
  const mem = multer({ dest: "tmp/" });
  upload = mem.single("file");

  // intercept and upload to Cloudinary
  router.post("/upload", userAuth, upload, async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "No file" });
      const type = req.file.mimetype.startsWith("video/") ? "video" : "image";
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "salon-reviews",
      });
      // cleanup tmp
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      req.file.uploaded = {
        type,
        url: result.secure_url,
        providerId: result.public_id,
        thumbnailUrl: result?.eager?.[0]?.secure_url || "",
        width: result.width,
        height: result.height,
        duration: result.duration,
      };
      next();
    } catch (e) {
      console.error("Cloudinary upload error", e);
      return res.status(500).json({ success: false, message: "Upload failed" });
    }
  }, handleUploadResult);

} else {
  // Local uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = file.originalname.split(".").pop();
      cb(null, unique + "." + ext);
    },
  });
  upload = multer({ storage }).single("file");
  router.post("/upload", userAuth, upload, handleUploadResult);
}

// ----- Public -----
router.get("/", listPublicReviews);

// ----- Auth -----
router.get("/mine", userAuth, listMyReviews);
router.post("/", userAuth, createReview);
router.patch("/:id", userAuth, updateReview);
router.delete("/:id", userAuth, deleteReview);

// ----- Admin (uses userAuth then checks role inside controller) -----
router.get("/admin", userAuth, adminListReviews);
router.patch("/admin/:id/status", userAuth, adminSetStatus);

export default router;
