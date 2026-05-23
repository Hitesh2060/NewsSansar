// src/utils/emailService.js
import nodemailer from 'nodemailer';

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create Gmail transporter
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER||'hiteshbhatt2060@gmail.com',
      pass: process.env.EMAIL_PASS ||'hnaq oyfk izrd lqmq',
    },
  });
};

// Send OTP for password reset
export const sendPasswordResetOTP = async (email, otp, userName) => {
  try {
    const transporter = createGmailTransporter();
    
    await transporter.verify();
    
    const mailOptions = {
      from: `"News Portal" <${process.env.EMAIL_USER||'hiteshbhatt2060@gmail.com'}>`,
      to: email,
      subject: '🔐 Password Reset OTP - News Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Password Reset OTP</h2>
          <hr>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>You requested to reset your password. Use the OTP below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 15px 30px; background-color: #007bff; color: white; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 10px;">
              ${otp}
            </div>
          </div>
          <p><strong>This OTP will expire in 10 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">News Portal Web Application</p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ OTP email error:', error.message);
    return false;
  }
};