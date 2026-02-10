const MenuPage = require('../models/MenuPage');

/**
 * Default menu page payload when no document exists in DB.
 * Mirrors the original frontend structure so the Menu page never breaks.
 */
const DEFAULT_MENU_PAGE = Object.freeze({
  weeklyMenu: [
    { day: 'Monday', breakfast: ['Poha', 'Daliya', 'Tea'], lunch: ['RAJMA', 'ROTI', 'RICE', 'Masala Mix RAITA'], snacks: ['Hot DOG'], dinner: ['Mix Veg', 'DAL MAKHNI', 'ROTI', 'RICE', 'Gulab Jamun'] },
    { day: 'Tuesday', breakfast: ['Besan Chilla', 'Sweet and Green Chutney', 'tea'], lunch: ['Paneer Butter Masala', 'Masar Dal+Rice', 'Mini papad'], snacks: ['Chana Samosa'], dinner: ['Gheeya Kofta', 'Arhar dal', 'roti', 'Roti', 'Kheer'] },
    { day: 'Wednesday', breakfast: ['Vada Pav', 'Green Chutney', 'TEA'], lunch: ['Kadhi Pakoda', 'Aloo Jeera', 'RICE', 'ROTI'], snacks: ['Chips', 'Biscuits', 'Thandai'], dinner: ['Kadhai Chicken/Paneer Chilli', 'ROTI', 'RICE', 'Dal Tadka'] },
    { day: 'Thursday', breakfast: ['IDLI', 'VADA', 'SAMBHAR', 'TEA'], lunch: ['Gobi Aloo', 'Boondi Raita', 'Veg Pulao', 'Moong Dal', 'Roti'], snacks: ['Bread Pakoda'], dinner: ['Matar Mushroom', 'Chana dal', 'ROTI', 'RICE', 'White Sponge Rasgulla'] },
    { day: 'Friday', breakfast: ['Paneer Aloo Pyaz Paratha', 'Butter', 'Tea'], lunch: ['Aloo Bhujia', 'Arhar Dal', 'Rice', 'Roti', 'Fryum Chips'], snacks: ['Pyaz Aloo Kachori'], dinner: ['Malai Kofta/Egg Curry', 'Masoor Dal', 'ROTI', 'RICE', 'Rasmalai'] },
    { day: 'Saturday', breakfast: ['DOSA', 'UTTBAM', 'CHUTNEY', 'SAMBHAR', 'TEA'], lunch: ['Chole Sabzi', 'Pethe Ki Sabzi(Pumpkin)', 'Poori', 'RICE'], snacks: ['Red Sauce Pasta'], dinner: ['Veg Biryani', 'Salan', 'Chinese Mix Veg', 'Roti', 'Ice Cream Lababdar Chicken/Paneer Tikka Masala'] },
    { day: 'Sunday', breakfast: ['AMRITSARI NAAN', 'CHHOLE', 'BUTTER', 'TEA'], lunch: ['Nutri Chura Bhurji', 'Black Chana Gravy', 'ROTI', 'JEERA RICE'], snacks: ['TEA'], dinner: ['MOONG Masur DAL', 'Tandoori Roti', 'RICE'] },
  ],
  dailyItems: [
    { name: 'Breakfast', items: ['PICKLE', 'TEA', 'SAUCE', 'JAM', 'BREAD', 'PEANUT BUTTER', 'OMELETTE', 'CORN FLAKES', 'BUTTER', 'CURD PACKET', 'BREAD SLICES', 'FRESH FRUITS', 'BOILED EGGS'] },
    { name: 'Lunch', items: ['SALAD (KHHIRA, ONION, BeetRoot)', 'PICKLE', 'SAUNF'] },
    { name: 'Snacks', items: ['TEA'] },
  ],
  extraItems: [
    { name: 'Breakfast', items: ['OMELETTE', 'EGG BHURJI'] },
    { name: 'Lunch', items: ['CURD PACKET', 'OMELETTE', 'EGG BHURJI', 'Lassi', 'Seasonal Fruit'] },
    { name: 'Dinner', items: ['MILK PACKET', 'CURD PACKET', 'HOT MILK', 'OMELETTE', 'EG G BHURJI'] },
  ],
  hostels: {
    boys: ['MBH', 'BH-1', 'BH-2', 'BH-3', 'BH-4', 'BH-5', 'BH-6', 'BH-7'],
    girls: ['GH-1', 'GH-2', 'MGH-1', 'MGH-2'],
  },
});

