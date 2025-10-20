import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const requireAuth = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization || '';
    const headerToken = bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
    const cookieToken = req.cookies?.token || req.cookies?.authToken || req.cookies?.jwt || null;

    const token = headerToken || cookieToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not Authorized.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: 'Not Authorized. Login again' });
    }

    const user = await userModel.findById(decoded.id).select('_id role name');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.userId = user._id.toString();
    req.user = {
      id: user._id.toString(),
      role: user.role || 'customer',
      name: user.name,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  const role = req?.user?.role || 'customer';
  if (!roles.includes(role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  return next();
};

export const requireAnyRole = (...roles) => requireRole(...roles);

export default requireAuth;
