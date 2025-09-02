import userModel from "../models/userModel.js";

// Allowed job titles for staff specialization
const ALLOWED_TITLES = [
  "Facial Artist",
  "Hairdresser",
  "Nail Artist",
  "Makeup Artist",
  "Event Stylist",
  "" // allow empty to clear / leave unset
];

// List staff (admin only). Supports q, role, status, jobTitle, pagination.
export const listStaff = async (req, res) => {
  try {
    const { q = "", role, status, jobTitle, page = 1, limit = 10 } = req.query;

    const filter = {
      role: { $in: ["staff", "admin"] }, // list both by default
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(jobTitle ? { jobTitle } : {}),
      ...(q
        ? { $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }] }
        : {}),
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      userModel
        .find(filter, { name: 1, email: 1, role: 1, status: 1, jobTitle: 1, lastLoginAt: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      userModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        jobTitle: u.jobTitle || "",
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

// Create staff/admin user (admin only)
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, role = "staff", jobTitle = "" } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing details" });
    }
    if (!["staff", "admin"].includes(role)) {
      return res.json({ success: false, message: "Role must be staff or admin" });
    }
    if (role === "staff" && !ALLOWED_TITLES.includes(jobTitle)) {
      return res.json({ success: false, message: "Invalid jobTitle" });
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
      jobTitle: role === "staff" ? jobTitle : "", // admins don't need jobTitle
      isAccountVerified: true, // optional: skip verification for staff/admin
      status: "active",
    });

    res.json({ success: true, id: user._id });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update staff/admin user (name, role, status, jobTitle)
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, status, jobTitle } = req.body;

    const update = {};
    if (name) update.name = name;

    if (role) {
      if (!["staff", "admin"].includes(role)) {
        return res.json({ success: false, message: "Invalid role" });
      }
      update.role = role;
      // If promoting to admin, drop jobTitle automatically
      if (role === "admin") update.jobTitle = "";
    }

    if (status) {
      if (!["active", "suspended"].includes(status)) {
        return res.json({ success: false, message: "Invalid status" });
      }
      update.status = status;
    }

    if (jobTitle !== undefined) {
      if (!ALLOWED_TITLES.includes(jobTitle)) {
        return res.json({ success: false, message: "Invalid jobTitle" });
      }
      update.jobTitle = jobTitle;
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

    if (!["active", "suspended"].includes(status)) {
      return res.json({ success: false, message: "Invalid status" });
    }

    const saved = await userModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!saved) return res.json({ success: false, message: "User not found" });

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
