import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies || {};
  if (!token) {
    return res.json({ success: false, message: "Not Authorized." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.json({ success: false, message: "Not Authorized. Login again" });
    }

    // Attach both id and (if present) role/permissions
    req.userId = decoded.id;
    req.user = {
      id: decoded.id,
      role: decoded.role || "customer",         // fallback for older tokens
      permissions: decoded.permissions || [],
    };
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default userAuth;

//  Additional guards for RBAC
export const requireAuth = (req, res, next) => {
  if (!req.userId) return res.status(401).json({ success: false, message: "Not Authorized." });
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  const role = req?.user?.role || "customer";
  if (!roles.includes(role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

// alias
export const requireAnyRole = (...roles) => requireRole(...roles);
