import { PrismaClient } from '@prisma/client';

const FALLBACK_DATABASE_URL =
  "postgresql://postgres.yyjjtdmkqgnixfzrvyvv:Idon'tknowythepassword1806@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

export function getSanitizedDbUrl(): string {
  let url = process.env.DATABASE_URL;
  if (!url || typeof url !== 'string' || !url.trim()) {
    url = FALLBACK_DATABASE_URL;
  }
  // Strip wrapping single or double quotes, and clean whitespace
  return url.trim().replace(/^["']|["']$/g, '').trim();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getSanitizedDbUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
