import express from "express";
import {
  register,
  login,
  logout,
  staffRegister,      
  adminStaffLogin,     
  me,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
  isAuthenticated
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Public auth
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Staff routes
router.post("/staff-register", staffRegister);
router.post("/admin-staff-login", adminStaffLogin);

// Protected routes
router.get("/me", userAuth, me);
router.get("/is-auth", userAuth, isAuthenticated);

// Email OTP / reset
router.post("/send-verify-otp", userAuth, sendVerifyOtp);
router.post("/verify-email", userAuth, verifyEmail);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

export default router;