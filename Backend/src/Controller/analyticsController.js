// src/Controller/analyticsController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get dashboard overview stats
// @route   GET /api/admin/analytics/overview
export const getDashboardOverview = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Parallel queries for better performance
    const [
      totalUsers,
      totalAuthors,
      totalArticles,
      totalPublishedArticles,
      totalPendingArticles,
      totalApprovedArticles,
      totalComments,
      totalReactions,
      recentUsers,
      recentArticles,
      recentComments,
      topArticles,
      topAuthors,
      categoryDistribution,
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.user.count({ where: { role: 'AUTHOR' } }),
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.article.count({ where: { status: 'APPROVED' } }), // ADDED: Approved articles count
      prisma.comment.count(),
      prisma.reaction.count(),
      
      // Recent activities (last 7 days)
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.article.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.comment.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      
      // Top 5 articles by views
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          viewCount: true,
          publishedAt: true,
          _count: {
            select: {
              comments: true,
              reactions: true,
            }
          }
        },
        orderBy: { viewCount: 'desc' },
        take: 5
      }),
      
      // Top 5 authors by article count
      prisma.user.findMany({
        where: { role: 'AUTHOR' },
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
          _count: {
            select: {
              authoredArticles: {
                where: { status: 'PUBLISHED' }
              }
            }
          }
        },
        orderBy: {
          authoredArticles: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      
      // Category distribution
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              articles: {
                where: { status: 'PUBLISHED' }
              }
            }
          }
        },
        orderBy: {
          articles: {
            _count: 'desc'
          }
        },
        take: 5
      }),
    ]);

    // Calculate engagement rate
    const totalEngagement = totalComments + totalReactions;
    const engagementRate = totalPublishedArticles > 0 
      ? (totalEngagement / totalPublishedArticles).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalAuthors,
          totalArticles,
          totalPublishedArticles,
          totalPendingArticles,
          totalApprovedArticles, // ADDED: Send approved articles count
          totalComments,
          totalReactions,
          engagementRate: parseFloat(engagementRate),
        },
        recentActivity: {
          newUsersLast7Days: recentUsers,
          newArticlesLast7Days: recentArticles,
          newCommentsLast7Days: recentComments,
        },
        topArticles: topArticles.map(article => ({
          id: article.id,
          title: article.title,
          views: article.viewCount,
          comments: article._count.comments,
          reactions: article._count.reactions,
          publishedAt: article.publishedAt,
        })),
        topAuthors: topAuthors.map(author => ({
          id: author.id,
          name: author.name,
          email: author.email,
          articleCount: author._count.authoredArticles,
        })),
        categoryDistribution: categoryDistribution.map(cat => ({
          name: cat.name,
          slug: cat.slug,
          articleCount: cat._count.articles,
        })),
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user engagement metrics
// @route   GET /api/admin/analytics/users
export const getUserEngagement = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isActive: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
            authoredArticles: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const usersWithEngagement = users.map(user => ({
      ...user,
      totalEngagement: user._count.comments + user._count.reactions
    }));
    
    const totalActiveUsers = usersWithEngagement.filter(u => u.isActive).length;
    const totalEngagedUsers = usersWithEngagement.filter(u => u.totalEngagement > 0).length;
    
    res.json({
      success: true,
      summary: {
        totalUsers: users.length,
        activeUsers: totalActiveUsers,
        engagedUsers: totalEngagedUsers,
        engagementRate: ((totalEngagedUsers / users.length) * 100).toFixed(1)
      },
      users: usersWithEngagement
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get article performance metrics
// @route   GET /api/admin/analytics/articles
export const getArticlePerformance = async (req, res) => {
  try {
    const { limit = 20, sortBy = 'views', order = 'desc' } = req.query;
    
    let orderBy = {};
    if (sortBy === 'views') orderBy = { viewCount: order };
    else if (sortBy === 'comments') orderBy = { comments: { _count: order } };
    else if (sortBy === 'reactions') orderBy = { reactions: { _count: order } };
    else if (sortBy === 'date') orderBy = { publishedAt: order };
    else orderBy = { viewCount: 'desc' };
    
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        summary: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: { id: true, name: true }
        },
        category: {
          select: { id: true, name: true }
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          }
        }
      },
      orderBy,
      take: parseInt(limit)
    });
    
    res.json({
      success: true,
      count: articles.length,
      articles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get traffic/views analytics
// @route   GET /api/admin/analytics/traffic
export const getTrafficAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let days = 7;
    if (period === '30d') days = 30;
    if (period === '90d') days = 90;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { gte: startDate }
      },
      select: {
        id: true,
        title: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: { viewCount: 'desc' }
    });
    
    const totalViews = articles.reduce((sum, article) => sum + article.viewCount, 0);
    const averageViews = articles.length > 0 ? totalViews / articles.length : 0;
    
    res.json({
      success: true,
      data: {
        period: days + ' days',
        summary: {
          totalArticles: articles.length,
          totalViews,
          averageViewsPerArticle: parseFloat(averageViews.toFixed(1)),
          mostViewedArticle: articles[0] ? {
            title: articles[0].title,
            views: articles[0].viewCount
          } : null
        },
        topArticles: articles.slice(0, 10)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get content status summary
// @route   GET /api/admin/analytics/content-status
export const getContentStatus = async (req, res) => {
  try {
    const statusCounts = await prisma.article.groupBy({
      by: ['status'],
      _count: true
    });
    
    const statusMap = {
      DRAFT: 0,
      PENDING_APPROVAL: 0,
      APPROVED: 0,
      PUBLISHED: 0,
      REJECTED: 0,
      ARCHIVED: 0
    };
    
    statusCounts.forEach(item => {
      statusMap[item.status] = item._count;
    });
    
    const pendingArticles = await prisma.article.findMany({
      where: { status: 'PENDING_APPROVAL' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json({
      success: true,
      data: {
        statusDistribution: statusMap,
        pendingApproval: {
          count: pendingArticles.length,
          articles: pendingArticles
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};