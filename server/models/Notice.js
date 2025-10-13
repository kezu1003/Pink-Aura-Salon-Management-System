import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["general", "meeting", "training", "inventory", "feedback", "schedule", "policy", "urgent"],
      default: "general"
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetRoles: { type: [String], default: ["staff"] }, // Can target specific roles
  },
  { timestamps: true }
);

NoticeSchema.index({ isActive: 1, expiresAt: 1 });
NoticeSchema.index({ priority: 1, createdAt: -1 });

export default mongoose.model("Notice", NoticeSchema);
