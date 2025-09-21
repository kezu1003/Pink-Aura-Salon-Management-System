import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { monthlyServiceReport, monthlyServiceReportPdf } from "../controllers/serviceReportsController.js";

const router = express.Router();

function requireAdminOrReceptionist(req, res, next) {
  const role = req?.user?.role || "customer";
  if (role === "admin" || role === "receptionist") return next();
  return res.status(403).json({ success: false, message: "Forbidden" });
}

// JSON 
router.get("/services/monthly", requireAuth, requireAdminOrReceptionist, monthlyServiceReport);

// PDF (download)
router.get("/services/monthly/pdf", requireAuth, requireAdminOrReceptionist, monthlyServiceReportPdf);

export default router;
