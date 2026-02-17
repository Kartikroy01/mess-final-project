const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
      required: true,
    },
    day: {
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true, 
      default: 'Sunday'
    },
    hostel: {
      type: String,
      required: true,
      index: true
    },
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          default: 0,
        },
        image: {
          type: String,
          default: '',
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);

