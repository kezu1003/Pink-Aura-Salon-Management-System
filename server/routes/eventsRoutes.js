import express from "express";
import {
  createEvents,
  deleteEvents,
  getAllEvents,
  updateEvents,
  getEventById,
  searchEvents,
} from "../controllers/eventsController.js";

const router = express.Router();

// IMPORTANT: Search route before "/:id"
router.get("/search", searchEvents);

router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", createEvents);
router.put("/:id", updateEvents);
router.delete("/:id", deleteEvents);

export default router;
