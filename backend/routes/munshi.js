const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Student = require('../models/Student');
const Bill = require('../models/Bill');
const ExtraOrder = require('../models/ExtraOrder');
const MessOff = require('../models/MessOff');
const munshiAuth = require('../middleware/munshiAuth');

// All munshi routes require auth and are scoped to munshi's hostel
router.use(munshiAuth);

// @route   GET /api/munshi/student/lookup
// @desc    Look up student by ID, roll number, or room number (only students in munshi's hostel)
// @access  Private (munshi)
router.get('/student/lookup', async (req, res) => {
  try {
    const { q } = req.query;
    const hostel = req.munshi.hostel;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query (q)',
      });
    }

    const query = q.trim();
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query cannot be empty',
      });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(query) && String(new mongoose.Types.ObjectId(query)) === query;
    const findQuery = {
      hostelNo: hostel,
      ...(isObjectId
        ? { _id: new mongoose.Types.ObjectId(query) }
        : {
            $or: [
              { rollNo: new RegExp('^' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
              { roomNo: new RegExp('^' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
            ],
          }),
    };

    const student = await Student.findOne(findQuery).select('-password').lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in your hostel',
      });
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    let bill = await Bill.findOne({ studentId: student._id, month, year }).lean();
    const balance = bill ? bill.totalBill : 0;

    res.json({
      success: true,
      data: {
        id: student._id.toString(),
        name: student.name,
        rollNumber: student.rollNo,
        roomNumber: student.roomNo,
        hostelName: student.hostelNo,
        balance,
      },
    });
  } catch (error) {
    console.error('Munshi student lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during student lookup',
    });
  }
});

// @route   POST /api/munshi/order
// @desc    Create an extra-items order for a student in munshi's hostel
// @access  Private (munshi)
router.post('/order', async (req, res) => {
  try {
    const { studentId, items, mealType } = req.body;
    const hostel = req.munshi.hostel;

    if (!studentId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId and items array',
      });
    }

    const student = await Student.findOne({ _id: studentId, hostelNo: hostel });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in your hostel',
      });
    }

    const orderItems = items.map((i) => ({
      name: i.name || 'Item',
      price: Number(i.price) || 0,
    }));
    const totalAmount = orderItems.reduce((sum, i) => sum + i.price, 0);

    const order = new ExtraOrder({
      studentId: student._id,
      items: orderItems,
      totalAmount,
      mealType: mealType || 'breakfast',
    });
    await order.save();

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    await Bill.findOneAndUpdate(
      { studentId: student._id, month, year },
      {
        $inc: {
          extras: totalAmount,
          totalBill: totalAmount,
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Order recorded successfully',
      data: {
        id: order._id.toString(),
        studentId: student._id.toString(),
        items: order.items,
        totalAmount: order.totalAmount,
        date: order.date,
      },
    });
  } catch (error) {
    console.error('Munshi order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording order',
    });
  }
});

// @route   GET /api/munshi/orders
// @desc    List orders for munshi's hostel only (optional query: from, to)
// @access  Private (munshi)
router.get('/orders', async (req, res) => {
  try {
    const { from, to } = req.query;
    const hostel = req.munshi.hostel;

    const studentIds = await Student.find({ hostelNo: hostel }).distinct('_id');

    const query = { studentId: { $in: studentIds } };
    if (from && to) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const orders = await ExtraOrder.find(query)
      .populate('studentId', 'name rollNo roomNo hostelNo')
      .sort({ date: -1 })
      .lean();

    const data = orders.map((o) => ({
      id: o._id.toString(),
      studentId: o.studentId._id ? o.studentId._id.toString() : o.studentId,
      studentName: o.studentId && o.studentId.name ? o.studentId.name : 'Unknown',
      items: o.items,
      totalAmount: o.totalAmount,
      date: o.date,
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Munshi orders list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders',
    });
  }
});

// @route   GET /api/munshi/mess-off-requests
// @desc    List mess-off requests for students in munshi's hostel only
// @access  Private (munshi)
router.get('/mess-off-requests', async (req, res) => {
  try {
    const hostel = req.munshi.hostel;
    const studentIds = await Student.find({ hostelNo: hostel }).distinct('_id');

    const requests = await MessOff.find({ studentId: { $in: studentIds } })
      .populate('studentId', 'name rollNo roomNo')
      .sort({ createdAt: -1 })
      .lean();

    const data = requests.map((r) => ({
      id: r._id.toString(),
      studentId: r.studentId._id ? r.studentId._id.toString() : r.studentId,
      studentName: r.studentId && r.studentId.name ? r.studentId.name : 'Unknown',
      from: r.fromDate.toISOString().split('T')[0],
      to: r.toDate.toISOString().split('T')[0],
      status: r.status,
      reason: r.reason || '',
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Munshi mess-off list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching mess-off requests',
    });
  }
});

// @route   PATCH /api/munshi/mess-off/:id/status
// @desc    Approve/reject mess-off request (only for students in munshi's hostel)
// @access  Private (munshi)
router.patch('/mess-off/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const hostel = req.munshi.hostel;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Approved or Rejected',
      });
    }

    const studentIds = await Student.find({ hostelNo: hostel }).distinct('_id');
    const messOff = await MessOff.findOneAndUpdate(
      { _id: id, studentId: { $in: studentIds } },
      { status, approvedAt: new Date() },
      { new: true }
    ).lean();

    if (!messOff) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or not in your hostel',
      });
    }

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      data: {
        id: messOff._id.toString(),
        status: messOff.status,
      },
    });
  } catch (error) {
    console.error('Munshi mess-off update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating request',
    });
  }
});

module.exports = router;
