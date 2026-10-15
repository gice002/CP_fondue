import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/services/auditService';
import { getAuthSession, assertAuthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    assertAuthorized(session, ['ADMIN_DISPATCH', 'EXECUTIVE']);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? undefined;
    const logs = await AuditService.getAuditLogs({ search });
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    const status = error.message?.startsWith('UNAUTHORIZED')
      ? 401
      : error.message?.startsWith('FORBIDDEN')
      ? 403
      : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
