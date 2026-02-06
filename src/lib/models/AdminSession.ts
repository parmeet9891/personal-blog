import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminSession extends Document {
  sessionId: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

const AdminSessionSchema = new Schema<IAdminSession>({
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    unique: true,
    trim: true,
    minlength: [10, 'Session ID must be at least 10 characters'],
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    default: 'admin',
    trim: true,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    validate: {
      validator: function(date: Date) {
        return date > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    trim: true,
    validate: {
      validator: function(ip: string) {
        if (!ip) return true; // Optional field
        // Accept localhost variations and common IP formats
        const localhostVariations = ['localhost', '127.0.0.1', '::1', '0:0:0:0:0:0:0:1'];
        if (localhostVariations.includes(ip)) return true;
        
        // Basic IPv4 validation
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (ipv4Regex.test(ip)) return true;
        
        // Basic IPv6 validation (simplified)
        const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
        return ipv6Regex.test(ip);
      },
      message: 'Invalid IP address format'
    }
  },
  userAgent: {
    type: String,
    trim: true,
    maxlength: [500, 'User agent cannot exceed 500 characters'],
  },
}, {
  timestamps: true,
});

// Create indexes for performance and security
AdminSessionSchema.index({ userId: 1 });
AdminSessionSchema.index({ lastAccessedAt: -1 });

// Update lastAccessedAt on each query
AdminSessionSchema.pre(['findOne', 'findOneAndUpdate'], function() {
  this.set({ lastAccessedAt: new Date() });
});

// Virtual for checking if session is expired
AdminSessionSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual for time until expiration
AdminSessionSchema.virtual('timeUntilExpiration').get(function() {
  const now = new Date();
  const expiry = this.expiresAt;
  return Math.max(0, expiry.getTime() - now.getTime());
});

// Method to extend session expiration
AdminSessionSchema.methods.extend = function(hours: number = 24) {
  this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  this.lastAccessedAt = new Date();
  return this.save();
};

// Static method to cleanup expired sessions
AdminSessionSchema.statics.cleanupExpired = function() {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

export default mongoose.models.AdminSession || mongoose.model<IAdminSession>('AdminSession', AdminSessionSchema);