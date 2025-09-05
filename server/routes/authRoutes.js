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
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Public auth
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Staff register (sets role="staff" and returns user)
router.post("/staff-register", staffRegister);

// Admin/Staff login (enforces role)
router.post("/admin-staff-login", adminStaffLogin);

// Me (needs logged-in user)
router.get("/me", userAuth, me);

// Email OTP / reset
router.post("/send-verify-otp", userAuth, sendVerifyOtp);
router.post("/verify-email", userAuth, verifyEmail);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

export default router;
