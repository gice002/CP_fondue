import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/services/ticketService';
import { getAuthSession, assertAuthorized } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ticket ID' }, { status: 400 });
    }

    const ticket = await TicketService.getTicketById(id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'ไม่พบใบแจ้งซ่อม' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('GET /api/tickets/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession(req);
    const body = await req.json();
    const action = body.action;

    let updatedTicket = null;

    if (action === 'ASSIGN') {
      // Admin assigns technician (BR4, UC-9) with workload validation and tags
      if (!body.technicianId) {
        return NextResponse.json({ success: false, error: 'กรุณาระบุช่างผู้รับผิดชอบ' }, { status: 400 });
      }

      updatedTicket = await TicketService.assignTicket(
        id,
        body.technicianId,
        body.tags,
        body.targetSlaDate,
        body.adminNotes,
        session.userId
      );
    } else if (action === 'UNASSIGN') {
      // Admin unassigns technician to release back to PENDING_DISPATCH
      updatedTicket = await TicketService.unassignTicket(id, session.userId, body.reason);
    } else if (action === 'UPDATE_TAGS') {
      // Admin updates tags
      if (!Array.isArray(body.tags)) {
        return NextResponse.json({ success: false, error: 'Tags must be an array' }, { status: 400 });
      }
      updatedTicket = await TicketService.updateTicketTags(id, body.tags, session.userId);
    } else if (action === 'ACCEPT') {
      // Technician accepts job (BR5, BR6)
      updatedTicket = await TicketService.acceptTicket(id, body.technicianId || session.userId);
    } else if (action === 'CLOSE') {
      // Technician completes job and submits proof (BR8, BR9)
      if (!body.repairNotes || !body.repairNotes.trim()) {
        return NextResponse.json({ success: false, error: 'กรุณากรอกบันทึกสรุปผลการซ่อม (BR8)' }, { status: 400 });
      }

      updatedTicket = await TicketService.closeTicket(
        id,
        body.repairNotes.trim(),
        body.afterProofUrls || [],
        session.userId
      );
    } else if (action === 'CANCEL') {
      // Cancels ticket (UC-5) with role verification
      updatedTicket = await TicketService.cancelTicket(id, body.reason, session.userId, session.role);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    if (!updatedTicket) {
      return NextResponse.json({ success: false, error: 'ไม่พบใบแจ้งซ่อม' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedTicket });
  } catch (error: any) {
    console.error('PATCH /api/tickets/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
