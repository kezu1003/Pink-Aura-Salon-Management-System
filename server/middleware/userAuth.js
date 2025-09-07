import jwt from "jsonwebtoken";


export const requireAuth = (req, res, next) => {
  try {
  
    const bearer = req.headers.authorization || "";
    const headerToken = bearer.startsWith("Bearer ") ? bearer.slice(7) : null;

  
    const cookieToken =
      req.cookies?.token || req.cookies?.authToken || req.cookies?.jwt || null;

    const token = headerToken || cookieToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login again" });
    }

    // Attach to request 
    req.userId = decoded.id;
    req.user = {
      id: decoded.id,
      role: decoded.role || "customer",
      permissions: decoded.permissions || [],
    };

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

/**
 * Role guard (RBAC)
 */
export const requireRole = (...roles) => (req, res, next) => {
  const role = req?.user?.role || "customer";
  if (!roles.includes(role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  return next();
};

// Alias if you used it elsewhere
export const requireAnyRole = (...roles) => requireRole(...roles);

// Keep default export for any existing imports that expect "userAuth"
export default requireAuth;
