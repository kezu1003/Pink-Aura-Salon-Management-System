import { Router } from "express";
import userAuth, { requireAnyRole, requireRole } from "../middleware/userAuth.js";
import {
  getAvailability,
  createAppointment,
  myAppointments,
  updateAppointment,
  cancelAppointment,
} from "../controllers/appointmentsController.js";

const router = Router();


router.use(userAuth);

// availability for a service on a date

router.get("/availability", getAvailability);

router.get("/me", requireAnyRole("customer", "admin", "staff"), myAppointments);
router.post("/", requireAnyRole("customer", "admin"), createAppointment);
router.patch("/:id", requireAnyRole("customer", "admin"), updateAppointment);
router.delete("/:id", requireAnyRole("customer", "admin"), cancelAppointment);

export default router;
