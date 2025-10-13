import express from "express";
import userAuth from "../middleware/userAuth.js";
import { capsFor } from "../config/capabilities.js";
import { listTiers, createTier, updateTier, deleteTier, searchAccounts, adjustPoints } from "../controllers/loyaltyAdminController.js";

const requireLoyaltyAdmin = (req, res, next) => {
  const caps = capsFor(req.user?.role || "customer");
  if (!caps?.includes("loyalty:admin")) return res.status(403).json({ message: "Forbidden" });
  next();
};

const router = express.Router();
router.use(userAuth, requireLoyaltyAdmin);

router.get("/tiers", listTiers);
router.post("/tiers", createTier);
router.put("/tiers/:id", updateTier);
router.delete("/tiers/:id", deleteTier);

router.get("/accounts", searchAccounts);
router.post("/accounts/:id/adjust", adjustPoints);

export default router;
