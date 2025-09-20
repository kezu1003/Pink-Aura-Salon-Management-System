import mongoose from "mongoose";
import Service, { SERVICE_CATEGORIES } from "./Service.js";

const seasonalOfferSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    label: { type: String, trim: true, default: "" },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, default: "", maxlength: 2000 },

    // list of service names included 

    servicesIncluded: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.every((s) => typeof s === "string" && s.trim().length > 0),
        message: "servicesIncluded must be a non-empty array of strings",
      },
    },

    category: { type: String, enum: [...SERVICE_CATEGORIES, "Other"], default: "Other", index: true },

    price: { type: Number, required: true, min: 0 },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          if (v == null) return true;
          return v < this.price;
        },
        message: "discountPrice must be less than price",
      },
    },

    estimatedTimeMins: { type: Number, min: 10, max: 600, default: 60 },

    image: { type: String, default: "" },

    popularityScore: { type: Number, default: 0, min: 0 },

    seasonalOffer: { type: seasonalOfferSchema, default: () => ({}) },

    isActive: { type: Boolean, default: true, index: true },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// unique per category to avoid duplicates 
packageSchema.index({ name: 1, category: 1 }, { unique: true });

const Package = mongoose.model("Package", packageSchema);
export default Package;
