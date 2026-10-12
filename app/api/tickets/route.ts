import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/services/ticketService';
import { getAuthSession } from '@/lib/auth';
import { TicketStatus } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as TicketStatus | null;
    const excludeStatus = searchParams.get('excludeStatus') ?? undefined;
    const search = searchParams.get('search') ?? undefined;
    const reporterId = searchParams.get('reporterId') ?? undefined;
    const technicianId = searchParams.get('technicianId') ?? undefined;

    const tickets = await TicketService.getTickets({
      status: status || undefined,
      excludeStatus,
      search,
      reporterId,
      technicianId,
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error: any) {
    console.error('GET /api/tickets error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tickets' },
      { status: 500 }
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

    const ticket = await TicketService.createTicket({
      locationId: body.locationId,
      locationDetail: body.locationDetail,
      category: body.category || 'ระบบคอมพิวเตอร์และเครือข่าย',
      equipmentId: body.equipmentId,
      assetCode: body.assetCode,
      description: body.description.trim(),
      attachmentUrls: body.attachmentUrls || [],
      reporterId: body.reporterId || session.userId,
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/tickets error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
