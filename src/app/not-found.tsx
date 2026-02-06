import ContentContainer from '@/components/Layout/ContentContainer';
import Link from 'next/link';

export default function NotFound() {
  return (
    <ContentContainer>
      <div className="py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-gray-400 text-lg mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="space-x-4">
          <Link 
            href="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-block"
          >
            Go to homepage
          </Link>
          <Link 
            href="/blog" 
            className="text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            View all articles
          </Link>
        </div>
      </div>
    </ContentContainer>
  );
}