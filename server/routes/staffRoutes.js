import express from "express";
import userAuth, { requireAnyRole } from "../middleware/userAuth.js";
import {
  staffMe,
  listSchedule,
  startAppointment,
  completeAppointment,
  listAnnouncements,
  createInventoryRequest,
  listPOs,
  fulfillPO,
  listServices,
} from "../controllers/staffDashController.js";

import { addUnavailability } from "../controllers/appointmentsController.js";

const router = express.Router();

// must be logged in and be staff or supplier
router.use(userAuth, requireAnyRole("staff", "supplier"));

router.get("/me", staffMe);

// staff
router.get("/schedule", listSchedule);
router.get("/services", listServices);
router.get("/announcements", listAnnouncements);
router.post("/inventory/requests", createInventoryRequest);

// mark unavailable (staff)
router.post("/unavailability", addUnavailability);

// appointments
router.post("/appointments/:id/start", startAppointment);
router.post("/appointments/:id/complete", completeAppointment);

// supplier
router.get("/suppliers/pos", listPOs);
router.post("/suppliers/pos/:id/fulfill", fulfillPO);

export default router;
