const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const upload = require('../middleware/upload');

// All admin routes are protected by adminAuth middleware
router.use(adminAuth);

// GET /api/admin/stats - overall statistics
router.get('/stats', adminController.getStats);

// GET /api/admin/hostels - list of hostels with summaries
router.get('/hostels', adminController.getHostels);

// GET /api/admin/hostels/:hostelNo - detailed data for a specific hostel
router.get('/hostels/:hostelNo', adminController.getHostelDetails);

// GET /api/admin/students - list of all students (optional query ?hostelNo=BH-1)
router.get('/students', adminController.getStudents);

// GET /api/admin/students-for-bill - get aggregated bill data for a hostel and month
router.get('/students-for-bill', adminController.getStudentsForBill);

// GET /api/admin/students/:id/details - get student details and history
router.get('/students/:id/details', adminController.getStudentDetails);

// GET /api/admin/munshis - list of all munshis (optional query ?hostelNo=BH-1)
router.get('/munshis', adminController.getMunshis);

// GET /api/admin/clerks - list of all clerks (optional query ?hostelNo=BH-1)
router.get('/clerks', adminController.getClerks);

// PATCH /api/admin/students/:id/verify - verify student
router.patch('/students/:id/verify', adminController.verifyStudent);

// PATCH /api/admin/students/:id/status - toggle student active status
router.patch('/students/:id/status', adminController.toggleStudentActive);

// DELETE /api/admin/students/:id - delete student
router.delete('/students/:id', adminController.deleteStudent);

// PATCH /api/admin/students/:id/assign - assign student to another hostel/munshi
router.patch('/students/:id/assign', adminController.assignStudentHostel);

// PATCH /api/admin/students/batch-assign - reassign multiple students together
router.patch('/students/batch-assign', adminController.batchAssignStudents);

// GET /api/admin/menu/:hostelNo - retrieve menu for a hostel
router.get('/menu/:hostelNo', adminController.getHostelMenu);

// POST /api/admin/menu/:hostelNo - update menu for a hostel
router.post('/menu/:hostelNo', upload.any(), adminController.updateHostelMenu);

// POST /api/admin/staff - create Munshi/Clerk
router.post('/staff', adminController.createStaff);

// PUT /api/admin/staff/:id - edit Munshi/Clerk details
router.put('/staff/:id', adminController.updateStaff);

// PATCH /api/admin/staff/:id/status - toggle staff active status
router.patch('/staff/:id/status', adminController.toggleStaffActive);

// DELETE /api/admin/staff/:id - delete staff member
router.delete('/staff/:id', adminController.deleteStaff);

module.exports = router;
