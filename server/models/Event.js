import mongoose from "mongoose";
import { eventConnection } from "../config/db.js"; // import the correct connection

const eventSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    venue: {
        type: String,
        required: true,
    }
},
{ timestamps: true }
);

const Event = eventConnection.model("Event", eventSchema); // use eventConnection

export default Event;