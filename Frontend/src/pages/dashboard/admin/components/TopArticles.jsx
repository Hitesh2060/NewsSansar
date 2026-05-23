// src/pages/dashboard/admin/components/TopArticles.jsx
import React from 'react';

const TopArticles = ({ articles }) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">Top Performing Articles</h2>
        </div>
        <div className="text-center py-8 text-gray-500">No articles yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold">Top Performing Articles</h2>
      </div>
      <div className="divide-y">
        {articles.map((article, index) => (
          <div key={article.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
              <div>
                <div className="font-medium text-gray-900">{article.title}</div>
                <div className="text-sm text-gray-500">{article.views} views</div>
              </div>
            </div>
            <div className="flex space-x-4 text-sm">
              <span>💬 {article.comments}</span>
              <span>👍 {article.reactions}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopArticles;