/**
 * Munshi Authentication Middleware
 * 
 * Verifies JWT token and ensures the user has munshi role.
 * Attaches munshi object to req.munshi for use in route handlers.
 * All operations are automatically scoped to the munshi's hostel.
 * 
 * @module middleware/munshiAuth
 */

const jwt = require('jsonwebtoken');
const Munshi = require('../models/Munshi');
const { JWT_CONFIG, ERROR_MESSAGES } = require('../utils/constants');

/**
 * Verify JWT and attach munshi to request
 * Token must have been issued for role 'munshi' (from unified login)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const munshiAuth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.warn('[Munshi Auth] Authentication attempt without token');
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.AUTH_REQUIRED,
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env[JWT_CONFIG.SECRET_ENV_VAR] || JWT_CONFIG.FALLBACK_SECRET
    );

    // Verify role is munshi
    if (decoded.role !== 'munshi') {
      console.warn(
        `[Munshi Auth] Access denied for role: ${decoded.role}, IP: ${req.ip}`
      );
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.MUNSHI_ONLY,
      });
    }

    // Fetch munshi from database
    const munshi = await Munshi.findById(decoded.id).select('-password').lean();

    if (!munshi) {
      console.warn(
        `[Munshi Auth] Munshi not found for ID: ${decoded.id}, IP: ${req.ip}`
      );
      return res.status(401).json({
        success: false,
        message: 'Munshi not found',
      });
    }

    // Check if account is active
    if (!munshi.isActive) {
      console.warn(
        `[Munshi Auth] Inactive account access attempt: ${munshi.email}, IP: ${req.ip}`
      );
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.ACCOUNT_INACTIVE,
      });
    }

    // Attach munshi to request for use in route handlers
    req.munshi = munshi;
    req.hostel = munshi.hostel; // Add hostel for convenient access

    // Log successful authentication (optional, can be disabled in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[Munshi Auth] Authenticated: ${munshi.email} (${munshi.hostel})`
      );
    }

    next();
  } catch (error) {
    // Handle JWT-specific errors
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      console.warn(
        `[Munshi Auth] Token error: ${error.name}, IP: ${req.ip}`
      );
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
      });
    }

    // Handle other errors
    console.error('[Munshi Auth] Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

module.exports = munshiAuth;

