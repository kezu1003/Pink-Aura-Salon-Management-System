import mongoose from "mongoose";

const unavailabilitySchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    reason: { type: String, default: "" }
  },
  { timestamps: true }
);

unavailabilitySchema.index({ staff: 1, startTime: 1, endTime: 1 });

const Unavailability = mongoose.model("Unavailability", unavailabilitySchema);
export default Unavailability;
