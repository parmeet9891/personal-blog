'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/Article/ArticleCard';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import ErrorMessage from '@/components/UI/ErrorMessage';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  publishedDate: string;
}

interface BlogPageClientProps {
  initialArticles?: ArticleData[];
}

export default function BlogPageClient({ initialArticles = [] }: BlogPageClientProps) {
  const [articles, setArticles] = useState<ArticleData[]>(initialArticles);
  const { loading, error, execute } = useAsyncOperation<ArticleData[]>();

  const fetchArticles = async () => {
    const result = await execute(async () => {
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      return data.articles || [];
    });

    if (result) {
      setArticles(result);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have initial articles (client-side navigation)
    if (initialArticles.length === 0) {
      fetchArticles();
    }
  }, []);

  if (loading && articles.length === 0) {
    return <LoadingSpinner size="lg" message="Loading articles..." />;
  }

  if (error && articles.length === 0) {
    return (
      <ErrorMessage
        title="Failed to Load Articles"
        message={error}
        onRetry={fetchArticles}
        showRetry={true}
      />
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">All Articles</h1>
      
      {error && articles.length > 0 && (
        <div className="mb-6">
          <ErrorMessage
            title="Update Failed"
            message={error}
            onRetry={fetchArticles}
            showRetry={true}
          />
        </div>
      )}
      
      {articles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {articles.map((article) => (
            <ArticleCard
              key={article._id}
              title={article.title}
              slug={article.slug}
              publishedDate={article.publishedDate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No articles published yet.</p>
          <p className="text-gray-500 text-sm mt-2">Check back soon for new content!</p>
        </div>
      )}
      
      {loading && articles.length > 0 && (
        <div className="mt-6">
          <LoadingSpinner size="sm" message="Refreshing articles..." />
        </div>
      )}
    </div>
  );
}