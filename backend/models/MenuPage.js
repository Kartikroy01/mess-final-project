const mongoose = require('mongoose');

/**
 * Day entry in the weekly menu: one document can hold the full 7-day template
 * or we use a single "current" document. Each day has four meal slots.
 */
const daySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      trim: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    breakfast: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.every((i) => typeof i === 'string' && i.trim().length > 0),
        message: 'breakfast must be an array of non-empty strings',
      },
    },
    lunch: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.every((i) => typeof i === 'string' && i.trim().length > 0),
        message: 'lunch must be an array of non-empty strings',
      },
    },
    snacks: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.every((i) => typeof i === 'string' && i.trim().length > 0),
        message: 'snacks must be an array of non-empty strings',
      },
    },
    dinner: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.every((i) => typeof i === 'string' && i.trim().length > 0),
        message: 'dinner must be an array of non-empty strings',
      },
    },
  },
  { _id: false }
);

/**
 * Section with a title and list of item names (e.g. "Daily Available Items", "Extra Items").
 */
const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.every((i) => typeof i === 'string' && i.trim().length > 0),
        message: 'items must be an array of non-empty strings',
      },
    },
  },
  { _id: false }
);

const menuPageSchema = new mongoose.Schema(
  {
    /** 7-day weekly menu (Monday–Sunday). */
    weeklyMenu: {
      type: [daySchema],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length <= 7,
        message: 'weeklyMenu must have at most 7 days',
      },
    },
    /** Always-available items per meal type (e.g. Breakfast, Lunch, Snacks). */
    dailyItems: {
      type: [sectionSchema],
      default: [],
    },
    /** Extra (paid) items per meal type. */
    extraItems: {
      type: [sectionSchema],
      default: [],
    },
    /** Hostel codes by category; used for "Select Your Hostel" on the menu page. */
    hostels: {
      boys: {
        type: [String],
        default: [],
        validate: {
          validator: (v) => Array.isArray(v) && v.every((i) => typeof i === 'string'),
          message: 'hostels.boys must be an array of strings',
        },
      },
      girls: {
        type: [String],
        default: [],
        validate: {
          validator: (v) => Array.isArray(v) && v.every((i) => typeof i === 'string'),
          message: 'hostels.girls must be an array of strings',
        },
      },
    },
    /** When this menu becomes effective (optional; for future scheduling). */
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    /** Only one active document should be used for the public page. */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

menuPageSchema.index({ isActive: 1, effectiveFrom: -1 });

module.exports = mongoose.model('MenuPage', menuPageSchema);
