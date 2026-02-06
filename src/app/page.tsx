import ContentContainer from "@/components/Layout/ContentContainer";
import ArticleCard from "@/components/Article/ArticleCard";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Article from "@/lib/models/Article";

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  publishedDate: string;
}

async function getLatestArticles(): Promise<{ articles: ArticleData[]; total: number }> {
  try {
    await connectDB();
    
    // Get published articles, sorted by published date (newest first)
    const articles = await Article.find({ isPublished: true })
      .sort({ publishedDate: -1 })
      .limit(5)
      .select('title slug publishedDate')
      .lean();
    
    // Get total count
    const total = await Article.countDocuments({ isPublished: true });
    
    // Convert to plain objects with string dates
    const serializedArticles = articles.map(article => ({
      _id: article._id.toString(),
      title: article.title,
      slug: article.slug,
      publishedDate: article.publishedDate.toISOString()
    }));
    
    return { articles: serializedArticles, total };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], total: 0 };
  }
}

export default async function Home() {
  const { articles, total } = await getLatestArticles();

  return (
    <ContentContainer>
      <div className="py-8">
        <h3 className="text-2xl font-bold mb-6">Hi, I&apos;m Parmeet 👋</h3>
        
        <p className="text-gray-200 mb-8 leading-relaxed">
          I&apos;m on a journey to become a better version of myself.
          <br />
          You&apos;ll often find me swimming, playing cricket, or hitting the tennis court.
          <br />
          Yes, I&apos;m a full-time Sports enthusiast and a part-time Software Engineer who believes in consistent progress and lifelong learning.
          <br /><br/>
          I started this blog to document my journey, keep myself accountable, and—if I&apos;m lucky—inspire someone along the way.
          <br />
          Welcome to my little corner of the internet, and thanks for stopping by.
        </p>
        
        <div className="flex space-x-4 mb-8">
          <a 
            href="https://x.com/parmeet9891" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-button"
          >
            X
          </a>
          <a 
            href="https://github.com/parmeet9891" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-button"
          >
            GitHub
          </a>
        </div>
        
        <hr className="border-gray-700 mb-8" />
        
        <div>
          <h4 className="text-xl font-semibold mb-4">Latest Articles</h4>
          {articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  title={article.title}
                  slug={article.slug}
                  publishedDate={article.publishedDate}
                />
              ))}
              {total > 5 && (
                <div className="mt-6">
                  <Link 
                    href="/blog" 
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    View all articles
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">No articles yet. Check back soon!</p>
          )}
        </div>
      </div>
    </ContentContainer>
  );
}