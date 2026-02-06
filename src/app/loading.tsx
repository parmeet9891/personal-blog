import ContentContainer from '@/components/Layout/ContentContainer';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function Loading() {
  return (
    <ContentContainer>
      <LoadingSpinner size="lg" message="Loading page..." />
    </ContentContainer>
  );
}