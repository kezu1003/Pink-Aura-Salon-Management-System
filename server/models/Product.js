import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    expiryDate: { type: Date },       
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Derived fields for clients
const EXPIRY_SOON_DAYS = 30;
productSchema.virtual("inStock").get(function () {
  return this.stock > 0 && this.status === "active";
});
productSchema.virtual("expiresInMs").get(function () {
  return this.expiryDate ? Math.max(0, this.expiryDate.getTime() - Date.now()) : null;
});
productSchema.virtual("isExpiringSoon").get(function () {
  if (!this.expiryDate) return false;
  const diff = this.expiryDate.getTime() - Date.now();
  return diff > 0 && diff <= EXPIRY_SOON_DAYS * 24 * 60 * 60 * 1000;
});
productSchema.index({ name: "text", description: "text", brand: "text", category: "text", sku: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
