// src/pages/dashboard/author/AuthorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from '../../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ArticleStats from './components/ArticleStats';
import ArticleList from './components/ArticleList';
import ArticleForm from './components/ArticleForm';

const AuthorDashboard = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        axios.get('/articles/my-articles/list'),
        axios.get('/categories'),
      ]);
      setArticles(articlesRes.data.articles || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveArticle = async (formData) => {
    try {
      if (editingArticle) {
        await axios.put(`/articles/${editingArticle.id}`, formData);
        toast.success('Article updated successfully');
      } else {
        await axios.post('/articles', formData);
        toast.success('Article created as draft');
      }
      setShowModal(false);
      setEditingArticle(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save article');
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await axios.post(`/articles/${id}/submit`);
      toast.success('Article submitted for approval');
      fetchData();
    } catch (error) {
      toast.error('Failed to submit article');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    try {
      await axios.delete(`/articles/${id}`);
      toast.success('Article deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete article');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Author Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <button
          onClick={() => {
            setEditingArticle(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Write New Article
        </button>
      </div>

      {/* Stats */}
      <ArticleStats articles={articles} />

      {/* Articles List */}
      <ArticleList
        articles={articles}
        onEdit={(article) => {
          setEditingArticle(article);
          setShowModal(true);
        }}
        onSubmit={handleSubmitForApproval}
        onDelete={handleDeleteArticle}
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <ArticleForm
          article={editingArticle}
          categories={categories}
          onSubmit={handleSaveArticle}
          onCancel={() => {
            setShowModal(false);
            setEditingArticle(null);
          }}
        />
      )}
    </div>
  );
};

export default AuthorDashboard;