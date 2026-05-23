import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  toggleReaction,
  getArticleReactions,
  getMyReactions,  
} from '../Controller/reactionController.js';

const router = express.Router();

router.post('/', protect, toggleReaction);
router.get('/article/:articleId', getArticleReactions);
router.get('/my-reactions', protect, getMyReactions); 

export default router;