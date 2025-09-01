
export function requireAdmin(req, res, next) {
  try {
    const role = req.user?.role || req.userRole; 
    if (role !== "admin") return res.status(403).json({ message: "Admin access required" });
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
