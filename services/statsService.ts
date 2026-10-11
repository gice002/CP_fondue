import { MOCK_EXECUTIVE_STATS } from '@/data/mockData';
import { ExecutiveStats } from '@/types';

export class StatsService {
  /**
   * Get executive-level SLA, EdPEx, and maintenance performance stats
   */
  static async getExecutiveStats(): Promise<ExecutiveStats> {
    return MOCK_EXECUTIVE_STATS;
  }
}
