const express = require('express');
const { loginStudent } = require('../controllers/auth');

const router = express.Router();

// Student login (rollNo-based for this dashboard)
router.post('/login', loginStudent);

// Student registration
router.post('/register', registerStudent);

module.exports = router;

