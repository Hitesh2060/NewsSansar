
import React from 'react';

const ApprovedArticles = ({ articles, onPublish }) => {
  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Articles</h3>
        <p className="text-gray-500">Approve articles in Pending tab, then publish them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div key={article.id} className="bg-purple-50 border-l-4 border-purple-500 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
              <div className="text-sm text-gray-500 mt-1">
                By {article.author?.name} | Category: {article.category?.name}
              </div>
              <p className="text-gray-600 mt-2">{article.summary}</p>
              <div className="text-xs text-green-600 mt-2">✓ Ready to publish</div>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onPublish(article.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
              >
                📢 Publish Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovedArticles;