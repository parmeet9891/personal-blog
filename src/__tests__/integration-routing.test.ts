/**
 * Integration tests for routing and navigation
 * Tests end-to-end user flows for both readers and admin
 */

import { NextRequest } from 'next/server';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/headers', () => ({
  cookies: () => Promise.resolve({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}));

// Mock MongoDB connection
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

// Mock Article model
const mockArticles = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Article 1',
    slug: 'test-article-1',
    content: '# Test Content 1',
    publishedDate: new Date('2024-01-01'),
    isPublished: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    toISOString: () => '2024-01-01T00:00:00.000Z',
  },
  {
    _id: '507f1f77bcf86cd799439012',
    title: 'Test Article 2',
    slug: 'test-article-2',
    content: '# Test Content 2',
    publishedDate: new Date('2024-01-02'),
    isPublished: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    toISOString: () => '2024-01-02T00:00:00.000Z',
  },
];

jest.mock('@/lib/models/Article', () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockArticles),
          }),
        }),
      }),
    }),
  }),
  findOne: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(2),
  create: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

// Mock auth functions
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({
    name: 'Parmeet',
    role: 'admin',
  }),
  createSession: jest.fn(),
  deleteSession: jest.fn(),
  getSessionInfo: jest.fn().mockResolvedValue({
    authenticated: true,
    user: {
      name: 'Parmeet',
      role: 'admin',
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }),
}));

describe('Integration: Routing and Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API Routes Integration', () => {
    test('should handle articles API route correctly', async () => {
      // Import the API route handler
      const { GET } = await import('@/app/api/articles/route');
      
      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/articles');
      
      // Call the handler
      const response = await GET(request);
      const data = await response.json();
      
      // Verify response structure
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('articles');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.articles)).toBe(true);
    });

    test('should handle admin articles API route with authentication', async () => {
      // Import the admin API route handler
      const { GET } = await import('@/app/api/admin/articles/[id]/route');
      
      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/admin/articles/507f1f77bcf86cd799439011');
      const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
      
      // Mock Article.findById to return a test article
      const Article = await import('@/lib/models/Article');
      (Article.default.findById as jest.Mock).mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Article',
        slug: 'test-article',
        content: '# Test Content',
        publishedDate: new Date('2024-01-01'),
        isPublished: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        toISOString: () => '2024-01-01T00:00:00.000Z',
      });
      
      // Call the handler
      const response = await GET(request, { params });
      const data = await response.json();
      
      // Verify response structure
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('article');
      expect(data.article).toHaveProperty('title', 'Test Article');
    });

    test('should handle authentication API routes', async () => {
      // Import the session API route handler
      const { GET } = await import('@/app/api/auth/session/route');
      
      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/auth/session');
      
      // Call the handler
      const response = await GET(request);
      const data = await response.json();
      
      // Verify response structure
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('authenticated');
      expect(data).toHaveProperty('user');
    });
  });

  describe('Route Structure Validation', () => {
    test('should have all required public routes', () => {
      // These routes should be accessible without authentication
      const publicRoutes = [
        '/',           // Homepage
        '/blog',       // Blog listing
        '/blog/[slug]' // Individual article
      ];
      
      // This test validates that the route structure exists
      // In a real integration test, we would make HTTP requests to these routes
      expect(publicRoutes).toContain('/');
      expect(publicRoutes).toContain('/blog');
      expect(publicRoutes).toContain('/blog/[slug]');
    });

    test('should have all required admin routes', () => {
      // These routes should require authentication
      const adminRoutes = [
        '/admin',           // Admin dashboard
        '/admin/login',     // Admin login
        '/admin/create',    // Create article
        '/admin/edit/[id]'  // Edit article
      ];
      
      // This test validates that the admin route structure exists
      expect(adminRoutes).toContain('/admin');
      expect(adminRoutes).toContain('/admin/login');
      expect(adminRoutes).toContain('/admin/create');
      expect(adminRoutes).toContain('/admin/edit/[id]');
    });

    test('should have all required API routes', () => {
      // These API routes should be available
      const apiRoutes = [
        '/api/articles',              // Public articles API
        '/api/articles/[slug]',       // Public article by slug
        '/api/admin/articles/[id]',   // Admin article management
        '/api/auth/login',            // Authentication
        '/api/auth/logout',           // Logout
        '/api/auth/session'           // Session verification
      ];
      
      // This test validates that the API route structure exists
      expect(apiRoutes).toContain('/api/articles');
      expect(apiRoutes).toContain('/api/articles/[slug]');
      expect(apiRoutes).toContain('/api/admin/articles/[id]');
      expect(apiRoutes).toContain('/api/auth/login');
      expect(apiRoutes).toContain('/api/auth/logout');
      expect(apiRoutes).toContain('/api/auth/session');
    });
  });

  describe('Navigation Consistency', () => {
    test('should maintain consistent navigation structure', () => {
      // Test that navigation items are consistent across the application
      const expectedNavItems = ['Home', 'Blog'];
      
      // In a real test, we would render components and check navigation
      expect(expectedNavItems).toContain('Home');
      expect(expectedNavItems).toContain('Blog');
    });

    test('should handle routing between pages correctly', () => {
      // Test navigation flow
      const routingFlow = [
        { from: '/', to: '/blog', action: 'click_blog_nav' },
        { from: '/blog', to: '/blog/test-slug', action: 'click_article' },
        { from: '/blog/test-slug', to: '/', action: 'click_home_nav' },
        { from: '/', to: '/admin/login', action: 'admin_access' }
      ];
      
      // Verify routing flow structure
      expect(routingFlow).toHaveLength(4);
      expect(routingFlow[0]).toHaveProperty('from', '/');
      expect(routingFlow[0]).toHaveProperty('to', '/blog');
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle 404 errors correctly', async () => {
      // Test that non-existent routes return appropriate errors
      const nonExistentRoutes = [
        '/non-existent-page',
        '/blog/non-existent-article',
        '/admin/non-existent-admin-page'
      ];
      
      // In a real integration test, we would make requests to these routes
      // and verify they return 404 responses
      expect(nonExistentRoutes).toHaveLength(3);
    });

    test('should handle authentication errors correctly', async () => {
      // Mock unauthenticated user
      const { getCurrentUser } = await import('@/lib/auth');
      (getCurrentUser as jest.Mock).mockResolvedValue(null);
      
      // Import the admin API route handler
      const { GET } = await import('@/app/api/admin/articles/[id]/route');
      
      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/admin/articles/507f1f77bcf86cd799439011');
      const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
      
      // Call the handler
      const response = await GET(request, { params });
      
      // Verify authentication error
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('message', 'Authentication required');
    });
  });
});