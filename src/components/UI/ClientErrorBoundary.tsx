'use client';

import { useState, useEffect } from 'react';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

interface ClientErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export default function ClientErrorBoundary({ 
  children, 
  fallback, 
  onError 
}: ClientErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(new Error(event.message));
      setHasError(true);
      onError?.(new Error(event.message));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      setError(error);
      setHasError(true);
      onError?.(error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <ErrorMessage
        title="Something went wrong"
        message={error?.message || "An unexpected error occurred. Please try refreshing the page."}
        onRetry={() => {
          setHasError(false);
          setError(null);
        }}
        showRetry={true}
      />
    );
  }

  return <>{children}</>;
}