import express from "express";
import userAuth, { requireAnyRole } from "../middleware/userAuth.js";
import { me } from "../controllers/authController.js";

const router = express.Router();

router.use(userAuth, requireAnyRole("admin", "staff"));

router.get("/me", me);

export default router;
