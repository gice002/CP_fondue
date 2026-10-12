import { NextRequest, NextResponse } from 'next/server';
import { AssetService } from '@/services/assetService';
import { getAuthSession } from '@/lib/auth';

/**
 * GET /api/assets
 * Retrieve all assets with status and history information
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    // Allow authenticated users to view assets
    const assets = await AssetService.getAssets();
    return NextResponse.json({ success: true, data: assets });
  } catch (error: any) {
    console.error('GET /api/assets error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assets
 * Create a new asset
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    // Role check: Only ADMIN_DISPATCH or EXECUTIVE can create assets
    if (session.role !== 'ADMIN_DISPATCH' && session.role !== 'EXECUTIVE') {
      return NextResponse.json(
        { success: false, error: 'คุณไม่มีสิทธิ์ในการสร้างข้อมูลสินทรัพย์' },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { assetCode, name, statusId } = body;

    if (!assetCode || typeof assetCode !== 'string' || !assetCode.trim()) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุรหัสสินทรัพย์ (assetCode)' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุชื่อสินทรัพย์ (name)' },
        { status: 400 }
      );
    }

    const parsedStatusId = Number(statusId);
    if (isNaN(parsedStatusId) || parsedStatusId <= 0) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ statusId เป็นตัวเลขที่ถูกต้อง' },
        { status: 400 }
      );
    }

    const created = await AssetService.createAsset({
      assetCode,
      name,
      statusId: parsedStatusId,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/assets error:', error);
    const status = error.message?.includes('ซ้ำในระบบ') ? 409 : 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create asset' },
      { status }
    );
  }
}
