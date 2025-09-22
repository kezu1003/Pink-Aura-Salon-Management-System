import mongoose from "mongoose";
import { courseConnection } from "../config/db.js"; 

const courseSchema = new mongoose.Schema(
{
    courseName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    instructorName: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    schedule: {
        type: String,
        required: true,
    }
},
{ timestamps: true }
);

const Course = courseConnection.model("Course", courseSchema); // use courseConnection

export default Course;