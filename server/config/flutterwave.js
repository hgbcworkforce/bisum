const Flutterwave = require('flutterwave-node-v3');
const crypto = require('crypto');

// Initialize Flutterwave
const flutterwave = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET
);

// Payment configuration
const paymentConfig = {
  tx_ref: () => `BISUM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  currency: 'NGN',
  redirect_url: process.env.FLUTTERWAVE_REDIRECT_URL || 'http://localhost:3000/payment/callback',
  customer: {
    email: '',
    name: '',
    phone_number: ''
  },
  customizations: {
    title: 'BISUM Conference 2025',
    description: 'Conference Registration Fee',
    logo: 'https://bisum.hgbcglobal.org/logo.png'
  }
};

// Initialize payment
const initializePayment = async (paymentData) => {
  try {
    const payload = {
      tx_ref: paymentConfig.tx_ref(),
      amount: paymentData.amount,
      currency: paymentConfig.currency,
      redirect_url: paymentConfig.redirect_url,
      customer: {
        email: paymentData.email,
        name: paymentData.name,
        phone_number: paymentData.phone
      },
      customizations: paymentConfig.customizations,
      meta: {
        attendee_id: paymentData.attendeeId,
        registration_type: paymentData.registrationType
      }
    };

    const response = await flutterwave.Charge.card(payload);
    
    if (response.status === 'success') {
      return {
        success: true,
        paymentUrl: response.data.link,
        transactionRef: payload.tx_ref,
        data: response.data
      };
    } else {
      return {
        success: false,
        error: response.message || 'Payment initialization failed'
      };
    }
    
  } catch (error) {
    console.error('❌ Flutterwave payment initialization failed:', error);
    return {
      success: false,
      error: error.message || 'Payment initialization failed'
    };
  }
};

// Verify payment
const verifyPayment = async (transactionId) => {
  try {
    const response = await flutterwave.Transaction.verify({ id: transactionId });
    
    if (response.status === 'success') {
      const paymentData = response.data;
      
      return {
        success: true,
        data: {
          transactionId: paymentData.id,
          transactionRef: paymentData.tx_ref,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          paidAt: paymentData.created_at,
          paymentMethod: paymentData.payment_type,
          meta: paymentData.meta
        }
      };
    } else {
      return {
        success: false,
        error: response.message || 'Payment verification failed'
      };
    }
    
  } catch (error) {
    console.error('❌ Flutterwave payment verification failed:', error);
    return {
      success: false,
      error: error.message || 'Payment verification failed'
    };
  }
};

// Webhook verification
const verifyWebhook = (signature, requestBody) => {
  try {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const hash = crypto
      .createHmac('sha256', secretHash)
      .update(JSON.stringify(requestBody))
      .digest('hex');
    
    return hash === signature;
  } catch (error) {
    console.error('❌ Webhook verification failed:', error);
    return false;
  }
};

module.exports = {
  flutterwave,
  initializePayment,
  verifyPayment,
  verifyWebhook,
  paymentConfig
};

