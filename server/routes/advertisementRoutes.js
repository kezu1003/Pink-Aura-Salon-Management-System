import express from "express";
import userAuth, { requireRole } from "../middleware/userAuth.js";
import {
  listAds,
  getAd,
  createAd,
  updateAd,
  deleteAd,
} from "../controllers/advertisementController.js";
import { uploadAdImage, handleMulterError } from "../middleware/upload.js";

const router = express.Router();

// All ad routes are admin-only
router.use(userAuth, requireRole("admin"));

router.get("/", listAds);
router.get("/:id", getAd);
router.post("/", uploadAdImage, handleMulterError, createAd);
router.put("/:id", uploadAdImage, handleMulterError, updateAd);
router.delete("/:id", deleteAd);

export default router;
