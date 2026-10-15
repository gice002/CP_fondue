import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/services/ticketService';
import { getAuthSession } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession(req);
    const body = await req.json();

    const rating = Number(body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุคะแนนความพึงพอใจ 1 - 5 ดาว (BR10)' },
        { status: 400 }
      );
    }

    const evaluation = await TicketService.submitEvaluation(
      id,
      rating,
      body.feedback,
      session.userId
    );

    if (!evaluation) {
      return NextResponse.json({ success: false, error: 'ไม่พบใบแจ้งซ่อม' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: evaluation }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/tickets/[id]/evaluation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
