import mongoose, { Document, Schema } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  publishedDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

const ArticleSchema = new Schema<IArticle>({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    minlength: [1, 'Title must be at least 1 character'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
  },
  content: {
    type: String,
    required: [true, 'Article content is required'],
    minlength: [1, 'Content must be at least 1 character'],
  },
  publishedDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(date: Date) {
        return date <= new Date();
      },
      message: 'Published date cannot be in the future'
    }
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for performance
ArticleSchema.index({ publishedDate: -1 });
ArticleSchema.index({ isPublished: 1 });
ArticleSchema.index({ isPublished: 1, publishedDate: -1 }); // Compound index for published articles by date

// Virtual for formatted published date
ArticleSchema.virtual('formattedDate').get(function() {
  return this.publishedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Generate slug from title before saving
ArticleSchema.pre('save', function() {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens
    
    // If slug is empty after processing, generate a fallback
    if (!baseSlug || baseSlug.length === 0) {
      baseSlug = 'article-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    }
    
    this.slug = baseSlug;
  }
});

// Ensure slug uniqueness
ArticleSchema.pre('save', async function() {
  if (this.isModified('slug')) {
    const existingArticle = await mongoose.models.Article.findOne({ 
      slug: this.slug, 
      _id: { $ne: this._id } 
    });
    
    if (existingArticle) {
      let counter = 1;
      let newSlug = `${this.slug}-${counter}`;
      
      while (await mongoose.models.Article.findOne({ slug: newSlug })) {
        counter++;
        newSlug = `${this.slug}-${counter}`;
      }
      
      this.slug = newSlug;
    }
  }
});

export default mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);