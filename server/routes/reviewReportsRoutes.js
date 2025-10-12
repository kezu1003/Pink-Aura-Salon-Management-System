import express from "express";
import { requireAuth, requireRole } from "../middleware/userAuth.js";
import { generateReviewReport } from "../controllers/reviewReportsController.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole("admin"));

// Review report endpoint
router.get("/report", generateReviewReport);

export default router;
