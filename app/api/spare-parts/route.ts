import { NextResponse } from 'next/server';
import { SparePartService } from '@/services/sparePartService';

export async function GET() {
  try {
    const parts = await SparePartService.getSpareParts();
    return NextResponse.json({ success: true, data: parts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
