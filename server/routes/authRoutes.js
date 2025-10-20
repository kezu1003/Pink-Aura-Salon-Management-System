import express from "express";
import {
  register,
  login,
  logout,
  me,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
  isAuthenticated,
} from "../controllers/authController.js";


import requireAuth from "../middleware/userAuth.js";

const router = express.Router();

/* Public auth */
router.post("/register", register);     
router.post("/login", login);           
router.post("/logout", logout);

/* Protected (session) */
router.get("/me", requireAuth, me);
router.get("/is-auth", requireAuth, isAuthenticated);

/* Email OTP / reset */
router.post("/send-verify-otp", requireAuth, sendVerifyOtp);
router.post("/verify-email", requireAuth, verifyEmail);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);


router.post("/staff-register", (_req, res) =>
  res.status(410).json({
    success: false,
    message: "Staff self-registration is disabled. Ask an admin to create your account.",
  })
);

router.post("/admin-staff-login", (req, res) => res.redirect(307, "/api/auth/login"));

export default router;
