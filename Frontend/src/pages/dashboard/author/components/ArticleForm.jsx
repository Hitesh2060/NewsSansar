// src/pages/dashboard/author/components/ArticleForm.jsx
import React, { useState, useEffect } from 'react';

const ArticleForm = ({ article, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    categoryId: '',
    thumbnail: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        content: article.content || '',
        summary: article.summary || '',
        categoryId: article.categoryId || '',
        thumbnail: article.thumbnail || '',
      });
    }
  }, [article]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.summary.trim()) newErrors.summary = 'Summary is required';
    if (!formData.categoryId) newErrors.categoryId = 'Please select a category';
    if (formData.title.length > 200) newErrors.title = 'Title must be less than 200 characters';
    if (formData.summary.length > 500) newErrors.summary = 'Summary must be less than 500 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <h2 className="text-xl font-bold">
            {article ? 'Edit Article' : 'Create New Article'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter article title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
          </div>

          {/* Summary */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows="2"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.summary ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief summary of your article"
            />
            <div className="flex justify-between">
              {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary}</p>}
              <p className="text-xs text-gray-400 mt-1">{formData.summary.length}/500 characters</p>
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="10"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Write your article content here..."
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>

          {/* Thumbnail URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail URL (Optional)
            </label>
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-400 mt-1">Enter a direct image URL for the article thumbnail</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {article ? 'Update Article' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleForm;