import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { getCurrentUser } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    const { slug } = await params;
    
    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid slug parameter' },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated admin for accessing unpublished articles
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === 'admin';
    
    // Build query filter - handle both slug and ObjectId
    let filter: any;
    
    if (mongoose.Types.ObjectId.isValid(slug)) {
      // If it's a valid ObjectId, search by ID
      filter = { _id: slug };
    } else {
      // Otherwise, search by slug
      filter = { slug: slug.trim().toLowerCase() };
    }
    
    // Non-admin users can only see published articles
    if (!isAdmin) {
      filter.isPublished = true;
    }
    
    // Find the article
    const article = await Article.findOne(filter).lean();
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Return the article with formatted dates
    return NextResponse.json({
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
    
  } catch (error: any) {
    console.error('Error fetching article by slug:', error);
    
    // Handle validation errors
    if (error?.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.message },
        { status: 400 }
      );
    }
    
    // Handle database connection errors
    if (error?.name === 'MongoNetworkError' || error?.name === 'MongoServerError') {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      );
    }
    
    // Handle invalid ObjectId errors
    if (error?.name === 'CastError') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
    
    const { slug } = await params;
    
    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid slug parameter' },
        { status: 400 }
      );
    }
    
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
    
    const { title, content, isPublished, publishedDate } = body;
    
    // Build update object with only provided fields
    const updateData: any = {};
    
    // Validate and add title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }
    
    // Validate and add content if provided
    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json(
          { error: 'Content must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.content = content.trim();
    }
    
    // Validate and add isPublished if provided
    if (isPublished !== undefined) {
      if (typeof isPublished !== 'boolean') {
        return NextResponse.json(
          { error: 'isPublished must be a boolean value' },
          { status: 400 }
        );
      }
      updateData.isPublished = isPublished;
    }
    
    // Handle custom published date if provided
    if (publishedDate !== undefined) {
      if (publishedDate === null) {
        updateData.publishedDate = new Date(); // Reset to current date
      } else {
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
        updateData.publishedDate = parsedDate;
      }
    }
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }
    
    // Build query filter - handle both slug and ObjectId
    let filter: any;
    
    if (mongoose.Types.ObjectId.isValid(slug)) {
      // If it's a valid ObjectId, search by ID
      filter = { _id: slug };
    } else {
      // Otherwise, search by slug
      filter = { slug: slug.trim().toLowerCase() };
    }
    
    // Update the article
    const article = await Article.findOneAndUpdate(
      filter,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validation
      }
    );
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Return the updated article
    return NextResponse.json({
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
    
  } catch (error: any) {
    console.error('Error updating article:', error);
    
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
    
    // Handle invalid ObjectId errors
    if (error?.name === 'CastError') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
    
    const { slug } = await params;
    
    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid slug parameter' },
        { status: 400 }
      );
    }
    
    // Build query filter - handle both slug and ObjectId
    let filter: any;
    
    if (mongoose.Types.ObjectId.isValid(slug)) {
      // If it's a valid ObjectId, search by ID
      filter = { _id: slug };
    } else {
      // Otherwise, search by slug
      filter = { slug: slug.trim().toLowerCase() };
    }
    
    // Find and delete the article
    const article = await Article.findOneAndDelete(filter);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      message: 'Article deleted successfully',
      deletedArticle: {
        _id: article._id.toString(),
        title: article.title,
        slug: article.slug,
      }
    });
    
  } catch (error: any) {
    console.error('Error deleting article:', error);
    
    // Handle database connection errors
    if (error?.name === 'MongoNetworkError' || error?.name === 'MongoServerError') {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      );
    }
    
    // Handle invalid ObjectId errors
    if (error?.name === 'CastError') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}