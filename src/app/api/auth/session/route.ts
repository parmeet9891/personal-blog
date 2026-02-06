import { NextRequest, NextResponse } from 'next/server';
import { getSessionInfo } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionInfo = await getSessionInfo();

    if (!sessionInfo || !sessionInfo.authenticated) {
      return NextResponse.json({
        authenticated: false,
        message: 'No active session',
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: sessionInfo.user,
      expiresAt: sessionInfo.expiresAt,
      message: 'Session valid',
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        message: 'Session verification failed',
      },
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

export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}