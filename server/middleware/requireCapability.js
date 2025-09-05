export default function requireCapability(cap) {
  return (req, res, next) => {
    const caps = req.user?.capabilities || [];
    if (!caps.includes(cap)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}
