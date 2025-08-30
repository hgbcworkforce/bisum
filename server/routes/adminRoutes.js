const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllAttendees,
  getAttendeeDetails,
  updateAttendeeAdmin,
  exportAttendees,
  getAllPayments
} = require('../controllers/adminController');

// TODO: Add authentication middleware here
// const { authenticateAdmin } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', getDashboardStats);

// @route   GET /api/admin/attendees
// @desc    Get all attendees with pagination and filters
// @access  Private (Admin only)
router.get('/attendees', getAllAttendees);

// @route   GET /api/admin/attendees/export
// @desc    Export attendees data
// @access  Private (Admin only)
router.get('/attendees/export', exportAttendees);

// @route   GET /api/admin/attendees/:id
// @desc    Get attendee details by ID
// @access  Private (Admin only)
router.get('/attendees/:id', getAttendeeDetails);

// @route   PUT /api/admin/attendees/:id
// @desc    Update attendee (admin override)
// @access  Private (Admin only)
router.put('/attendees/:id', updateAttendeeAdmin);

// @route   GET /api/admin/payments
// @desc    Get all payments with pagination
// @access  Private (Admin only)
router.get('/payments', getAllPayments);

module.exports = router;

