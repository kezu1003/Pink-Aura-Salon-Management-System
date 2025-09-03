import express from "express";
import { checkout } from "../controllers/ordersController.js";
import { requireAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/checkout", requireAuth, checkout);

export default router;
