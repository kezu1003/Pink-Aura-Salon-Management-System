import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        price: Number,
        qty: Number,
        subtotal: Number,
      },
    ],
    totalQty: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "cancelled", "fulfilled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
