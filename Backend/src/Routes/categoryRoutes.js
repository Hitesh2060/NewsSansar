// src/Routes/categoryRoutes.js
import express from 'express';
import { getCategories } from '../Controller/categoryController.js';

const router = express.Router();

router.get('/', getCategories);

export default router;