import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { RoleCode } from '@/types';

export const SESSION_COOKIE_NAME = 'cp_fondue_session';

export interface AuthSession {
  userId: string;
  email: string;
  role: RoleCode;
  firstName: string;
  lastName: string;
}

interface SessionPayload {
  userId: string;
  role: RoleCode;
  exp: number; // unix timestamp in ms
}

/**
 * Get cryptographic secret for signing cookies.
 * Enforces strict 32+ character entropy in production environments (Fail-closed).
 */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('FATAL CONFIGURATION ERROR: SESSION_SECRET must be configured with at least 32 characters in production.');
  }
  return secret || 'cp_fondue_default_dev_secret_key_32_characters_minimum_entropy_2026!';
}

/**
 * Sign payload to generate a tamper-evident session token
 */
export function signSessionToken(payload: SessionPayload): string {
  const secret = getSessionSecret();
  const rawData = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(rawData).digest('base64url');
  return `${rawData}.${signature}`;
}

/**
 * Verify and parse session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [rawData, signature] = parts;
    const secret = getSessionSecret();
    const expectedSignature = crypto.createHmac('sha256', secret).update(rawData).digest('base64url');

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(rawData, 'base64url').toString('utf-8'));
    if (!payload.userId || !payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Server-side Authentication helper.
 * Retrieves authenticated user session from signed cryptographic cookie.
 * Strips untrusted client headers (x-user-id/x-user-role) and referer spoofing.
 */
export async function getAuthSession(req?: NextRequest): Promise<AuthSession | null> {
  // 1. Primary: Verify signed session cookie
  const cookieValue = req?.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieValue) {
    const sessionPayload = verifySessionToken(cookieValue);
    if (sessionPayload?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: sessionPayload.userId, deletedAt: null },
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
  }

  // 2. Controlled Development / Demo switcher (strictly non-production or explicit demo mode)
  const isDevOrDemo = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_LOGIN === 'true';
  if (isDevOrDemo) {
    const devRoleCookie = req?.cookies.get('cp_dev_role')?.value as RoleCode | undefined;
    if (devRoleCookie) {
      const portalUser = await prisma.user.findFirst({
        where: { role: devRoleCookie, deletedAt: null },
      });
      if (portalUser) {
        return {
          userId: portalUser.id,
          email: portalUser.email,
          role: devRoleCookie,
          firstName: portalUser.firstName,
          lastName: portalUser.lastName,
        };
      }
    }
  }

  // Unauthenticated requests return null
  return null;
}

/**
 * Role-Based Access Control (RBAC) verification helper.
 * Asserts session is present and caller possesses an allowed role.
 */
export function assertAuthorized(
  session: AuthSession | null | undefined,
  allowedRoles: RoleCode[]
): asserts session is AuthSession {
  if (!session) {
    throw new Error('UNAUTHORIZED: กรุณาเข้าสู่ระบบก่อนดำเนินการ');
  }
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`FORBIDDEN: คุณไม่มีสิทธิ์ดำเนินการในส่วนนี้ (ต้องการสิทธิ์: ${allowedRoles.join(', ')})`);
  }
}
