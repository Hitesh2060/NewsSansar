// src/pages/dashboard/user/components/UserReactions.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const UserReactions = ({ reactions }) => {
  if (reactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow text-center py-12">
        <div className="text-6xl mb-4">👍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reactions yet</h3>
        <p className="text-gray-500">Like or dislike articles to show your feedback!</p>
        <Link to="/" className="inline-block mt-4 text-blue-600 hover:underline">
          Browse Articles →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">My Reactions ({reactions.length})</h2>
      </div>
      <div className="divide-y">
        {reactions.map((reaction) => (
          <div key={reaction.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {reaction.type === 'LIKE' ? '👍' : '👎'}
              </div>
              <div>
                <Link 
                  to={`/article/${reaction.articleId}`} 
                  className="text-blue-600 hover:underline font-medium"
                >
                  {reaction.article?.title || 'Article'}
                </Link>
                <div className="text-xs text-gray-400 mt-1">
                  {reaction.type === 'LIKE' ? 'Liked' : 'Disliked'} on {new Date(reaction.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserReactions;