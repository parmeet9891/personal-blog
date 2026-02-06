'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownRenderer from '@/components/Article/MarkdownRenderer';

interface Article {
  _id?: string;
  title: string;
  content: string;
  isPublished: boolean;
  publishedDate?: string;
}

interface ArticleEditorProps {
  article?: Article;
  mode: 'create' | 'edit';
}

export default function ArticleEditor({ article, mode }: ArticleEditorProps) {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    isPublished: article?.isPublished || false,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        isPublished: article.isPublished,
      });
    }
  }, [article]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      setLoading(false);
      return;
    }

    try {
      const url = mode === 'create' 
        ? '/api/articles' 
        : `/api/admin/articles/${article?._id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          isPublished: formData.isPublished,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          mode === 'create' 
            ? 'Article created successfully!' 
            : 'Article updated successfully!'
        );
        
        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          router.push('/admin');
        }, 1500);
      } else {
        setError(data.error || `Failed to ${mode} article`);
      }
    } catch (error) {
      console.error(`Error ${mode}ing article:`, error);
      setError(`An error occurred while ${mode}ing the article. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!article?._id) return;

    if (!confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/admin/articles/${article._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Article deleted successfully!');
        setTimeout(() => {
          router.push('/admin');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      setError('An error occurred while deleting the article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          {mode === 'create' ? 'Create New Article' : 'Edit Article'}
        </h1>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-500 text-green-300 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter article title"
            disabled={loading}
            required
          />
        </div>

        {/* Publication Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            disabled={loading}
          />
          <label htmlFor="isPublished" className="ml-2 text-sm text-gray-300">
            Publish immediately
          </label>
        </div>

        {/* Content Field and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Input */}
          <div className={showPreview ? '' : 'lg:col-span-2'}>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Content * (Markdown supported)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={20}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter article content in Markdown format..."
              disabled={loading}
              required
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Preview</h3>
              <div className="border border-gray-600 rounded-md p-4 bg-gray-900 max-h-96 overflow-y-auto">
                {formData.content.trim() ? (
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-4">{formData.title || 'Untitled'}</h1>
                    <MarkdownRenderer content={formData.content} />
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    Content preview will appear here...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              {loading ? 
                (mode === 'create' ? 'Creating...' : 'Updating...') : 
                (mode === 'create' ? 'Create Article' : 'Update Article')
              }
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Delete Button (only in edit mode) */}
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              {loading ? 'Deleting...' : 'Delete Article'}
            </button>
          )}
        </div>
      </form>

      {/* Back to Dashboard Link */}
      <div className="text-center pt-6 border-t border-gray-700">
        <a
          href="/admin"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}