import { prisma } from '@/lib/prisma';
import { MOCK_TICKETS, MOCK_USERS, MOCK_LOCATIONS, MOCK_EQUIPMENTS } from '@/data/mockData';
import { Ticket, TicketStatus, TicketUrgency, Evaluation } from '@/types';

// In-memory state for mock prototype mode
let ticketsState: Ticket[] = [...MOCK_TICKETS];

const isMockMode = () => process.env.USE_MOCK_DATA !== 'false';

export class TicketService {
  /**
   * Fetch tickets with optional status or role filter
   */
  static async getTickets(filter?: {
    status?: TicketStatus;
    reporterId?: string;
    technicianId?: string;
    search?: string;
  }): Promise<Ticket[]> {
    if (!isMockMode()) {
      try {
        const dbTickets = await prisma.ticket.findMany({
          where: {
            status: filter?.status ? (filter.status as any) : undefined,
            reporterId: filter?.reporterId,
            assignedTechId: filter?.technicianId,
          },
          include: {
            reporter: true,
            assignedTech: true,
            location: true,
            equipment: true,
            attachments: true,
            statusHistories: true,
            evaluation: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        return dbTickets.map((t: any) => ({
          id: t.id,
          ticketNumber: t.ticketNumber,
          reporter: {
            id: t.reporter.id,
            firstName: t.reporter.firstName,
            lastName: t.reporter.lastName,
            email: t.reporter.email,
            phoneNumber: t.reporter.phoneNumber ?? undefined,
            roleCode: 'REPORTER',
            departmentName: 'วิทยาลัยการคอมพิวเตอร์',
          },
          assignedTechnician: t.assignedTech
            ? {
                id: t.assignedTech.id,
                firstName: t.assignedTech.firstName,
                lastName: t.assignedTech.lastName,
                email: t.assignedTech.email,
                phoneNumber: t.assignedTech.phoneNumber ?? undefined,
                roleCode: 'TECHNICIAN',
              }
            : undefined,
          location: {
            id: t.location.id,
            building: t.location.building,
            floor: t.location.floor,
            roomNumber: t.location.roomNumber,
            roomName: t.location.roomName,
          },
          locationDetail: t.locationDetail ?? undefined,
          equipment: t.equipment
            ? {
                id: t.equipment.id,
                assetCode: t.equipment.assetCode,
                name: t.equipment.name,
                specDetails: t.equipment.specDetails ?? undefined,
                categoryName: 'ครุภัณฑ์',
                warrantyStatus: t.equipment.warrantyStatus as any,
                locationId: t.equipment.locationId,
              }
            : undefined,
          category: t.categoryId,
          description: t.description,
          urgency: t.urgency as TicketUrgency,
          status: t.status as TicketStatus,
          targetSlaDate: t.targetSlaDate?.toISOString(),
          adminNotes: t.adminNotes ?? undefined,
          repairNotes: t.repairNotes ?? undefined,
          attachments: t.attachments.map((a: any) => ({
            id: a.id,
            fileUrl: a.fileUrl,
            fileType: a.fileType,
            phase: a.phase,
            caption: a.caption ?? undefined,
            uploadedAt: a.uploadedAt.toISOString(),
          })),
          statusHistories: t.statusHistories.map((h: any) => ({
            id: h.id,
            ticketId: h.ticketId,
            newStatus: h.newStatus,
            notes: h.notes ?? undefined,
            changedBy: h.changedById,
            changedAt: h.changedAt.toISOString(),
          })),
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          completedAt: t.completedAt?.toISOString(),
          cancelledAt: t.cancelledAt?.toISOString(),
        }));
      } catch (err) {
        console.warn('Prisma query failed, falling back to mock state:', err);
      }
    }

    let result = [...ticketsState];

    if (filter?.status) {
      result = result.filter((t) => t.status === filter.status);
    }
    if (filter?.reporterId) {
      result = result.filter((t) => t.reporter.id === filter.reporterId);
    }
    if (filter?.technicianId) {
      result = result.filter((t) => t.assignedTechnician?.id === filter.technicianId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.location.roomName.toLowerCase().includes(q) ||
          t.reporter.firstName.toLowerCase().includes(q) ||
          t.equipment?.assetCode.toLowerCase().includes(q)
      );
    }

    return result;
  }

  /**
   * Get ticket by ID or Ticket Number
   */
  static async getTicketById(id: string): Promise<Ticket | null> {
    const list = await this.getTickets();
    return list.find((t) => t.id === id || t.ticketNumber === id) || null;
  }

  /**
   * Create a new ticket (BR2, BR3)
   */
  static async createTicket(dto: {
    locationId: string;
    locationDetail?: string;
    category: string;
    equipmentId?: string;
    assetCode?: string;
    description: string;
    urgency: TicketUrgency;
    attachmentUrls?: string[];
    reporterId?: string;
  }): Promise<Ticket> {
    const seq = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const ticketNumber = `REQ-${datePrefix}-${seq}`;

    const location =
      MOCK_LOCATIONS.find((l) => l.id === dto.locationId) ||
      MOCK_LOCATIONS[0];

    const equipment = dto.equipmentId
      ? MOCK_EQUIPMENTS.find((e) => e.id === dto.equipmentId)
      : dto.assetCode
      ? MOCK_EQUIPMENTS.find((e) => e.assetCode === dto.assetCode)
      : undefined;

    const newTicket: Ticket = {
      id: `tkt_${Date.now()}`,
      ticketNumber,
      reporter: MOCK_USERS.reporter,
      location,
      locationDetail: dto.locationDetail || 'ภายในห้องตามที่ระบุ',
      equipment,
      category: dto.category,
      description: dto.description,
      urgency: dto.urgency,
      status: 'PENDING_DISPATCH',
      attachments: (dto.attachmentUrls || []).map((url, i) => ({
        id: `att_new_${Date.now()}_${i}`,
        fileUrl: url,
        fileName: `damage_photo_${i + 1}.jpg`,
        fileType: 'image/jpeg',
        phase: 'BEFORE_REPAIR',
        uploadedAt: new Date().toISOString(),
      })),
      statusHistories: [
        {
          id: `hist_${Date.now()}`,
          ticketId: `tkt_${Date.now()}`,
          newStatus: 'PENDING_DISPATCH',
          notes: 'ผู้ใช้ส่งคำร้องแจ้งซ่อมผ่านระบบออนไลน์ (BR2, BR3)',
          changedBy: `${MOCK_USERS.reporter.firstName} ${MOCK_USERS.reporter.lastName}`,
          changedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [dto.urgency === 'CRITICAL' ? 'ฉุกเฉิน (Critical)' : dto.urgency === 'URGENT' ? 'เร่งด่วน (Urgent)' : 'ปกติ (Normal)'],
    };

    ticketsState.unshift(newTicket);
    return newTicket;
  }

  /**
   * Dispatch & assign ticket to a technician (BR4, UC-9)
   */
  static async assignTicket(
    ticketId: string,
    technicianId: string,
    urgency?: TicketUrgency,
    targetSlaDate?: string,
    adminNotes?: string
  ): Promise<Ticket | null> {
    const ticket = ticketsState.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) return null;

    const tech = Object.values(MOCK_USERS).find((u) => u.id === technicianId) || MOCK_USERS.tech_anucha;

    ticket.assignedTechnician = tech;
    ticket.status = 'ASSIGNED';
    if (urgency) ticket.urgency = urgency;
    if (targetSlaDate) ticket.targetSlaDate = targetSlaDate;
    if (adminNotes) ticket.adminNotes = adminNotes;
    ticket.updatedAt = new Date().toISOString();

    ticket.statusHistories.push({
      id: `hist_${Date.now()}`,
      ticketId: ticket.id,
      oldStatus: 'PENDING_DISPATCH',
      newStatus: 'ASSIGNED',
      notes: `จนท. ${MOCK_USERS.admin.firstName} มอบหมายงานให้ช่าง ${tech.firstName} ${tech.lastName} (BR4)`,
      changedBy: `${MOCK_USERS.admin.firstName} ${MOCK_USERS.admin.lastName}`,
      changedAt: new Date().toISOString(),
    });

    return ticket;
  }

  /**
   * Technician accepts job (BR5, BR6)
   */
  static async acceptTicket(ticketId: string, technicianId: string): Promise<Ticket | null> {
    const ticket = ticketsState.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) return null;

    ticket.status = 'IN_PROGRESS';
    ticket.updatedAt = new Date().toISOString();

    ticket.statusHistories.push({
      id: `hist_${Date.now()}`,
      ticketId: ticket.id,
      oldStatus: 'ASSIGNED',
      newStatus: 'IN_PROGRESS',
      notes: `ทีมช่างกดรับงานซ่อมแล้ว พร้อมเข้าปฏิบัติหน้าที่ (BR5, BR6)`,
      changedBy: ticket.assignedTechnician ? `${ticket.assignedTechnician.firstName} ${ticket.assignedTechnician.lastName}` : 'ช่างประจำการ',
      changedAt: new Date().toISOString(),
    });

    return ticket;
  }

  /**
   * Complete and close ticket with proof photos and repair notes (BR8, BR9)
   */
  static async closeTicket(
    ticketId: string,
    repairNotes: string,
    afterProofUrls: string[] = []
  ): Promise<Ticket | null> {
    const ticket = ticketsState.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) return null;

    ticket.status = 'COMPLETED';
    ticket.repairNotes = repairNotes;
    ticket.completedAt = new Date().toISOString();
    ticket.updatedAt = new Date().toISOString();

    afterProofUrls.forEach((url, i) => {
      ticket.attachments.push({
        id: `att_proof_${Date.now()}_${i}`,
        fileUrl: url,
        fileName: `proof_after_${i + 1}.jpg`,
        fileType: 'image/jpeg',
        phase: 'AFTER_REPAIR',
        caption: 'ภาพผลงานหลังซ่อมเสร็จสิ้น (BR8)',
        uploadedAt: new Date().toISOString(),
      });
    });

    ticket.statusHistories.push({
      id: `hist_${Date.now()}`,
      ticketId: ticket.id,
      oldStatus: 'IN_PROGRESS',
      newStatus: 'COMPLETED',
      notes: `ช่างบันทึกผลงาน แนบรูปยืนยัน และปิดงานซ่อมเรียบร้อย (BR8, BR9)`,
      changedBy: ticket.assignedTechnician ? `${ticket.assignedTechnician.firstName} ${ticket.assignedTechnician.lastName}` : 'ช่างประจำการ',
      changedAt: new Date().toISOString(),
    });

    return ticket;
  }

  /**
   * Cancel ticket (UC-5)
   */
  static async cancelTicket(ticketId: string, reason?: string): Promise<Ticket | null> {
    const ticket = ticketsState.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) return null;

    ticket.status = 'CANCELLED';
    ticket.cancelledAt = new Date().toISOString();
    ticket.updatedAt = new Date().toISOString();

    ticket.statusHistories.push({
      id: `hist_${Date.now()}`,
      ticketId: ticket.id,
      oldStatus: ticket.status,
      newStatus: 'CANCELLED',
      notes: `ผู้แจ้งขอยกเลิกคำร้อง: ${reason || 'ไม่มีเหตุผลระบุ'} (UC-5)`,
      changedBy: `${ticket.reporter.firstName} ${ticket.reporter.lastName}`,
      changedAt: new Date().toISOString(),
    });

    return ticket;
  }

  /**
   * Submit satisfaction evaluation (BR10, UC-6 & UC-3)
   */
  static async submitEvaluation(
    ticketId: string,
    rating: number,
    feedback?: string
  ): Promise<Evaluation | null> {
    const ticket = ticketsState.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) return null;

    const evalObj: Evaluation = {
      id: `eval_${Date.now()}`,
      ticketId: ticket.id,
      reporterId: ticket.reporter.id,
      rating,
      feedback,
      evaluatedAt: new Date().toISOString(),
    };

    ticket.evaluation = evalObj;
    ticket.tags = (ticket.tags || []).filter((tg) => !tg.includes('รอประเมิน'));
    ticket.tags.push(`ประเมินแล้ว (${rating}★)`);

    return evalObj;
  }
}
