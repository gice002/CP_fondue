import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/services/ticketService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await TicketService.getTicketById(id);

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const action = body.action;

    let updatedTicket = null;

    if (action === 'ASSIGN') {
      // Admin assigns technician (BR4, UC-9)
      updatedTicket = await TicketService.assignTicket(
        id,
        body.technicianId,
        body.urgency,
        body.targetSlaDate,
        body.adminNotes
      );
    } else if (action === 'ACCEPT') {
      // Technician accepts job (BR5, BR6)
      updatedTicket = await TicketService.acceptTicket(id, body.technicianId);
    } else if (action === 'CLOSE') {
      // Technician completes job and submits proof (BR8, BR9)
      updatedTicket = await TicketService.closeTicket(
        id,
        body.repairNotes,
        body.afterProofUrls || []
      );
    } else if (action === 'CANCEL') {
      // Reporter cancels ticket (UC-5)
      updatedTicket = await TicketService.cancelTicket(id, body.reason);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    if (!updatedTicket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedTicket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
