import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user is suspended
    if (req.user.isSuspended) {
      if (req.user.suspendedUntil && req.user.suspendedUntil > new Date()) {
        return res.status(403).json({
          message: "Account suspended",
          suspendedUntil: req.user.suspendedUntil,
        });
      }
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Restrict to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
