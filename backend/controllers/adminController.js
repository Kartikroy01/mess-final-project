const Student = require("../models/Student");
const Munshi = require("../models/Munshi");
const BillRecord = require("../models/BillRecord");
const ExtraOrder = require("../models/ExtraOrder");
const Bill = require("../models/Bill");
const Menu = require("../models/menu");
const MealHistory = require("../models/MealHistory");

// Fixed list of hostels
const HOSTELS_LIST = [
  "MBH-A", "MBH-B", "MBH-E", "MBH-F",
  "BH-1", "BH-2", "BH-3", "BH-4", "BH-5", "BH-6", "BH-7",
  "GH-1", "GH-2",
  "MGH-1", "MGH-2"
];

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalMunshis = await Munshi.countDocuments({ type: { $ne: "clerk" } });
    const totalClerks = await Munshi.countDocuments({ type: "clerk" });
    const totalHostels = HOSTELS_LIST.length;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalMunshis,
        totalClerks,
        totalHostels
      }
    });
  } catch (err) {
    console.error("Error in getStats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/hostels
exports.getHostels = async (req, res) => {
  try {
    // Aggregate student counts per hostel
    const studentCounts = await Student.aggregate([
      {
        $group: {
          _id: "$hostelNo",
          total: { $sum: 1 },
          verified: { $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$isVerified", false] }, 1, 0] } }
        }
      }
    ]);

    // Fetch all active Munshis and Clerks
    const staff = await Munshi.find({ isActive: true }).select('name email hostel type').lean();

    // Map student statistics by hostel
    const studentMap = {};
    studentCounts.forEach(c => {
      if (c._id) {
        studentMap[c._id.toUpperCase()] = {
          total: c.total,
          verified: c.verified,
          pending: c.pending
        };
      }
    });

    // Map staff statistics by hostel
    const staffMap = {};
    staff.forEach(s => {
      const hostelKey = s.hostel ? s.hostel.toUpperCase() : '';
      if (!staffMap[hostelKey]) {
        staffMap[hostelKey] = { munshis: [], clerks: [] };
      }
      if (s.type === 'clerk') {
        staffMap[hostelKey].clerks.push({ name: s.name, email: s.email });
      } else {
        staffMap[hostelKey].munshis.push({ name: s.name, email: s.email });
      }
    });

    // Construct final list of hostels
    const result = HOSTELS_LIST.map(h => {
      const hKey = h.toUpperCase();
      return {
        hostelNo: h,
        studentCount: studentMap[hKey]?.total || 0,
        verifiedStudentCount: studentMap[hKey]?.verified || 0,
        pendingStudentCount: studentMap[hKey]?.pending || 0,
        munshis: staffMap[hKey]?.munshis || [],
        clerks: staffMap[hKey]?.clerks || []
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error in getHostels:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/hostels/:hostelNo
exports.getHostelDetails = async (req, res) => {
  try {
    const { hostelNo } = req.params;
    const regexHostel = new RegExp("^" + hostelNo + "$", "i");

    // Fetch students assigned to this hostel
    const students = await Student.find({ hostelNo: regexHostel })
      .select("name rollNo roomNo email phoneNo isVerified isActive")
      .sort({ roomNo: 1 })
      .lean();

    // Fetch Munshis and Clerks assigned to this hostel
    const munshis = await Munshi.find({ hostel: regexHostel, type: { $ne: "clerk" } })
      .select("name email isActive")
      .lean();

    const clerks = await Munshi.find({ hostel: regexHostel, type: "clerk" })
      .select("name email isActive")
      .lean();

    // Fetch bill generation records for this hostel
    const billHistory = await BillRecord.find({ hostel: regexHostel })
      .sort({ generatedAt: -1 })
      .limit(50)
      .lean();

    // Calculate total bills/extras generated this month
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const studentIds = students.map(s => s._id);

    // Sum monthly bills for current month
    const totalBillsAggregate = await Bill.aggregate([
      { $match: { studentId: { $in: studentIds }, month: currentMonth, year: currentYear } },
      { $group: { _id: null, total: { $sum: "$totalBill" } } }
    ]);
    const currentMonthBills = totalBillsAggregate[0]?.total || 0;

    res.json({
      success: true,
      data: {
        hostelNo,
        students,
        munshis,
        clerks,
        billHistory,
        currentMonthBills,
        studentCount: students.length,
        verifiedStudentCount: students.filter(s => s.isVerified).length,
        pendingStudentCount: students.filter(s => !s.isVerified).length,
      }
    });
  } catch (err) {
    console.error("Error in getHostelDetails:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/students
exports.getStudents = async (req, res) => {
  try {
    const { hostelNo, search } = req.query;
    const query = {};
    if (hostelNo) {
      query.hostelNo = new RegExp("^" + hostelNo + "$", "i");
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { rollNo: new RegExp(search, "i") }
      ];
    }

    const students = await Student.find(query)
      .select("name rollNo roomNo hostelNo email phoneNo isVerified isActive photo")
      .sort({ hostelNo: 1, roomNo: 1 })
      .lean();

    res.json({ success: true, data: students });
  } catch (err) {
    console.error("Error in getStudents:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/students/:id/assign
exports.assignStudentHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const { hostelNo, roomNo } = req.body;

    if (!hostelNo) {
      return res.status(400).json({ success: false, message: "Hostel number is required" });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    student.hostelNo = hostelNo;
    if (roomNo) {
      student.roomNo = roomNo;
    }
    student.qrCode = `${student.rollNo}-${hostelNo}-${student.roomNo}`;
    await student.save();

    res.json({
      success: true,
      message: `Student reassigned to ${hostelNo}`,
      data: student
    });
  } catch (err) {
    console.error("Error in assignStudentHostel:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// PATCH /api/admin/students/batch-assign
exports.batchAssignStudents = async (req, res) => {
  try {
    const { studentIds, hostelNo } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: "Student IDs are required" });
    }
    if (!hostelNo) {
      return res.status(400).json({ success: false, message: "Target hostel number is required" });
    }

    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: "No students found matching the provided IDs" });
    }

    const bulkOps = students.map(student => {
      student.hostelNo = hostelNo;
      student.qrCode = `${student.rollNo}-${hostelNo}-${student.roomNo || '101'}`;
      return student.save();
    });

    await Promise.all(bulkOps);

    res.json({
      success: true,
      message: `Successfully reassigned ${students.length} students to ${hostelNo}`
    });
  } catch (err) {
    console.error("Error in batchAssignStudents:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// GET /api/admin/students/:id/details
exports.getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .select("name rollNo roomNo hostelNo email phoneNo isVerified isActive photo createdAt")
      .lean();

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Fetch student's bill records
    const bills = await Bill.find({ studentId: id })
      .sort({ year: -1, month: -1 })
      .lean();

    // Fetch student's recent extra orders
    const extraOrders = await ExtraOrder.find({ studentId: id })
      .sort({ date: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: {
        student,
        bills,
        extraOrders
      }
    });
  } catch (err) {
    console.error("Error in getStudentDetails:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// GET /api/admin/munshis
exports.getMunshis = async (req, res) => {
  try {
    const { hostelNo } = req.query;
    const query = { type: { $ne: "clerk" } };
    if (hostelNo) {
      query.hostel = new RegExp("^" + hostelNo + "$", "i");
    }

    const munshis = await Munshi.find(query)
      .select("name email hostel isActive createdAt")
      .sort({ hostel: 1 })
      .lean();

    res.json({ success: true, data: munshis });
  } catch (err) {
    console.error("Error in getMunshis:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/clerks
exports.getClerks = async (req, res) => {
  try {
    const { hostelNo } = req.query;
    const query = { type: "clerk" };
    if (hostelNo) {
      query.hostel = new RegExp("^" + hostelNo + "$", "i");
    }

    const clerks = await Munshi.find(query)
      .select("name email hostel isActive createdAt")
      .sort({ hostel: 1 })
      .lean();

    res.json({ success: true, data: clerks });
  } catch (err) {
    console.error("Error in getClerks:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/students/:id/verify
exports.verifyStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({
      success: true,
      message: `Student verification updated to ${isVerified}`,
      data: student
    });
  } catch (err) {
    console.error("Error in verifyStudent:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// PATCH /api/admin/students/:id/status
exports.toggleStudentActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({
      success: true,
      message: `Student active status updated to ${isActive}`,
      data: student
    });
  } catch (err) {
    console.error("Error in toggleStudentActive:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// DELETE /api/admin/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    console.error("Error in deleteStudent:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// POST /api/admin/staff
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, hostel, type } = req.body;

    if (!name || !email || !password || !hostel || !type) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await Munshi.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use by another staff member" });
    }

    const staff = await Munshi.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      hostel: hostel.toUpperCase().trim(),
      type
    });

    res.status(201).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`,
      data: staff.toSafeObject ? staff.toSafeObject() : staff
    });
  } catch (err) {
    console.error("Error in createStaff:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// PUT /api/admin/staff/:id
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, hostel, type, password } = req.body;

    const staff = await Munshi.findById(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    if (name) staff.name = name;
    if (email) staff.email = email.toLowerCase().trim();
    if (hostel) staff.hostel = hostel.toUpperCase().trim();
    if (type) staff.type = type;
    if (password && password.length >= 6) {
      staff.password = password;
    }

    await staff.save();

    res.json({
      success: true,
      message: "Staff member updated successfully",
      data: staff.toSafeObject ? staff.toSafeObject() : staff
    });
  } catch (err) {
    console.error("Error in updateStaff:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// PATCH /api/admin/staff/:id/status
exports.toggleStaffActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const staff = await Munshi.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.json({
      success: true,
      message: `Staff active status updated to ${isActive}`,
      data: staff.toSafeObject ? staff.toSafeObject() : staff
    });
  } catch (err) {
    console.error("Error in toggleStaffActive:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// DELETE /api/admin/staff/:id
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Munshi.findByIdAndDelete(id);

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, message: "Staff member deleted successfully" });
  } catch (err) {
    console.error("Error in deleteStaff:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// GET /api/admin/menu/:hostelNo - retrieve menu for a hostel
exports.getHostelMenu = async (req, res) => {
  try {
    const { hostelNo } = req.params;
    const menus = await Menu.find({ hostel: hostelNo.toUpperCase() }).lean();

    const menuByType = {
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: []
    };

    menus.forEach(menu => {
      if (menuByType[menu.mealType]) {
        menu.items.forEach(item => {
          menuByType[menu.mealType].push({
            id: item._id,
            name: item.name,
            price: item.price,
            image: item.image ? (item.image.startsWith('http') ? item.image : `${process.env.VITE_API_URL || 'http://localhost:5000'}${item.image}`) : `https://placehold.co/300x200/cccccc/FFF?text=${encodeURIComponent(item.name || '')}`,
            category: menu.mealType,
            isAvailable: item.isAvailable,
            day: menu.day
          });
        });
      }
    });

    res.json({
      success: true,
      data: menuByType
    });
  } catch (error) {
    console.error('Error in getHostelMenu:', error);
    res.status(500).json({ success: false, message: 'Server error fetching menu: ' + error.message });
  }
};

// POST /api/admin/menu/:hostelNo - update weekly menu for a hostel
exports.updateHostelMenu = async (req, res) => {
  try {
    const { hostelNo } = req.params;
    
    if (!req.body.menuData) {
      return res.status(400).json({ success: false, message: 'Missing menuData' });
    }

    const weeklyMenu = JSON.parse(req.body.menuData);
    const files = req.files || [];
    
    const fileMap = {};
    files.forEach(file => {
      fileMap[file.fieldname] = `/uploads/${file.filename}`;
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];

    for (const day of days) {
      if (!weeklyMenu[day]) continue;

      for (const mealType of mealTypes) {
        if (!weeklyMenu[day][mealType]) continue;

        let menu = await Menu.findOne({ day, mealType, hostel: hostelNo.toUpperCase() });
        
        if (!menu) {
          menu = new Menu({ day, mealType, items: [], hostel: hostelNo.toUpperCase() });
        }

        const newItems = weeklyMenu[day][mealType]
          .filter(item => item.name && item.name.trim())
          .map((item, index) => {
            let imagePath = item.existingImage || '';
            const imageKey = `${day}-${mealType}-${index}`;
            if (fileMap[imageKey]) {
              imagePath = fileMap[imageKey];
            }

            return {
              name: item.name.trim(),
              price: Number(item.price) || 0,
              image: imagePath,
              isAvailable: item.isAvailable !== false
            };
          });

        if (newItems.length > 0) {
          menu.items = newItems;
          menu.isActive = true;
          await menu.save();
        } else if (menu._id) {
          await Menu.deleteOne({ _id: menu._id });
        }
      }
    }

    res.json({ success: true, message: 'Weekly menu updated successfully' });
  } catch (error) {
    console.error('Error in updateHostelMenu:', error);
    res.status(500).json({ success: false, message: 'Server error updating weekly menu: ' + error.message });
  }
};

// Helper: parse month string YYYY-MM to start and end Date
function parseMonth(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  if (!y || !m) return null;
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
}

// GET /api/admin/students-for-bill
exports.getStudentsForBill = async (req, res) => {
  try {
    const { hostelNo, month } = req.query;
    if (!hostelNo) {
      return res.status(400).json({ success: false, message: "Hostel number is required" });
    }
    if (!month) {
      return res.status(400).json({ success: false, message: "Month (YYYY-MM) is required" });
    }

    const range = parseMonth(month);
    if (!range) {
      return res.status(400).json({ success: false, message: "Invalid month format. Use YYYY-MM" });
    }

    // Fetch students from this hostel
    const students = await Student.find({
      hostelNo: new RegExp("^" + hostelNo + "$", "i"),
    })
      .select("roomNo name rollNo")
      .lean();

    const studentIds = students.map((s) => s._id);

    // Aggregate meal counts per student
    const meals = await MealHistory.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lte: range.end },
        },
      },
      { 
        $group: { 
            _id: "$studentId", 
            dietCount: { $sum: { $ifNull: ["$dietCount", 0] } } 
        } 
      },
    ]);

    const mealMap = new Map(meals.map((m) => [String(m._id), m.dietCount]));

    // Aggregate extras
    const extras = await ExtraOrder.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lt: range.end },
        },
      },
      { $group: { _id: "$studentId", extraTotal: { $sum: "$totalAmount" } } },
    ]);

    const extraMap = new Map(extras.map((e) => [String(e._id), e.extraTotal]));

    const result = students.map((s, idx) => ({
      serial: idx + 1,
      studentId: s._id,
      roomNo: s.roomNo,
      name: s.name,
      rollNo: s.rollNo,
      diet: mealMap.get(String(s._id)) || 0,
      extra: extraMap.get(String(s._id)) || 0,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error in getStudentsForBill:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

