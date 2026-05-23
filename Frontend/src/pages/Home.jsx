// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [selectedCategory, searchTerm, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let url = `/articles?page=${currentPage}&limit=9`;
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await axios.get(url);
      setArticles(response.data.articles);
      setTotalPages(response.data.pagination.pages);
      setTotalArticles(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug === selectedCategory ? '' : categorySlug);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && articles.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Latest News</h1>
        <p className="text-gray-600 mt-2">Stay updated with the latest articles</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search articles by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Category Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded-full transition ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`px-4 py-2 rounded-full transition ${
                selectedCategory === category.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-500">
        Found {totalArticles} article{totalArticles !== 1 ? 's' : ''}
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1"
              >
                {article.thumbnail && (
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                  />
                )}
                {!article.thumbnail && (
                  <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-4xl">📰</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {article.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-xs text-gray-500">
                      👁️ {article.viewCount || 0} views
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By {article.author?.name || 'Unknown'}</span>
                    <div className="flex items-center space-x-3">
                      <span>💬 {article._count?.comments || 0}</span>
                      <span>👍 {article._count?.reactions || 0}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {formatDate(article.publishedAt || article.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;