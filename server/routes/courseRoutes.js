import express from "express";
import {
  createCourses,
  deleteCourses,
  getAllCourses,
  updateCourses,
  getCourseById,
  searchCourses,
} from "../controllers/courseController.js";

const router = express.Router();

// IMPORTANT: Search route before "/:id"
router.get("/search", searchCourses);

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/", createCourses);
router.put("/:id", updateCourses);
router.delete("/:id", deleteCourses);

export default router;
