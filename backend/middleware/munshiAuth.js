const jwt = require('jsonwebtoken');
const Munshi = require('../models/Munshi');

/**
 * Verify JWT and attach munshi to request.
 * Token must have been issued for role 'munshi' (from unified login).
 */
const munshiAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');

    if (decoded.role !== 'munshi') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Munshi only.',
      });
    }

    const munshi = await Munshi.findById(decoded.id).select('-password').lean();

    if (!munshi) {
      return res.status(401).json({
        success: false,
        message: 'Munshi not found',
      });
    }

    if (!munshi.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    req.munshi = munshi;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    console.error('Munshi auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

module.exports = munshiAuth;
