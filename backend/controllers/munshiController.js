/**
 * Munshi Controller
 * 
 * Business logic for munshi operations including student lookup,
 * order management, and mess-off request handling.
 * All operations are scoped to the munshi's assigned hostel.
 * 
 * @module controllers/munshiController
 */

const mongoose = require('mongoose');
const Student = require('../models/Student');
const Bill = require('../models/Bill');
const ExtraOrder = require('../models/ExtraOrder');
const MealHistory = require('../models/MealHistory');
const MessOff = require('../models/MessOff');
const {
  PAGINATION_DEFAULTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require('../utils/constants');

// ==================== STUDENT LOOKUP ====================

/**
 * Look up student by ID, roll number, or room number
 * Only returns students from munshi's hostel
 * 
 * @route GET /api/munshi/student/lookup
 * @access Private (munshi)
 */
exports.lookupStudent = async (req, res) => {
  try {
    const { q } = req.query;
    const hostel = req.munshi.hostel;

    const query = q.trim();

    // Check if query is a valid ObjectId
    const isObjectId =
      mongoose.Types.ObjectId.isValid(query) &&
      String(new mongoose.Types.ObjectId(query)) === query;

    // Build search query
    const findQuery = {
      hostelNo: hostel,
      ...(isObjectId
        ? { _id: new mongoose.Types.ObjectId(query) }
        : {
            $or: [
              {
                rollNo: new RegExp(
                  '^' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
                  'i'
                ),
              },
              {
                roomNo: new RegExp(
                  '^' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
                  'i'
                ),
              },
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

    // Get current month's bill
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const bill = await Bill.findOne({ studentId: student._id, month, year }).lean();
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
    console.error('[Munshi Controller] Student lookup error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ==================== ORDER MANAGEMENT ====================

/**
 * Create an extra-items order for a student
 * Updates the student's bill automatically
 * 
 * @route POST /api/munshi/order
 * @access Private (munshi)
 */
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { studentId, items, mealType } = req.body;
    const hostel = req.munshi.hostel;

    // Verify student exists and belongs to munshi's hostel
    const student = await Student.findOne({
      _id: studentId,
      hostelNo: hostel,
    }).session(session);

    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_IN_HOSTEL,
      });
    }

    // Process and validate items
    const orderItems = items.map((i) => ({
      name: i.name.trim(),
      price: Number(i.price),
    }));

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price, 0);

    // Create the order
    const order = new ExtraOrder({
      studentId: student._id,
      items: orderItems,
      totalAmount,
      mealType: mealType || 'breakfast',
    });
    await order.save({ session });

    // Create meal history record
    const mealHistory = new MealHistory({
      studentId: student._id,
      date: new Date(),
      type: (mealType || 'breakfast').charAt(0).toUpperCase() + (mealType || 'breakfast').slice(1),
      items: orderItems.map(item => ({
        name: item.name,
        qty: 1, // Default to 1 as current UI doesn't support quantity per item selection yet
        price: item.price
      })),
      totalCost: totalAmount
    });
    await mealHistory.save({ session });

    // Update or create bill for current month
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
      { upsert: true, new: true, session }
    );

    await session.commitTransaction();

    console.log(
      `[Munshi Controller] Order created: ${order._id} for student ${student.rollNo} by munshi ${req.munshi.email}`
    );

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.ORDER_CREATED,
      data: {
        id: order._id.toString(),
        studentId: student._id.toString(),
        studentName: student.name,
        items: order.items,
        totalAmount: order.totalAmount,
        mealType: order.mealType,
        date: order.date,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('[Munshi Controller] Order creation error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  } finally {
    session.endSession();
  }
};

/**
 * Get list of orders for munshi's hostel with pagination and filtering
 * 
 * @route GET /api/munshi/orders
 * @access Private (munshi)
 */
exports.getOrders = async (req, res) => {
  try {
    const {
      from,
      to,
      studentId,
      mealType,
      limit = PAGINATION_DEFAULTS.PAGE_SIZE,
      page = 1,
    } = req.query;
    const hostel = req.munshi.hostel;

    // Get all student IDs from munshi's hostel
    const studentIds = await Student.find({ hostelNo: hostel }).distinct('_id');

    // Build query
    const query = { studentId: { $in: studentIds } };

    // Add date range filter
    if (from && to) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    // Add student filter
    if (studentId) {
      query.studentId = new mongoose.Types.ObjectId(studentId);
    }

    // Add meal type filter
    if (mealType) {
      query.mealType = mealType;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalCount = await ExtraOrder.countDocuments(query);

    // Fetch orders with pagination
    const orders = await ExtraOrder.find(query)
      .populate('studentId', 'name rollNo roomNo hostelNo')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const data = orders.map((o) => ({
      id: o._id.toString(),
      studentId: o.studentId._id ? o.studentId._id.toString() : o.studentId,
      studentName: o.studentId && o.studentId.name ? o.studentId.name : 'Unknown',
      studentRollNo: o.studentId && o.studentId.rollNo ? o.studentId.rollNo : '',
      items: o.items,
      totalAmount: o.totalAmount,
      mealType: o.mealType,
      date: o.date,
    }));

    res.json({
      success: true,
      data,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('[Munshi Controller] Orders list error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ==================== MESS-OFF REQUEST MANAGEMENT ====================

/**
 * Get list of mess-off requests for munshi's hostel with pagination and filtering
 * 
 * @route GET /api/munshi/mess-off-requests
 * @access Private (munshi)
 */
exports.getMessOffRequests = async (req, res) => {
  try {
    const {
      status,
      from,
      to,
      limit = PAGINATION_DEFAULTS.PAGE_SIZE,
      page = 1,
    } = req.query;
    const hostel = req.munshi.hostel;

    // Get all student IDs from munshi's hostel
    const studentIds = await Student.find({ hostelNo: hostel }).distinct('_id');

    // Build query
    const query = { studentId: { $in: studentIds } };

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add date range filter
    if (from && to) {
      const start = new Date(from);
      const end = new Date(to);
      query.$or = [
        { fromDate: { $gte: start, $lte: end } },
        { toDate: { $gte: start, $lte: end } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await MessOff.countDocuments(query);

    // Fetch requests with pagination
    const requests = await MessOff.find(query)
      .populate('studentId', 'name rollNo roomNo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const data = requests.map((r) => ({
      id: r._id.toString(),
      studentId: r.studentId._id ? r.studentId._id.toString() : r.studentId,
      studentName: r.studentId && r.studentId.name ? r.studentId.name : 'Unknown',
      studentRollNo: r.studentId && r.studentId.rollNo ? r.studentId.rollNo : '',
      from: r.fromDate.toISOString().split('T')[0],
      to: r.toDate.toISOString().split('T')[0],
      status: r.status,
      reason: r.reason || '',
      createdAt: r.createdAt,
    }));

    res.json({
      success: true,
      data,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('[Munshi Controller] Mess-off list error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Approve or reject a mess-off request
 * Only for requests from students in munshi's hostel
 * 
 * @route PATCH /api/munshi/mess-off/:id/status
 * @access Private (munshi)
 */
exports.updateMessOffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const hostel = req.munshi.hostel;

    // Get all student IDs from munshi's hostel
    const studentIds = await Student.find({ hostelNo: hostel }).distinct('_id');

    // Find and update the mess-off request
    const updateData = {
      status,
      approvedAt: new Date(),
    };

    // Add rejection reason if provided
    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const messOff = await MessOff.findOneAndUpdate(
      { _id: id, studentId: { $in: studentIds } },
      updateData,
      { new: true }
    )
      .populate('studentId', 'name rollNo')
      .lean();

    if (!messOff) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_IN_HOSTEL,
      });
    }

    console.log(
      `[Munshi Controller] Mess-off request ${id} ${status.toLowerCase()} by munshi ${req.munshi.email}`
    );

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      data: {
        id: messOff._id.toString(),
        status: messOff.status,
        studentName: messOff.studentId?.name || 'Unknown',
      },
    });
  } catch (error) {
    console.error('[Munshi Controller] Mess-off update error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};
