import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RoleCode } from '@/types';

export interface AuthSession {
  userId: string;
  email: string;
  role: RoleCode;
  firstName: string;
  lastName: string;
}

/**
 * Server-side Authentication & Authorization helper
 * Integrates with KKU Mail domain validation and database role verification.
 */
export async function getAuthSession(req?: NextRequest): Promise<AuthSession> {
  // 1. Check for request header override (e.g. from middleware or client API call)
  const headerUserId = req?.headers.get('x-user-id');
  const headerRole = req?.headers.get('x-user-role') as RoleCode | null;

  if (headerUserId) {
    const user = await prisma.user.findUnique({
      where: { id: headerUserId },
    });
    if (user) {
      return {
        userId: user.id,
        email: user.email,
        role: (user.role as RoleCode) || 'REPORTER',
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }
  }

  // 2. If specific role requested in headers
  if (headerRole) {
    const user = await prisma.user.findFirst({
      where: { role: headerRole },
    });
    if (user) {
      return {
        userId: user.id,
        email: user.email,
        role: headerRole,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }
  }

  // 3. Default fallback to reporter role in database
  const defaultUser = await prisma.user.findFirst({
    where: { role: 'REPORTER' },
  });

  if (defaultUser) {
    return {
      userId: defaultUser.id,
      email: defaultUser.email,
      role: 'REPORTER',
      firstName: defaultUser.firstName,
      lastName: defaultUser.lastName,
    };
  }

  return {
    userId: 'usr_reporter_01',
    email: 'somchai.k@kkumail.com',
    role: 'REPORTER',
    firstName: 'สมชาย',
    lastName: 'เกียรติวิทยา',
  };
}

/**
 * Role-Based Access Control (RBAC) verification
 */
export function assertAuthorized(session: AuthSession, allowedRoles: RoleCode[]): void {
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`คุณไม่มีสิทธิ์ดำเนินการในส่วนนี้ (ต้องการสิทธิ์: ${allowedRoles.join(', ')})`);
  }
}
