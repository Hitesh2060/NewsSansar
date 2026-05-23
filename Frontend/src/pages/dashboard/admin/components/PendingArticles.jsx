// src/pages/dashboard/admin/components/PendingArticles.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const PendingArticles = ({ articles, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState(null);

  const handleReject = (id) => {
    if (!rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    onReject(id, rejectionReason);
    setRejectionReason('');
    setSelectedArticleId(null);
  };

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Articles</h3>
        <p className="text-gray-500">Articles submitted by authors will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div key={article.id} className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
              <div className="text-sm text-gray-500 mt-1">
                By {article.author?.name} | Category: {article.category?.name}
              </div>
              <p className="text-gray-600 mt-2">{article.summary}</p>
              <div className="text-xs text-gray-400 mt-2">
                Submitted: {new Date(article.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onApprove(article.id)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => setSelectedArticleId(article.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
              >
                ✗ Reject
              </button>
            </div>
          </div>

          {selectedArticleId === article.id && (
            <div className="mt-4 p-4 bg-red-100 rounded-lg">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                rows="2"
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleReject(article.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setSelectedArticleId(null);
                    setRejectionReason('');
                  }}
                  className="bg-gray-300 px-3 py-1 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PendingArticles;