const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment Reference
  transactionRef: {
    type: String,
    required: true,
    unique: true
  },
  flutterwaveTransactionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Attendee Information
  attendeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendee',
    required: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD', 'EUR']
  },
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    required: true
  },
  paymentChannel: {
    type: String,
    required: true
  },
  
  // Flutterwave Response Data
  flutterwaveResponse: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: {
    type: Date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Additional Information
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Error Information (if payment failed)
  errorMessage: {
    type: String,
    trim: true
  },
  errorCode: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ transactionRef: 1 });
paymentSchema.index({ flutterwaveTransactionId: 1 });
paymentSchema.index({ attendeeId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paidAt: 1 });

// Virtual for payment status
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'successful';
});

paymentSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

paymentSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

// Method to get payment summary
paymentSchema.methods.getPaymentSummary = function() {
  return {
    transactionRef: this.transactionRef,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    paymentMethod: this.paymentMethod,
    paidAt: this.paidAt,
    attendeeId: this.attendeeId
  };
};

// Method to mark payment as successful
paymentSchema.methods.markAsSuccessful = function(flutterwaveData) {
  this.status = 'successful';
  this.paidAt = new Date();
  this.flutterwaveResponse = flutterwaveData;
  this.updatedAt = new Date();
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function(errorMessage, errorCode) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.errorCode = errorCode;
  this.updatedAt = new Date();
  return this.save();
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          successfulPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] }
          },
          successfulAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'successful'] }, '$amount', 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    if (stats.length > 0) {
      return {
        totalPayments: stats[0].totalPayments,
        totalAmount: stats[0].totalAmount,
        successfulPayments: stats[0].successfulPayments,
        successfulAmount: stats[0].successfulAmount,
        pendingPayments: stats[0].pendingPayments,
        failedPayments: stats[0].failedPayments,
        successRate: (stats[0].successfulPayments / stats[0].totalPayments * 100).toFixed(2)
      };
    }
    
    return {
      totalPayments: 0,
      totalAmount: 0,
      successfulPayments: 0,
      successfulAmount: 0,
      pendingPayments: 0,
      failedPayments: 0,
      successRate: 0
    };
  } catch (error) {
    throw new Error('Failed to get payment statistics');
  }
};

// Static method to get payments by date range
paymentSchema.statics.getPaymentsByDateRange = async function(startDate, endDate) {
  try {
    const query = {};
    
    if (startDate && endDate) {
      query.paidAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const payments = await this.find(query)
      .populate('attendeeId', 'firstName lastName email organization')
      .sort({ paidAt: -1 });
    
    return payments;
  } catch (error) {
    throw new Error('Failed to get payments by date range');
  }
};

module.exports = mongoose.model('Payment', paymentSchema);

