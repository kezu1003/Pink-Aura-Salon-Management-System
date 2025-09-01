import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const orderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", default: null },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, trim: true }
    },
    items: [
      {
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        sku: String,
        name: String,
        price: Number,       // snapshot (salePrice || price at time)
        qty: { type: Number, min: 1 }
      }
    ],
    subtotal: { type: Number, min: 0 },
    tax: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0 },
    status: { type: String, enum: ["pending", "paid", "cancelled", "fulfilled"], default: "pending" },
    payment: {
      method: { type: String, enum: ["cash", "card", "online", "none"], default: "none" },
      txnId: String,
      paidAt: Date
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
