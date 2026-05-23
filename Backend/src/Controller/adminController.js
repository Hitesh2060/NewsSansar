// src/Controller/adminController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    });
    
    res.json({
      success: true,
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'}`,
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};