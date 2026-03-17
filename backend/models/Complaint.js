const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    category: {
      type: String,
      enum: ['Food Quality', 'Quantity', 'Hygiene', 'Mess Staff Behavior', 'Other'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isDirectToWarden: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Pending', 'Resolved', 'In Progress'],
      default: 'Pending',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    resolution: {
      type: String,
      trim: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Munshi',
    },
  },
  { timestamps: true }
);

complaintSchema.index({ studentId: 1, date: -1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
