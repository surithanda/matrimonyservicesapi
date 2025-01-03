import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use App Password if using Gmail
  }
});

// Generate a 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
export const sendOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your One-Time Password (OTP) for Account Verification',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #4CAF50;">Account Verification</h2>
          <p>Dear User,</p>
          <p>We received a request to verify your account. Please use the OTP below to proceed:</p>
          <div style="font-size: 18px; font-weight: bold; margin: 20px 0; color: #333;">
            ${otp}
          </div>
          <p><strong>Note:</strong> This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #555;">For your security, do not share this OTP with anyone.</p>
          <p style="font-size: 12px; color: #555;">If you have any questions, please contact our support team.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};