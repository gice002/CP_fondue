import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/services/ticketService';
import { TicketStatus } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as TicketStatus | null;
    const search = searchParams.get('search') ?? undefined;
    const reporterId = searchParams.get('reporterId') ?? undefined;
    const technicianId = searchParams.get('technicianId') ?? undefined;

    const tickets = await TicketService.getTickets({
      status: status || undefined,
      search,
      reporterId,
      technicianId,
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.description || !body.locationId) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกสถานที่และรายละเอียดปัญหา (BR2)' },
        { status: 400 }
      );
    }

    const ticket = await TicketService.createTicket({
      locationId: body.locationId,
      locationDetail: body.locationDetail,
      category: body.category || 'ระบบคอมพิวเตอร์และเครือข่าย',
      equipmentId: body.equipmentId,
      assetCode: body.assetCode,
      description: body.description,
      urgency: body.urgency || 'NORMAL',
      attachmentUrls: body.attachmentUrls || [],
      reporterId: body.reporterId,
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
