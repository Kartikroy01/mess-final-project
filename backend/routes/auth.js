const express = require('express');
const {
    login,
    loginStudent,
    registerStudent,
    loginStudentByRollNo,
    forgotPassword,
    resetPassword,
} = require('../controllers/auth');

const router = express.Router();

// Student registration
router.post('/register', registerStudent);

// Unified login: handles both student and munshi login automatically
router.post('/login', login);

// Student login (email/password - backward compatibility)
router.post('/student/login', loginStudent);

// Student login (rollNo-based - backward compatibility)
router.post('/login-rollno', loginStudentByRollNo);

// Forgot password - sends reset token (works for both students and munshis)
router.post('/forgot-password', forgotPassword);

// Reset password - uses token to set new password (works for both students and munshis)
router.post('/reset-password', resetPassword);

module.exports = router;