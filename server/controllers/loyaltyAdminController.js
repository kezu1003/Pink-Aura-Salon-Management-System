import LoyaltyTier from "../models/LoyaltyTier.js";
import LoyaltyAccount from "../models/LoyaltyAccount.js";
import LoyaltyTxn from "../models/LoyaltyTxn.js";

/* ---------- helpers ---------- */
const toNum = (v, def = 0) => {
  if (v === "" || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const isMissing = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

/* ---------- TIERS (ADMIN) ---------- */

export const listTiers = async (_req, res) => {
  try {
    const rows = await LoyaltyTier.find().sort({ minSpendRolling12m: 1 }).lean();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to list tiers" });
  }
};

export const createTier = async (req, res) => {
  try {
    const {
      name,
      minSpendRolling12m,
      earnRate,
      redeemRate,
      maxRedeemPctPerOrder,
      perks,
      isActive,
    } = req.body || {};

    // Required fields
    if (isMissing(name) || isMissing(minSpendRolling12m) || isMissing(earnRate) || isMissing(redeemRate)) {
      return res.status(400).json({
        message: "Missing required fields: name, minSpendRolling12m, earnRate, redeemRate",
      });
    }

    // Sanitize & bounds
    const payload = {
      name: String(name).trim(),
      minSpendRolling12m: Math.max(0, toNum(minSpendRolling12m, 0)),
      earnRate: Math.max(0, toNum(earnRate, 0.01)),       // points per LKR
      redeemRate: Math.max(0, toNum(redeemRate, 1)),      // LKR per point
      maxRedeemPctPerOrder: Math.min(100, Math.max(0, toNum(maxRedeemPctPerOrder, 20))),
      perks: perks ?? "",
      isActive: typeof isActive === "boolean" ? isActive : true,
    };

    const doc = await LoyaltyTier.create(payload);
    res.json(doc);
  } catch (e) {
    // duplicate name -> 409 conflict
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Tier name already exists" });
    }
    res.status(500).json({ message: e.message || "Failed to create tier" });
  }
};

export const updateTier = async (req, res) => {
  try {
    const {
      name,
      minSpendRolling12m,
      earnRate,
      redeemRate,
      maxRedeemPctPerOrder,
      perks,
      isActive,
    } = req.body || {};

    // Build $set only with provided fields
    const set = {};
    if (!isMissing(name)) set.name = String(name).trim();
    if (!isMissing(minSpendRolling12m)) set.minSpendRolling12m = Math.max(0, toNum(minSpendRolling12m));
    if (!isMissing(earnRate)) set.earnRate = Math.max(0, toNum(earnRate));
    if (!isMissing(redeemRate)) set.redeemRate = Math.max(0, toNum(redeemRate));
    if (!isMissing(maxRedeemPctPerOrder))
      set.maxRedeemPctPerOrder = Math.min(100, Math.max(0, toNum(maxRedeemPctPerOrder)));
    if (perks !== undefined) set.perks = perks ?? "";
    if (isActive !== undefined) set.isActive = Boolean(isActive);

    const doc = await LoyaltyTier.findByIdAndUpdate(
      req.params.id,
      { $set: set },
      { new: true, runValidators: true }
    );

    if (!doc) return res.status(404).json({ message: "Tier not found" });
    res.json(doc);
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Tier name already exists" });
    }
    res.status(500).json({ message: e.message || "Failed to update tier" });
  }
};

export const deleteTier = async (req, res) => {
  try {
    const deleted = await LoyaltyTier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Tier not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to delete tier" });
  }
};

/* ---------- ACCOUNTS (ADMIN) ---------- */

export const searchAccounts = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const match = q
      ? { $or: [{ "user.name": new RegExp(q, "i") }, { "user.email": new RegExp(q, "i") }] }
      : {};

    const results = await LoyaltyAccount.aggregate([
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $match: match },
      { $lookup: { from: "loyaltytiers", localField: "tier", foreignField: "_id", as: "tier" } },
      { $unwind: { path: "$tier", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          pointsBalance: 1,
          lifetimePoints: 1,
          rolling12mSpend: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "tier.name": 1,
        },
      },
      { $limit: 50 },
    ]);

    res.json(results);
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to search accounts" });
  }
};

export const adjustPoints = async (req, res) => {
  try {
    const { id } = req.params; // LoyaltyAccount _id
    let { points = 0, note = "" } = req.body || {};

    // enforce integer points (typical loyalty behavior)
    points = Math.trunc(Number(points) || 0);

    const account = await LoyaltyAccount.findById(id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    const session = await LoyaltyAccount.startSession();
    await session.withTransaction(async () => {
      account.pointsBalance += points;
      if (points > 0) account.lifetimePoints += points;
      await account.save({ session });

      await LoyaltyTxn.create(
        [
          {
            account: account._id,
            type: "adjust",
            points,
            note: String(note || ""),
            createdBy: req.user?.id || undefined,
          },
        ],
        { session }
      );
    });
    session.endSession();

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to adjust points" });
  }
};
