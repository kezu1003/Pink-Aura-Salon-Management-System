import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      required: true,
      enum: ["Hair", "Skin", "Makeup", "Nails", "Spa", "Other"],
      index: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

ReviewSchema.index({ staff: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ category: 1, rating: -1 });

export default mongoose.model("Review", ReviewSchema);
