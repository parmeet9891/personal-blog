'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContentContainer from '@/components/Layout/ContentContainer';
import ArticleEditor from '@/components/Admin/ArticleEditor';

interface Article {
  _id: string;
  title: string;
  content: string;
  isPublished: boolean;
  publishedDate: string;
  createdAt: string;
  updatedAt: string;
}

interface EditArticleProps {
  params: Promise<{ id: string }>;
}

export default function EditArticle({ params }: EditArticleProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [articleId, setArticleId] = useState<string | null>(null);
  const router = useRouter();

  // Unwrap params
  useEffect(() => {
    params.then(({ id }) => {
      setArticleId(id);
    });
  }, [params]);

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

  // Fetch article data
  useEffect(() => {
    if (isAuthenticated === true && articleId) {
      fetchArticle();
    }
  }, [isAuthenticated, articleId]);

  const fetchArticle = async () => {
    if (!articleId) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/admin/articles/${articleId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found');
        } else {
          throw new Error('Failed to fetch article');
        }
        return;
      }
      
      const data = await response.json();
      setArticle(data.article);
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article. Please try again.');
    } finally {
      setLoading(false);
    }
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

  // Show loading while fetching article
  if (loading) {
    return (
      <ContentContainer>
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-400">Loading article...</div>
        </div>
      </ContentContainer>
    );
  }

  // Show error if article fetch failed
  if (error) {
    return (
      <ContentContainer>
        <div className="text-center py-12">
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <div className="space-x-4">
            <button
              onClick={fetchArticle}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
            <a
              href="/admin"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors inline-block"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </ContentContainer>
    );
  }

  // Show error if no article found
  if (!article) {
    return (
      <ContentContainer>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">Article not found</div>
          <a
            href="/admin"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors inline-block"
          >
            Back to Dashboard
          </a>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <ArticleEditor article={article} mode="edit" />
    </ContentContainer>
  );
}