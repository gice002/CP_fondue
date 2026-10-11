import { NextRequest, NextResponse } from 'next/server';
import { SparePartService } from '@/services/sparePartService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const requisitions = await SparePartService.getRequisitions(status ? { status } : undefined);
    return NextResponse.json({ success: true, data: requisitions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.ticketId || !body.items || !body.items.length) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุใบแจ้งซ่อมและรายการอะไหล่ที่ต้องการเบิก' },
        { status: 400 }
      );
    }

    const reqRecord = await SparePartService.createRequisition({
      ticketId: body.ticketId,
      ticketNumber: body.ticketNumber,
      technicianId: body.technicianId,
      items: body.items,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: reqRecord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, notes } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'Missing id or action' }, { status: 400 });
    }

    let updated = null;
    if (action === 'APPROVE') {
      updated = await SparePartService.approveRequisition(id, body.adminId);
    } else if (action === 'REJECT') {
      updated = await SparePartService.rejectRequisition(id, notes);
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Requisition not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
