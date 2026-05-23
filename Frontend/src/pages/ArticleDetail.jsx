// src/pages/ArticleDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [userReaction, setUserReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({ likes: 0, dislikes: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchArticle();
    fetchReactions();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`/articles/${id}`);
      setArticle(response.data.article);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Article not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReactions = async () => {
    try {
      const response = await axios.get(`/reactions/article/${id}`);
      setReactionCounts(response.data.reactions);
      setUserReaction(response.data.userReaction);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (type) => {
    if (!isAuthenticated) {
      toast.error('Please login to react to articles');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post('/reactions', { articleId: id, type });
      if (response.data.success) {
        fetchReactions();
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/comments', {
        content: comment,
        articleId: id,
        parentCommentId: replyTo?.id || null,
      });

      if (response.data.success) {
        toast.success('Comment added successfully');
        setComment('');
        setReplyTo(null);
        fetchArticle(); // Refresh comments
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await axios.delete(`/comments/${commentId}`);
      toast.success('Comment deleted');
      fetchArticle();
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;
  if (!article) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center space-x-1"
      >
        <span>←</span>
        <span>Back</span>
      </button>

      {/* Category Badge */}
      <div className="mb-4">
        <span className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
          {article.category?.name || 'Uncategorized'}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {article.title}
      </h1>

      {/* Author & Meta Info */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {article.author?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="font-medium text-gray-900">{article.author?.name || 'Unknown Author'}</div>
            <div className="text-sm text-gray-500">
              Published on {formatDate(article.publishedAt || article.createdAt)}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-500">
          <span className="flex items-center space-x-1">
            <span>👁️</span>
            <span>{article.viewCount || 0} views</span>
          </span>
        </div>
      </div>

      {/* Thumbnail */}
      {article.thumbnail && (
        <img
          src={article.thumbnail}
          alt={article.title}
          className="w-full rounded-lg mb-6"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      {/* Content */}
      <div className="prose max-w-none mb-8">
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      </div>

      {/* Reactions Section */}
      <div className="flex items-center space-x-4 mb-8 pb-8 border-b">
        <button
          onClick={() => handleReaction('LIKE')}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition ${
            userReaction === 'LIKE'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="text-xl">👍</span>
          <span>{reactionCounts.likes}</span>
        </button>
        <button
          onClick={() => handleReaction('DISLIKE')}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition ${
            userReaction === 'DISLIKE'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="text-xl">👎</span>
          <span>{reactionCounts.dislikes}</span>
        </button>
      </div>

      {/* Comments Section */}
      <div>
        <h3 className="text-xl font-bold mb-4">
          Comments ({article._count?.comments || article.comments?.length || 0})
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="mb-8">
          {replyTo && (
            <div className="bg-gray-100 p-3 rounded-lg mb-3 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Replying to: <strong>{replyTo.author?.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Cancel Reply
              </button>
            </div>
          )}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isAuthenticated ? "Write a comment..." : "Please login to comment"}
            rows="4"
            disabled={!isAuthenticated}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          {isAuthenticated && (
            <button
              type="submit"
              disabled={submitting}
              className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="inline-block mt-3 text-blue-600 hover:underline">
              Login to comment
            </Link>
          )}
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {article.comments?.filter(c => !c.parentCommentId).map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {comment.author?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{comment.author?.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
                {(user?.id === comment.userId || user?.role === 'ADMIN') && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-700 ml-10">{comment.content}</p>
              {isAuthenticated && (
                <button
                  onClick={() => setReplyTo(comment)}
                  className="ml-10 mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Reply
                </button>
              )}

              {/* Replies */}
              {comment.replies?.length > 0 && (
                <div className="ml-10 mt-4 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-white rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {reply.author?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">{reply.author?.name}</div>
                            <div className="text-xs text-gray-500">
                              {formatDate(reply.createdAt)}
                            </div>
                          </div>
                        </div>
                        {(user?.id === reply.userId || user?.role === 'ADMIN') && (
                          <button
                            onClick={() => handleDeleteComment(reply.id)}
                            className="text-red-500 text-xs hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-700 ml-8">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {(!article.comments || article.comments.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;