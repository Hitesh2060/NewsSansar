// src/pages/dashboard/admin/components/AdminStats.jsx
import React from 'react';

const AdminStats = ({ stats }) => {
  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'blue', icon: '👥' },
    { label: 'Published', value: stats.totalPublishedArticles, color: 'green', icon: '📰' },
    { label: 'Pending Review', value: stats.totalPendingArticles, color: 'yellow', icon: '⏳' },
    { label: 'Approved', value: stats.totalApprovedArticles, color: 'purple', icon: '✓' },
    { label: 'Comments', value: stats.totalComments, color: 'orange', icon: '💬' },
    { label: 'Reactions', value: stats.totalReactions, color: 'pink', icon: '👍' },
    { label: 'Total Articles', value: stats.totalArticles, color: 'gray', icon: '📄' },
    { label: 'Authors', value: stats.totalAuthors, color: 'indigo', icon: '✍️' },
  ];

  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    pink: 'text-pink-600 bg-pink-50',
    gray: 'text-gray-600 bg-gray-50',
    indigo: 'text-indigo-600 bg-indigo-50',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
      {statCards.map((stat) => (
        <div key={stat.label} className={`${colorClasses[stat.color]} rounded-lg p-3 text-center`}>
          <div className="text-xl font-bold">{stat.value}</div>
          <div className="text-xs">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;