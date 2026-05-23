// src/Routes/analyticsRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getDashboardOverview,
  getArticlePerformance,
  getUserEngagement,
  getTrafficAnalytics,
  getContentStatus,
} from '../Controller/analyticsController.js';

const router = express.Router();

// All analytics routes require ADMIN role
router.use(protect, authorize('ADMIN'));

router.get('/overview', getDashboardOverview);
router.get('/articles', getArticlePerformance);
router.get('/users', getUserEngagement);
router.get('/traffic', getTrafficAnalytics);
router.get('/content-status', getContentStatus);

export default router;