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
  return process.env.SESSION_SECRET || 'cp_fondue_production_session_signing_secret_2026';
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
 * Retrieves authenticated user session from headers, signed cookie, dev role, or portal context.
 */
export async function getAuthSession(req?: NextRequest): Promise<AuthSession> {
  // 1. Explicit request headers (from authorized internal actions or desk components)
  const headerUserId = req?.headers.get('x-user-id');
  const headerRole = req?.headers.get('x-user-role') as RoleCode | undefined;

  if (headerUserId) {
    const user = await prisma.user.findUnique({
      where: { id: headerUserId, deletedAt: null },
    });
    if (user) {
      return {
        userId: user.id,
        email: user.email,
        role: headerRole || (user.role as RoleCode),
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }
  }

  if (headerRole) {
    const user = await prisma.user.findFirst({
      where: { role: headerRole, deletedAt: null },
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

  // 2. Check referer url (e.g. /admin, /technician, /executive, /reporter)
  const referer = req?.headers.get('referer') || '';
  let portalRole: RoleCode | null = null;
  if (referer.includes('/admin')) portalRole = 'ADMIN_DISPATCH';
  else if (referer.includes('/technician')) portalRole = 'TECHNICIAN';
  else if (referer.includes('/executive')) portalRole = 'EXECUTIVE';
  else if (referer.includes('/reporter')) portalRole = 'REPORTER';

  // 3. Check explicit dev-role cookie (set by 1-click role switcher)
  const devRoleCookie = req?.cookies.get('cp_dev_role')?.value as RoleCode | undefined;

  // 4. Verify signed session cookie if present
  const cookieValue = req?.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieValue) {
    const sessionPayload = verifySessionToken(cookieValue);
    if (sessionPayload?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: sessionPayload.userId },
      });
      if (user && !user.deletedAt) {
        // If the request is made from a specific workspace (e.g. /admin), but the session cookie
        // belongs to a different persona (e.g. Reporter), let the workspace role take precedence
        const userRole = (user.role as RoleCode) || 'REPORTER';
        if (portalRole && userRole !== portalRole) {
          // Proceed to portal role lookup below
        } else if (devRoleCookie && userRole !== devRoleCookie) {
          // Proceed to devRole lookup below
        } else {
          return {
            userId: user.id,
            email: user.email,
            role: userRole,
            firstName: user.firstName,
            lastName: user.lastName,
          };
        }
      }
    }
  }

  // 5. Use portal role, dev role, or fallback
  const targetRole = portalRole || devRoleCookie || 'REPORTER';

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

  // 6. Default fallback: Somchai (Reporter)
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

/**
 * Role-Based Access Control (RBAC) verification helper
 */
export function assertAuthorized(session: AuthSession, allowedRoles: RoleCode[]): void {
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`FORBIDDEN: คุณไม่มีสิทธิ์ดำเนินการในส่วนนี้ (ต้องการสิทธิ์: ${allowedRoles.join(', ')})`);
  }
}
