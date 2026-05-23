// src/pages/dashboard/user/components/UserProfile.jsx
import React, { useState } from 'react';
import axios from '../../../../api/axios';
import toast from 'react-hot-toast';

const UserProfile = ({ user, onUpdate }) => {
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put('/users/profile', profileData);
      if (response.data.success) {
        onUpdate(response.data.user);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Profile Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {getInitials(user?.name)}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user?.name}</h3>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              {user?.role}
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setProfileData({ name: user?.name, bio: user?.bio });
                }}
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Bio</label>
              <p className="text-gray-900">{user?.bio || 'No bio added yet'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Member Since</label>
              <p className="text-gray-900">
                {new Date(user?.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;