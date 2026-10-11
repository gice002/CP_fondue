import { NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

export async function GET() {
  try {
    const technicians = await UserService.getTechnicians();
    return NextResponse.json({ success: true, data: technicians });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
