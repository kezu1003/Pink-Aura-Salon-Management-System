import mongoose from "mongoose";
const { Schema } = mongoose;

const loyaltyTierSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    minSpendRolling12m: { type: Number, required: true, min: 0 }, // LKR
    earnRate: { type: Number, required: true, min: 0 },           // points per LKR (e.g., 0.01 => 1 point per 100 LKR)
    redeemRate: { type: Number, required: true, min: 0 },         // LKR per point 
    maxRedeemPctPerOrder: { type: Number, default: 20, min: 0, max: 100 },
    perks: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

loyaltyTierSchema.index({ isActive: 1, minSpendRolling12m: 1 });

export default mongoose.model("LoyaltyTier", loyaltyTierSchema);
