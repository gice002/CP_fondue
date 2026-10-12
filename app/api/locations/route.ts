import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      where: {
        building: { contains: 'SC-09' },
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });
    return NextResponse.json({ success: true, data: locations });
  } catch (error: any) {
    console.error('GET /api/locations error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
