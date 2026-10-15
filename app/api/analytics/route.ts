import { NextRequest, NextResponse } from 'next/server';
import { StatsService } from '@/services/statsService';
import { getAuthSession, assertAuthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    assertAuthorized(session, ['ADMIN_DISPATCH', 'EXECUTIVE']);

    const stats = await StatsService.getExecutiveStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    const status = error.message?.startsWith('UNAUTHORIZED')
      ? 401
      : error.message?.startsWith('FORBIDDEN')
      ? 403
      : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
