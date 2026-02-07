const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Munshi (Mess Manager) Schema
 * 
 * Represents a mess manager who is responsible for managing mess operations
 * for a specific hostel. Each munshi has access only to data from their
 * assigned hostel (hostel-scoped operations).
 * 
 * @typedef {Object} Munshi
 * @property {string} name - Full name of the munshi
 * @property {string} email - Unique email address (validated format)
 * @property {string} password - Hashed password (min 6 characters)
 * @property {string} hostel - Assigned hostel identifier (e.g., BH-1, MBH, GH-1)
 * @property {boolean} isActive - Account active status
 * @property {string} [resetPasswordToken] - Hashed token for password reset
 * @property {Date} [resetPasswordExpiry] - Token expiration timestamp
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const munshiSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Munshi name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password in queries by default
    },
    /** Hostel this munshi is assigned to (e.g. BH-1, MBH, GH-1). All data operations are scoped to this hostel. */
    hostel: {
      type: String,
      required: [true, 'Hostel assignment is required'],
      trim: true,
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    /** Hashed token for password reset functionality */
    resetPasswordToken: {
      type: String,
      select: false,
    },
    /** Expiration timestamp for password reset token */
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================

/**
 * Index on hostel for efficient hostel-scoped queries
 */
munshiSchema.index({ hostel: 1 });

/**
 * Compound index for active munshis by hostel
 */
munshiSchema.index({ hostel: 1, isActive: 1 });

// ==================== MIDDLEWARE ====================

/**
 * Pre-save middleware to hash password before storing
 * Only hashes if password is modified
 */
munshiSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ==================== INSTANCE METHODS ====================

/**
 * Compare provided password with stored hashed password
 * 
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
munshiSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Get safe munshi object without sensitive fields
 * 
 * @returns {Object} Munshi object without password and tokens
 */
munshiSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  delete obj.__v;
  return obj;
};

// ==================== STATIC METHODS ====================

/**
 * Find all active munshis for a specific hostel
 * 
 * @param {string} hostelName - Hostel identifier
 * @returns {Promise<Array>} Array of active munshi documents
 */
munshiSchema.statics.findActiveByHostel = function (hostelName) {
  return this.find({ 
    hostel: hostelName.toUpperCase(), 
    isActive: true 
  }).select('-password');
};

/**
 * Find munshi by email (case-insensitive)
 * 
 * @param {string} email - Email address to search
 * @returns {Promise<Object|null>} Munshi document or null
 */
munshiSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// ==================== EXPORT ====================

module.exports = mongoose.model('Munshi', munshiSchema);
