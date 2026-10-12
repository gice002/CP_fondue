import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSessionToken, SESSION_COOKIE_NAME, getAuthSession } from '@/lib/auth';
import { RoleCode } from '@/types';

/**
 * Session API handler
 * GET: returns current session user information
 * POST: in development/preview environments, sets active session to a chosen role or user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Disallow dev session switching endpoint in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Role switching endpoint is disabled in production' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const role = body.role as RoleCode;
    const userId = body.userId as string | undefined;

    let targetUser = null;

    if (userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });
    } else if (role) {
      targetUser = await prisma.user.findFirst({
        where: { role, deletedAt: null },
      });
    }

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found for the requested role' },
        { status: 404 }
      );
    }

    const token = signSessionToken({
      userId: targetUser.id,
      role: (targetUser.role as RoleCode) || 'REPORTER',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const res = NextResponse.json({
      success: true,
      data: {
        userId: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: (process.env.NODE_ENV as string) === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}
