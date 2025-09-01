import express from "express";
import { checkout } from "../controllers/checkoutController.js";
import { authOptional } from "../middleware/userAuth.js"; 

const router = express.Router();

router.post("/", authOptional, checkout);

export default router;
