// const jwt = require('jsonwebtoken');
// const Student = require('../models/Student');
// const Bill = require('../models/Bill');
// const MealHistory = require('../models/MealHistory');

// const createToken = (student) => {
//   const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
//   return jwt.sign({ id: student._id, role: 'student' }, secret, {
//     expiresIn: '7d',
//   });
// };

// const buildStudentResponse = async (student) => {
//   const now = new Date();
//   const month = now.getMonth() + 1;
//   const year = now.getFullYear();

//   let bill = await Bill.findOne({ studentId: student._id, month, year });

//   if (!bill) {
//     bill = await Bill.create({
//       studentId: student._id,
//       month,
//       year,
//       mealCharges: 0,
//       fines: 0,
//       extras: 0,
//       totalBill: 0,
//       mealCount: 0,
//     });
//   }

//   const meals = await MealHistory.find({ studentId: student._id })
//     .sort({ date: -1 })
//     .limit(10)
//     .lean();

//   const mealHistory = meals.map((meal) => ({
//     date: meal.date.toISOString().split('T')[0],
//     type: meal.type,
//     items: meal.items || [],
//   }));

//   return {
//     id: student._id,
//     name: student.name,
//     rollNo: student.rollNo,
//     hostelNo: student.hostelNo,
//     roomNo: student.roomNo,
//     email: student.email,
//     photo: student.photo,
//     qrCode: student.qrCode,
//     bill: bill.totalBill,
//     mealCount: bill.mealCount,
//     mealHistory,
//   };
// };

// // ✅ ADD THIS NEW FUNCTION
// // POST /api/auth/register
// exports.registerStudent = async (req, res) => {
//   try {
//     const { name, email, password, rollNo, hostelNo, roomNo } = req.body;

//     console.log('Registration attempt for:', email);

//     // Validation
//     if (!name || !email || !password || !rollNo) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide name, email, password, and roll number',
//       });
//     }

//     // Check if student already exists
//     const existingStudent = await Student.findOne({
//       $or: [
//         { email: email.toLowerCase() },
//         { rollNo: rollNo }
//       ]
//     });

//     if (existingStudent) {
//       return res.status(400).json({
//         success: false,
//         message: 'Student already exists with this email or roll number',
//       });
//     }

//     // Create new student
//     const student = new Student({
//       name,
//       email: email.toLowerCase(),
//       password, // Will be hashed by the pre-save hook in Student model
//       rollNo,
//       hostelNo: hostelNo || 'Not Assigned',
//       roomNo: roomNo || '000',
//     });

//     await student.save();

//     console.log('Student registered:', student._id);

//     // Generate token
//     const token = createToken(student);
//     const studentPayload = await buildStudentResponse(student);

//     return res.status(201).json({
//       success: true,
//       message: 'Registration successful',
//       token,
//       student: studentPayload,
//     });

//   } catch (error) {
//     console.error('Registration error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error during registration',
//       error: error.message,
//     });
//   }
// };

// // POST /api/auth/login (Email & Password)
// exports.loginStudent = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     console.log('Login attempt for:', email);

//     // Validation
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide email and password',
//       });
//     }

//     // Find student by email
//     const student = await Student.findOne({ email: email.toLowerCase() });

//     console.log('Student found:', student ? 'Yes' : 'No');

//     if (!student) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password',
//       });
//     }

//     // Check password using the comparePassword method
//     const isPasswordValid = await student.comparePassword(password);

//     console.log('Password valid:', isPasswordValid);

//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password',
//       });
//     }

//     // Generate token
//     const token = createToken(student);
//     const studentPayload = await buildStudentResponse(student);

//     return res.json({
//       success: true,
//       message: 'Login successful',
//       token,
//       student: studentPayload,
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error during login',
//     });
//   }
// };

// // POST /api/auth/login-rollno (Roll Number based login)
// exports.loginStudentByRollNo = async (req, res) => {
//   try {
//     const { rollNo } = req.body;

//     if (!rollNo) {
//       return res.status(400).json({
//         success: false,
//         message: 'rollNo is required',
//       });
//     }

//     let student = await Student.findOne({ rollNo });

//     if (!student) {
//       // Create a basic student record for demo purposes
//       student = new Student({
//         rollNo,
//         name: `Student ${rollNo}`,
//         email: `${rollNo}@example.com`,
//         password: rollNo,
//         hostelNo: 'Hostel A',
//         roomNo: '000',
//       });

//       await student.save();
//     }

//     const token = createToken(student);
//     const studentPayload = await buildStudentResponse(student);

//     return res.json({
//       success: true,
//       token,
//       student: studentPayload,
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error during login',
//     });
//   }
// };


//// //
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Student = require('../models/Student');
const Bill = require('../models/Bill');
const MealHistory = require('../models/MealHistory');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');

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
    phoneNo: student.phoneNo,
    photo: student.photo,
    qrCode: student.qrCode,
    bill: bill.totalBill,
    mealCount: bill.mealCount,
    mealHistory,
  };
};

// POST /api/auth/register
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password, rollNo, hostelNo, roomNo, phoneNo } = req.body;

    console.log('Registration attempt for:', email);

    // Validation
    if (!name || !email || !password || !rollNo || !phoneNo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, roll number, and phone number',
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [
        { email: email.toLowerCase() },
        { rollNo: rollNo }
      ]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student already exists with this email or roll number',
      });
    }

    // Create new student
    const student = new Student({
      name,
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save hook in Student model
      rollNo,
      hostelNo: hostelNo || 'Not Assigned',
      roomNo: roomNo || '000',
      phoneNo,
    });

    await student.save();

    console.log('Student registered:', student._id);

    // Generate token
    const token = createToken(student);
    const studentPayload = await buildStudentResponse(student);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      student: studentPayload,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// POST /api/auth/login (Email & Password)
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find student by email
    const student = await Student.findOne({ email: email.toLowerCase() });

    console.log('Student found:', student ? 'Yes' : 'No');

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password using the comparePassword method
    const isPasswordValid = await student.comparePassword(password);

    console.log('Password valid:', isPasswordValid);

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

// POST /api/auth/login-rollno (Roll Number based login)
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
        password: rollNo,
        hostelNo: 'Hostel A',
        roomNo: '000',
        phoneNo: '0000000000',
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

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Forgot password request for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address',
      });
    }

    // Find student by email
    const student = await Student.findOne({ email: email.toLowerCase() });

    if (!student) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If the email exists, a reset token has been sent',
      });
    }

    // Generate reset token (6-digit code)
    const resetToken = crypto.randomInt(100000, 999999).toString();
    
    // Hash the token before saving
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token and expiry (10 minutes)
    student.resetPasswordToken = hashedToken;
    student.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await student.save();

    console.log('Reset token generated for:', student.email);

    // Send email with reset token
    try {
      await sendPasswordResetEmail(student.email, resetToken, student.name);
      console.log('Password reset email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Still return success to not reveal if email exists
      return res.json({
        success: true,
        message: 'If the email exists, a reset token has been sent',
      });
    }

    return res.json({
      success: true,
      message: 'Password reset token has been sent to your email',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log('Reset password attempt');

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Hash the provided token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find student with matching token that hasn't expired
    const student = await Student.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Update password (will be hashed by pre-save hook)
    student.password = newPassword;
    student.resetPasswordToken = undefined;
    student.resetPasswordExpiry = undefined;
    await student.save();

    console.log('Password reset successful for:', student.email);

    return res.json({
      success: true,
      message: 'Password has been reset successfully',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};