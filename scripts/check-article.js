// Debug script to check article status
// Run with: node scripts/check-article.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const ARTICLE_ID = '6988add2a64969be7b212a8e';

async function checkArticle() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the Article model
    const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }));

    // Find the article by ID
    const article = await Article.findById(ARTICLE_ID);

    if (!article) {
      console.log('❌ Article not found with ID:', ARTICLE_ID);
      process.exit(1);
    }

    console.log('📄 Article Found!\n');
    console.log('Title:', article.title);
    console.log('Slug:', article.slug);
    console.log('Is Published:', article.isPublished);
    console.log('Published Date:', article.publishedDate);
    console.log('Created At:', article.createdAt);
    console.log('Updated At:', article.updatedAt);
    console.log('\n---\n');

    // Check if it should appear on homepage
    const now = new Date();
    const publishedDate = new Date(article.publishedDate);

    console.log('🔍 Homepage Visibility Check:\n');
    console.log('✓ isPublished:', article.isPublished ? '✅ true' : '❌ false (ISSUE!)');
    console.log('✓ publishedDate <= now:', publishedDate <= now ? '✅ yes' : '❌ no (ISSUE!)');
    
    if (article.isPublished && publishedDate <= now) {
      console.log('\n✅ This article SHOULD appear on the homepage!');
      console.log('\nIf it\'s not showing, try:');
      console.log('1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)');
      console.log('2. Clear Next.js cache: rm -rf .next && npm run dev');
      console.log('3. Check if there are 5+ newer articles (homepage shows only 5)');
    } else {
      console.log('\n❌ This article will NOT appear on the homepage because:');
      if (!article.isPublished) {
        console.log('   - isPublished is false (article is in draft mode)');
        console.log('   - Solution: Edit the article and check "Publish immediately"');
      }
      if (publishedDate > now) {
        console.log('   - publishedDate is in the future');
        console.log('   - Solution: Update the publishedDate to current or past date');
      }
    }

    // Check how many published articles exist
    const publishedCount = await Article.countDocuments({ isPublished: true });
    console.log('\n📊 Total published articles:', publishedCount);

    // Get the 5 most recent published articles
    const recentArticles = await Article.find({ isPublished: true })
      .sort({ publishedDate: -1 })
      .limit(5)
      .select('title publishedDate');

    console.log('\n📋 Top 5 articles on homepage:');
    recentArticles.forEach((art, index) => {
      const isOurArticle = art._id.toString() === ARTICLE_ID;
      console.log(`${index + 1}. ${art.title} (${art.publishedDate.toLocaleDateString()})${isOurArticle ? ' ← YOUR ARTICLE' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkArticle();
