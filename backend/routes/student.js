const express = require('express');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProfile,
  getMealHistory,
  downloadMealReport,
  uploadProfilePhoto,
} = require('../controllers/studentController');

const router = express.Router();

// GET /api/student/profile
router.get('/profile', authMiddleware, getProfile);

// GET /api/student/meals?month=0-11
router.get('/meals', authMiddleware, getMealHistory);

// GET /api/student/report/download?month=0-11
router.get('/report/download', authMiddleware, downloadMealReport);

// POST /api/student/upload-photo
router.post('/upload-photo', authMiddleware, upload.single('photo'), uploadProfilePhoto);

module.exports = router;
