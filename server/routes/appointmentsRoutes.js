import express from "express";
import userAuth from "../middleware/userAuth.js";
import { listMine, listAdmin, createAppointment, updateAppointment, cancelAppointment, markPaidAndConfirm } from "../controllers/appointmentsController.js";
import { slotsForDate } from "../controllers/availabilityController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();


router.get("/slots", userAuth, slotsForDate);

// customer

router.get("/mine", userAuth, listMine);
router.post("/", userAuth, createAppointment);
router.patch("/:id", userAuth, updateAppointment);
router.delete("/:id", userAuth, cancelAppointment);

// admin & receptionist 
router.get("/", userAuth, listAdmin);
router.post("/:id/mark-paid", userAuth, markPaidAndConfirm);

export default router;
