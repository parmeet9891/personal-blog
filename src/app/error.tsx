'use client';

import { useEffect } from 'react';
import ContentContainer from '@/components/Layout/ContentContainer';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <ContentContainer>
      <div className="py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Something went wrong!</h1>
        <p className="text-gray-400 text-lg mb-8">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        <div className="space-x-4 mb-8">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try again
          </button>
          <Link 
            href="/" 
            className="text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            Go to homepage
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left bg-gray-800 p-4 rounded-lg">
            <summary className="text-red-400 cursor-pointer mb-2">Error Details (Development)</summary>
            <pre className="text-sm text-gray-300 overflow-auto">
              {error.message}
              {error.stack && '\n\nStack trace:\n' + error.stack}
            </pre>
          </details>
        )}
      </div>
    </ContentContainer>
  );
}