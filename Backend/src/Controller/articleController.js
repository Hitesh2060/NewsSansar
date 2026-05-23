// src/Controller/articleController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== PUBLIC ROUTES (Everyone) ====================

// @desc    Get all published articles
// @route   GET /api/articles
export const getPublishedArticles = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    let filter = { status: 'PUBLISHED' };
    
    if (category) {
      filter.category = { slug: category };
    }
    
    if (search) {
      filter.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const articles = await prisma.article.findMany({
      where: filter,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          }
        },
        category: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          }
        }
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: parseInt(limit),
    });
    
    const total = await prisma.article.count({ where: filter });
    
    res.json({
      success: true,
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single article by slug/id
// @route   GET /api/articles/:id
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await prisma.article.findFirst({
      where: {
        OR: [
          { id: id },
          { id: id, status: 'PUBLISHED' }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            bio: true,
          }
        },
        category: true,
        comments: {
          where: { isApproved: true, parentCommentId: null },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              }
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        reactions: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          }
        }
      }
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    });
    
    res.json({ success: true, article });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== AUTHOR ROUTES (Logged in users with AUTHOR role) ====================

// @desc    Create article (draft)
// @route   POST /api/articles
export const createArticle = async (req, res) => {
  try {
    const { title, content, summary, categoryId, thumbnail } = req.body;
    
    // Validate required fields
    if (!title || !content || !summary || !categoryId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        thumbnail: thumbnail || null,
        status: 'DRAFT',
        authorId: req.user.id,
        categoryId,
      },
      include: {
        author: {
          select: { id: true, name: true }
        },
        category: true,
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Article created as draft',
      article
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update article (only draft or rejected status)
// @route   PUT /api/articles/:id
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, categoryId, thumbnail } = req.body;
    
    // Check if article exists and belongs to author
    const article = await prisma.article.findFirst({
      where: {
        id,
        authorId: req.user.id,
        status: { in: ['DRAFT', 'REJECTED'] }
      }
    });
    
    if (!article) {
      return res.status(404).json({ 
        message: 'Article not found or you cannot edit it in its current status' 
      });
    }
    
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        title: title || article.title,
        content: content || article.content,
        summary: summary || article.summary,
        categoryId: categoryId || article.categoryId,
        thumbnail: thumbnail !== undefined ? thumbnail : article.thumbnail,
        // If rejected and being edited, reset to draft
        status: article.status === 'REJECTED' ? 'DRAFT' : article.status,
        rejectionReason: article.status === 'REJECTED' ? null : article.rejectionReason,
      },
      include: {
        category: true,
      }
    });
    
    res.json({
      success: true,
      message: 'Article updated successfully',
      article: updatedArticle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit article for approval
// @route   POST /api/articles/:id/submit
export const submitForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if article exists and belongs to author
    const article = await prisma.article.findFirst({
      where: {
        id,
        authorId: req.user.id,
        status: 'DRAFT'
      }
    });
    
    if (!article) {
      return res.status(404).json({ 
        message: 'Article not found or already submitted' 
      });
    }
    
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' }
    });
    
    res.json({
      success: true,
      message: 'Article submitted for admin approval',
      article: updatedArticle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get author's own articles
// @route   GET /api/articles/my-articles
export const getMyArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { authorId: req.user.id },
      include: {
        category: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, articles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== ADMIN ROUTES ====================

// Add this function to articleController.js

// @desc    Get pending articles (for admin)
// @route   GET /api/articles/admin/pending
export const getPendingArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json({ success: true, count: articles.length, articles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve article
// @route   POST /api/articles/:id/approve
export const approveArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await prisma.article.findFirst({
      where: {
        id,
        status: 'PENDING_APPROVAL'
      }
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found or not pending' });
    }
    
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      }
    });
    
    res.json({
      success: true,
      message: 'Article approved',
      article: updatedArticle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// @desc    Get approved articles (ready to publish)
// @route   GET /api/articles/admin/approved
export const getApprovedArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'APPROVED' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
      },
      orderBy: { reviewedAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      count: articles.length, 
      articles 
    });
  } catch (error) {
    console.error('Error fetching approved articles:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Publish article (after approval)
// @route   POST /api/articles/:id/publish
export const publishArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await prisma.article.findFirst({
      where: {
        id,
        status: 'APPROVED'
      }
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found or not approved' });
    }
    
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    });
    
    res.json({
      success: true,
      message: 'Article published successfully',
      article: updatedArticle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject article with reason
// @route   POST /api/articles/:id/reject
export const rejectArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Please provide rejection reason' });
    }
    
    const article = await prisma.article.findFirst({
      where: {
        id,
        status: 'PENDING_APPROVAL'
      }
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found or not pending' });
    }
    
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      }
    });
    
    res.json({
      success: true,
      message: 'Article rejected',
      article: updatedArticle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete article (admin only)
// @route   DELETE /api/articles/:id
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await prisma.article.findUnique({
      where: { id }
    });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    await prisma.article.delete({ where: { id } });
    
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};