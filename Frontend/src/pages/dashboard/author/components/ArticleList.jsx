// src/pages/dashboard/author/components/ArticleList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const ArticleList = ({ articles, onEdit, onSubmit, onDelete }) => {
  const [filter, setFilter] = useState('all');

  const filteredArticles = articles.filter(article => {
    if (filter === 'all') return true;
    return article.status === filter;
  });

  const filters = [
    { value: 'all', label: 'All', count: articles.length },
    { value: 'DRAFT', label: 'Drafts', count: articles.filter(a => a.status === 'DRAFT').length },
    { value: 'PENDING_APPROVAL', label: 'Pending', count: articles.filter(a => a.status === 'PENDING_APPROVAL').length },
    { value: 'PUBLISHED', label: 'Published', count: articles.filter(a => a.status === 'PUBLISHED').length },
    { value: 'REJECTED', label: 'Rejected', count: articles.filter(a => a.status === 'REJECTED').length },
  ];

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
        <p className="text-gray-500">Click the "Write New Article" button to create your first article.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filter Tabs */}
      <div className="px-6 py-3 border-b bg-gray-50">
        <div className="flex space-x-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                filter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredArticles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link to={`/article/${article.id}`} className="text-blue-600 hover:underline font-medium">
                    {article.title}
                  </Link>
                  {article.rejectionReason && article.status === 'REJECTED' && (
                    <div className="text-xs text-red-500 mt-1">
                      Reason: {article.rejectionReason.substring(0, 60)}...
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">{article.category?.name}</td>
                <td className="px-6 py-4"><StatusBadge status={article.status} /></td>
                <td className="px-6 py-4 text-gray-600">{article.viewCount || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(article.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 space-x-2">
                  {(article.status === 'DRAFT' || article.status === 'REJECTED') && (
                    <>
                      <button
                        onClick={() => onEdit(article)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onSubmit(article.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Submit
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDelete(article.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArticleList;