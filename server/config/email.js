const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  registrationConfirmation: (attendeeData, registrationNumber) => ({
    subject: 'BISUM Conference 2025 - Registration Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🎉 Registration Confirmed!</h2>
        <p>Dear ${attendeeData.firstName} ${attendeeData.lastName},</p>
        
        <p>Your registration for the BISUM Conference 2025 has been successfully confirmed!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📋 Registration Details</h3>
          <p><strong>Registration Number:</strong> ${registrationNumber}</p>
          <p><strong>Full Name:</strong> ${attendeeData.firstName} ${attendeeData.lastName}</p>
          <p><strong>Email:</strong> ${attendeeData.email}</p>
          <p><strong>Phone:</strong> ${attendeeData.phone}</p>
          <p><strong>Organization:</strong> ${attendeeData.organization}</p>
          <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>Please keep this registration number for your records. You will receive further details about the conference schedule and venue closer to the event date.</p>
        
        <p>If you have any questions, please contact us at ${process.env.EMAIL_USER}.</p>
        
        <p>Best regards,<br>BISUM Conference Team</p>
      </div>
    `
  }),
  
  paymentReceipt: (attendeeData, paymentData) => ({
    subject: 'BISUM Conference 2025 - Payment Receipt',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">💰 Payment Receipt</h2>
        <p>Dear ${attendeeData.firstName} ${attendeeData.lastName},</p>
        
        <p>Thank you for your payment for the BISUM Conference 2025!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">💳 Payment Details</h3>
          <p><strong>Transaction Reference:</strong> ${paymentData.transactionRef}</p>
          <p><strong>Amount Paid:</strong> ₦${paymentData.amount}</p>
          <p><strong>Payment Date:</strong> ${new Date(paymentData.paidAt).toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${paymentData.paymentMethod}</p>
        </div>
        
        <p>Your registration is now complete. We look forward to seeing you at the conference!</p>
        
        <p>Best regards,<br>BISUM Conference Team</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data, data.registrationNumber || data.transactionRef);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};

