import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Parse and validate pagination parameters
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10'), 1), 100); // Max 100 articles per request
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;
    
    // Parse filtering parameters
    const published = searchParams.get('published');
    const search = searchParams.get('search');
    
    // Check if user is authenticated admin for accessing unpublished articles
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === 'admin';
    
    // Build query filter
    const filter: any = {};
    
    // Filter by publication status
    if (published === 'true') {
      filter.isPublished = true;
    } else if (published === 'false' && isAdmin) {
      filter.isPublished = false;
    } else if (!isAdmin) {
      // Non-admin users can only see published articles
      filter.isPublished = true;
    }
    
    // Add search functionality
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    // Get articles with sorting by publication date (newest first)
    const articles = await Article.find(filter)
      .sort({ publishedDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug publishedDate isPublished createdAt updatedAt')
      .lean();
    
    // Get total count for pagination
    const total = await Article.countDocuments(filter);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;
    const hasPrevious = page > 1;
    
    return NextResponse.json({
      articles: articles.map(article => ({
        ...article,
        _id: article._id.toString(),
        publishedDate: article.publishedDate.toISOString(),
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore,
        hasPrevious,
      },
      filters: {
        published: published || 'all',
        search: search || '',
      }
    });
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    
    // Return appropriate error response based on error type
    if (error?.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.message },
        { status: 400 }
      );
    }
    
    if (error?.name === 'MongoNetworkError' || error?.name === 'MongoServerError') {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication first
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { title, content, isPublished = false, publishedDate } = body;
    
    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    // Validate optional fields
    if (typeof isPublished !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublished must be a boolean value' },
        { status: 400 }
      );
    }
    
    // Prepare article data
    const articleData: any = {
      title: title.trim(),
      content: content.trim(),
      isPublished,
    };
    
    // Handle custom published date if provided
    if (publishedDate) {
      const parsedDate = new Date(publishedDate);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid publishedDate format' },
          { status: 400 }
        );
      }
      if (parsedDate > new Date()) {
        return NextResponse.json(
          { error: 'Published date cannot be in the future' },
          { status: 400 }
        );
      }
      articleData.publishedDate = parsedDate;
    }
    
    // Create the article (slug will be auto-generated from title)
    const article = new Article(articleData);
    await article.save();
    
    // Return the created article
    return NextResponse.json({
      message: 'Article created successfully',
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
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating article:', error);
    
    // Handle validation errors
    if (error?.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors (slug collision)
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'Article with similar title already exists' },
        { status: 409 }
      );
    }
    
    // Handle database connection errors
    if (error?.name === 'MongoNetworkError' || error?.name === 'MongoServerError') {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}