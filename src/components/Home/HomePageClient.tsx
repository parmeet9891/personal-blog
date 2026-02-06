'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/Article/ArticleCard';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import ErrorMessage from '@/components/UI/ErrorMessage';
import Link from 'next/link';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  publishedDate: string;
}

interface HomePageClientProps {
  initialArticles?: ArticleData[];
  initialTotal?: number;
}

export default function HomePageClient({ 
  initialArticles = [], 
  initialTotal = 0 
}: HomePageClientProps) {
  const [articles, setArticles] = useState<ArticleData[]>(initialArticles);
  const [total, setTotal] = useState(initialTotal);
  const { loading, error, execute } = useAsyncOperation<{ articles: ArticleData[]; total: number }>();

  const fetchLatestArticles = async () => {
    const result = await execute(async () => {
      const response = await fetch('/api/articles?limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      return {
        articles: data.articles || [],
        total: data.pagination?.total || 0
      };
    });

    if (result) {
      setArticles(result.articles);
      setTotal(result.total);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have initial articles (client-side navigation)
    if (initialArticles.length === 0 && initialTotal === 0) {
      fetchLatestArticles();
    }
  }, []);

  return (
    <div className="py-8">
      <h3 className="text-2xl font-bold mb-6">Hi, I&apos;m Parmeet 👋</h3>
      
      <p className="text-gray-200 mb-8 leading-relaxed">
        I am on a journey to become a better person. You will find me swimming, playing cricket and tennis. A Part time Software Engineer.
        I started this blog to document my progress, keep myself accountable and hopefully inspire anyone. Welcome to my corner of internet, and thanks for stopping by!
      </p>
      
      <div className="flex space-x-4 mb-8">
        <a 
          href="https://twitter.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-button"
        >
          Twitter/X
        </a>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-button"
        >
          GitHub
        </a>
      </div>
      
      <hr className="border-gray-700 mb-8" />
      
      <div>
        <h4 className="text-xl font-semibold mb-4">Latest Articles</h4>
        
        {loading && articles.length === 0 && (
          <LoadingSpinner size="md" message="Loading latest articles..." />
        )}
        
        {error && articles.length === 0 && (
          <ErrorMessage
            title="Failed to Load Articles"
            message={error}
            onRetry={fetchLatestArticles}
            showRetry={true}
          />
        )}
        
        {error && articles.length > 0 && (
          <div className="mb-6">
            <ErrorMessage
              title="Update Failed"
              message={error}
              onRetry={fetchLatestArticles}
              showRetry={true}
            />
          </div>
        )}
        
        {!loading && !error && articles.length === 0 && (
          <p className="text-gray-400">No articles yet. Check back soon!</p>
        )}
        
        {articles.length > 0 && (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard
                key={article._id}
                title={article.title}
                slug={article.slug}
                publishedDate={article.publishedDate}
              />
            ))}
            {total > 5 && (
              <div className="mt-6">
                <Link 
                  href="/blog" 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  View all articles
                </Link>
              </div>
            )}
          </div>
        )}
        
        {loading && articles.length > 0 && (
          <div className="mt-6">
            <LoadingSpinner size="sm" message="Refreshing articles..." />
          </div>
        )}
      </div>
    </div>
  );
}