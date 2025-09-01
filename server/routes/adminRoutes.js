import express from "express";
import { authUser, requireAdmin } from "../middleware/userAuth.js";

const router = express.Router();

// Admin-only routes
router.get("/dashboard", authUser, requireAdmin, (req, res) => {
  res.json({ success: true, message: "Welcome to Admin Dashboard" });
});

export default router;
