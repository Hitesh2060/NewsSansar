// src/pages/dashboard/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from '../../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AdminStats from './components/AdminStats';
import PendingArticles from './components/PendingArticles';
import ApprovedArticles from './components/ApprovedArticles';
import UserManagement from './components/UserManagement';
import CommentManagement from './components/CommentManagement';
import AdminAnalytics from './AdminAnalytics';

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  
  // State for data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAuthors: 0,
    totalArticles: 0,
    totalPublishedArticles: 0,
    totalPendingArticles: 0,
    totalApprovedArticles: 0,
    totalComments: 0,
    totalReactions: 0,
  });
  const [pendingArticles, setPendingArticles] = useState([]);
  const [approvedArticles, setApprovedArticles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [topArticles, setTopArticles] = useState([]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    
    if (!token) {
      toast.error('Please login again');
      setLoading(false);
      return;
    }

    try {
      // Fetch analytics/overview
      const analyticsRes = await axios.get('/admin/analytics/overview');
      if (analyticsRes.data.success) {
        const summary = analyticsRes.data.data.summary;
        setStats({
          totalUsers: summary.totalUsers || 0,
          totalAuthors: summary.totalAuthors || 0,
          totalArticles: summary.totalArticles || 0,
          totalPublishedArticles: summary.totalPublishedArticles || 0,
          totalPendingArticles: summary.totalPendingArticles || 0,
          totalApprovedArticles: summary.totalApprovedArticles || 0,
          totalComments: summary.totalComments || 0,
          totalReactions: summary.totalReactions || 0,
        });
        setTopArticles(analyticsRes.data.data.topArticles || []);
      }

      // Fetch pending articles
      const pendingRes = await axios.get('/articles/admin/pending');
      setPendingArticles(pendingRes.data.articles || []);

      // Fetch approved articles
      const approvedRes = await axios.get('/articles/admin/approved');
      setApprovedArticles(approvedRes.data.articles || []);

      // Fetch users
      const usersRes = await axios.get('/admin/analytics/users');
      setAllUsers(usersRes.data.users || []);

      // Fetch comments
      const commentsRes = await axios.get('/comments/admin/all');
      setAllComments(commentsRes.data.comments || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Action Handlers
  const handleApprove = async (id) => {
    try {
      await axios.post(`/articles/${id}/approve`);
      toast.success('Article approved! Go to Approved tab to publish.');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve article');
    }
  };

  const handlePublish = async (id) => {
    try {
      await axios.post(`/articles/${id}/publish`);
      toast.success('Article published successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to publish article');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await axios.post(`/articles/${id}/reject`, { reason });
      toast.success('Article rejected');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to reject article');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`/admin/users/${userId}/toggle-status`);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await axios.delete(`/comments/admin/${commentId}`);
      toast.success('Comment deleted');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'pending', label: '⏳ Pending', count: pendingArticles.length, color: 'yellow' },
    { id: 'approved', label: '✓ Approved', count: approvedArticles.length, color: 'purple' },
    { id: 'users', label: '👥 Users', count: allUsers.length, color: 'blue' },
    { id: 'comments', label: '💬 Comments', count: allComments.length, color: 'green' },
    { id: 'analytics', label: '📊 Analytics', color: 'indigo' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome back, {user?.name}!</p>

      {/* Stats Cards */}
      <AdminStats stats={stats} />

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-4 whitespace-nowrap ${
                activeTab === tab.id
                  ? `border-b-2 border-${tab.color}-500 text-${tab.color}-600 font-medium`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1 text-xs bg-${tab.color}-100 px-1.5 py-0.5 rounded-full`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' && (
        <PendingArticles
          articles={pendingArticles}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {activeTab === 'approved' && (
        <ApprovedArticles
          articles={approvedArticles}
          onPublish={handlePublish}
        />
      )}

      {activeTab === 'users' && (
        <UserManagement
          users={allUsers}
          onToggleStatus={handleToggleUserStatus}
        />
      )}

      {activeTab === 'comments' && (
        <CommentManagement
          comments={allComments}
          onDeleteComment={handleDeleteComment}
        />
      )}

      {activeTab === 'analytics' && (
        <AdminAnalytics
          stats={stats}
          topArticles={topArticles}
        />
      )}
    </div>
  );
};

export default AdminDashboard;