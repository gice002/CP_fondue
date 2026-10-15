import { NextResponse } from 'next/server';
import { StatsService } from '@/services/statsService';

export async function GET() {
  try {
    const stats = await StatsService.getExecutiveStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
