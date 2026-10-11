import { MOCK_AUDIT_LOGS } from '@/data/mockData';
import { AuditLog } from '@/types';

let auditLogsState: AuditLog[] = [...MOCK_AUDIT_LOGS];

export class AuditService {
  /**
   * Get all audit trail and compliance logs (BR7, BR11, EdPEx)
   */
  static async getAuditLogs(filter?: { search?: string }): Promise<AuditLog[]> {
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      return auditLogsState.filter(
        (log) =>
          log.ticketNumber?.toLowerCase().includes(q) ||
          log.location?.toLowerCase().includes(q) ||
          log.problemSummary?.toLowerCase().includes(q) ||
          log.reporterName?.toLowerCase().includes(q) ||
          log.techName?.toLowerCase().includes(q)
      );
    }
    return auditLogsState;
  }

  /**
   * Record a new audit log
   */
  static async logAction(entry: Omit<AuditLog, 'id' | 'changedAt'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...entry,
      id: `aud_${Date.now()}`,
      changedAt: new Date().toLocaleString('th-TH'),
    };
    auditLogsState.unshift(newLog);
    return newLog;
  }
}
