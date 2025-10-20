import userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const RAW_TITLES = [
  'Facial Artist',
  'Hair dresser',   
  'Hairdresser',    // normalize to "Hair dresser"
  'Nail Artist',
  'Makeup Artist',
  'Event Stylist',
];

// Normalize 
const normalizeJobTitle = (input) => {
  if (!input) return '';
  const t = String(input).trim();
  if (t.toLowerCase() === 'hairdresser') return 'Hair dresser';
  return RAW_TITLES.includes(t) ? t : '';
};

export const listStaff = async (req, res) => {
  try {
    const { q = '', role, status, jobTitle, page = 1, limit = 10 } = req.query;

    const filter = {
      role: { $in: ['staff', 'admin'] }, 
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(jobTitle ? { jobTitle } : {}),
      ...(q
        ? { $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] }
        : {}),
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      userModel
        .find(filter, {
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          jobTitle: 1,
          lastLoginAt: 1,
          createdAt: 1,
        })
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
        jobTitle: u.jobTitle || '',
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

// Admin creates staff 
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, role = 'staff', jobTitle = '' } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: 'Missing details' });
    }
    if (!['staff', 'admin'].includes(role)) {
      return res.json({ success: false, message: 'Role must be staff or admin' });
    }

    const normalized = normalizeJobTitle(jobTitle);
    if (role === 'staff' && !normalized) {
      return res.json({ success: false, message: 'Invalid jobTitle' });
    }

    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashed,
      role,
      jobTitle: role === 'staff' ? normalized : '',
      isAccountVerified: true,
      status: 'active',
    });

    res.json({ success: true, id: user._id });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, status, jobTitle } = req.body;

    const meId = req.userId;
    const me = req.user?.role;

    const update = {};
    if (name) update.name = name;

    if (role) {
      if (!['staff', 'admin'].includes(role)) {
        return res.json({ success: false, message: 'Invalid role' });
      }
      // Prevent demoting the only admin
      if (role !== 'admin') {
        const adminCount = await userModel.countDocuments({ role: 'admin', _id: { $ne: id } });
        const target = await userModel.findById(id).select('role');
        if (target?.role === 'admin' && adminCount === 0) {
          return res.json({ success: false, message: 'Cannot demote the only admin' });
        }
      }
      // Prevent self-demote
      if (String(id) === String(meId) && role !== 'admin') {
        return res.json({ success: false, message: 'You cannot demote your own admin role' });
      }
      update.role = role;
      if (role === 'admin') update.jobTitle = '';
    }

    if (status) {
      if (!['active', 'suspended'].includes(status)) {
        return res.json({ success: false, message: 'Invalid status' });
      }
      // Prevent self-suspend
      if (String(id) === String(meId)) {
        return res.json({ success: false, message: 'You cannot suspend your own account' });
      }
      update.status = status;
    }

    if (jobTitle !== undefined) {
      const normalized = normalizeJobTitle(jobTitle);
      if (normalized === '' && jobTitle !== '') {
        return res.json({ success: false, message: 'Invalid jobTitle' });
      }
      update.jobTitle = normalized;
    }

    const saved = await userModel.findByIdAndUpdate(id, update, { new: true });
    if (!saved) return res.json({ success: false, message: 'User not found' });

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

    if (!['active', 'suspended'].includes(status)) {
      return res.json({ success: false, message: 'Invalid status' });
    }

    // Guard: self-suspend
    if (String(id) === String(req.userId)) {
      return res.json({ success: false, message: 'You cannot suspend your own account' });
    }

    const saved = await userModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!saved) return res.json({ success: false, message: 'User not found' });

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//  Admin reset a staff password 
export const adminResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return res.json({ success: false, message: 'Missing newPassword' });

    
    const hash = await bcrypt.hash(newPassword, 10);
    const saved = await userModel.findByIdAndUpdate(
      id,
      { password: hash },
      { new: true }
    );
    if (!saved) return res.json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Password reset' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
