import express from "express";
import { createCourses, deleteCourses, getAllCourses, updateCourses, getCourseById, searchCourses } from "../controllers/courseController.js";

const router = express.Router();

// IMPORTANT: Search route MUST come before /:id route
router.get("/search", searchCourses);

// Existing routes
router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/", createCourses);
router.put("/:id", updateCourses);
router.delete("/:id", deleteCourses);

export default router;