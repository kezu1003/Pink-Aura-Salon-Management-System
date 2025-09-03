import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    providerId: { type: String, default: "" }, // Cloudinary public_id or ""
    thumbnailUrl: { type: String, default: "" },
    width: Number,
    height: Number,
    duration: Number,
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
      name: { type: String, required: true }, // snapshot from token
    },
    anonymous: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, trim: true, minlength: 2, maxlength: 80, required: true },
    comment: { type: String, trim: true, minlength: 2, maxlength: 2000, required: true },
    category: {
      type: String,
      enum: ["Service", "Cleanliness", "Price", "Ambience", "Products", "Other"],
      default: "Service",
    },
    tags: {
      staffIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],
    },
    media: { type: [mediaSchema], default: [] }, // max 4 (enforced in controller)
    status: { type: String, enum: ["approved", "pending", "hidden"], default: "approved", index: true },
  },
  { timestamps: true }
);

// Useful indexes
reviewSchema.index({ rating: 1, category: 1, "tags.staffIds": 1, status: 1, createdAt: -1 });
// Text search for q=...
reviewSchema.index({ title: "text", comment: "text" });

export default mongoose.model("Review", reviewSchema);
