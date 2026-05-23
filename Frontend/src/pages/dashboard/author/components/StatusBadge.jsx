// src/pages/dashboard/author/components/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status }) => {
  const badges = {
    DRAFT: { color: 'bg-gray-500', label: 'Draft', icon: '✏️' },
    PENDING_APPROVAL: { color: 'bg-yellow-500', label: 'Pending', icon: '⏳' },
    APPROVED: { color: 'bg-green-500', label: 'Approved', icon: '✓' },
    PUBLISHED: { color: 'bg-blue-500', label: 'Published', icon: '🌐' },
    REJECTED: { color: 'bg-red-500', label: 'Rejected', icon: '✗' },
    ARCHIVED: { color: 'bg-gray-400', label: 'Archived', icon: '📦' },
  };

  const config = badges[status] || badges.DRAFT;

  return (
    <span className={`${config.color} text-white text-xs px-2 py-1 rounded-full inline-flex items-center space-x-1`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;