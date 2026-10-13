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
 * Get cryptographic secret for signing cookies
 */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: SESSION_SECRET is required in production environment.');
    }
    // Safe development fallback key
    return 'dev_insecure_fallback_secret_cp_fondue_local_only_key_2026';
  }
  return secret;
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
 * Retrieves authenticated user session from signed cookie or database verification.
 * Header spoofing (x-user-id, x-user-role) is intentionally disallowed in production.
 */
export async function getAuthSession(req?: NextRequest): Promise<AuthSession> {
  // In development / test mode: prioritize portal context (referer / cp_dev_role) for smooth multi-role preview
  if (process.env.NODE_ENV !== 'production') {
    // 1. Check referer url (e.g. /admin, /technician, /executive, /reporter)
    const referer = req?.headers.get('referer') || '';
    let portalRole: RoleCode | null = null;
    if (referer.includes('/admin')) portalRole = 'ADMIN_DISPATCH';
    else if (referer.includes('/technician')) portalRole = 'TECHNICIAN';
    else if (referer.includes('/executive')) portalRole = 'EXECUTIVE';
    else if (referer.includes('/reporter')) portalRole = 'REPORTER';

    // 2. Check explicit dev-role cookie
    const devRoleCookie = req?.cookies.get('cp_dev_role')?.value as RoleCode | undefined;
    const targetRole = portalRole || devRoleCookie;

    if (targetRole) {
      const portalUser = await prisma.user.findFirst({
        where: { role: targetRole, deletedAt: null },
      });
      if (portalUser) {
        return {
          userId: portalUser.id,
          email: portalUser.email,
          role: targetRole,
          firstName: portalUser.firstName,
          lastName: portalUser.lastName,
        };
      }
    }
  }

  // 3. Verify signed session cookie (production / explicit login)
  const cookieValue = req?.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieValue) {
    const sessionPayload = verifySessionToken(cookieValue);
    if (sessionPayload?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: sessionPayload.userId },
      });
      if (user && (!user.deletedAt)) {
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

  // 4. Default fallback in development: reporter user in database
  if (process.env.NODE_ENV !== 'production') {
    const defaultReporter = await prisma.user.findFirst({
      where: { role: 'REPORTER', deletedAt: null },
    });
    if (defaultReporter) {
      return {
        userId: defaultReporter.id,
        email: defaultReporter.email,
        role: 'REPORTER',
        firstName: defaultReporter.firstName,
        lastName: defaultReporter.lastName,
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

  // 5. In production: If no valid session cookie, fail closed
  throw new Error('UNAUTHORIZED: กรุณาเข้าสู่ระบบก่อนดำเนินการ');
}

/**
 * Role-Based Access Control (RBAC) verification helper
 */
export function assertAuthorized(session: AuthSession, allowedRoles: RoleCode[]): void {
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`FORBIDDEN: คุณไม่มีสิทธิ์ดำเนินการในส่วนนี้ (ต้องการสิทธิ์: ${allowedRoles.join(', ')})`);
  }
}
