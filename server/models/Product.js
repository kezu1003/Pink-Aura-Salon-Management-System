import mongoose from "mongoose";

const { Schema } = mongoose;

export const BRANDS = [
  "Seren Cosmetics",
  "Basicare",
  "Maybelline",
  "L'Oreal",
  "Dove",
  "Dr. Rashel",
  "Aussie",
  "Femfresh",
  "Anua",
  "CeraVe",
  "Banana Boat",
  "Boots",
];

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "Hair Care Products",
        "Nail Care Products",
        "Skincare Products",
        "Makeup Products",
      ],
      required: true,
    },
    brand: { type: String, enum: BRANDS, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    images: [{ type: String }],
    stock: { type: Number, required: true, min: 0 },
    expiryDate: { 
      
      type: Date,
      validate: {
      validator(v) {
      if (!v) return true;
      const startOfToday = new Date();
      startOfToday.setHours(0,0,0,0);
      return v >= startOfToday;
    },
    message: "Expiry date cannot be in the past.",
  },
},
    skinType: {
      type: String,
      enum: [
        "All Skin Types",
        "Dry Skin",
        "Oily Skin", 
        "Combination Skin",
        "Sensitive Skin",
        "Normal Skin",
        "Mature Skin",
        "Acne-Prone Skin"
      ],
      default: "All Skin Types"
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);




// Virtual field: days left until expiry
productSchema.virtual("expiryDaysLeft").get(function () {
  if (!this.expiryDate) return null;
  const today = new Date();
  const diff = this.expiryDate - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

export default mongoose.model("Product", productSchema);
