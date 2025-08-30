const express = require('express');
const router = express.Router();
const {
  registerAttendee,
  getAttendeeById,
  getAttendeeByRegistrationNumber,
  updateAttendee,
  cancelRegistration,
  getRegistrationStats
} = require('../controllers/registrationController');

// @route   POST /api/registration
// @desc    Register new attendee
// @access  Public
router.post('/', registerAttendee);

// @route   GET /api/registration/stats
// @desc    Get registration statistics
// @access  Public
router.get('/stats', getRegistrationStats);

// @route   GET /api/registration/:id
// @desc    Get attendee by ID
// @access  Public
router.get('/:id', getAttendeeById);

// @route   GET /api/registration/number/:registrationNumber
// @desc    Get attendee by registration number
// @access  Public
router.get('/number/:registrationNumber', getAttendeeByRegistrationNumber);

// @route   PUT /api/registration/:id
// @desc    Update attendee information
// @access  Public
router.put('/:id', updateAttendee);

// @route   DELETE /api/registration/:id
// @desc    Cancel registration
// @access  Public
router.delete('/:id', cancelRegistration);

module.exports = router;

