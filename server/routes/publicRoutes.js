import express from "express";
import userAuth from "../middleware/userAuth.js";
import User from "../models/userModel.js";

const router = express.Router();

/**
    Static categories for the form & filters.
 */

router.get("/review-categories", (_req, res) => {
  res.json({
    success: true,
    categories: ["Hair", "Skin", "Makeup", "Nails", "Spa", "Other"],
  });
});


router.get("/staff-for-reviews", userAuth, async (_req, res) => {
  const staff = await User.find({ role: 'staff' })
  .select('name _id role')
  .sort({ name: 1 })
  .lean();
res.json({ success: true, staff });
});

export default router;
