// src/Controller/userController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, bio },
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
    
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};