/**
 * Property-Based Test for Article Data Persistence
 * Feature: personal-blog-website, Property 6: Article Data Persistence
 * Validates: Requirements 5.2, 5.3
 */

import * as fc from 'fast-check';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Article, { IArticle } from '@/lib/models/Article';

// Test database setup
const TEST_DB_URI = process.env.MONGODB_URI?.replace('/personal-blog', '/personal-blog-test') || 'mongodb://localhost:27017/personal-blog-test';

beforeAll(async () => {
  // Override the MongoDB URI for testing
  process.env.MONGODB_URI = TEST_DB_URI;
  await connectDB();
});

afterAll(async () => {
  // Clean up test database
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
  // Force exit to prevent hanging
  setTimeout(() => process.exit(0), 1000);
});

beforeEach(async () => {
  // Clear articles collection before each test
  await Article.deleteMany({});
});

// Generators for property-based testing
const articleTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const articleContentArb = fc.string({ minLength: 1, maxLength: 10000 }).filter(s => s.trim().length > 0);
const publishedDateArb = fc.date({ min: new Date('2020-01-01'), max: new Date() });
const isPublishedArb = fc.boolean();

const articleDataArb = fc.record({
  title: articleTitleArb,
  content: articleContentArb,
  publishedDate: publishedDateArb,
  isPublished: isPublishedArb,
});

describe('Property 6: Article Data Persistence', () => {
  /**
   * Property: For any article creation or modification, the system should store 
   * all required fields (title, content, publication date) and make them 
   * retrievable through database queries
   */
  test('article data persists correctly across create, read, update operations', async () => {
    await fc.assert(
      fc.asyncProperty(articleDataArb, async (articleData) => {
        // CREATE: Store article with all required fields
        const article = new Article({
          title: articleData.title.trim(),
          content: articleData.content.trim(),
          publishedDate: articleData.publishedDate,
          isPublished: articleData.isPublished,
        });

        const savedArticle = await article.save();
        
        // Verify article was saved with all required fields
        expect(savedArticle._id).toBeDefined();
        expect(savedArticle.title).toBe(articleData.title.trim());
        expect(savedArticle.content).toBe(articleData.content.trim());
        expect(savedArticle.publishedDate).toEqual(articleData.publishedDate);
        expect(savedArticle.isPublished).toBe(articleData.isPublished);
        expect(savedArticle.slug).toBeDefined();
        expect(savedArticle.createdAt).toBeDefined();
        expect(savedArticle.updatedAt).toBeDefined();

        // READ: Retrieve article by ID and verify all fields persist
        const retrievedById = await Article.findById(savedArticle._id);
        expect(retrievedById).not.toBeNull();
        expect(retrievedById!.title).toBe(articleData.title.trim());
        expect(retrievedById!.content).toBe(articleData.content.trim());
        expect(retrievedById!.publishedDate).toEqual(articleData.publishedDate);
        expect(retrievedById!.isPublished).toBe(articleData.isPublished);

        // READ: Retrieve article by slug and verify all fields persist
        const retrievedBySlug = await Article.findOne({ slug: savedArticle.slug });
        expect(retrievedBySlug).not.toBeNull();
        expect(retrievedBySlug!._id.toString()).toBe(savedArticle._id.toString());
        expect(retrievedBySlug!.title).toBe(articleData.title.trim());
        expect(retrievedBySlug!.content).toBe(articleData.content.trim());

        // UPDATE: Modify article and verify persistence
        const newTitle = `Updated ${articleData.title.trim()}`;
        const newContent = `Updated ${articleData.content.trim()}`;
        
        retrievedById!.title = newTitle;
        retrievedById!.content = newContent;
        retrievedById!.isPublished = !articleData.isPublished;
        
        const updatedArticle = await retrievedById!.save();
        
        // Verify updated fields persist
        expect(updatedArticle.title).toBe(newTitle);
        expect(updatedArticle.content).toBe(newContent);
        expect(updatedArticle.isPublished).toBe(!articleData.isPublished);
        expect(updatedArticle.updatedAt.getTime()).toBeGreaterThan(updatedArticle.createdAt.getTime());

        // Final verification: Re-read from database
        const finalCheck = await Article.findById(savedArticle._id);
        expect(finalCheck!.title).toBe(newTitle);
        expect(finalCheck!.content).toBe(newContent);
        expect(finalCheck!.isPublished).toBe(!articleData.isPublished);
      }),
      { numRuns: 10, timeout: 10000 }
    );
  }, 15000);

  test('article slug generation and uniqueness is maintained', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(articleTitleArb, { minLength: 2, maxLength: 3 }),
        async (titles) => {
          const articles: IArticle[] = [];
          
          // Create articles with potentially duplicate titles
          for (const title of titles) {
            const article = new Article({
              title: title.trim(),
              content: 'Test content',
              isPublished: true,
            });
            
            const saved = await article.save();
            articles.push(saved);
            
            // Verify slug was generated
            expect(saved.slug).toBeDefined();
            expect(saved.slug.length).toBeGreaterThan(0);
            expect(saved.slug).toMatch(/^[a-z0-9-]+$/);
          }
          
          // Verify all slugs are unique
          const slugs = articles.map(a => a.slug);
          const uniqueSlugs = new Set(slugs);
          expect(uniqueSlugs.size).toBe(slugs.length);
          
          // Verify all articles can be retrieved by their unique slugs
          for (const article of articles) {
            const retrieved = await Article.findOne({ slug: article.slug });
            expect(retrieved).not.toBeNull();
            expect(retrieved!._id.toString()).toBe(article._id.toString());
          }
        }
      ),
      { numRuns: 5, timeout: 10000 }
    );
  }, 15000);

  test('article queries by publication status work correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(articleDataArb, { minLength: 2, maxLength: 3 }),
        async (articlesData) => {
          // Create articles with mixed publication status
          const createdArticles = [];
          for (const data of articlesData) {
            const article = new Article({
              title: data.title.trim(),
              content: data.content.trim(),
              publishedDate: data.publishedDate,
              isPublished: data.isPublished,
            });
            createdArticles.push(await article.save());
          }
          
          // Query published articles
          const publishedArticles = await Article.find({ isPublished: true });
          const expectedPublished = createdArticles.filter(a => a.isPublished);
          expect(publishedArticles.length).toBe(expectedPublished.length);
          
          // Query unpublished articles
          const unpublishedArticles = await Article.find({ isPublished: false });
          const expectedUnpublished = createdArticles.filter(a => !a.isPublished);
          expect(unpublishedArticles.length).toBe(expectedUnpublished.length);
          
          // Verify total count
          const totalArticles = await Article.countDocuments();
          expect(totalArticles).toBe(createdArticles.length);
          expect(publishedArticles.length + unpublishedArticles.length).toBe(totalArticles);
        }
      ),
      { numRuns: 3, timeout: 5000 }
    );
  }, 10000);
});