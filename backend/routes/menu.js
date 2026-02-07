const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const { getPublicMenu, upsertPublicMenu } = require('../controllers/menuPageController');

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

        const mapItem = (item) => ({
            id: item._id,
            name: item.name,
            price: item.price,
            image: item.image || `https://placehold.co/300x200/cccccc/FFF?text=${encodeURIComponent(item.name || '')}`,
            category: menu.mealType,
        });

        menus.forEach(menu => {
            if (menuByType[menu.mealType]) {
                menuByType[menu.mealType] = menu.items
                    .filter(item => item.isAvailable)
                    .map(item => mapItem(item));
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

// @route   POST /api/menu/item
// @desc    Add a new item to a meal type (munshi)
// @access  Public
router.post('/item', async (req, res) => {
    try {
        const { mealType, name, price, image } = req.body;

        if (!mealType || !name || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide mealType, name, and price',
            });
        }

        if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid meal type',
            });
        }

        const priceNum = Number(price);
        if (isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a non-negative number',
            });
        }

        let menu = await Menu.findOne({ mealType, isActive: true });

        if (!menu) {
            menu = new Menu({
                mealType,
                items: [],
            });
        }

        menu.items.push({
            name: name.trim(),
            price: priceNum,
            image: image && typeof image === 'string' ? image.trim() : '',
            isAvailable: true,
        });

        await menu.save();

        const newItem = menu.items[menu.items.length - 1];
        res.status(201).json({
            success: true,
            message: 'Meal item added successfully',
            data: {
                id: newItem._id,
                name: newItem.name,
                price: newItem.price,
                image: newItem.image || `https://placehold.co/300x200/cccccc/FFF?text=${encodeURIComponent(newItem.name)}`,
                category: mealType,
            },
        });
    } catch (error) {
        console.error('Add menu item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding menu item',
        });
    }
});

// @route   GET /api/menu/public
// @desc    Get public menu page data (weekly menu, daily items, extra items, hostels) for Menu.jsx
// @access  Public
router.get('/public', getPublicMenu);

// @route   PUT /api/menu/public
// @desc    Update public menu page (admin/cms)
// @access  Public
router.put('/public', upsertPublicMenu);

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

        const items = menu.items
            .filter(item => item.isAvailable)
            .map(item => ({
                id: item._id,
                name: item.name,
                price: item.price,
                image: item.image || `https://placehold.co/300x200/cccccc/FFF?text=${encodeURIComponent(item.name || '')}`,
                category: menu.mealType,
            }));

        res.json({
            success: true,
            data: {
                mealType: menu.mealType,
                items
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