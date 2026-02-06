'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContentContainer from '@/components/Layout/ContentContainer';
import ArticleEditor from '@/components/Admin/ArticleEditor';

export default function CreateArticle() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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
      <ArticleEditor mode="create" />
    </ContentContainer>
  );
}