/**
 * Munshi Routes
 *
 * Routes for munshi (mess manager) operations.
 * All routes require munshi authentication and are scoped to the munshi's hostel.
 *
 * @module routes/munshi
 */

const express = require("express");
const router = express.Router();
const munshiAuth = require("../middleware/munshiAuth");
const munshiController = require("../controllers/munshiController");
const clerkController = require("../controllers/clerkController");
const {
  validateStudentLookup,
  validateOrderCreation,
  validateOrdersList,
  validateMessOffList,
  validateMessOffStatus,
} = require("../validators/munshiValidators");

// ==================== MIDDLEWARE ====================

/**
 * All munshi routes require authentication
 * The munshiAuth middleware verifies JWT and attaches munshi object to req.munshi
 */
router.use(munshiAuth);

// ==================== STUDENT OPERATIONS ====================

/**
 * @route   GET /api/munshi/student/lookup
 * @desc    Look up student by ID, roll number, or room number
 * @query   q - Search query (student ID, roll number, or room number)
 * @access  Private (munshi)
 * @returns Student details with current balance
 */
router.get(
  "/student/lookup",
  validateStudentLookup,
  munshiController.lookupStudent,
);

/**
 * @route   GET /api/munshi/students-for-bill
 * @desc    Get students with meal/extra data for a given month
 * @access  Private (Munshi/Clerk)
 */
router.get("/students-for-bill", clerkController.getStudentsForMonth);

/**
 * @route   GET /api/munshi/students-for-daterange
 * @desc    Get students with meal/extra data for a given date range
 * @access  Private (Munshi/Clerk)
 */
router.get("/students-for-daterange", clerkController.getStudentsForDateRange);

/**
 * @route   POST /api/munshi/generate-bill
 * @desc    Generate Excel bill for a month
 * @access  Private (Munshi/Clerk)
 */
router.post("/generate-bill", clerkController.generateMonthlyBill);

/**
 * @route   POST /api/munshi/generate-bill-daterange
 * @desc    Generate Excel bill for a date range
 * @access  Private (Munshi/Clerk)
 */
router.post("/generate-bill-daterange", clerkController.generateBillForDateRange);

/**
 * @route   GET /api/munshi/bill-history
 * @desc    Get bill generation history for the hostel
 * @access  Private (Munshi/Clerk)
 */
router.get("/bill-history", clerkController.getBillHistory);

/**
 * @route   GET /api/munshi/all-students
 * @desc    Get all students (verified & pending)
 * @access  Private (munshi)
 */
router.get("/all-students", clerkController.getAllStudents);

/**
 * @route   POST /api/munshi/verify-student
 * @desc    Approve or reject student
 * @body    studentId, action ('approve'|'reject')
 * @access  Private (munshi)
 */
router.post("/verify-student", clerkController.verifyStudent);

// ==================== ORDER OPERATIONS ====================

/**
 * @route   POST /api/munshi/order
 * @desc    Create an extra-items order for a student
 * @body    studentId, items[], mealType (optional)
 * @access  Private (munshi)
 * @returns Created order details
 */
router.post("/order", validateOrderCreation, munshiController.createOrder);

/**
 * @route   GET /api/munshi/orders
 * @desc    List orders for munshi's hostel with pagination and filtering
 * @query   limit, page, from, to, studentId, mealType (all optional)
 * @access  Private (munshi)
 * @returns Paginated list of orders
 */
router.get("/orders", validateOrdersList, munshiController.getOrders);

// ==================== MESS-OFF OPERATIONS ====================

/**
 * @route   GET /api/munshi/mess-off-requests
 * @desc    List mess-off requests for students in munshi's hostel
 * @query   limit, page, status, from, to (all optional)
 * @access  Private (munshi)
 * @returns Paginated list of mess-off requests
 */
router.get(
  "/mess-off-requests",
  validateMessOffList,
  munshiController.getMessOffRequests,
);

/**
 * @route   PATCH /api/munshi/mess-off/:id/status
 * @desc    Approve or reject a mess-off request
 * @param   id - Mess-off request ID
 * @body    status (Approved/Rejected), rejectionReason (optional)
 * @access  Private (munshi)
 * @returns Updated request status
 */
router.patch(
  "/mess-off/:id/status",
  validateMessOffStatus,
  munshiController.updateMessOffStatus,
);

// ==================== EXPORT ====================

// ==================== EXTRA ITEMS ====================

/**
 * @route   GET /api/munshi/extra-items
 * @desc    Get all available extra items
 * @access  Private (munshi)
 */
router.get("/extra-items", munshiController.getExtraItems);

module.exports = router;
