// src/Controller/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { generateOTP, sendPasswordResetOTP } from '../utils/emailService.js';

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ==================== EMAIL/PASSWORD AUTH ====================

// @desc    Register User
export const register = async (req, res) => {
  try {
    const { name, email, password, role, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let userRole = 'USER';
    if (role === 'AUTHOR') {
      userRole = 'AUTHOR';
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        bio: bio || '',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        profilePicture: true,
        createdAt: true,
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Please contact admin.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        profilePicture: user.profilePicture,
        isGoogleAuth: user.isGoogleAuth,
      },
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user profile
export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password (when logged in)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== OTP PASSWORD RESET ====================

// @desc    Request OTP for password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: 'If your email is registered, you will receive an OTP' 
      });
    }
    
    // Check if user signed up with Google
    if (user.isGoogleAuth) {
      return res.status(400).json({ 
        message: 'This account uses Google Sign-In. Please login with Google.' 
      });
    }
    
    const otp = generateOTP();
    const resetOtpExpires = new Date(Date.now() + 10 * 60000);
    
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: hashedOTP,
        resetOtpExpires,
      }
    });
    
    const emailSent = await sendPasswordResetOTP(user.email, otp, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending OTP. Please try again.' });
    }
    
    res.json({
      success: true,
      message: 'OTP sent to your email',
      ...(process.env.NODE_ENV !== 'production' && { devOTP: otp })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify OTP and reset password
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    
    const user = await prisma.user.findFirst({
      where: {
        email,
        resetOtp: hashedOTP,
        resetOtpExpires: { gt: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpires: null,
      }
    });
    
    res.json({
      success: true,
      message: 'Password reset successful! Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: 'If your email is registered, you will receive an OTP' 
      });
    }
    
    const otp = generateOTP();
    const resetOtpExpires = new Date(Date.now() + 10 * 60000);
    
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: hashedOTP,
        resetOtpExpires,
      }
    });
    
    const emailSent = await sendPasswordResetOTP(user.email, otp, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending OTP' });
    }
    
    res.json({
      success: true,
      message: 'New OTP sent to your email',
      ...(process.env.NODE_ENV !== 'production' && { devOTP: otp })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== GOOGLE OAUTH ====================

// @desc    Google OAuth callback
export const googleCallback = (req, res) => {
  try {
    const token = generateToken(req.user.id);
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/success?token=${token}`);
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
};

// @desc    Get user after Google auth
export const getGoogleUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const token = generateToken(req.user.id);
    
    res.json({
      success: true,
      user: req.user,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};