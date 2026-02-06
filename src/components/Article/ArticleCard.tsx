import Link from 'next/link';

interface ArticleCardProps {
  title: string;
  slug: string;
  publishedDate: string;
}

export default function ArticleCard({ title, slug, publishedDate }: ArticleCardProps) {
  const formattedDate = new Date(publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Link href={`/blog/${slug}`} className="block">
      <div className="article-card">
        <h5 className="text-lg font-medium text-white mb-2 hover:text-blue-300 transition-colors">
          {title}
        </h5>
        <p className="text-gray-400 text-sm">{formattedDate}</p>
      </div>
    </Link>
  );
}