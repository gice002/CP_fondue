import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/equipments
 * Query equipments, optionally filtered by locationId
 */
export async function GET(req: NextRequest) {
  try {
    const locationId = req.nextUrl.searchParams.get('locationId');

    const equipments = await prisma.equipment.findMany({
      where: locationId ? { locationId } : undefined,
      include: {
        status: true,
        location: true,
      },
      orderBy: { equipmentCode: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: equipments,
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('GET /api/equipments error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch equipments' },
      { status: 500 }
    );
  }
}
