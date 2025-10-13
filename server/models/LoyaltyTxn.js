import mongoose from "mongoose";
const { Schema } = mongoose;

const loyaltyTxnSchema = new Schema(
  {
    account: { type: Schema.Types.ObjectId, ref: "LoyaltyAccount", required: true, index: true },
    type: { type: String, enum: ["earn", "redeem", "expire", "adjust", "reversal"], required: true },
    points: { type: Number, required: true }, // negative for redemption/reversal
    currency: { type: String, default: "LKR" },
    amountLKR: { type: Number, default: 0 },   // order value for earn; discount value for redeem
    source: { type: String, enum: ["order", "appointment", "admin", "system"], default: "system" },
    sourceId: { type: String },                // order/appointment id 
    note: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "user" }, // nullable for system/webhook
  },
  { timestamps: true }
);

// ensure idempotency for earn/reversal from same source
loyaltyTxnSchema.index({ type: 1, source: 1, sourceId: 1 }, { unique: true, partialFilterExpression: { sourceId: { $exists: true } } });

export default mongoose.model("LoyaltyTxn", loyaltyTxnSchema);
