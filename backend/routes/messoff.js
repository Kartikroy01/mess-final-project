const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const MessOff = require('../models/MessOff');

// @route   POST /api/mess-off/apply
// @desc    Apply for mess off
// @access  Private
router.post('/apply', authMiddleware, async (req, res) => {
    try {
        const { fromDate, toDate, meals, reason } = req.body;
        const studentId = req.student._id;

        // Validation
        if (!fromDate || !toDate || !meals || meals.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields' 
            });
        }

        // Check if dates are valid
        const from = new Date(fromDate);
        const to = new Date(toDate);

        if (from > to) {
            return res.status(400).json({ 
                success: false, 
                message: 'From date cannot be after to date' 
            });
        }

        // Check for overlapping mess-off requests
        const overlapping = await MessOff.findOne({
            studentId,
            status: { $in: ['Pending', 'Approved'] },
            $or: [
                { fromDate: { $lte: to }, toDate: { $gte: from } }
            ]
        });

        if (overlapping) {
            return res.status(400).json({ 
                success: false, 
                message: 'You already have a mess-off request for overlapping dates' 
            });
        }

        // Create mess-off request
        const messOff = new MessOff({
            studentId,
            fromDate: from,
            toDate: to,
            meals,
            reason: reason || ''
        });

        await messOff.save();

        res.status(201).json({
            success: true,
            message: 'Mess-off application submitted successfully',
            data: {
                id: messOff._id,
                fromDate: messOff.fromDate.toISOString().split('T')[0],
                toDate: messOff.toDate.toISOString().split('T')[0],
                meals: messOff.meals,
                status: messOff.status,
                reason: messOff.reason
            }
        });
    } catch (error) {
        console.error('Apply mess-off error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error submitting application' 
        });
    }
});

// @route   GET /api/mess-off/my-applications
// @desc    Get student's mess-off applications
// @access  Private
router.get('/my-applications', authMiddleware, async (req, res) => {
    try {
        const studentId = req.student._id;

        const applications = await MessOff.find({ studentId })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: applications.map(app => ({
                id: app._id,
                fromDate: app.fromDate.toISOString().split('T')[0],
                toDate: app.toDate.toISOString().split('T')[0],
                meals: app.meals,
                reason: app.reason,
                status: app.status,
                createdAt: app.createdAt
            }))
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching applications' 
        });
    }
});

// @route   DELETE /api/mess-off/:id
// @desc    Cancel mess-off application (only if pending)
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.student._id;

        const messOff = await MessOff.findOne({ _id: id, studentId });

        if (!messOff) {
            return res.status(404).json({ 
                success: false, 
                message: 'Application not found' 
            });
        }

        if (messOff.status !== 'Pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Can only cancel pending applications' 
            });
        }

        await MessOff.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Application cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel application error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error cancelling application' 
        });
    }
});

module.exports = router;