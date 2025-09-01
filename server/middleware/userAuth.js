import jwt from "jsonwebtoken";


export const authUser = (req, res, next) => {
  try {
    const bearer =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;
    const token = req.cookies?.token || bearer;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id && !decoded?._id) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Login again" });
    }

    req.userId = decoded.id || decoded._id;
    req.userRole = decoded.role || "customer"; // allow role checks later
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: error.message || "Invalid token" });
  }
};




export const authOptional = (req, _res, next) => {
  try {
    const bearer =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;
    const token = req.cookies?.token || bearer;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.id || decoded?._id) {
        req.userId = decoded.id || decoded._id;
        req.userRole = decoded.role || "customer";
      }
    }
  } catch {
    
  }
  next();
};

export default authUser;
