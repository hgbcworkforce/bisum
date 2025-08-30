const Attendee = require('../models/Attendee');
const { sendEmail } = require('../config/email');

// @desc    Register new attendee
// @route   POST /api/registration
// @access  Public
const registerAttendee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      organization,
      position,
      registrationType,
      dietaryRestrictions,
      specialNeeds,
      sessionPreferences
    } = req.body;

    // Check if attendee already exists
    const existingAttendee = await Attendee.findOne({ email });
    if (existingAttendee) {
      return res.status(400).json({
        success: false,
        message: 'An attendee with this email already exists'
      });
    }

    // Create new attendee
    const attendee = new Attendee({
      firstName,
      lastName,
      email,
      phone,
      organization,
      position,
      registrationType,
      dietaryRestrictions,
      specialNeeds,
      sessionPreferences
    });

    await attendee.save();

    // Send confirmation email
    try {
      await sendEmail(email, 'registrationConfirmation', {
        ...attendee.toObject(),
        registrationNumber: attendee.registrationNumber
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        attendeeId: attendee._id,
        registrationNumber: attendee.registrationNumber,
        registrationSummary: attendee.getRegistrationSummary()
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// @desc    Get attendee by ID
// @route   GET /api/registration/:id
// @access  Public
const getAttendeeById = async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id);
    
    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: 'Attendee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attendee.getRegistrationSummary()
    });

  } catch (error) {
    console.error('Get attendee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendee information'
    });
  }
};

// @desc    Get attendee by registration number
// @route   GET /api/registration/number/:registrationNumber
// @access  Public
const getAttendeeByRegistrationNumber = async (req, res) => {
  try {
    const attendee = await Attendee.findOne({ 
      registrationNumber: req.params.registrationNumber 
    });
    
    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: 'Registration number not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attendee.getRegistrationSummary()
    });

  } catch (error) {
    console.error('Get attendee by registration number error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendee information'
    });
  }
};

// @desc    Update attendee information
// @route   PUT /api/registration/:id
// @access  Public
const updateAttendee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      organization,
      position,
      dietaryRestrictions,
      specialNeeds,
      sessionPreferences
    } = req.body;

    // Find attendee
    const attendee = await Attendee.findById(req.params.id);
    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: 'Attendee not found'
      });
    }

    // Check if payment is completed (prevent updates after payment)
    if (attendee.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update registration after payment is completed'
      });
    }

    // Update fields
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone) updateFields.phone = phone;
    if (organization) updateFields.organization = organization;
    if (position) updateFields.position = position;
    if (dietaryRestrictions !== undefined) updateFields.dietaryRestrictions = dietaryRestrictions;
    if (specialNeeds !== undefined) updateFields.specialNeeds = specialNeeds;
    if (sessionPreferences) updateFields.sessionPreferences = sessionPreferences;

    const updatedAttendee = await Attendee.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Registration updated successfully',
      data: updatedAttendee.getRegistrationSummary()
    });

  } catch (error) {
    console.error('Update attendee error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update registration'
    });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registration/:id
// @access  Public
const cancelRegistration = async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id);
    
    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: 'Attendee not found'
      });
    }

    // Check if payment is completed
    if (attendee.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration after payment is completed. Please contact support for refund.'
      });
    }

    // Update status to cancelled
    attendee.status = 'cancelled';
    await attendee.save();

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration'
    });
  }
};

// @desc    Get registration statistics
// @route   GET /api/registration/stats
// @access  Public
const getRegistrationStats = async (req, res) => {
  try {
    const stats = await Attendee.getRegistrationStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get registration stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve registration statistics'
    });
  }
};

module.exports = {
  registerAttendee,
  getAttendeeById,
  getAttendeeByRegistrationNumber,
  updateAttendee,
  cancelRegistration,
  getRegistrationStats
};

