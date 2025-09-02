import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail, me, adminStaffLogin } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);                 // customer login (unchanged path)
authRouter.post('/admin-login', adminStaffLogin); // ✅ new: admin/staff login with role select
authRouter.post('/logout', logout);

authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', userAuth, isAuthenticated);

// ✅ new: profile for any logged user (customer/staff/admin)
authRouter.get('/me', userAuth, me);

authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);

export default authRouter;
