import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    name: string;
    role: string;
  };
}

/**
 * Authentication middleware for API routes
 * Validates session and adds user information to request
 */
export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Add user to request object
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Optional authentication middleware for API routes
 * Adds user information to request if authenticated, but doesn't require it
 */
export async function withOptionalAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const user = await getCurrentUser();
      
      // Add user to request object (may be null)
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user || undefined;

      return handler(authenticatedReq);
    } catch (error) {
      console.error('Optional authentication middleware error:', error);
      
      // Continue without authentication on error
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = undefined;
      
      return handler(authenticatedReq);
    }
  };
}

/**
 * Admin-only authentication middleware for API routes
 * Validates session and ensures user has admin role
 */
export async function withAdminAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Add user to request object
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq);
    } catch (error) {
      console.error('Admin authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}