import "dotenv/config";
import mongoose from "mongoose";
import LoyaltyTier from "../models/LoyaltyTier.js";

const MONGO = process.env.MONGO_URL;

async function run() {
  await mongoose.connect(MONGO);
  const defaults = [
    { name: "Silver",   minSpendRolling12m: 50000,  earnRate: 0.01, redeemRate: 1, maxRedeemPctPerOrder: 20, perks: "Standard benefits" },
    { name: "Gold",     minSpendRolling12m: 150000, earnRate: 0.0125, redeemRate: 1, maxRedeemPctPerOrder: 25, perks: "Priority booking" },
    { name: "Platinum", minSpendRolling12m: 300000, earnRate: 0.015, redeemRate: 1, maxRedeemPctPerOrder: 30, perks: "VIP perks" },
  ];
  for (const t of defaults) {
    await LoyaltyTier.updateOne({ name: t.name }, { $set: t }, { upsert: true });
  }
  console.log("Seeded tiers");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
