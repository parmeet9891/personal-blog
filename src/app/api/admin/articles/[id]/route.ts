import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { getCurrentUser } from '@/lib/auth';
import { validateForm, ValidationRules } from '@/utils/validation';

// Helper function to require authentication
async function requireAuth() {
  const user = await getCurrentUser();
  return {
    authenticated: !!user && user.role === 'admin',
    user
  };
}

// Article validation rules
const articleValidationRules: ValidationRules = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200
  },
  content: {
    required: true,
    minLength: 1
  }
};

// Helper function to validate article data
function validateArticleData(data: any) {
  const errors = validateForm(data, articleValidationRules);
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// GET /api/admin/articles/[id] - Get article by ID (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication for getting article by ID (admin functionality)
    const authResult = await requireAuth();
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    await connectDB();
    
    const article = await Article.findById(id);
    
    if (!article) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article: {
        _id: article._id.toString(),
        title: article.title,
        slug: article.slug,
        content: article.content,
        publishedDate: article.publishedDate.toISOString(),
        isPublished: article.isPublished,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { message: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/articles/[id] - Update article (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authResult = await requireAuth();
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Validate input data
    const validation = validateArticleData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { message: 'Invalid article data', errors: validation.errors },
        { status: 400 }
      );
    }

    await connectDB();
    
    const article = await Article.findById(id);
    
    if (!article) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      );
    }

    // Update article fields
    if (body.title !== undefined) {
      article.title = body.title;
      // Regenerate slug if title changed
      article.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (body.content !== undefined) article.content = body.content;
    if (body.isPublished !== undefined) article.isPublished = body.isPublished;
    
    await article.save();

    return NextResponse.json({
      success: true,
      message: 'Article updated successfully',
      article: {
        _id: article._id.toString(),
        title: article.title,
        slug: article.slug,
        content: article.content,
        publishedDate: article.publishedDate.toISOString(),
        isPublished: article.isPublished,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { message: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles/[id] - Delete article (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authResult = await requireAuth();
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    await connectDB();
    
    const article = await Article.findById(id);
    
    if (!article) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      );
    }

    await Article.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { message: 'Failed to delete article' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}