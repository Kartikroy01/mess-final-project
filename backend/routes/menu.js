const express = require('express');
const router = express.Router();
const munshiAuth = require('../middleware/munshiAuth');
const Student = require('../models/Student');
const Menu = require('../models/menu');
const MealHistory = require('../models/MealHistory');
const MessOff = require('../models/MessOff');
const Bill = require('../models/Bill');

// All routes use munshiAuth middleware
router.use(munshiAuth);

// @route   GET /api/munshi/student/search
// @desc    Search student by ID or room number
// @access  Munshi only
router.get('/student/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    // Only search students from munshi's hostel
    const student = await Student.findOne({
      hostelNo: req.hostel,
      $or: [
        { rollNo: q },
        { roomNo: q },
        { qrCode: q }
      ]
    }).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in your hostel'
      });
    }

    res.json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        hostelNo: student.hostelNo,
        roomNo: student.roomNo,
        qrCode: student.qrCode,
        isActive: student.isActive
      }
    });
  } catch (error) {
    console.error('Search student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/munshi/order/process
// @desc    Process student meal order
// @access  Munshi only
router.post('/order/process', async (req, res) => {
  try {
    const { studentId, mealType, items } = req.body;

    if (!studentId || !mealType || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate mealType
    if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal type'
      });
    }

    // Verify student belongs to munshi's hostel
    const student = await Student.findById(studentId);
    if (!student || student.hostelNo !== req.hostel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student not in your hostel.'
      });
    }

    // Calculate total
    const totalCost = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    // Create meal history
    const mealHistory = new MealHistory({
      studentId,
      date: new Date(),
      type: mealType.charAt(0).toUpperCase() + mealType.slice(1),
      items: items.map(item => ({
        name: item.name,
        qty: item.quantity || 1,
        price: item.price
      })),
      totalCost,
      processedBy: req.munshi._id,
      hostel: req.hostel
    });

    await mealHistory.save();

    // Update bill
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    await Bill.findOneAndUpdate(
      { studentId, month: currentMonth, year: currentYear },
      {
        $inc: {
          mealCharges: totalCost,
          totalBill: totalCost,
          mealCount: 1
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Order processed successfully',
      order: {
        id: mealHistory._id,
        totalCost,
        items: mealHistory.items
      }
    });
  } catch (error) {
    console.error('Process order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing order'
    });
  }
});

// @route   GET /api/munshi/mess-off/requests
// @desc    Get mess-off requests from munshi's hostel
// @access  Munshi only
router.get('/mess-off/requests', async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    // Get all requests for students in munshi's hostel
    const students = await Student.find({ hostelNo: req.hostel }).select('_id');
    const studentIds = students.map(s => s._id);

    const requests = await MessOff.find({
      ...query,
      studentId: { $in: studentIds }
    })
      .populate('studentId', 'name rollNo hostelNo roomNo')
      .sort({ createdAt: -1 })
      .lean();

    const formattedRequests = requests.map(req => ({
      id: req._id,
      student: req.studentId,
      fromDate: req.fromDate.toISOString().split('T')[0],
      toDate: req.toDate.toISOString().split('T')[0],
      meals: req.meals,
      reason: req.reason,
      status: req.status,
      createdAt: req.createdAt
    }));

    res.json({
      success: true,
      data: formattedRequests
    });
  } catch (error) {
    console.error('Get mess-off requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/munshi/mess-off/:id
// @desc    Update mess-off request status
// @access  Munshi only
router.patch('/mess-off/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const messOff = await MessOff.findByIdAndUpdate(
      id,
      {
        status,
        approvedBy: req.munshi._id,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!messOff) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      data: messOff
    });
  } catch (error) {
    console.error('Update mess-off status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/munshi/orders
// @desc    Get orders/reports from munshi's hostel
// @access  Munshi only
router.get('/orders', async (req, res) => {
  try {
    const { startDate, endDate, mealType } = req.query;

    let query = { hostel: req.hostel };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (mealType) {
      if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid meal type'
        });
      }
      query.type = mealType.charAt(0).toUpperCase() + mealType.slice(1);
    }

    const orders = await MealHistory.find(query)
      .populate('studentId', 'name rollNo hostelNo roomNo')
      .sort({ date: -1 })
      .lean();

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/menu/current
// @desc    Get current menu for all meal types
// @access  Munshi only
router.get('/current', async (req, res) => {
  try {
    const menus = await Menu.find({ isActive: true })
      .sort({ mealType: 1 })
      .lean();

    const menuByType = {
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: []
    };

    menus.forEach(menu => {
      if (menuByType[menu.mealType]) {
        menuByType[menu.mealType] = menu.items
          .filter(item => item.isAvailable)
          .map(item => ({
            id: item._id,
            name: item.name,
            price: item.price,
            image: item.image || `https://placehold.co/300x200/cccccc/FFF?text=${encodeURIComponent(item.name || '')}`,
            category: menu.mealType,
            isAvailable: item.isAvailable
          }));
      }
    });

    res.json({
      success: true,
      data: menuByType
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching menu'
    });
  }
});

// @route   POST /api/menu/item
// @desc    Add a new item to menu
// @access  Munshi only
router.post('/item', async (req, res) => {
  try {
    const { mealType, name, price, image } = req.body;

    if (!mealType || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mealType, name, and price'
      });
    }

    if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal type'
      });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number'
      });
    }

    let menu = await Menu.findOne({ mealType, isActive: true });

    if (!menu) {
      menu = new Menu({
        mealType,
        items: [],
        isActive: true
      });
    }

    menu.items.push({
      name: name.trim(),
      price: priceNum,
      image: image && typeof image === 'string' ? image.trim() : '',
      isAvailable: true
    });

    await menu.save();

    const newItem = menu.items[menu.items.length - 1];
    res.status(201).json({
      success: true,
      message: 'Meal item added successfully',
      data: {
        id: newItem._id,
        name: newItem.name,
        price: newItem.price,
        image: newItem.image || `https://placehold.co/300x200/cccccc/FFF?text=${encodeURIComponent(newItem.name)}`,
        category: mealType,
        isAvailable: newItem.isAvailable
      }
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding menu item'
    });
  }
});

// @route   GET /api/menu/:mealType
// @desc    Get menu for specific meal type
// @access  Munshi only
router.get('/:mealType', async (req, res) => {
  try {
    const { mealType } = req.params;

    if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal type'
      });
    }

    const menu = await Menu.findOne({ mealType, isActive: true }).lean();

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found for this meal type'
      });
    }

    const items = menu.items
      .filter(item => item.isAvailable)
      .map(item => ({
        id: item._id,
        name: item.name,
        price: item.price,
        image: item.image || `https://placehold.co/300x200/cccccc/FFF?text=${encodeURIComponent(item.name || '')}`,
        category: menu.mealType,
        isAvailable: item.isAvailable
      }));

    res.json({
      success: true,
      data: {
        mealType: menu.mealType,
        items
      }
    });
  } catch (error) {
    console.error('Get meal type menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching menu'
    });
  }
});

module.exports = router;