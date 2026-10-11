import { NextRequest, NextResponse } from 'next/server';
import { SparePartService } from '@/services/sparePartService';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const requisitions = await SparePartService.getRequisitions(status ? { status } : undefined);
    return NextResponse.json({ success: true, data: requisitions });
  } catch (error: any) {
    console.error('GET /api/spare-parts/requisitions error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const body = await req.json();

    if (!body.ticketId || !body.items || !body.items.length) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุใบแจ้งซ่อมและรายการอะไหล่ที่ต้องการเบิก (UC-10)' },
        { status: 400 }
      );
    }

    const reqRecord = await SparePartService.createRequisition({
      ticketId: body.ticketId,
      ticketNumber: body.ticketNumber,
      technicianId: body.technicianId || session.userId,
      items: body.items,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: reqRecord }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/spare-parts/requisitions error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const body = await req.json();
    const { id, action, notes } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'Missing id or action' }, { status: 400 });
    }

    let updated = null;
    if (action === 'APPROVE') {
      updated = await SparePartService.approveRequisition(id, body.adminId || session.userId);
    } else if (action === 'REJECT') {
      updated = await SparePartService.rejectRequisition(id, notes, body.adminId || session.userId);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'ไม่พบใบเบิกอะไหล่' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('PATCH /api/spare-parts/requisitions error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
