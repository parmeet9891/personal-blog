import ContentContainer from "@/components/Layout/ContentContainer";
import MarkdownRenderer from "@/components/Article/MarkdownRenderer";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Article from "@/lib/models/Article";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60; // Revalidate every 60 seconds

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  publishedDate: string;
  isPublished: boolean;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getArticleBySlug(slug: string): Promise<ArticleData | null> {
  try {
    await connectDB();
    
    // Find the published article by slug
    const article = await Article.findOne({ 
      slug: slug.toLowerCase(),
      isPublished: true 
    }).lean();
    
    if (!article) {
      return null;
    }
    
    // Convert to plain object with string dates
    return {
      _id: article._id.toString(),
      title: article.title,
      slug: article.slug,
      content: article.content,
      publishedDate: article.publishedDate.toISOString(),
      isPublished: article.isPublished
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  
  if (!article) {
    return {
      title: "Article Not Found - Parmeet's Personal Blog",
      description: "The requested article could not be found.",
    };
  }
  
  // Extract first paragraph or first 160 characters for description
  const description = article.content
    .replace(/[#*`]/g, '') // Remove markdown formatting
    .split('\n')
    .find(line => line.trim().length > 0) // Find first non-empty line
    ?.substring(0, 160) + '...' || 'Read this article on Parmeet\'s personal blog';
  
  return {
    title: `${article.title} - Parmeet's Personal Blog`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime: article.publishedDate,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  
  if (!article) {
    notFound();
  }
  
  const formattedDate = new Date(article.publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <ContentContainer>
      <div className="py-8">
        {/* Navigation back to blog */}
        <div className="mb-8">
          <Link 
            href="/blog" 
            className="text-blue-400 hover:text-blue-300 underline transition-colors inline-flex items-center"
          >
            ← Back to all articles
          </Link>
        </div>
        
        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {article.title}
          </h1>
          <p className="text-gray-400">
            Published on {formattedDate}
          </p>
        </header>
        
        {/* Article content */}
        <article className="prose prose-invert max-w-none">
          <MarkdownRenderer content={article.content} />
        </article>
        
        {/* Navigation back to blog (bottom) */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <Link 
            href="/blog" 
            className="text-blue-400 hover:text-blue-300 underline transition-colors inline-flex items-center"
          >
            ← Back to all articles
          </Link>
        </div>
      </div>
    </ContentContainer>
  );
}