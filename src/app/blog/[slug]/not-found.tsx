import ContentContainer from "@/components/Layout/ContentContainer";
import Link from "next/link";

export default function NotFound() {
  return (
    <ContentContainer>
      <div className="py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
        <p className="text-gray-400 text-lg mb-8">
          The article you're looking for doesn't exist or may have been removed.
        </p>
        <div className="space-x-4">
          <Link 
            href="/blog" 
            className="text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            View all articles
          </Link>
          <span className="text-gray-600">•</span>
          <Link 
            href="/" 
            className="text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </ContentContainer>
  );
}