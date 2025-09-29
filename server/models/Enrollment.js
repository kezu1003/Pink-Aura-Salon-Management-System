import mongoose from "mongoose";
import { enrollmentConnection } from "../config/db.js"; 

const enrollmentSchema = new mongoose.Schema(
{
    courseID: {
        type: String,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
    name: { //username 
        type: String, 
        required: true 
    },
    courseName: {
        type: String,
        required: true,
    },
    email: { type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        index: true 
    },
},
{ timestamps: true }
);

const Enrollment = enrollmentConnection.model("Enrollment", enrollmentSchema); // use enrollmentConnection

export default Enrollment;