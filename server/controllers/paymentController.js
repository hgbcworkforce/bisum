const Payment = require('../models/Payment');
const Attendee = require('../models/Attendee');
const { initializePayment, verifyPayment, verifyWebhook } = require('../config/flutterwave');
const { sendEmail } = require('../config/email');

// @desc    Initialize payment
// @route   POST /api/payments/initialize
// @access  Public
const initializePaymentController = async (req, res) => {
  try {
    const { attendeeId, amount, registrationType } = req.body;

    // Validate attendee exists
    const attendee = await Attendee.findById(attendeeId);
    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: 'Attendee not found'
      });
    }

    // Check if attendee already has a pending or successful payment
    const existingPayment = await Payment.findOne({
      attendeeId,
      status: { $in: ['pending', 'successful'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this attendee'
      });
    }

    // Prepare payment data
    const paymentData = {
      attendeeId,
      amount,
      registrationType,
      email: attendee.email,
      name: `${attendee.firstName} ${attendee.lastName}`,
      phone: attendee.phone
    };

    // Initialize payment with Flutterwave
    const paymentResult = await initializePayment(paymentData);

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.error || 'Payment initialization failed'
      });
    }

    // Create payment record in database
    const payment = new Payment({
      transactionRef: paymentResult.transactionRef,
      flutterwaveTransactionId: paymentResult.data.id || 'pending',
      attendeeId,
      amount,
      currency: 'NGN',
      status: 'pending',
      paymentMethod: 'card',
      paymentChannel: 'flutterwave',
      flutterwaveResponse: paymentResult.data,
      metadata: {
        registrationType,
        attendeeEmail: attendee.email
      }
    });

    await payment.save();

    // Update attendee payment status
    attendee.paymentStatus = 'pending';
    attendee.paymentId = payment._id;
    await attendee.save();

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        paymentUrl: paymentResult.paymentUrl,
        transactionRef: paymentResult.transactionRef,
        paymentId: payment._id
      }
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed. Please try again.'
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Public
const verifyPaymentController = async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    // Verify payment with Flutterwave
    const verificationResult = await verifyPayment(transactionId);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.error || 'Payment verification failed'
      });
    }

    const paymentData = verificationResult.data;

    // Find payment in database
    const payment = await Payment.findOne({
      flutterwaveTransactionId: paymentData.transactionId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update payment status
    if (paymentData.status === 'successful') {
      await payment.markAsSuccessful(paymentData);
      
      // Update attendee payment status
      const attendee = await Attendee.findById(payment.attendeeId);
      if (attendee) {
        attendee.paymentStatus = 'completed';
        await attendee.save();

        // Send payment receipt email
        try {
          await sendEmail(attendee.email, 'paymentReceipt', {
            ...attendee.toObject(),
            ...paymentData
          });
        } catch (emailError) {
          console.error('Payment receipt email failed:', emailError);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentStatus: 'completed',
          transactionRef: payment.transactionRef,
          amount: payment.amount
        }
      });
    } else {
      await payment.markAsFailed('Payment verification failed', 'VERIFICATION_FAILED');
      
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: {
          paymentStatus: 'failed',
          transactionRef: payment.transactionRef
        }
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed. Please try again.'
    });
  }
};

// @desc    Handle Flutterwave webhook
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['verif-hash'];
    const requestBody = req.body;

    // Verify webhook signature
    if (!verifyWebhook(signature, requestBody)) {
      console.error('Webhook signature verification failed');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { tx_ref, transaction_id, status, amount, currency } = requestBody;

    // Find payment by transaction reference
    const payment = await Payment.findOne({ transactionRef: tx_ref });

    if (!payment) {
      console.error('Payment not found for webhook:', tx_ref);
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment based on webhook status
    if (status === 'successful') {
      await payment.markAsSuccessful(requestBody);
      
      // Update attendee payment status
      const attendee = await Attendee.findById(payment.attendeeId);
      if (attendee) {
        attendee.paymentStatus = 'completed';
        await attendee.save();

        // Send payment receipt email
        try {
          await sendEmail(attendee.email, 'paymentReceipt', {
            ...attendee.toObject(),
            transactionRef: payment.transactionRef,
            amount: payment.amount,
            paidAt: payment.paidAt,
            paymentMethod: payment.paymentMethod
          });
        } catch (emailError) {
          console.error('Webhook payment receipt email failed:', emailError);
        }
      }

      console.log(`Payment completed via webhook: ${tx_ref}`);
    } else if (status === 'failed' || status === 'cancelled') {
      await payment.markAsFailed(`Payment ${status}`, status.toUpperCase());
      
      // Update attendee payment status
      const attendee = await Attendee.findById(payment.attendeeId);
      if (attendee) {
        attendee.paymentStatus = 'failed';
        await attendee.save();
      }

      console.log(`Payment ${status} via webhook: ${tx_ref}`);
    }

    // Respond to Flutterwave
    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Public
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('attendeeId', 'firstName lastName email organization registrationNumber');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment.getPaymentSummary()
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment information'
    });
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Public
const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.getPaymentStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment statistics'
    });
  }
};

module.exports = {
  initializePaymentController,
  verifyPaymentController,
  handleWebhook,
  getPaymentById,
  getPaymentStats
};

