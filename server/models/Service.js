import mongoose from "mongoose";

export const SERVICE_CATEGORIES = ["Hair", "Nails", "Makeup", "Facials", "Other"];

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 60,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    durationMins: {
      type: Number,
      required: true,
      min: 10,
      max: 300,
    },
    category: {
      type: String,
      enum: SERVICE_CATEGORIES,
      required: true,
      default: "Other",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// unique per category
serviceSchema.index({ name: 1, category: 1 }, { unique: true });
serviceSchema.index({ category: 1, isActive: 1 });

const Service = mongoose.model("Service", serviceSchema);
export default Service;
