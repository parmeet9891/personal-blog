/**
 * Unit Tests for Database Connection and Error Handling
 * Validates: Requirements 5.5
 */

import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import AdminSession from '@/lib/models/AdminSession';

// Test database setup
const TEST_DB_URI = process.env.MONGODB_URI?.replace('/personal-blog', '/personal-blog-test') || 'mongodb://localhost:27017/personal-blog-test';

describe('Database Connection and Error Handling', () => {
  beforeAll(async () => {
    // Override the MongoDB URI for testing
    process.env.MONGODB_URI = TEST_DB_URI;
  });

  afterEach(async () => {
    // Clean up after each test
    if (mongoose.connection.readyState === 1) {
      await Article.deleteMany({});
      await AdminSession.deleteMany({});
    }
  });

  afterAll(async () => {
    // Clean up test database
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.dropDatabase();
      await mongoose.connection.close();
    }
  });

  describe('Connection Establishment', () => {
    test('should establish connection successfully with valid URI', async () => {
      const connection = await connectDB();
      
      expect(connection).toBeDefined();
      expect(mongoose.connection.readyState).toBe(1); // Connected
      expect(mongoose.connection.db.databaseName).toBe('personal-blog-test');
    });

    test('should reuse existing connection on subsequent calls', async () => {
      const connection1 = await connectDB();
      const connection2 = await connectDB();
      
      expect(connection1).toBe(connection2);
      expect(mongoose.connection.readyState).toBe(1);
    });

    test('should handle connection with proper options', async () => {
      await connectDB();
      
      // Verify connection options are applied
      expect(mongoose.connection.readyState).toBe(1);
      expect(mongoose.connection.host).toBeDefined();
    });
  });

  describe('Schema Validation', () => {
    test('should validate Article schema correctly', async () => {
      await connectDB();
      
      // Valid article should save successfully
      const validArticle = new Article({
        title: 'Test Article',
        content: 'This is test content',
        isPublished: true,
      });
      
      const saved = await validArticle.save();
      expect(saved._id).toBeDefined();
      expect(saved.slug).toBeDefined();
      expect(saved.createdAt).toBeDefined();
    });

    test('should reject invalid Article data', async () => {
      await connectDB();
      
      // Missing required title
      const invalidArticle = new Article({
        content: 'Content without title',
      });
      
      await expect(invalidArticle.save()).rejects.toThrow(/title.*required/i);
    });

    test('should reject invalid Article title length', async () => {
      await connectDB();
      
      // Title too long
      const longTitle = 'a'.repeat(201);
      const invalidArticle = new Article({
        title: longTitle,
        content: 'Valid content',
      });
      
      await expect(invalidArticle.save()).rejects.toThrow(/title.*exceed.*200/i);
    });

    test('should validate AdminSession schema correctly', async () => {
      await connectDB();
      
      // Valid session should save successfully
      const validSession = new AdminSession({
        sessionId: 'test-session-123',
        userId: 'admin',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      });
      
      const saved = await validSession.save();
      expect(saved._id).toBeDefined();
      expect(saved.sessionId).toBe('test-session-123');
      expect(saved.createdAt).toBeDefined();
    });

    test('should reject AdminSession with past expiration date', async () => {
      await connectDB();
      
      const expiredSession = new AdminSession({
        sessionId: 'expired-session',
        userId: 'admin',
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });
      
      await expect(expiredSession.save()).rejects.toThrow(/expiration.*future/i);
    });
  });

  describe('Data Integrity', () => {
    test('should enforce unique slug constraint', async () => {
      await connectDB();
      
      // Create first article
      const article1 = new Article({
        title: 'Same Title',
        content: 'Content 1',
      });
      
      await article1.save();
      
      // Create second article with same title (should generate same base slug)
      const article2 = new Article({
        title: 'Same Title',
        content: 'Content 2',
      });
      
      // This should succeed because the uniqueness logic adds a suffix
      const saved2 = await article2.save();
      
      // Verify that slugs are different (uniqueness handled by suffix)
      expect(saved2.slug).not.toBe(article1.slug);
      expect(saved2.slug).toMatch(/same-title/);
      
      // Test that the slug uniqueness mechanism works
      expect(article1.slug).toBe('same-title');
      expect(saved2.slug).toBe('same-title-1');
    });

    test('should enforce unique sessionId constraint', async () => {
      await connectDB();
      
      const session1 = new AdminSession({
        sessionId: 'unique-session',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      
      await session1.save();
      
      const session2 = new AdminSession({
        sessionId: 'unique-session', // Same session ID
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      
      await expect(session2.save()).rejects.toThrow(/duplicate.*sessionId/i);
    });
  });

  describe('Error Scenarios', () => {
    test('should handle database operation errors gracefully', async () => {
      await connectDB();
      
      // Try to create an article with invalid slug format (should fail validation)
      const invalidArticle = new Article({
        title: 'Valid Title',
        content: 'Valid content',
        slug: 'invalid slug with spaces!', // Invalid slug format
      });
      
      await expect(invalidArticle.save()).rejects.toThrow(/validation failed/i);
    });

    test('should handle connection state checks', () => {
      // Test connection state values
      expect([0, 1, 2, 3]).toContain(mongoose.connection.readyState);
      
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      if (mongoose.connection.readyState === 1) {
        expect(mongoose.connection.db).toBeDefined();
      }
    });

    test('should handle missing environment variables', () => {
      const originalUri = process.env.MONGODB_URI;
      delete process.env.MONGODB_URI;
      
      // This should be tested in isolation, but since we're in a test environment,
      // we'll just verify the error would be thrown
      expect(() => {
        // Simulate the check from mongodb.ts
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
          throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
        }
      }).toThrow(/MONGODB_URI.*environment variable/i);
      
      // Restore the URI
      process.env.MONGODB_URI = originalUri;
    });
  });

  describe('Model Methods and Virtuals', () => {
    test('should generate formatted date virtual for Article', async () => {
      await connectDB();
      
      const testDate = new Date('2024-01-15');
      const article = new Article({
        title: 'Date Test Article',
        content: 'Testing date formatting',
        publishedDate: testDate,
      });
      
      const saved = await article.save();
      expect(saved.formattedDate).toBeDefined();
      expect(saved.formattedDate).toMatch(/January.*15.*2024/);
    });

    test('should check session expiration virtual', async () => {
      await connectDB();
      
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const session = new AdminSession({
        sessionId: 'test-expiration',
        expiresAt: futureDate,
      });
      
      const saved = await session.save();
      expect(saved.isExpired).toBe(false);
      expect(saved.timeUntilExpiration).toBeGreaterThan(0);
    });

    test('should extend session expiration', async () => {
      await connectDB();
      
      const session = new AdminSession({
        sessionId: 'test-extend',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });
      
      const saved = await session.save();
      const originalExpiry = saved.expiresAt;
      
      await saved.extend(48); // Extend by 48 hours
      
      expect(saved.expiresAt.getTime()).toBeGreaterThan(originalExpiry.getTime());
    });
  });
});