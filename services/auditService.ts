import { prisma } from '@/lib/prisma';
import { AuditLog } from '@/types';

export class AuditService {
  /**
   * Get all audit trail and compliance logs from PostgreSQL (BR7, BR11, EdPEx)
   */
  static async getAuditLogs(filter?: { search?: string }): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: true,
      },
      orderBy: { changedAt: 'desc' },
      take: 100,
    });

    const mapped = logs.map((log) => {
      let parsedNew: any = {};
      try {
        if (log.newData) parsedNew = JSON.parse(log.newData);
      } catch {
        // ignore
      }

      return {
        id: log.id,
        tableName: log.tableName,
        action: log.commandUsed,
        recordId: log.id,
        ticketNumber: parsedNew.ticketNumber || undefined,
        problemSummary: parsedNew.description || undefined,
        reporterName: log.user ? `${log.user.firstName} ${log.user.lastName}` : log.userId,
        status: parsedNew.status || undefined,
        rating: parsedNew.rating || undefined,
        oldData: log.oldData ?? undefined,
        newData: log.newData ?? undefined,
        changedBy: log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.email})` : log.userId,
        changedAt: log.changedAt.toLocaleString('th-TH'),
      };
    });

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      return mapped.filter(
        (m) =>
          m.tableName.toLowerCase().includes(q) ||
          m.action.toLowerCase().includes(q) ||
          m.changedBy.toLowerCase().includes(q) ||
          (m.ticketNumber && m.ticketNumber.toLowerCase().includes(q))
      );
    }

    return mapped;
  }

  /**
   * Record a new audit log directly to PostgreSQL
   */
  static async logAction(entry: {
    tableName: string;
    commandUsed: string;
    oldData?: string;
    newData?: string;
    userId: string;
  }): Promise<void> {
    await prisma.auditLog.create({
      data: {
        tableName: entry.tableName,
        commandUsed: entry.commandUsed,
        oldData: entry.oldData || null,
        newData: entry.newData || null,
        userId: entry.userId,
      },
    });
  }
}
