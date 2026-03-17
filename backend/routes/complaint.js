const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Complaint = require('../models/Complaint');

// @route   POST /api/complaint/submit
// @desc    Submit a complaint
// @access  Private
router.post('/submit', authMiddleware, async (req, res) => {
    try {
        const { category, message, isDirectToWarden } = req.body;
        const studentId = req.student._id;

        if (!category || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide category and message' 
            });
        }

        const complaint = new Complaint({
            studentId,
            category,
            message,
            isDirectToWarden: !!isDirectToWarden
        });

        await complaint.save();

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: complaint
        });
    } catch (error) {
        console.error('Submit complaint error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error submitting complaint' 
        });
    }
});

// @route   GET /api/complaint/my-complaints
// @desc    Get student's complaints
// @access  Private
router.get('/my-complaints', authMiddleware, async (req, res) => {
    try {
        const studentId = req.student._id;

        const complaints = await Complaint.find({ studentId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({
            success: true,
            data: complaints
        });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching complaints' 
        });
    }
});

module.exports = router;
