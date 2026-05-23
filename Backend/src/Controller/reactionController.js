// src/Controller/reactionController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Like or dislike an article
// @route   POST /api/reactions
export const toggleReaction = async (req, res) => {
  try {
    const { articleId, type } = req.body;
    
    if (!articleId || !type) {
      return res.status(400).json({ message: 'ArticleId and type are required' });
    }
    
    if (!['LIKE', 'DISLIKE'].includes(type)) {
      return res.status(400).json({ message: 'Type must be LIKE or DISLIKE' });
    }
    
    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Check if user already reacted to this article
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        userId: req.user.id,
        articleId,
      }
    });
    
    if (existingReaction) {
      // If same reaction type, remove it (toggle off)
      if (existingReaction.type === type) {
        await prisma.reaction.delete({
          where: { id: existingReaction.id }
        });
        
        return res.json({
          success: true,
          message: `Reaction removed`,
          action: 'removed',
          reaction: null
        });
      } 
      // If different reaction type, update it
      else {
        const updatedReaction = await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type }
        });
        
        return res.json({
          success: true,
          message: `Reaction changed from ${existingReaction.type} to ${type}`,
          action: 'updated',
          reaction: updatedReaction
        });
      }
    }
    
    // Create new reaction
    const reaction = await prisma.reaction.create({
      data: {
        type,
        userId: req.user.id,
        articleId,
      }
    });
    
    res.status(201).json({
      success: true,
      message: `${type} added to article`,
      action: 'added',
      reaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add this function to reactionController.js

// @desc    Get user's own reactions
export const getMyReactions = async (req, res) => {
  try {
    const reactions = await prisma.reaction.findMany({
      where: { userId: req.user.id },
      include: {
        article: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, reactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reaction counts for an article
// @route   GET /api/reactions/article/:articleId
export const getArticleReactions = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const likes = await prisma.reaction.count({
      where: {
        articleId,
        type: 'LIKE'
      }
    });
    
    const dislikes = await prisma.reaction.count({
      where: {
        articleId,
        type: 'DISLIKE'
      }
    });
    
    // If user is logged in, check their reaction
    let userReaction = null;
    if (req.user) {
      userReaction = await prisma.reaction.findFirst({
        where: {
          articleId,
          userId: req.user.id
        },
        select: { type: true }
      });
    }
    
    res.json({
      success: true,
      reactions: {
        likes,
        dislikes,
        total: likes + dislikes
      },
      userReaction: userReaction?.type || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};