// src/pages/auth/AuthSuccess.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        try {
          localStorage.setItem('token', token);
          const response = await axios.get('/auth/google/user');
          
          if (response.data.success) {
            login(response.data.user, response.data.token);
            toast.success('Google login successful!');
            
            if (response.data.user.role === 'ADMIN') {
              navigate('/admin/dashboard');
            } else if (response.data.user.role === 'AUTHOR') {
              navigate('/author/dashboard');
            } else {
              navigate('/');
            }
          }
        } catch (error) {
          toast.error('Authentication failed');
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleGoogleAuth();
  }, [navigate, login]);

  return <LoadingSpinner />;
};

export default AuthSuccess;