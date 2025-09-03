import mongoose from "mongoose";

const { Schema } = mongoose;

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
    brand: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    images: [{ type: String }],
    stock: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date },
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
