import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import connectDB from './mongodb';
import AdminSession from './models/AdminSession';
import crypto from 'crypto';

export interface AuthUser {
  name: string;
  role: string;
}

export interface SessionOptions {
  ipAddress?: string;
  userAgent?: string;
  expirationHours?: number;
}

export async function createSession(
  userId: string, 
  options: SessionOptions = {}
): Promise<string> {
  await connectDB();
  
  const sessionId = generateSecureSessionId();
  const expirationHours = options.expirationHours || 24;
  const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
  
  // Clean up any existing sessions for this user (single session per user)
  await AdminSession.deleteMany({ userId });
  
  await AdminSession.create({
    sessionId,
    userId,
    expiresAt,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
  });
  
  return sessionId;
}

export async function validateSession(sessionId: string): Promise<AuthUser | null> {
  if (!sessionId) return null;
  
  await connectDB();
  
  const session = await AdminSession.findOne({
    sessionId,
    expiresAt: { $gt: new Date() },
  });
  
  if (!session) return null;
  
  // Update last accessed time
  session.lastAccessedAt = new Date();
  await session.save();
  
  return {
    name: 'Parmeet',
    role: 'admin',
  };
}

export async function extendSession(
  sessionId: string, 
  hours: number = 24
): Promise<boolean> {
  if (!sessionId) return false;
  
  await connectDB();
  
  const session = await AdminSession.findOne({
    sessionId,
    expiresAt: { $gt: new Date() },
  });
  
  if (!session) return false;
  
  await session.extend(hours);
  return true;
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  
  await connectDB();
  await AdminSession.deleteOne({ sessionId });
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await connectDB();
  await AdminSession.deleteMany({ userId });
}

export async function cleanupExpiredSessions(): Promise<number> {
  await connectDB();
  const result = await AdminSession.deleteMany({ 
    expiresAt: { $lt: new Date() } 
  });
  return result.deletedCount || 0;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    
    if (!sessionId) return null;
    
    return validateSession(sessionId);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getSessionInfo(): Promise<{
  authenticated: boolean;
  user?: AuthUser;
  sessionId?: string;
  expiresAt?: Date;
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    
    if (!sessionId) {
      return { authenticated: false };
    }
    
    await connectDB();
    
    const session = await AdminSession.findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    });
    
    if (!session) {
      return { authenticated: false };
    }
    
    const user = await validateSession(sessionId);
    
    return {
      authenticated: true,
      user: user || undefined,
      sessionId,
      expiresAt: session.expiresAt,
    };
  } catch (error) {
    console.error('Error getting session info:', error);
    return { authenticated: false };
  }
}

export function validateCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME || 'Parmeet';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Parmeet8826';
  
  return username === adminUsername && password === adminPassword;
}

export async function getClientInfo(): Promise<{ ipAddress?: string; userAgent?: string }> {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     headersList.get('remote-addr') || 
                     undefined;
    const userAgent = headersList.get('user-agent') || undefined;
    
    return { ipAddress, userAgent };
  } catch (error) {
    console.error('Error getting client info:', error);
    return {};
  }
}

function generateSecureSessionId(): string {
  // Generate a cryptographically secure session ID
  const randomBytes = crypto.randomBytes(32);
  const timestamp = Date.now().toString(36);
  const randomString = randomBytes.toString('hex');
  
  return `${timestamp}_${randomString}`;
}