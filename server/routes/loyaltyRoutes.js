import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getMySummary, getMyTxns, previewRedeem } from "../controllers/loyaltyMeController.js";

const router = express.Router();

router.get("/me", userAuth, getMySummary);
router.get("/me/txns", userAuth, getMyTxns);
router.post("/redeem/preview", userAuth, previewRedeem);

export default router;
