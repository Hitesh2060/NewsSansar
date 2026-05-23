// src/Routes/articleRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  // Public routes
  getPublishedArticles,
  getArticleById,
  // Author routes
  createArticle,
  updateArticle,
  submitForApproval,
  getMyArticles,
  // Admin routes
  getPendingArticles,
  approveArticle,
  getApprovedArticles,
  publishArticle,
  rejectArticle,
  deleteArticle,
} from '../Controller/articleController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES (Everyone) ====================
router.get('/', getPublishedArticles);
router.get('/:id', getArticleById);

// ==================== AUTHOR ROUTES (Require login - AUTHOR or ADMIN) ====================
router.post('/', protect, authorize('AUTHOR', 'ADMIN'), createArticle);
router.put('/:id', protect, authorize('AUTHOR', 'ADMIN'), updateArticle);
router.post('/:id/submit', protect, authorize('AUTHOR', 'ADMIN'), submitForApproval);
router.get('/my-articles/list', protect, authorize('AUTHOR', 'ADMIN'), getMyArticles);

// ==================== ADMIN ROUTES (Require ADMIN role) ====================
router.get('/admin/pending', protect, authorize('ADMIN'), getPendingArticles);
router.post('/:id/approve', protect, authorize('ADMIN'), approveArticle);
router.get('/admin/approved', protect, authorize('ADMIN'), getApprovedArticles);
router.post('/:id/publish', protect, authorize('ADMIN'), publishArticle);
router.post('/:id/reject', protect, authorize('ADMIN'), rejectArticle);
router.delete('/:id', protect, authorize('ADMIN'), deleteArticle);

export default router;