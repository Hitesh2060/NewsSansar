// src/pages/dashboard/admin/components/CommentManagement.jsx
import React from 'react';

const CommentManagement = ({ comments, onDeleteComment }) => {
  if (comments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow text-center py-12">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Comments Yet</h3>
        <p className="text-gray-500">Comments from readers will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold">Comment Management</h2>
        <p className="text-sm text-gray-500">Moderate user comments</p>
      </div>
      <div className="divide-y">
        {comments.map((comment) => (
          <div key={comment.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">{comment.author?.name}</span>
                  <span className="text-xs text-gray-400">
                    on {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-blue-600 mb-1">
                  Article: {comment.article?.title}
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
              <button
                onClick={() => onDeleteComment(comment.id)}
                className="text-red-500 hover:text-red-700 text-sm ml-4"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentManagement;