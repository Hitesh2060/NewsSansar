// src/pages/dashboard/author/components/ArticleStats.jsx
import React from 'react';

const ArticleStats = ({ articles }) => {
  const stats = [
    { 
      label: 'Total Articles', 
      value: articles.length, 
      color: 'blue',
      icon: '📝'
    },
    { 
      label: 'Published', 
      value: articles.filter(a => a.status === 'PUBLISHED').length, 
      color: 'green',
      icon: '✅'
    },
    { 
      label: 'Pending Review', 
      value: articles.filter(a => a.status === 'PENDING_APPROVAL').length, 
      color: 'yellow',
      icon: '⏳'
    },
    { 
      label: 'Drafts', 
      value: articles.filter(a => a.status === 'DRAFT').length, 
      color: 'gray',
      icon: '✏️'
    },
    { 
      label: 'Rejected', 
      value: articles.filter(a => a.status === 'REJECTED').length, 
      color: 'red',
      icon: '❌'
    },
  ];

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600',
    red: 'text-red-600',
  };

  const bgClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    gray: 'bg-gray-50',
    red: 'bg-red-50',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className={`${bgClasses[stat.color]} rounded-lg shadow p-4 transition hover:shadow-md`}>
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${colorClasses[stat.color]}`}>{stat.value}</div>
            <div className="text-2xl">{stat.icon}</div>
          </div>
          <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default ArticleStats;