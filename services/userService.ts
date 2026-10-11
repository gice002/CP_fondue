import { prisma } from '@/lib/prisma';
import { User, RoleCode } from '@/types';

export class UserService {
  /**
   * Get all technicians and their live task workloads from PostgreSQL (UC-9)
   */
  static async getTechnicians(): Promise<(User & { activeTasks: number; isAvailable: boolean; specialty?: string })[]> {
    const techUsers = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      include: {
        department: true,
        assignedTickets: {
          where: {
            currentStatus: { in: ['ASSIGNED', 'IN_PROGRESS'] },
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return techUsers.map((u) => {
      const activeTasks = u.assignedTickets.length;
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phoneNumber: u.phoneNumber ?? undefined,
        roleCode: 'TECHNICIAN',
        departmentName: u.department?.departmentName || 'ฝ่ายปฏิบัติการ',
        activeTasks,
        isAvailable: activeTasks === 0,
        specialty: u.id === 'usr_tech_01'
          ? 'ผู้เชี่ยวชาญ Switch/Router & LAN'
          : u.id === 'usr_tech_02'
          ? 'ผู้เชี่ยวชาญระบบปรับอากาศและสุขาภิบาล'
          : 'ผู้เชี่ยวชาญฮาร์ดแวร์และเซิร์ฟเวอร์',
      };
    });
  }

  /**
   * Get user profile from PostgreSQL for a given portal role
   */
  static async getUserProfile(role: RoleCode): Promise<User> {
    const dbUser = await prisma.user.findFirst({
      where: { role },
      include: { department: true },
    });

    if (dbUser) {
      return {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        phoneNumber: dbUser.phoneNumber ?? undefined,
        roleCode: role,
        departmentName: dbUser.department?.departmentName || 'วิทยาลัยการคอมพิวเตอร์',
      };
    }

    // Fallback if not found
    return {
      id: `usr_${role.toLowerCase()}`,
      firstName: 'ผู้ใช้งาน',
      lastName: 'ระบบ',
      email: `${role.toLowerCase()}@kkumail.com`,
      roleCode: role,
      departmentName: 'วิทยาลัยการคอมพิวเตอร์',
    };
  }
}
