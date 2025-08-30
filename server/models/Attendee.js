const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^(\+234|0)[789][01]\d{8}$/, 'Please enter a valid Nigerian phone number']
  },
  
  // Organization Information
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  
  // Registration Details
  registrationNumber: {
    type: String,
    unique: true,
    required: true
  },
  registrationType: {
    type: String,
    enum: ['student', 'professional', 'speaker', 'sponsor'],
    required: [true, 'Registration type is required']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  
  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  
  // Additional Information
  dietaryRestrictions: {
    type: String,
    trim: true,
    maxlength: [200, 'Dietary restrictions cannot exceed 200 characters']
  },
  specialNeeds: {
    type: String,
    trim: true,
    maxlength: [200, 'Special needs cannot exceed 200 characters']
  },
  
  // Conference Preferences
  sessionPreferences: [{
    type: String,
    trim: true
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'cancelled', 'refunded'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate registration number before saving
attendeeSchema.pre('save', async function(next) {
  if (this.isNew && !this.registrationNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const year = new Date().getFullYear();
      this.registrationNumber = `Bisum/${year}/${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Index for efficient queries
attendeeSchema.index({ email: 1 });
attendeeSchema.index({ registrationNumber: 1 });
attendeeSchema.index({ paymentStatus: 1 });
attendeeSchema.index({ registrationDate: 1 });

// Virtual for full name
attendeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for registration status
attendeeSchema.virtual('isFullyRegistered').get(function() {
  return this.paymentStatus === 'completed';
});

// Method to get registration summary
attendeeSchema.methods.getRegistrationSummary = function() {
  return {
    registrationNumber: this.registrationNumber,
    fullName: this.fullName,
    email: this.email,
    organization: this.organization,
    registrationType: this.registrationType,
    paymentStatus: this.paymentStatus,
    registrationDate: this.registrationDate
  };
};

// Static method to get statistics
attendeeSchema.statics.getRegistrationStats = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: 1 },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
          },
          byType: {
            $push: '$registrationType'
          }
        }
      }
    ]);
    
    if (stats.length > 0) {
      const typeCounts = stats[0].byType.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      return {
        totalRegistrations: stats[0].totalRegistrations,
        pendingPayments: stats[0].pendingPayments,
        completedPayments: stats[0].completedPayments,
        byType: typeCounts
      };
    }
    
    return {
      totalRegistrations: 0,
      pendingPayments: 0,
      completedPayments: 0,
      byType: {}
    };
  } catch (error) {
    throw new Error('Failed to get registration statistics');
  }
};

module.exports = mongoose.model('Attendee', attendeeSchema);

