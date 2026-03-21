/**
 * JWT Authentication Middleware
 * Verifies Bearer token on protected routes
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect middleware — verifies JWT and attaches user to req
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Extract token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Also check extension-specific header (X-Auth-Token)
        if (!token && req.headers["x-auth-token"]) {
            token = req.headers["x-auth-token"];
        }

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please log in." });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from DB (fresh data each request)
        const user = await User.findById(decoded.userId).select("-password");
        if (!user || !user.isActive) {
            return res.status(401).json({ error: "User not found or deactivated." });
        }

        // Update last seen
        user.lastSeen = new Date();
        await user.save({ validateBeforeSave: false });

        // Attach user to request
        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired. Please log in again.", code: "TOKEN_EXPIRED" });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token." });
        }
        next(err);
    }
};

/**
 * Generate JWT access token (short-lived)
 */
const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
};

/**
 * Generate JWT refresh token (long-lived)
 */
const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });
};

module.exports = { protect, generateAccessToken, generateRefreshToken };
