import express from 'express';
import userAuth from '../middleware/userAuth.js';
import {
  isAuthenticated, login, logout, register, resetPassword,
  sendResetOtp, sendVerifyOtp, verifyEmail, me, adminStaffLogin,
  staffRegister // ✅ NEW
} from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/staff-register', staffRegister); // staff self-register
authRouter.post('/login', login);                  // customer login (unchanged)
authRouter.post('/admin-login', adminStaffLogin);  // admin/staff login with role select
authRouter.post('/logout', logout);

authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', userAuth, isAuthenticated);
authRouter.get('/me', userAuth, me);

authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);

export default authRouter;
