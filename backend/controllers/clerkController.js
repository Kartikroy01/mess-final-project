const ExcelJS = require("exceljs");
const Student = require("../models/Student");
const MealHistory = require("../models/MealHistory");
const ExtraOrder = require("../models/ExtraOrder");

// Helper: parse month string YYYY-MM to start and end Date
function parseMonth(monthStr) {
  // expect YYYY-MM
  const [y, m] = monthStr.split("-").map(Number);
  if (!y || !m) return null;
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m - 1 + 1, 1);
  return { start, end };
}

exports.getStudentsForMonth = async (req, res) => {
  try {
    const hostel = req.hostel || req.munshi?.hostel;
    if (!hostel)
      return res
        .status(401)
        .json({ success: false, message: "Hostel not found on clerk account" });

    const { month } = req.query;
    if (!month)
      return res
        .status(400)
        .json({
          success: false,
          message: 'Query parameter "month" is required (format: YYYY-MM)',
        });

    const range = parseMonth(month);
    if (!range)
      return res
        .status(400)
        .json({ success: false, message: "Invalid month format. Use YYYY-MM" });

    // Fetch students from this hostel
    const students = await Student.find({
      hostelNo: new RegExp("^" + hostel + "$", "i"),
    })
      .select("roomNo name rollNo")
      .lean();

    const studentIds = students.map((s) => s._id);

    // Aggregate meal counts per student
    const meals = await MealHistory.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lt: range.end },
        },
      },
      { $group: { _id: "$studentId", dietCount: { $sum: 1 } } },
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
    console.error("Error in getStudentsForMonth:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.generateMonthlyBill = async (req, res) => {
  try {
    const hostel = req.hostel || req.munshi?.hostel;
    if (!hostel)
      return res
        .status(401)
        .json({ success: false, message: "Hostel not found on clerk account" });

    const { month, dietRate, billItems } = req.body;
    
    // billItems: array of { name: string, amount: number }

    if (!month)
      return res
        .status(400)
        .json({
          success: false,
          message: 'Body param "month" is required (format: YYYY-MM)',
        });
    if (dietRate === undefined)
      return res
        .status(400)
        .json({ success: false, message: 'Body param "dietRate" is required' });

    const range = parseMonth(month);
    if (!range)
      return res
        .status(400)
        .json({ success: false, message: "Invalid month format. Use YYYY-MM" });

    const students = await Student.find({
      hostelNo: new RegExp("^" + hostel + "$", "i"),
    })
      .select("roomNo name rollNo")
      .lean();

    if (!students.length)
      return res
        .status(404)
        .json({ success: false, message: "No students found for this hostel" });

    const studentIds = students.map((s) => s._id);

    const meals = await MealHistory.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lt: range.end },
        },
      },
      { $group: { _id: "$studentId", dietCount: { $sum: 1 } } },
    ]);

    const mealMap = new Map(meals.map((m) => [String(m._id), m.dietCount]));

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

    // Build Excel
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Bill");

    const columns = [
      { header: "Serial No", key: "serial", width: 10 },
      { header: "Room No", key: "roomNo", width: 12 },
      { header: "Name", key: "name", width: 30 },
      { header: "Roll No", key: "rollNo", width: 18 },
      { header: "Diet", key: "diet", width: 10 },
      { header: "Diet Rate", key: "dietRate", width: 12 },
      { header: "DietRate × Diet", key: "dietTotal", width: 16 },
      { header: "Extra", key: "extra", width: 12 },
    ];

    // Add dynamic columns for bill items
    let billItemsTotal = 0;
    const safeBillItems = Array.isArray(billItems) ? billItems : [];
    
    safeBillItems.forEach((item, index) => {
        columns.push({ header: item.name, key: `item_${index}`, width: 15 });
        billItemsTotal += Number(item.amount) || 0;
    });
    
    columns.push({ header: "Total Bill", key: "total", width: 14 });

    console.log("Generated Columns:", JSON.stringify(columns.map(c => c.header)));

    ws.columns = columns;

    students.forEach((s, idx) => {
      const diet = mealMap.get(String(s._id)) || 0;
      const extra = extraMap.get(String(s._id)) || 0;
      const dietTotal = Number(diet) * Number(dietRate);
      const total = dietTotal + Number(extra) + billItemsTotal;

      const row = {
        serial: idx + 1,
        roomNo: s.roomNo,
        name: s.name,
        rollNo: s.rollNo,
        diet,
        dietRate: Number(dietRate),
        dietTotal,
        extra,
        total,
      };

      // Add dynamic item amounts to row
      safeBillItems.forEach((item, index) => {
          row[`item_${index}`] = Number(item.amount);
      });

      ws.addRow(row);
    });

    // Formatting - make numeric columns numbers
    // Base numeric columns
    // Serial (1), Room (2), Name (3), Roll (4) are typically text.
    // Diet (5) onwards usually numbers.
    ws.columns.forEach((col, index) => {
        if (index >= 4) { // 0-indexed, so 5th column (Diet) onwards
            col.numFmt = "#,##0.00";
        }
    });

    const safeHostelName = String(hostel).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${safeHostelName}_${month}_Bill.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
    console.log(`Bill generated successfully: ${filename}`);
  } catch (err) {
    console.error("Error in generateMonthlyBill:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const hostel = req.hostel || req.munshi?.hostel;
    if (!hostel) return res.status(401).json({ success: false, message: "Hostel not found" });

    const students = await Student.find({
      hostelNo: new RegExp("^" + hostel + "$", "i"),
    })
      .select("name rollNo roomNo isVerified email phoneNo")
      .sort({ roomNo: 1 })
      .lean();

    res.json({ success: true, data: students });
  } catch (err) {
    console.error("Error in getAllStudents:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyStudent = async (req, res) => {
  try {
    const { studentId, action } = req.body; // action: 'approve' or 'reject'
    const hostel = req.hostel || req.munshi?.hostel;

    if (!hostel) return res.status(401).json({ success: false, message: "Hostel not found" });

    const student = await Student.findOne({ _id: studentId, hostelNo: new RegExp("^" + hostel + "$", "i") });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    if (action === "approve") {
      student.isVerified = true;
      await student.save();
      return res.json({ success: true, message: "Student verified successfully" });
    } else if (action === "reject") {
      await Student.findByIdAndDelete(studentId);
      return res.json({ success: true, message: "Student rejected and removed" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }
  } catch (err) {
    console.error("Error in verifyStudent:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
