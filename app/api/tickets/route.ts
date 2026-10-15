import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/services/ticketService';
import { getAuthSession } from '@/lib/auth';
import { TicketStatus } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as TicketStatus | null;
    const excludeStatus = searchParams.get('excludeStatus') ?? undefined;
    const search = searchParams.get('search') ?? undefined;
    let reporterId = searchParams.get('reporterId') ?? undefined;
    const technicianId = searchParams.get('technicianId') ?? undefined;

    // Pagination query parameters
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : undefined;
    const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : undefined;

    // CRITICAL DATA PRIVACY: If authenticated user is a REPORTER, strictly enforce reporterId to their own ID
    if (session.role === 'REPORTER') {
      reporterId = session.userId;
    }

    const result = await TicketService.getTicketsWithPagination({
      status: status || undefined,
      excludeStatus,
      search,
      reporterId,
      technicianId,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.tickets,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('GET /api/tickets error:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tickets' },
      { status }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const body = await req.json();

    if (!body.description || !body.description.trim()) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกรายละเอียดปัญหา (BR2)' },
        { status: 400 }
      );
    }

    if (!body.locationId) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุสถานที่เกิดเหตุ (BR2)' },
        { status: 400 }
      );
    }

    // Security: Only ADMIN_DISPATCH can specify initial custom tags (e.g. for Walk-in creation)
    const allowedTags = session.role === 'ADMIN_DISPATCH' && Array.isArray(body.tags) ? body.tags : undefined;

    // Security: Reporter ID is ALWAYS set to authenticated session.userId (prevent spoofing)
    const reporterUserId = session.userId;

    const ticket = await TicketService.createTicket({
      locationId: body.locationId,
      locationDetail: body.locationDetail,
      category: body.category || 'ระบบคอมพิวเตอร์และเครือข่าย',
      equipmentId: body.equipmentId,
      assetCode: body.assetCode,
      description: body.description.trim(),
      attachmentUrls: body.attachmentUrls || [],
      reporterId: reporterUserId,
      initialTags: allowedTags,
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/tickets error:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create ticket' },
      { status }
    );
  }
}
