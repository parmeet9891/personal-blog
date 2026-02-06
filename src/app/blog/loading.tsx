import ContentContainer from '@/components/Layout/ContentContainer';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function BlogLoading() {
  return (
    <ContentContainer>
      <div className="py-8">
        <div className="h-8 bg-gray-800 rounded mb-8 animate-pulse"></div>
        <LoadingSpinner size="lg" message="Loading articles..." />
      </div>
    </ContentContainer>
  );
}