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

    const session = await getAuthSession(req);
    const ticket = await TicketService.getTicketById(id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'ไม่พบใบแจ้งซ่อม' }, { status: 404 });
    }

    // Reporter data privacy: Reporters can only view their own tickets
    if (session.role === 'REPORTER' && ticket.reporter.id !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลใบแจ้งซ่อมนี้' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('GET /api/tickets/[id] error:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
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
      // Require ADMIN_DISPATCH role
      assertAuthorized(session, ['ADMIN_DISPATCH']);

      const technicianIds = body.technicianIds || (body.technicianId ? [body.technicianId] : []);
      if (!technicianIds || technicianIds.length === 0) {
        return NextResponse.json({ success: false, error: 'กรุณาระบุช่างผู้รับผิดชอบอย่างน้อย 1 คน' }, { status: 400 });
      }

      updatedTicket = await TicketService.assignTicket(
        id,
        technicianIds,
        body.tags,
        body.adminNotes,
        session.userId
      );
    } else if (action === 'UNASSIGN') {
      // Require ADMIN_DISPATCH role
      assertAuthorized(session, ['ADMIN_DISPATCH']);

      updatedTicket = await TicketService.unassignTicket(id, session.userId, body.reason);
    } else if (action === 'UPDATE_TAGS') {
      // Require ADMIN_DISPATCH role
      assertAuthorized(session, ['ADMIN_DISPATCH']);

      if (!Array.isArray(body.tags)) {
        return NextResponse.json({ success: false, error: 'Tags must be an array' }, { status: 400 });
      }
      updatedTicket = await TicketService.updateTicketTags(id, body.tags, session.userId);
    } else if (action === 'ACCEPT') {
      // Require TECHNICIAN or ADMIN_DISPATCH role
      assertAuthorized(session, ['TECHNICIAN', 'ADMIN_DISPATCH']);

      const targetTechId = body.technicianId || session.userId;
      updatedTicket = await TicketService.acceptTicket(id, targetTechId);
    } else if (action === 'CLOSE') {
      // Require TECHNICIAN or ADMIN_DISPATCH role
      assertAuthorized(session, ['TECHNICIAN', 'ADMIN_DISPATCH']);

      if (!body.repairNotes || !body.repairNotes.trim()) {
        return NextResponse.json({ success: false, error: 'กรุณากรอกบันทึกสรุปผลการซ่อม (BR8)' }, { status: 400 });
      }

      const targetTechId = body.technicianId || session.userId;
      updatedTicket = await TicketService.closeTicket(
        id,
        body.repairNotes.trim(),
        body.afterProofUrls || [],
        targetTechId
      );
    } else if (action === 'CANCEL') {
      // Cancel is allowed for REPORTER or ADMIN_DISPATCH
      assertAuthorized(session, ['REPORTER', 'ADMIN_DISPATCH']);

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
    const status = error.message?.startsWith('UNAUTHORIZED')
      ? 401
      : error.message?.startsWith('FORBIDDEN')
      ? 403
      : 400;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
