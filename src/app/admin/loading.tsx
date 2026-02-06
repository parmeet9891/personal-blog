import ContentContainer from '@/components/Layout/ContentContainer';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function AdminLoading() {
  return (
    <ContentContainer>
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-800 rounded w-48 animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="h-10 bg-gray-800 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-800 rounded w-20 animate-pulse"></div>
          </div>
        </div>
        <LoadingSpinner size="lg" message="Loading admin dashboard..." />
      </div>
    </ContentContainer>
  );
}