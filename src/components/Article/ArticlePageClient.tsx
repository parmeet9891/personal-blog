'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import MarkdownRenderer from './MarkdownRenderer';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import ErrorMessage from '@/components/UI/ErrorMessage';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface Article {
  _id: string;
  title: string;
  content: string;
  publishedDate: string;
  slug: string;
}

interface ArticlePageClientProps {
  slug: string;
  initialArticle?: Article;
}

export default function ArticlePageClient({ slug, initialArticle }: ArticlePageClientProps) {
  const [article, setArticle] = useState<Article | null>(initialArticle || null);
  const { loading, error, execute } = useAsyncOperation<Article>();

  const fetchArticle = async () => {
    const result = await execute(async () => {
      const response = await fetch(`/api/articles/${slug}`);
      if (response.status === 404) {
        notFound();
      }
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      return await response.json();
    });

    if (result) {
      setArticle(result);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have initial article (client-side navigation)
    if (!initialArticle) {
      fetchArticle();
    }
  }, [slug]);

  if (loading && !article) {
    return <LoadingSpinner size="lg" message="Loading article..." />;
  }

  if (error && !article) {
    return (
      <ErrorMessage
        title="Failed to Load Article"
        message={error}
        onRetry={fetchArticle}
        showRetry={true}
      />
    );
  }

  if (!article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="py-8">
      {error && article && (
        <div className="mb-6">
          <ErrorMessage
            title="Update Failed"
            message={error}
            onRetry={fetchArticle}
            showRetry={true}
          />
        </div>
      )}
      
      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">{article.title}</h1>
          <time className="text-gray-400 text-sm">
            Published on {formatDate(article.publishedDate)}
          </time>
        </header>
        
        <div className="prose prose-invert max-w-none">
          <MarkdownRenderer content={article.content} />
        </div>
      </article>
      
      {loading && article && (
        <div className="mt-6">
          <LoadingSpinner size="sm" message="Refreshing article..." />
        </div>
      )}
    </div>
  );
}