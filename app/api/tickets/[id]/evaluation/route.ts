import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/services/ticketService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.rating) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุคะแนนความพึงพอใจ 1-5 ดาว' }, { status: 400 });
    }

    const evaluation = await TicketService.submitEvaluation(id, body.rating, body.feedback);

    if (!evaluation) {
      return NextResponse.json({ success: false, error: 'ไม่พบใบแจ้งซ่อม' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: evaluation }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