/**
 * Normalize a MenuPage document into the exact shape expected by the frontend.
 * Ensures arrays and nested objects are always present and safe to iterate.
 */
function toPublicPayload(doc) {
  if (!doc) return { ...DEFAULT_MENU_PAGE };
  return {
    weeklyMenu: Array.isArray(doc.weeklyMenu) && doc.weeklyMenu.length > 0
      ? doc.weeklyMenu.map((d) => ({
          day: d.day || '',
          breakfast: Array.isArray(d.breakfast) ? d.breakfast : [],
          lunch: Array.isArray(d.lunch) ? d.lunch : [],
          snacks: Array.isArray(d.snacks) ? d.snacks : [],
          dinner: Array.isArray(d.dinner) ? d.dinner : [],
        }))
      : DEFAULT_MENU_PAGE.weeklyMenu,
    dailyItems: Array.isArray(doc.dailyItems) && doc.dailyItems.length > 0
      ? doc.dailyItems.map((s) => ({ name: s.name || '', items: Array.isArray(s.items) ? s.items : [] }))
      : DEFAULT_MENU_PAGE.dailyItems,
    extraItems: Array.isArray(doc.extraItems) && doc.extraItems.length > 0
      ? doc.extraItems.map((s) => ({ name: s.name || '', items: Array.isArray(s.items) ? s.items : [] }))
      : DEFAULT_MENU_PAGE.extraItems,
    hostels: {
      boys: Array.isArray(doc.hostels?.boys) ? doc.hostels.boys : DEFAULT_MENU_PAGE.hostels.boys,
      girls: Array.isArray(doc.hostels?.girls) ? doc.hostels.girls : DEFAULT_MENU_PAGE.hostels.girls,
    },
  };
}

/**
 * GET public menu page data for the Menu.jsx page.
 * Returns the active MenuPage from DB, or DEFAULT_MENU_PAGE if none exists.
 */
async function getPublicMenu(req, res) {
  console.log('[MenuPageController] getPublicMenu called - PUBLIC ENDPOINT');
  try {
    const doc = await MenuPage.findOne({ isActive: true })
      .sort({ effectiveFrom: -1 })
      .lean()
      .exec();

    console.log('[MenuPageController] Found menu document:', doc ? 'YES' : 'NO');
    const payload = toPublicPayload(doc);

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (err) {
    console.error('getPublicMenu error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load menu page',
      ...(process.env.NODE_ENV === 'development' && { error: err.message }),
    });
  }
}

/**
 * PUT/POST update the active menu page (e.g. for admin).
 * Body: { weeklyMenu?, dailyItems?, extraItems?, hostels? }
 * Creates or replaces the single active document.
 */
async function upsertPublicMenu(req, res) {
  try {
    const { weeklyMenu, dailyItems, extraItems, hostels } = req.body || {};

    const update = {};
    if (Array.isArray(weeklyMenu)) update.weeklyMenu = weeklyMenu;
    if (Array.isArray(dailyItems)) update.dailyItems = dailyItems;
    if (Array.isArray(extraItems)) update.extraItems = extraItems;
    if (hostels && typeof hostels === 'object') {
      update['hostels.boys'] = Array.isArray(hostels.boys) ? hostels.boys : [];
      update['hostels.girls'] = Array.isArray(hostels.girls) ? hostels.girls : [];
    }

    const doc = await MenuPage.findOneAndUpdate(
      { isActive: true },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnCreate: true }
    )
      .lean()
      .exec();

    const payload = toPublicPayload(doc);
    return res.status(200).json({
      success: true,
      message: 'Menu page updated',
      data: payload,
    });
  } catch (err) {
    console.error('upsertPublicMenu error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update menu page',
      ...(process.env.NODE_ENV === 'development' && { error: err.message }),
    });
  }
}

module.exports = {
  getPublicMenu,
  upsertPublicMenu,
  DEFAULT_MENU_PAGE,
  toPublicPayload,
};
