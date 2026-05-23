// src/components/Layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, isAdmin, isAuthor } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Determine which dashboard link to show (only ONE)
  const getDashboardLink = () => {
    if (isAdmin) {
      return { path: '/admin/dashboard', label: 'Admin Dashboard' };
    }
    if (isAuthor) {
      return { path: '/author/dashboard', label: 'Author Dashboard' };
    }
    if (user) {
      return { path: '/dashboard', label: 'My Dashboard' };
    }
    return null;
  };

  const dashboardLink = getDashboardLink();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              NewsPortal
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex ml-10 space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                Home
              </Link>
              
              {/* Show ONLY ONE dashboard link based on role */}
              {dashboardLink && (
                <Link 
                  to={dashboardLink.path} 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2"
                >
                  {dashboardLink.label}
                </Link>
              )}
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Welcome, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;