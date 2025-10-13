import LoyaltyAccount from "../models/LoyaltyAccount.js";
import LoyaltyTier from "../models/LoyaltyTier.js";
import LoyaltyTxn from "../models/LoyaltyTxn.js";

export async function upsertAccount(userId, session) {
  const [account] = await LoyaltyAccount.find({ user: userId }).session(session);
  if (account) return account;
  return LoyaltyAccount.create([{ user: userId }], { session }).then((arr) => arr[0]);
}

// Evaluate tier based on rolling 12m spend
export async function evaluateTier(account, session) {
  const tiers = await LoyaltyTier.find({ isActive: true }).sort({ minSpendRolling12m: 1 }).session(session);
  let chosen = null;
  for (const t of tiers) {
    if (account.rolling12mSpend >= t.minSpendRolling12m) chosen = t;
    else break;
  }
  account.tier = chosen?._id || account.tier || null;
  account.lastEvaluatedAt = new Date();
  await account.save({ session });
  return chosen;
}

// Add an earn transaction (idempotent by source/type)
export async function awardOnPaidOrder({ userId, orderId, orderAmountLKR }, session) {
  const account = await upsertAccount(userId, session);
  const tier = account.tier ? await LoyaltyTier.findById(account.tier).session(session) : null;

  const earnRate = tier?.earnRate ?? 0.01; // default: 1 point per 100 LKR
  const points = Math.floor(orderAmountLKR * earnRate);

  if (points <= 0) return { points: 0 };

  // Create ledger row; if duplicate (already awarded), ignore
  try {
    await LoyaltyTxn.create(
      [{ account: account._id, type: "earn", points, amountLKR: orderAmountLKR, source: "order", sourceId: String(orderId) }],
      { session }
    );
  } catch (e) {
    if (e.code === 11000) return { points: 0, duplicate: true }; // already earned for this order
    throw e;
  }

  account.pointsBalance += points;
  account.lifetimePoints += points;
  account.rolling12mSpend += orderAmountLKR;
  await account.save({ session });

  const newTier = await evaluateTier(account, session);
  return { points, tier: newTier };
}
