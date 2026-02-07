// const express = require('express');
// const { loginStudent, registerStudent, loginStudentByRollNo } = require('../controllers/auth');

// const router = express.Router();

// // Student registration
// router.post('/register', registerStudent);

// // Student login (email & password)
// router.post('/login', loginStudent);

// // Student login (rollNo-based for backward compatibility)
// router.post('/login-rollno', loginStudentByRollNo);

// module.exports = router;
/////
const express = require('express');
const { 
    loginStudent, 
    registerStudent, 
    loginStudentByRollNo,
    forgotPassword,
    resetPassword
} = require('../controllers/auth');

const router = express.Router();

// Student registration
router.post('/register', registerStudent);

// Student login (email & password)
router.post('/login', loginStudent);

// Student login (rollNo-based for backward compatibility)
router.post('/login-rollno', loginStudentByRollNo);

// Forgot password - sends reset token
router.post('/forgot-password', forgotPassword);

// Reset password - uses token to set new password
router.post('/reset-password', resetPassword);

module.exports = router;