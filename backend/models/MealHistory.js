const mongoose = require('mongoose');

const mealHistorySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
      required: true,
    },
    items: [
      {
        name: String,
        qty: Number,
        price: Number,
      },
    ],
    totalCost: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

mealHistorySchema.index({ studentId: 1, date: -1 });

module.exports = mongoose.model('MealHistory', mealHistorySchema);

