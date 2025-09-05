import express from "express";
import userAuth, { requireRole } from "../middleware/userAuth.js";
import {
  createReview,
  listReviews,
  updateOwnReview,
  deleteReview,
  exportReportCsv,
} from "../controllers/reviewsController.js";

const router = express.Router();

//  logged in to read/write reviews
router.use(userAuth);

router.get("/", listReviews);
router.post("/", createReview);
router.patch("/:id", updateOwnReview);
router.delete("/:id", deleteReview);


router.get("/report.csv", requireRole("admin"), exportReportCsv);

export default router;
