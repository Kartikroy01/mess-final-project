const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Bill = require('../models/Bill');
const MealHistory = require('../models/MealHistory');

const createToken = (student) => {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
  return jwt.sign({ id: student._id, role: 'student' }, secret, {
    expiresIn: '7d',
  });
};

const buildStudentResponse = async (student) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let bill = await Bill.findOne({ studentId: student._id, month, year });

  if (!bill) {
    bill = await Bill.create({
      studentId: student._id,
      month,
      year,
      mealCharges: 0,
      fines: 0,
      extras: 0,
      totalBill: 0,
      mealCount: 0,
    });
  }

  const meals = await MealHistory.find({ studentId: student._id })
    .sort({ date: -1 })
    .limit(10)
    .lean();

  const mealHistory = meals.map((meal) => ({
    date: meal.date.toISOString().split('T')[0],
    type: meal.type,
    items: meal.items || [],
  }));

  return {
    id: student._id,
    name: student.name,
    rollNo: student.rollNo,
    hostelNo: student.hostelNo,
    roomNo: student.roomNo,
    email: student.email,
    photo: student.photo,
    qrCode: student.qrCode,
    bill: bill.totalBill,
    mealCount: bill.mealCount,
    mealHistory,
  };
};

// POST /api/auth/login (Email & Password)
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email); // DEBUG

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find student by email
    const student = await Student.findOne({ email: email.toLowerCase() });

    console.log('Student found:', student ? 'Yes' : 'No'); // DEBUG

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password using the comparePassword method
    const isPasswordValid = await student.comparePassword(password);

    console.log('Password valid:', isPasswordValid); // DEBUG

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = createToken(student);
    const studentPayload = await buildStudentResponse(student);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      student: studentPayload,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// POST /api/auth/login-rollno (Roll Number based login - Keep for backward compatibility)
exports.loginStudentByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.body;

    if (!rollNo) {
      return res.status(400).json({
        success: false,
        message: 'rollNo is required',
      });
    }

    let student = await Student.findOne({ rollNo });

    if (!student) {
      // Create a basic student record for demo purposes
      student = new Student({
        rollNo,
        name: `Student ${rollNo}`,
        email: `${rollNo}@example.com`,
        password: rollNo, // temporary password; not used in this flow
        hostelNo: 'Hostel A',
        roomNo: '000',
      });

      await student.save();
    }

    const token = createToken(student);
    const studentPayload = await buildStudentResponse(student);

    return res.json({
      success: true,
      token,
      student: studentPayload,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};