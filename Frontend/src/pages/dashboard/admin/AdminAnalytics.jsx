// src/pages/dashboard/admin/AdminAnalytics.jsx
import React from 'react';
import TopArticles from './components/TopArticles';

const AdminAnalytics = ({ stats, topArticles }) => {
  return (
    <div>
      {/* Top Articles Section */}
      <TopArticles articles={topArticles} />

      {/* Platform Summary Section */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">Platform Summary</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalPublishedArticles}</div>
            <div className="text-sm text-gray-600">Published Articles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalComments}</div>
            <div className="text-sm text-gray-600">Total Comments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.totalReactions}</div>
            <div className="text-sm text-gray-600">Total Reactions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;