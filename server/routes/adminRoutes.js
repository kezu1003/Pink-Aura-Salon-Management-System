import express from "express";
import userAuth, { requireRole } from "../middleware/userAuth.js";
import { listStaff, createStaff, updateStaff, setStatus } from "../controllers/staffController.js";
import { appointmentsOverview } from "../controllers/reportsController.js";
import { listAppointmentsAdmin } from "../controllers/appointmentsController.js";

const router = express.Router();

router.use(userAuth, requireRole("admin")); // every route below requires admin

router.get("/staff", listStaff);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.patch("/staff/:id/status", setStatus);

// Appointments (admin)
router.get("/appointments", listAppointmentsAdmin);

export default router;
