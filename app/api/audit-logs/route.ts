import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/services/auditService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? undefined;
    const logs = await AuditService.getAuditLogs({ search });
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
