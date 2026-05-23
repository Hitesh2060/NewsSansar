// src/Routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import { 
  register, 
  login, 
  getMe,
  forgotPassword,
  resetPasswordWithOTP,
  resendOTP,
  changePassword,
  googleCallback,
  getGoogleUser
} from '../Controller/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== Email/Password Auth ====================
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithOTP);
router.post('/resend-otp', resendOTP);

// ==================== Protected Routes ====================
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

// ==================== Google OAuth ====================
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failure' }),
  googleCallback
);

router.get('/google/user', getGoogleUser);
router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

export default router;