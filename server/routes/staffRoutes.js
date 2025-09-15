// server/routes/staffRoutes.js
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
import { addTimeOff, removeTimeOff, listTimeOff } from "../controllers/staffTimeOffController.js";

const router = express.Router();

// must be logged in and be staff or supplier
router.use(userAuth, requireAnyRole("staff", "supplier"));

router.get("/me", staffMe);

// staff
router.get("/schedule", listSchedule);
router.get("/services", listServices);
router.get("/announcements", listAnnouncements);
router.post("/inventory/requests", createInventoryRequest);

// appointments
router.post("/appointments/:id/start", startAppointment);
router.post("/appointments/:id/complete", completeAppointment);

// supplier
router.get("/suppliers/pos", listPOs);
router.post("/suppliers/pos/:id/fulfill", fulfillPO);

router.get("/time-off", listTimeOff);
router.post("/time-off", addTimeOff);
router.delete("/time-off/:id", removeTimeOff);

export default router;
