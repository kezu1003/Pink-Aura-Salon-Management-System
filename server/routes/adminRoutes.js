import express from "express";
import userAuth, { requireRole } from "../middleware/userAuth.js";
import { listStaff, createStaff, updateStaff, setStatus } from "../controllers/staffController.js";
import { appointmentsOverview, appointmentsOverviewPdf } from "../controllers/appointmentReportsController.js";

const router = express.Router();

router.use(userAuth, requireRole("admin")); // every route below requires admin

router.get("/staff", listStaff);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.patch("/staff/:id/status", setStatus);

router.get("/appointment-reports/overview", appointmentsOverview);
router.get("/appointment-reports/overview.pdf", appointmentsOverviewPdf);

export default router;
