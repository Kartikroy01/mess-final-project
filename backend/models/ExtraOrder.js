const mongoose = require('mongoose');

const extraOrderSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
      default: 'breakfast',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

extraOrderSchema.index({ studentId: 1, date: -1 });
extraOrderSchema.index({ date: -1 });

module.exports = mongoose.model('ExtraOrder', extraOrderSchema);
