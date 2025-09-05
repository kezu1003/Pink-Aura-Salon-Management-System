import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export default async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ success: false, message: "No auth token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(payload.id).lean();
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      role: user.role,
      staffType: user.staffType || null,
    };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid session" });
  }
}
