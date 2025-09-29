import express from "express";
import { createEnrollments, deleteEnrollments, getAllEnrollments, updateEnrollments, getEnrollmentById, searchEnrollments } from "../controllers/enrollmentController.js";

const router = express.Router();

// IMPORTANT: Search route MUST come before /:id route
router.get("/search", searchEnrollments);

// Existing routes
router.get("/", getAllEnrollments);
router.get("/:id", getEnrollmentById);
router.post("/", createEnrollments);
router.put("/:id", updateEnrollments);
router.delete("/:id", deleteEnrollments);

export default router;