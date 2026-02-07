const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// @route   GET /api/menu/current
// @desc    Get current menu for all meal types
// @access  Public
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
                menuByType[menu.mealType] = menu.items.filter(item => item.isAvailable);
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

// @route   GET /api/menu/:mealType
// @desc    Get menu for specific meal type
// @access  Public
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

        res.json({
            success: true,
            data: {
                mealType: menu.mealType,
                items: menu.items.filter(item => item.isAvailable)
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