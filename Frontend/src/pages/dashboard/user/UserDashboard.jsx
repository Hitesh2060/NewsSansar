// src/pages/dashboard/user/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from '../../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import UserProfile from './components/UserProfile';
import UserComments from './components/UserComments';
import UserReactions from './components/UserReactions';
import ChangePassword from './components/ChangePassword';

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [myComments, setMyComments] = useState([]);
  const [myReactions, setMyReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserActivity = async () => {
    try {
      const [commentsRes, reactionsRes] = await Promise.all([
        axios.get('/comments/my-comments').catch(() => ({ data: { comments: [] } })),
        axios.get('/reactions/my-reactions').catch(() => ({ data: { reactions: [] } })),
      ]);
      setMyComments(commentsRes.data.comments || []);
      setMyReactions(reactionsRes.data.reactions || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserActivity();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'comments', label: 'Comments', icon: '💬', count: myComments.length },
    { id: 'reactions', label: 'Reactions', icon: '👍', count: myReactions.length },
    { id: 'password', label: 'Security', icon: '🔒' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-gray-600">Manage your account and activity</p>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-3 px-4 transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="capitalize">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <UserProfile user={user} onUpdate={updateUser} />
      )}

      {activeTab === 'comments' && (
        <UserComments comments={myComments} onRefresh={fetchUserActivity} />
      )}

      {activeTab === 'reactions' && (
        <UserReactions reactions={myReactions} />
      )}

      {activeTab === 'password' && (
        <ChangePassword />
      )}
    </div>
  );
};

export default UserDashboard;