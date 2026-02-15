const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Student = require("../models/Student");
const Munshi = require("../models/Munshi");
const Bill = require("../models/Bill");
const MealHistory = require("../models/MealHistory");
const {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendRegistrationOTP
} = require("../utils/emailService");
const TempRegistration = require("../models/TempRegistration");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";
const TOKEN_EXPIRY = "7d";

const createToken = (student) => {
  return jwt.sign({ id: student._id, role: "student" }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
};

const createTokenForMunshi = (munshi) => {
  return jwt.sign(
    { id: munshi._id, role: "munshi", hostel: munshi.hostel },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );
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

  const mealHistory = meals.map((meal) => {
    const dateObj = new Date(meal.date);
    const timeStr = dateObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    return {
      date: meal.date.toISOString().split("T")[0],
      time: timeStr,
      type: meal.type,
      items: meal.items || [],
    };
  });

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
// POST /api/auth/register
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password, rollNo, hostelNo, roomNo, phoneNo } =
      req.body;

    console.log("Registration attempt for:", email);

    // Validation
    if (!name || !email || !password || !rollNo || !phoneNo) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide name, email, password, roll number, and phone number",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email: normalizedEmail }, { rollNo: rollNo }],
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student already exists with this email or roll number",
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update temporary registration
    // We use findOneAndUpdate with upsert to handle existing pending registrations
    await TempRegistration.findOneAndUpdate(
      { email: normalizedEmail },
      {
        name,
        email: normalizedEmail,
        password, // Note: storing plaintext password temporarily, should ideally hash or encrypt
        rollNo,
        hostelNo: hostelNo || "Not Assigned",
        roomNo: roomNo || "000",
        phoneNo,
        otp,
        otpExpires
      },
      { upsert: true, new: true }
    );

    console.log(`OTP generated for ${normalizedEmail}: ${otp}`);

    // Send OTP via email
    try {
      await sendRegistrationOTP(normalizedEmail, otp, name);
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      email: normalizedEmail
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// POST /api/auth/verify-otp
exports.verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and verification code"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find temporary registration
    const tempReg = await TempRegistration.findOne({
      email: normalizedEmail,
      otp: otp,
      otpExpires: { $gt: new Date() }
    });

    if (!tempReg) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code"
      });
    }

    // Verify registration doesn't already exist (double check)
    const existingStudent = await Student.findOne({
      $or: [{ email: normalizedEmail }, { rollNo: tempReg.rollNo }],
    });

    if (existingStudent) {
      await TempRegistration.deleteOne({ _id: tempReg._id });
      return res.status(400).json({
        success: false,
        message: "Student already exists with this email or roll number",
      });
    }

    // Create new student
    const student = new Student({
      name: tempReg.name,
      email: tempReg.email,
      password: tempReg.password, // Will be hashed by pre-save hook
      rollNo: tempReg.rollNo,
      hostelNo: tempReg.hostelNo,
      roomNo: tempReg.roomNo,
      phoneNo: tempReg.phoneNo,
    });

    await student.save();

    // Delete temporary registration
    await TempRegistration.deleteOne({ _id: tempReg._id });

    // Send welcome email (optional)
    try {
      await sendWelcomeEmail(student.email, student.name, student.rollNo);
    } catch (err) {
      console.error("Error sending welcome email:", err);
    }

    console.log("Student registered and verified:", student._id);

    // Generate token and login
    const token = createToken(student);
    const studentPayload = await buildStudentResponse(student);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      student: studentPayload,
      role: "student"
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during verification",
      error: error.message,
    });
  }
};

// POST /api/auth/login (Email & Password) – unified: student or munshi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try student first
    const student = await Student.findOne({ email: normalizedEmail });
    if (student) {
      const valid = await student.comparePassword(password);
      if (!valid) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }
      if (!student.isActive) {
        return res
          .status(401)
          .json({ success: false, message: "Account is inactive" });
      }
      const token = createToken(student);
      const studentPayload = await buildStudentResponse(student);
      return res.json({
        success: true,
        message: "Login successful",
        token,
        userType: "student",
        role: "student",
        student: studentPayload,
      });
    }

    // 2. Try munshi
    const munshi = await Munshi.findOne({ email: normalizedEmail }).select('+password');
    if (munshi) {
      const valid = await munshi.comparePassword(password);
      if (!valid) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }
      if (!munshi.isActive) {
        return res
          .status(401)
          .json({ success: false, message: "Account is inactive" });
      }
      const token = createTokenForMunshi(munshi);
      const munshiPayload = {
        id: munshi._id,
        name: munshi.name,
        email: munshi.email,
        hostel: munshi.hostel,
        role: "munshi",
        type: munshi.type || "munshi",
      };
      return res.json({
        success: true,
        message: "Login successful",
        token,
        userType: "munshi",
        role: "munshi",
        munshi: munshiPayload,
      });
    }

    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// POST /api/auth/login (Email & Password) – student only (backward compatibility)
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken(student);
    const studentPayload = await buildStudentResponse(student);
    return res.json({
      success: true,
      message: "Login successful",
      token,
      role: "student",
      student: studentPayload,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
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
        message: "rollNo is required",
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
        hostelNo: "Hostel A",
        roomNo: "000",
        phoneNo: "0000000000",
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
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// POST /api/auth/forgot-password (Works for both students and munshis)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("Forgot password request for:", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email address",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Try to find user (student or munshi)
    let user = await Student.findOne({ email: normalizedEmail });
    let userType = "student";

    if (!user) {
      user = await Munshi.findOne({ email: normalizedEmail });
      userType = "munshi";
    }

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: "If the email exists, a reset token has been sent",
      });
    }

    // Generate reset token (6-digit code)
    const resetToken = crypto.randomInt(100000, 999999).toString();

    // Hash the token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save hashed token and expiry (10 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log(`Reset token generated for ${userType}:`, user.email);

    // Send email with reset token
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
      console.log("Password reset email sent successfully");
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Notify the user that there's a problem sending the email
      // but only if the user actually exists (which we know they do here)
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email due to a server configuration issue. Please contact the administrator.",
      });
    }

    return res.json({
      success: true,
      message: "Password reset token has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// POST /api/auth/reset-password (Works for both students and munshis)
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log("Reset password attempt");

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide token and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the provided token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Try to find user (student or munshi) with matching token
    let user = await Student.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    let userType = "student";

    if (!user) {
      user = await Munshi.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: Date.now() },
      });
      userType = "munshi";
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    console.log(`Password reset successful for ${userType}:`, user.email);

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
