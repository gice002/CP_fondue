import { MOCK_USERS } from '@/data/mockData';
import { User } from '@/types';

export class UserService {
  /**
   * Get all available technicians for dispatching (UC-9)
   */
  static async getTechnicians(): Promise<(User & { activeTasks: number; isAvailable: boolean })[]> {
    const techs = Object.values(MOCK_USERS).filter((u) => u.roleCode === 'TECHNICIAN');
    
    // Add realistic live workload status
    return techs.map((t) => {
      let activeTasks = 0;
      let isAvailable = true;

      if (t.id === 'usr_tech_01') { // Anucha
        activeTasks = 0;
        isAvailable = true;
      } else if (t.id === 'usr_tech_03') { // Thanakrit
        activeTasks = 2;
        isAvailable = false;
      } else if (t.id === 'usr_tech_02') { // Somsak
        activeTasks = 1;
        isAvailable = false;
      }

      return {
        ...t,
        activeTasks,
        isAvailable,
      };
    });
  }

  /**
   * Get default mock profile for a given portal
   */
  static async getUserProfile(role: 'REPORTER' | 'ADMIN_DISPATCH' | 'TECHNICIAN' | 'EXECUTIVE'): Promise<User> {
    switch (role) {
      case 'ADMIN_DISPATCH':
        return MOCK_USERS.admin;
      case 'TECHNICIAN':
        return MOCK_USERS.tech_anucha;
      case 'EXECUTIVE':
        return MOCK_USERS.executive;
      case 'REPORTER':
      default:
        return MOCK_USERS.reporter;
    }
  }
}
