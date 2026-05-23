// src/pages/dashboard/user/components/UserComments.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../../api/axios';
import toast from 'react-hot-toast';

const UserComments = ({ comments, onRefresh }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    setDeletingId(commentId);
    try {
      await axios.delete(`/comments/${commentId}`);
      toast.success('Comment deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow text-center py-12">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
        <p className="text-gray-500">Start engaging with articles by leaving comments!</p>
        <Link to="/" className="inline-block mt-4 text-blue-600 hover:underline">
          Browse Articles →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">My Comments ({comments.length})</h2>
      </div>
      <div className="divide-y">
        {comments.map((comment) => (
          <div key={comment.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link 
                  to={`/article/${comment.articleId}`} 
                  className="text-blue-600 hover:underline font-medium"
                >
                  {comment.article?.title || 'Article'}
                </Link>
                <p className="text-gray-700 mt-2">{comment.content}</p>
                <div className="text-xs text-gray-400 mt-2">
                  Posted on {new Date(comment.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(comment.id)}
                disabled={deletingId === comment.id}
                className="text-red-500 hover:text-red-700 text-sm ml-4 disabled:opacity-50"
              >
                {deletingId === comment.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserComments;