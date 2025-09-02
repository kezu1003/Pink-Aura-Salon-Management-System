import userModel from "../models/userModel.js";

// List staff (admin only). Supports q, role, status, pagination.
export const listStaff = async (req, res) => {
  try {
    const { q = "", role, status, page = 1, limit = 10 } = req.query;
    const filter = {
      role: { $in: ["staff", "admin"] }, // list both by default
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? { $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }] }
        : {}),
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      userModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        lastLoginAt: u.lastLoginAt || null,
      })),
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Create staff/admin user
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, role = "staff" } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing details" });
    }
    if (!["staff", "admin"].includes(role)) {
      return res.json({ success: false, message: "Role must be staff or admin" });
    }
    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    // hash password using bcryptjs
    const bcrypt = await import("bcryptjs");
    const hashed = await bcrypt.default.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashed,
      role,
      isAccountVerified: true, // optional for staff/admin
    });

    res.json({ success: true, id: user._id });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update role/status
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, status } = req.body;

    const update = {};
    if (name) update.name = name;
    if (role) {
      if (!["staff", "admin"].includes(role)) return res.json({ success: false, message: "Invalid role" });
      update.role = role;
    }
    if (status) {
      if (!["active", "suspended"].includes(status)) return res.json({ success: false, message: "Invalid status" });
      update.status = status;
    }

    const saved = await userModel.findByIdAndUpdate(id, update, { new: true });
    if (!saved) return res.json({ success: false, message: "User not found" });

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Activate/Suspend quick endpoint
export const setStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) return res.json({ success: false, message: "Invalid status" });

    const saved = await userModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!saved) return res.json({ success: false, message: "User not found" });

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
