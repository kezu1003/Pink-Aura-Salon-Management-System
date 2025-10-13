import mongoose from "mongoose";
const { Schema } = mongoose;

const loyaltyAccountSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", unique: true, required: true },
    tier: { type: Schema.Types.ObjectId, ref: "LoyaltyTier" },
    pointsBalance: { type: Number, default: 0 },
    lifetimePoints: { type: Number, default: 0 },
    rolling12mSpend: { type: Number, default: 0 }, // LKR
    lastEvaluatedAt: { type: Date },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("LoyaltyAccount", loyaltyAccountSchema);
