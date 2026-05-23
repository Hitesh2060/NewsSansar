import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getArticleComments,
  addComment,
  updateComment,
  deleteComment,
  getAllComments,
  moderateComment,
  getMyComments,  
} from '../Controller/commentController.js';

const router = express.Router();

// Public routes
router.get('/article/:articleId', getArticleComments);

// Authenticated user routes
router.post('/', protect, addComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.get('/my-comments', protect, getMyComments);  

// Admin routes
router.get('/admin/all', protect, authorize('ADMIN'), getAllComments);
router.delete('/admin/:id', protect, authorize('ADMIN'), moderateComment);

export default router;