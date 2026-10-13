import { prisma } from '@/lib/prisma';
import { User, RoleCode } from '@/types';

export class UserService {
  /**
   * Get all technicians and their live task workloads from PostgreSQL (UC-9)
   */
  /**
   * Get all technicians and their live task workloads from PostgreSQL (UC-9)
   * Separates total assigned/queued tasks from in-progress tasks
   */
  static async getTechnicians(): Promise<(User & {
    activeTasks: number;
    inProgressCount: number;
    queuedCount: number;
    isAvailable: boolean;
    specialty?: string;
  })[]> {
    const techUsers = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      include: {
        department: true,
        assignedTickets: {
          where: {
            currentStatus: { in: ['ASSIGNED', 'IN_PROGRESS'] },
          },
          select: { id: true, currentStatus: true },
        },
        ticketAssignments: {
          include: {
            ticket: {
              select: { id: true, currentStatus: true },
            },
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return techUsers.map((u) => {
      const allActiveMap = new Map<string, string>();
      for (const t of u.assignedTickets) {
        allActiveMap.set(t.id, t.currentStatus);
      }
      for (const ta of u.ticketAssignments) {
        if (ta.ticket && ['ASSIGNED', 'IN_PROGRESS'].includes(ta.ticket.currentStatus)) {
          allActiveMap.set(ta.ticket.id, ta.ticket.currentStatus);
        }
      }
      const statuses = Array.from(allActiveMap.values());
      const inProgressCount = statuses.filter((s) => s === 'IN_PROGRESS').length;
      const queuedCount = statuses.filter((s) => s === 'ASSIGNED').length;
      const activeTasks = statuses.length;
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phoneNumber: u.phoneNumber ?? undefined,
        roleCode: 'TECHNICIAN',
        departmentName: u.department?.departmentName || 'ฝ่ายปฏิบัติการ',
        activeTasks,
        inProgressCount,
        queuedCount,
        // isAvailable: true if technician is not currently executing an in-progress task
        isAvailable: inProgressCount === 0,
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
