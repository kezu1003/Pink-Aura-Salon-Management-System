import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    venue: { type: String, required: true },
    // optional category used by your UI filters
    category: { type: String },
  },
  { timestamps: true }
);

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
export default Event;
