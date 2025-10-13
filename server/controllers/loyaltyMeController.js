import LoyaltyAccount from "../models/LoyaltyAccount.js";
import LoyaltyTxn from "../models/LoyaltyTxn.js";

export const getMySummary = async (req, res) => {
  const account = await LoyaltyAccount.findOne({ user: req.user.id })
    .populate("tier")
    .lean();

  if (!account) {
    return res.json({
      pointsBalance: 0,
      lifetimePoints: 0,
      rolling12mSpend: 0,
      tier: null,
    });
  }
  res.json({
    pointsBalance: account.pointsBalance,
    lifetimePoints: account.lifetimePoints,
    rolling12mSpend: account.rolling12mSpend,
    tier: account.tier
      ? { name: account.tier.name, perks: account.tier.perks, maxRedeemPctPerOrder: account.tier.maxRedeemPctPerOrder }
      : null,
  });
};

export const getMyTxns = async (req, res) => {
  const { limit = 10, cursor } = req.query;
  const account = await LoyaltyAccount.findOne({ user: req.user.id }).lean();
  if (!account) return res.json({ items: [], nextCursor: null });

  const query = { account: account._id };
  if (cursor) query._id = { $lt: cursor }; 

  const items = await LoyaltyTxn.find(query)
    .sort({ _id: -1 })
    .limit(Number(limit))
    .lean();

  const nextCursor = items.length === Number(limit) ? items[items.length - 1]._id : null;
  res.json({ items, nextCursor });
};

//  validate allowed redemption on server
export const previewRedeem = async (req, res) => {
  const { cartSubtotal = 0, pointsRequested = 0 } = req.body;
  const account = await LoyaltyAccount.findOne({ user: req.user.id }).populate("tier").lean();
  const balance = account?.pointsBalance || 0;
  const tier = account?.tier;

  let allowedByBalance = Math.max(0, Math.min(balance, Math.floor(pointsRequested)));
  if (!tier) return res.json({ allowedPoints: Math.min(allowedByBalance, Math.floor(cartSubtotal * 0.2)) });

  const cap = Math.floor((cartSubtotal * (tier.maxRedeemPctPerOrder ?? 20)) / (tier.redeemRate || 1));
  res.json({ allowedPoints: Math.max(0, Math.min(allowedByBalance, cap)) });
};
