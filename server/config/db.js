import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

export const eventConnection = mongoose.createConnection(process.env.MONGO_URI);
export const courseConnection = mongoose.createConnection(process.env.MONGO_URI2);
export const enrollmentConnection = mongoose.createConnection(process.env.MONGO_URI3);

export const connectDB = async () => {
    try {
        const eventConnection = await mongoose.createConnection(process.env.MONGO_URI);
        console.log("Event DB connected!");

        const courseConnection = await mongoose.createConnection(process.env.MONGO_URI2);
        console.log("Course DB connected!");

        const enrollmentConnection = await mongoose.createConnection(process.env.MONGO_URI3);
        console.log("Enrollment DB connected!");

        // You can export these connections if needed
        return { eventConnection, courseConnection, enrollmentConnection };
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        process.exit(1);
    }
};

