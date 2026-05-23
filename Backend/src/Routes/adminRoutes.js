// src/Routes/adminRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { toggleUserStatus } from '../Controller/adminController.js';

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router.put('/users/:id/toggle-status', toggleUserStatus);

export default router;