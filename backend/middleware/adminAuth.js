/**
 * Admin Authentication Middleware
 * 
 * Verifies JWT token and ensures the user has 'admin' role.
 * Attaches admin object to req.admin for use in route handlers.
 * 
 * @module middleware/adminAuth
 */

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { JWT_CONFIG } = require('../utils/constants') || { JWT_CONFIG: { SECRET_ENV_VAR: 'JWT_SECRET', FALLBACK_SECRET: 'your_jwt_secret_key_here' } };

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.warn('[Admin Auth] Authentication attempt without token');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const secret = process.env.JWT_SECRET || (JWT_CONFIG && JWT_CONFIG.FALLBACK_SECRET) || 'your_jwt_secret_key_here';
    const decoded = jwt.verify(token, secret);

    if (decoded.role !== 'admin') {
      console.warn(`[Admin Auth] Access denied for role: ${decoded.role}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges required.',
      });
    }

    const admin = await Admin.findById(decoded.id).select('-password').lean();

    if (!admin) {
      console.warn(`[Admin Auth] Admin not found for ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'Administrator account not found',
      });
    }

    if (!admin.isActive) {
      console.warn(`[Admin Auth] Inactive administrator account access attempt: ${admin.email}`);
      return res.status(401).json({
        success: false,
        message: 'Administrator account is inactive',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid token. Please log in again.',
      });
    }

    console.error('[Admin Auth] Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

module.exports = adminAuth;
