import { NextRequest, NextResponse } from 'next/server';
import { SparePartService } from '@/services/sparePartService';
import { getAuthSession, assertAuthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    // Allow viewing for all authenticated roles (REPORTER, ADMIN_DISPATCH, TECHNICIAN, EXECUTIVE)
    assertAuthorized(session, ['ADMIN_DISPATCH', 'TECHNICIAN', 'EXECUTIVE', 'REPORTER']);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const requisitions = await SparePartService.getRequisitions(status ? { status } : undefined);
    return NextResponse.json({ success: true, data: requisitions });
  } catch (error: any) {
    console.error('GET /api/spare-parts/requisitions error:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    // Only TECHNICIAN and ADMIN_DISPATCH may create requisitions
    assertAuthorized(session, ['TECHNICIAN', 'ADMIN_DISPATCH']);

    const body = await req.json();

    if (!body.ticketId || !body.items || !body.items.length) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุใบแจ้งซ่อมและรายการอะไหล่ที่ต้องการเบิก (UC-10)' },
        { status: 400 }
      );
    }

    // Require exactly one item per requisition contract (or create requisition for each item)
    if (body.items.length !== 1) {
      return NextResponse.json(
        { success: false, error: 'ระบบรองรับการเบิก 1 ชนิดอะไหล่ต่อ 1 ใบเบิก (กรุณาแยกส่งใบเบิกหากมีหลายรายการ)' },
        { status: 400 }
      );
    }

    const reqRecord = await SparePartService.createRequisition({
      ticketId: body.ticketId,
      ticketNumber: body.ticketNumber,
      technicianId: session.userId,
      items: body.items,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: reqRecord }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/spare-parts/requisitions error:', error);
    const status = error.message?.startsWith('UNAUTHORIZED')
      ? 401
      : error.message?.startsWith('FORBIDDEN')
      ? 403
      : 400;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    // Only ADMIN_DISPATCH can approve or reject spare part requisitions
    assertAuthorized(session, ['ADMIN_DISPATCH']);

    const body = await req.json();
    const { id, action, notes } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'Missing id or action' }, { status: 400 });
    }

    let updated = null;
    if (action === 'APPROVE') {
      updated = await SparePartService.approveRequisition(id, session.userId);
    } else if (action === 'REJECT') {
      updated = await SparePartService.rejectRequisition(id, notes, session.userId);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'ไม่พบใบเบิกอะไหล่' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('PATCH /api/spare-parts/requisitions error:', error);
    const status = error.message?.startsWith('UNAUTHORIZED')
      ? 401
      : error.message?.startsWith('FORBIDDEN')
      ? 403
      : 400;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
