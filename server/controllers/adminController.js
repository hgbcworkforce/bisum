const Attendee = require('../models/Attendee');
const Payment = require('../models/Payment');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Get registration statistics
    const registrationStats = await Attendee.getRegistrationStats();
    
    // Get payment statistics
    const paymentStats = await Payment.getPaymentStats();
    
    // Get recent registrations
    const recentRegistrations = await Attendee.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email organization registrationType paymentStatus registrationDate');
    
    // Get recent payments
    const recentPayments = await Payment.find()
      .populate('attendeeId', 'firstName lastName email organization')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('transactionRef amount status createdAt attendeeId');
    
    // Get registrations by type
    const registrationsByType = await Attendee.aggregate([
      {
        $group: {
          _id: '$registrationType',
          count: { $sum: 1 },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get daily registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyRegistrations = await Attendee.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        registrationStats,
        paymentStats,
        recentRegistrations,
        recentPayments,
        registrationsByType,
        dailyRegistrations
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics'
    });
  }
};

// @desc    Get all attendees with pagination and filters
// @route   GET /api/admin/attendees
// @access  Private (Admin only)
const getAllAttendees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      registrationType = '',
      paymentStatus = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (registrationType) {
      query.registrationType = registrationType;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const attendees = await Attendee.find(query)
      .populate('paymentId', 'transactionRef amount status')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Attendee.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        attendees,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get all attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendees'
    });
  }
};

// @desc    Get attendee details by ID
// @route   GET /api/admin/attendees/:id
// @access  Private (Admin only)
const getAttendeeDetails = async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id)
      .populate('paymentId');

    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: 'Attendee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attendee
    });

  } catch (error) {
    console.error('Get attendee details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendee details'
    });
  }
};

// @desc    Update attendee (admin override)
// @route   PUT /api/admin/attendees/:id
// @access  Private (Admin only)
const updateAttendeeAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      organization,
      position,
      registrationType,
      paymentStatus,
      status,
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

    // Update fields
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone) updateFields.phone = phone;
    if (organization) updateFields.organization = organization;
    if (position) updateFields.position = position;
    if (registrationType) updateFields.registrationType = registrationType;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (status) updateFields.status = status;
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
      message: 'Attendee updated successfully',
      data: updatedAttendee
    });

  } catch (error) {
    console.error('Update attendee admin error:', error);
    
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
      message: 'Failed to update attendee'
    });
  }
};

// @desc    Export attendees data
// @route   GET /api/admin/attendees/export
// @access  Private (Admin only)
const exportAttendees = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const attendees = await Attendee.find()
      .populate('paymentId', 'transactionRef amount status paidAt')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = attendees.map(attendee => {
        const payment = attendee.paymentId;
        return {
          'Registration Number': attendee.registrationNumber,
          'First Name': attendee.firstName,
          'Last Name': attendee.lastName,
          'Email': attendee.email,
          'Phone': attendee.phone,
          'Organization': attendee.organization,
          'Position': attendee.position || '',
          'Registration Type': attendee.registrationType,
          'Payment Status': attendee.paymentStatus,
          'Transaction Ref': payment ? payment.transactionRef : '',
          'Amount': payment ? payment.amount : '',
          'Payment Date': payment ? payment.paidAt : '',
          'Registration Date': attendee.registrationDate,
          'Status': attendee.status
        };
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendees.csv');
      
      // Simple CSV conversion
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value || ''}"`).join(','))
      ].join('\n');
      
      res.send(csvString);
    } else {
      // Return JSON
      res.status(200).json({
        success: true,
        data: attendees
      });
    }

  } catch (error) {
    console.error('Export attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export attendees data'
    });
  }
};

// @desc    Get all payments with pagination
// @route   GET /api/admin/payments
// @access  Private (Admin only)
const getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const payments = await Payment.find(query)
      .populate('attendeeId', 'firstName lastName email organization registrationNumber')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Payment.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllAttendees,
  getAttendeeDetails,
  updateAttendeeAdmin,
  exportAttendees,
  getAllPayments
};

