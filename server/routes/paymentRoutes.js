const express = require('express');
const router = express.Router();
const {
  initializePaymentController,
  verifyPaymentController,
  handleWebhook,
  getPaymentById,
  getPaymentStats
} = require('../controllers/paymentController');

// @route   POST /api/payments/initialize
// @desc    Initialize payment
// @access  Public
router.post('/initialize', initializePaymentController);

// @route   POST /api/payments/verify
// @desc    Verify payment
// @access  Public
router.post('/verify', verifyPaymentController);

// @route   POST /api/payments/webhook
// @desc    Handle Flutterwave webhook
// @access  Public
router.post('/webhook', handleWebhook);

// @route   GET /api/payments/stats
// @desc    Get payment statistics
// @access  Public
router.get('/stats', getPaymentStats);

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Public
router.get('/:id', getPaymentById);

module.exports = router;

