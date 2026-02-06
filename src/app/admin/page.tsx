'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContentContainer from '@/components/Layout/ContentContainer';

interface Article {
  _id: string;
  title: string;
  slug: string;
  publishedDate: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ArticlesResponse {
  articles: Article[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  };
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.authenticated && data.user?.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch articles
  useEffect(() => {
    if (isAuthenticated === true) {
      fetchArticles();
    }
  }, [isAuthenticated]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all articles (published and unpublished) for admin
      const response = await fetch('/api/articles?limit=100');
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data: ArticlesResponse = await response.json();
      setArticles(data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId: string, articleTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${articleTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(articleId);
      
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete article');
      }
      
      // Remove the deleted article from the list
      setArticles(prev => prev.filter(article => article._id !== articleId));
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (articleId: string) => {
    router.push(`/admin/edit/${articleId}`);
  };

  const handleCreateNew = () => {
    router.push('/admin/create');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      router.push('/admin/login');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <ContentContainer>
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-400">Checking authentication...</div>
        </div>
      </ContentContainer>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (isAuthenticated === false) {
    return null;
  }

  return (
    <ContentContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Create New Article
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-400">Loading articles...</div>
          </div>
        ) : (
          <>
            {/* Articles Count */}
            <div className="text-gray-400 text-sm">
              Total articles: {articles.length}
            </div>

            {/* Articles List */}
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">No articles found</div>
                <button
                  onClick={handleCreateNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
                >
                  Create Your First Article
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div
                    key={article._id}
                    className="border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {article.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>
                            Status: 
                            <span className={`ml-1 px-2 py-1 rounded text-xs ${
                              article.isPublished 
                                ? 'bg-green-900/30 text-green-300' 
                                : 'bg-yellow-900/30 text-yellow-300'
                            }`}>
                              {article.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </span>
                          <span>Published: {formatDate(article.publishedDate)}</span>
                          <span>Updated: {formatDate(article.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(article._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(article._id, article.title)}
                          disabled={deleteLoading === article._id}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          {deleteLoading === article._id ? 'Deleting...' : 'Delete'}
                        </button>
                        <a
                          href={`/blog/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Back to Blog Link */}
        <div className="text-center pt-6 border-t border-gray-700">
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Blog
          </a>
        </div>
      </div>
    </ContentContainer>
  );
}