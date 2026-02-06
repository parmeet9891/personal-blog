import ContentContainer from "@/components/Layout/ContentContainer";
import ArticleCard from "@/components/Article/ArticleCard";
import connectDB from "@/lib/mongodb";
import Article from "@/lib/models/Article";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Parmeet's Personal Blog",
  description: "All articles from Parmeet's personal blog documenting his journey of self-improvement and experiences",
};

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  publishedDate: string;
}

async function getAllArticles(): Promise<ArticleData[]> {
  try {
    await connectDB();
    
    // Get all published articles, sorted by published date (newest first)
    const articles = await Article.find({ isPublished: true })
      .sort({ publishedDate: -1 })
      .select('title slug publishedDate')
      .lean();
    
    // Convert to plain objects with string dates
    const serializedArticles = articles.map(article => ({
      _id: article._id.toString(),
      title: article.title,
      slug: article.slug,
      publishedDate: article.publishedDate.toISOString()
    }));
    
    return serializedArticles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export default async function BlogPage() {
  const articles = await getAllArticles();

  return (
    <ContentContainer>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8">All Articles</h1>
        
        {articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            {articles.map((article) => (
              <ArticleCard
                key={article._id}
                title={article.title}
                slug={article.slug}
                publishedDate={article.publishedDate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No articles published yet.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for new content!</p>
          </div>
        )}
      </div>
    </ContentContainer>
  );
}