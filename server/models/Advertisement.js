import mongoose from "mongoose";

const { Schema } = mongoose;

const advertisementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    image: { type: String, required: true }, // filename under /uploads/ads
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: Boolean, default: true, index: true }, // true = active
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export default mongoose.model("Advertisement", advertisementSchema);
