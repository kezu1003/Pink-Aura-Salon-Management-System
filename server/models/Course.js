import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    instructorName: { type: String, required: true },
    location: { type: String, required: true },
    schedule: { type: String, required: true },
    // optional category used by your UI filters
    category: { type: String },
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
export default Course;
