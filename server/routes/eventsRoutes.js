import express from "express";
import { createEvents, deleteEvents, getAllEvents, updateEvents, getEventById, searchEvents } from "../controllers/eventsController.js";

const router = express.Router();

// IMPORTANT: Search route MUST come before /:id route
router.get("/search", searchEvents);

// Existing routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", createEvents);
router.put("/:id", updateEvents);
router.delete("/:id", deleteEvents);

export default router;