import { NextRequest, NextResponse } from 'next/server';
import { AssetService } from '@/services/assetService';
import { getAuthSession } from '@/lib/auth';

/**
 * GET /api/assets/[id]
 * Retrieve a single asset by its integer ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assetId = parseInt(id, 10);
    if (isNaN(assetId) || assetId <= 0) {
      return NextResponse.json(
        { success: false, error: 'รหัสสินทรัพย์ (id) ต้องเป็นตัวเลขจำนวนเต็มบวก' },
        { status: 400 }
      );
    }

    const asset = await AssetService.getAssetById(assetId);
    if (!asset) {
      return NextResponse.json(
        { success: false, error: `ไม่พบข้อมูลสินทรัพย์รหัส: ${assetId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error: any) {
    console.error('GET /api/assets/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/assets/[id]
 * Update an asset, including its statusId with atomic status history recording
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }
    // Role check: Only ADMIN_DISPATCH, TECHNICIAN, or EXECUTIVE can update asset status
    if (session.role === 'REPORTER') {
      return NextResponse.json(
        { success: false, error: 'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลสินทรัพย์' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const assetId = parseInt(id, 10);
    if (isNaN(assetId) || assetId <= 0) {
      return NextResponse.json(
        { success: false, error: 'รหัสสินทรัพย์ (id) ต้องเป็นตัวเลขจำนวนเต็มบวก' },
        { status: 400 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const updateDTO: {
      assetCode?: string;
      name?: string;
      statusId?: number;
    } = {};

    if (body.assetCode !== undefined) {
      if (typeof body.assetCode !== 'string' || !body.assetCode.trim()) {
        return NextResponse.json(
          { success: false, error: 'รหัสสินทรัพย์ (assetCode) ต้องเป็นข้อความที่ไม่ว่างเปล่า' },
          { status: 400 }
        );
      }
      updateDTO.assetCode = body.assetCode.trim();
    }

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json(
          { success: false, error: 'ชื่อสินทรัพย์ (name) ต้องเป็นข้อความที่ไม่ว่างเปล่า' },
          { status: 400 }
        );
      }
      updateDTO.name = body.name.trim();
    }

    if (body.statusId !== undefined) {
      const parsedStatus = Number(body.statusId);
      if (isNaN(parsedStatus) || parsedStatus <= 0) {
        return NextResponse.json(
          { success: false, error: 'statusId ต้องเป็นตัวเลขที่ถูกต้อง' },
          { status: 400 }
        );
      }
      updateDTO.statusId = parsedStatus;
    }

    // Server-verified actor user ID
    const updated = await AssetService.updateAsset(assetId, updateDTO, session.userId);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('PATCH /api/assets/[id] error:', error);
    const msg = error.message || '';
    let status = 400;
    if (msg.includes('ไม่พบสินทรัพย์')) {
      status = 404;
    } else if (msg.includes('ซ้ำในระบบ')) {
      status = 409;
    } else if (msg.includes('ไม่พบสถานะสินทรัพย์')) {
      status = 400;
    }
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

/**
 * DELETE /api/assets/[id]
 * Delete an asset only when permitted by historical audit preservation rules
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }
    // Role check: Only ADMIN_DISPATCH or EXECUTIVE can delete assets
    if (session.role !== 'ADMIN_DISPATCH' && session.role !== 'EXECUTIVE') {
      return NextResponse.json(
        { success: false, error: 'คุณไม่มีสิทธิ์ในการลบข้อมูลสินทรัพย์' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const assetId = parseInt(id, 10);
    if (isNaN(assetId) || assetId <= 0) {
      return NextResponse.json(
        { success: false, error: 'รหัสสินทรัพย์ (id) ต้องเป็นตัวเลขจำนวนเต็มบวก' },
        { status: 400 }
      );
    }

    const result = await AssetService.deleteAsset(assetId);
    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error('DELETE /api/assets/[id] error:', error);
    const msg = error.message || '';
    let status = 400;
    if (msg.includes('ไม่พบสินทรัพย์')) {
      status = 404;
    } else if (msg.includes('ประวัติการเปลี่ยนสถานะ')) {
      // Rejection due to audit retention rule
      status = 409;
    }
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
