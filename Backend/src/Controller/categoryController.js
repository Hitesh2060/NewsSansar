// src/Controller/categoryController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });
    
    res.json({ success: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};