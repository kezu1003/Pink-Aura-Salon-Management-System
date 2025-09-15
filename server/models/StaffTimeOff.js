import mongoose from "mongoose";

const staffTimeOffSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, 
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true, index: true },
    reason: { type: String, default: "" },
  },
  { timestamps: true }
);

staffTimeOffSchema.index({ staff: 1, start: 1, end: 1 });

const StaffTimeOff = mongoose.model("StaffTimeOff", staffTimeOffSchema);
export default StaffTimeOff;
