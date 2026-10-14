import { NextResponse } from 'next/server';
import { prisma, getSanitizedDbUrl } from '@/lib/prisma';


export async function GET() {
  const startTime = Date.now();
  const rawDbUrl = process.env.DATABASE_URL;
  const sanitizedUrl = getSanitizedDbUrl();

  // Mask credentials for safe display
  const maskedDbUrl = sanitizedUrl.replace(
    /\/\/([^:]+):([^@]+)@/,
    '//$1:****@'
  );

  try {
    const [userCount, ticketCount] = await Promise.all([
      prisma.user.count(),
      prisma.ticket.count(),
    ]);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        latencyMs,
        maskedUrl: maskedDbUrl,
        userCount,
        ticketCount,
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_SET: Boolean(rawDbUrl),
        DIRECT_URL_SET: Boolean(process.env.DIRECT_URL),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message || 'Database connection error',
        database: {
          connected: false,
          maskedUrl: maskedDbUrl,
        },
        env: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL_SET: Boolean(rawDbUrl),
          DIRECT_URL_SET: Boolean(process.env.DIRECT_URL),
        },
      },
      { status: 500 }
    );
  }
}
