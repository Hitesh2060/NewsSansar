// src/Controller/commentController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== PUBLIC ROUTES ====================

// @desc    Get comments for an article
// @route   GET /api/comments/article/:articleId
export const getArticleComments = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        isApproved: true,
        parentCommentId: null, // Get only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          }
        },
        replies: {
          where: { isApproved: true },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { replies: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, count: comments.length, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add these functions to commentController.js

// @desc    Get user's own comments
export const getMyComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { userId: req.user.id },
      include: {
        article: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// ==================== AUTHENTICATED USER ROUTES ====================

// @desc    Add comment to article
// @route   POST /api/comments
export const addComment = async (req, res) => {
  try {
    const { content, articleId, parentCommentId } = req.body;
    
    if (!content || !articleId) {
      return res.status(400).json({ message: 'Content and articleId are required' });
    }
    
    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // If replying, check if parent comment exists
    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId }
      });
      
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }
    
    const comment = await prisma.comment.create({
      data: {
        content,
        articleId,
        userId: req.user.id,
        parentCommentId: parentCommentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update own comment
// @route   PUT /api/comments/:id
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findFirst({
      where: {
        id,
        userId: req.user.id,
      }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or you cannot edit it' });
    }
    
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          }
        }
      }
    });
    
    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete own comment
// @route   DELETE /api/comments/:id
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findFirst({
      where: {
        id,
        userId: req.user.id,
      }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or you cannot delete it' });
    }
    
    await prisma.comment.delete({ where: { id } });
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== ADMIN ROUTES ====================

// @desc    Get all comments (admin)
// @route   GET /api/comments/admin/all
// @desc    Get all comments (admin)
export const getAllComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        article: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: comments.length, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Moderate comment (delete/approve)
// @route   DELETE /api/comments/admin/:id
export const moderateComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await prisma.comment.findUnique({
      where: { id }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    await prisma.comment.delete({ where: { id } });
    
    res.json({
      success: true,
      message: 'Comment removed by admin'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};