const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to other email services
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD  // Your email app password
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Matrimony Login',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Matrimony Login OTP</h2>
        <p>Dear User,</p>
        <p>Your One-Time Password (OTP) for login is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #e74c3c; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP is valid for 10 minutes only.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
        <p>Best regards,<br>Matrimony Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send Password Reset OTP email
const sendPasswordResetOTPEmail = async (email, otp, firstName = 'User') => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset OTP - Matrimony Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">🔐 Password Reset Request</h1>
          <h2 style="color: #f39c12; margin: 0;">Matrimony Services</h2>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0;">Hello ${firstName}!</h3>
          <p style="margin: 0; font-size: 16px;">We received a request to reset your password.</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; text-align: center; margin: 20px 0; border: 2px dashed #e9ecef;">
          <p style="font-size: 18px; color: #495057; margin-bottom: 15px; font-weight: bold;">Your Password Reset OTP:</p>
          <div style="background-color: white; padding: 15px; border-radius: 8px; display: inline-block; border: 2px solid #e74c3c;">
            <h1 style="color: #e74c3c; letter-spacing: 8px; margin: 0; font-size: 36px; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;"><strong>⏰ Important:</strong> This OTP is valid for <strong>15 minutes only</strong>.</p>
        </div>
        
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #721c24;"><strong>🛡️ Security Note:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
          <p style="color: #6c757d; font-size: 14px; margin: 0;">Best regards,<br><strong>Matrimony Services Team</strong></p>
          <p style="color: #adb5bd; font-size: 12px; margin-top: 10px;">This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetOTPEmail
}; 