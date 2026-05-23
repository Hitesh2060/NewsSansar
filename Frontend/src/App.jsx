// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AuthSuccess from './pages/auth/AuthSuccess';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';

// Dashboard Imports
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import AuthorDashboard from './pages/dashboard/author/AuthorDashboard';
import UserDashboard from './pages/dashboard/user/UserDashboard';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        
        {/* User Dashboard (Reader) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        
        {/* Author Dashboard */}
        <Route
          path="/author/dashboard"
          element={
            <PrivateRoute requiredRole="AUTHOR">
              <AuthorDashboard />
            </PrivateRoute>
          }
        />
        
        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;