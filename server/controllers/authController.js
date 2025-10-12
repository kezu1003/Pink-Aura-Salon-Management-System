import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';
import { capsFor } from '../config/capabilities.js';

//  sign token with role
const signAuthToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role || "customer",
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// Allowed staff job titles for self-registration
const ALLOWED_TITLES = [
  "Facial Artist",
  "Hair dresser",
  "Nail Artist",
  "Makeup Artist",
  "Event Stylist",
];

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing Details' });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword, // role defaults to "customer"
    });

    const token = signAuthToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send welcome email 
    try {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Welcome to Pink Aura',
        text: `Welcome to Pink Aura. Your account has been created with email id: ${email}`,
      };
      await transporter.sendMail(mailOptions);
    } catch (e) {
      console.error('Welcome email failed:', e.message);
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle || "",
        permissions: [],
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Staff self-registration

export const staffRegister = async (req, res) => {
  const { name, email, password, jobTitle } = req.body;

  if (!name || !email || !password || !jobTitle) {
    return res.json({ success: false, message: 'Missing details' });
  }
  if (!ALLOWED_TITLES.includes(jobTitle)) {
    return res.json({ success: false, message: 'Invalid job title' });
  }

  try {
    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashed,
      role: 'staff',
      jobTitle,
      isAccountVerified: true
    });

    const perms = capsFor(user);
    user.permissions = perms;
    await user.save();

    const token = signAuthToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: 'Staff registered successfully', user: {
      id: user._id, name: user.name, email: user.email, role: user.role,
      jobTitle: user.jobTitle || "", permissions: perms
    }});
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: 'Invalid email' });

    if (user.role !== 'customer') {
      return res.json({
        success: false,
        message: 'Please use the Staff/Admin login portal for this account.',
        code: 'WRONG_PORTAL'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: 'Invalid password' });

    if (user.status === "suspended") {
      return res.json({ success: false, message: "Account suspended. Contact admin." });
    }

    const perms = capsFor(user);
    user.permissions = perms;
    user.lastLoginAt = new Date();
    await user.save();

    const token = signAuthToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle || "",
        permissions: perms,
        isAccountVerified: user.isAccountVerified,
        status: user.status,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      path: '/'
    });
    
    
    res.clearCookie('authToken', { path: '/' });
    res.clearCookie('jwt', { path: '/' });
    
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
   
    console.error("Logout error:", error);
    return res.json({ success: true, message: "Logged out" });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account verification OTP',
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };
    await transporter.sendMail(mailOption);

    res.json({ success: true, message: 'Verification OTP sent on email' });
  } catch (error) {
    res.json({ success: false, messsage: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId;
  if (!userId || !otp) return res.json({ success: false, message: 'Missing Details' });

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: 'User not found' });

    if (user.verifyOtp === '' || user.verifyOtp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP Expired' });
    }

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: 'Email verifie successfully.' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const isAuthenticated = async (_req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email is required' });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: 'User not found' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset OTP',
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };
    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: ' OTP sent to your email' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: 'Email, OTP and New password are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: 'User not found' });

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP Expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: 'Password been reset successfully' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).lean();
    if (!user) return res.json({ success: false, message: "User not found" });

    const perms = capsFor(user);
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle || "",
        permissions: perms,
        status: user.status,
        isAccountVerified: user.isAccountVerified,
        lastLoginAt: user.lastLoginAt || null,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Admin/Staff specific login with role selection enforcement

export const adminStaffLogin = async (req, res) => {
  const { email, password, role } = req.body; 
  if (!email || !password || !role) {
    return res.json({ success: false, message: "Email, password and role are required" });
  }
  if (!["admin", "staff"].includes(role)) {
    return res.json({ success: false, message: "Invalid role" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "Invalid email" });

    if (user.role !== role) {
      return res.json({ success: false, message: `This account is not ${role}.` });
    }
    if (user.status === "suspended") {
      return res.json({ success: false, message: "Account suspended. Contact admin." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ success: false, message: "Invalid password" });

    const perms = capsFor(user);
    user.permissions = perms;
    user.lastLoginAt = new Date();
    await user.save();

    const token = signAuthToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle || "",
        permissions: perms,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
