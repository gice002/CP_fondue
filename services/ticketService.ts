import { prisma } from '@/lib/prisma';
import { Ticket, TicketStatus, TicketUrgency, Evaluation, TAG_PRIORITY_ORDER } from '@/types';
import { AuditService } from './auditService';

export class TicketService {
  /**
   * Safe mapping from Prisma database record to domain Ticket interface
   */
  private static mapDbTicketToDomain(t: any): Ticket {
    const reporterUser = t.reporter
      ? {
          id: t.reporter.id,
          firstName: t.reporter.firstName,
          lastName: t.reporter.lastName,
          email: t.reporter.email,
          phoneNumber: t.reporter.phoneNumber ?? undefined,
          roleCode: (t.reporter.role as any) || 'REPORTER',
          departmentName: t.reporter.department?.departmentName || 'วิทยาลัยการคอมพิวเตอร์',
        }
      : {
          id: t.reporterUserId,
          firstName: 'ผู้แจ้งเหตุ',
          lastName: '',
          email: 'reporter@kkumail.com',
          roleCode: 'REPORTER' as const,
        };

    const techUser = t.assignedTechnician
      ? {
          id: t.assignedTechnician.id,
          firstName: t.assignedTechnician.firstName,
          lastName: t.assignedTechnician.lastName,
          email: t.assignedTechnician.email,
          phoneNumber: t.assignedTechnician.phoneNumber ?? undefined,
          roleCode: (t.assignedTechnician.role as any) || 'TECHNICIAN',
          departmentName: t.assignedTechnician.department?.departmentName || 'ทีมซ่อมบำรุง',
        }
      : undefined;

    // Resolve location (strictly in SC-09 อาคารวิทยวิภาส)
    const loc = t.location || t.equipment?.location || {
      id: 'loc_01',
      building: 'SC-09 อาคารวิทยวิภาส',
      floor: 'ชั้น 1',
      roomNumber: '101',
      roomName: 'ห้องสำนักงานคณบดีและธุรการ',
    };

    const locationObj = {
      id: loc.id,
      building: loc.building || 'SC-09 อาคารวิทยวิภาส',
      floor: loc.floor || 'ชั้น 1',
      roomNumber: loc.roomNumber || '-',
      roomName: loc.roomName || 'ไม่ระบุห้อง',
    };

    const equipmentObj = t.equipment
      ? {
          id: t.equipment.id,
          assetCode: t.equipment.equipmentCode,
          name: t.equipment.equipmentName,
          specDetails: undefined,
          categoryName: t.category?.categoryName || 'ครุภัณฑ์',
          warrantyStatus: 'IN_WARRANTY' as const,
          locationId: t.equipment.locationId,
        }
      : undefined;

    const evaluationObj = t.evaluation
      ? {
          id: t.evaluation.id,
          ticketId: t.evaluation.ticketId,
          reporterId: t.evaluation.evaluatorUserId || t.reporterUserId,
          rating: t.evaluation.ratingScore,
          feedback: t.evaluation.feedback ?? undefined,
          evaluatedAt: t.evaluation.evaluationTime.toISOString(),
        }
      : undefined;

    // Extract real tags from TicketTagMap relation
    const rawTags: string[] = (t.tags || [])
      .map((tm: any) => tm.tag?.tagName || tm.tagName || (typeof tm === 'string' ? tm : null))
      .filter((tag: any): tag is string => Boolean(tag));
    const finalTags = rawTags.length > 0 ? rawTags : ['งานทั่วไป'];

    return {
      id: t.id,
      ticketNumber: t.ticketNumber || `REQ-${t.id.slice(-6).toUpperCase()}`,
      reporter: reporterUser,
      assignedTechnician: techUser,
      location: locationObj,
      locationDetail: t.locationDetail ?? undefined,
      equipment: equipmentObj,
      category: t.category?.categoryName || 'ทั่วไป',
      description: t.problemDescription,
      urgency: (t.urgency as TicketUrgency) || 'NORMAL',
      status: (t.currentStatus as TicketStatus) || 'PENDING_DISPATCH',
      targetSlaDate: t.targetSlaDate ? t.targetSlaDate.toISOString() : undefined,
      adminNotes: t.adminNotes ?? undefined,
      repairNotes: t.repairNotes ?? undefined,
      attachments: (t.attachments || []).map((a: any) => ({
        id: a.id,
        fileUrl: a.filePath,
        fileName: a.fileName ?? undefined,
        fileType: a.fileType,
        phase: a.phase as any,
        caption: a.caption ?? undefined,
        uploadedAt: a.uploadedAt.toISOString(),
      })),
      statusHistories: (t.statusHistories || []).map((h: any) => ({
        id: h.id,
        ticketId: h.ticketId,
        oldStatus: h.oldStatus as any,
        newStatus: (h.newStatus as any) || t.currentStatus,
        notes: h.ticketNotes ?? undefined,
        changedBy: h.changedByUser
          ? `${h.changedByUser.firstName} ${h.changedByUser.lastName}`
          : h.changedByUserId,
        changedAt: h.changedAt.toISOString(),
      })),
      evaluation: evaluationObj,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      completedAt: t.completedAt ? t.completedAt.toISOString() : undefined,
      cancelledAt: t.cancelledAt ? t.cancelledAt.toISOString() : undefined,
      tags: finalTags,
    };
  }

  /**
   * Fetch tickets from PostgreSQL with optional filtering and Tag priority ordering
   */
  static async getTickets(filter?: {
    status?: TicketStatus;
    excludeStatus?: string;
    reporterId?: string;
    technicianId?: string;
    search?: string;
  }): Promise<Ticket[]> {
    const whereClause: any = {};

    if (filter?.status) {
      whereClause.currentStatus = filter.status;
    } else if (filter?.excludeStatus) {
      const excluded = filter.excludeStatus.split(',').map((s) => s.trim());
      whereClause.currentStatus = { notIn: excluded };
    }

    if (filter?.reporterId) {
      whereClause.reporterUserId = filter.reporterId;
    }

    if (filter?.technicianId) {
      whereClause.assignedTechnicianId = filter.technicianId;
    }

    if (filter?.search) {
      const q = filter.search.trim();
      whereClause.OR = [
        { ticketNumber: { contains: q, mode: 'insensitive' } },
        { problemDescription: { contains: q, mode: 'insensitive' } },
        { reporter: { firstName: { contains: q, mode: 'insensitive' } } },
        { reporter: { lastName: { contains: q, mode: 'insensitive' } } },
        { location: { roomName: { contains: q, mode: 'insensitive' } } },
        { equipment: { equipmentCode: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const dbTickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        reporter: { include: { department: true } },
        assignedTechnician: { include: { department: true } },
        location: true,
        equipment: { include: { location: true } },
        category: true,
        attachments: true,
        tags: { include: { tag: true } },
        statusHistories: {
          orderBy: { changedAt: 'asc' },
          include: { changedByUser: true },
        },
        evaluation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const domainTickets = dbTickets.map((t) => this.mapDbTicketToDomain(t));

    // Sort by Tag priority (Priority 1 = งานเร่งด่วน is highest, 5 = งานที่ต้องรออุปกรณ์ is lowest)
    // If multiple tags exist, use the tag with highest priority (lowest number)
    return domainTickets.sort((a, b) => {
      const getPriority = (t: Ticket) => {
        if (!t.tags || t.tags.length === 0) return 99;
        const priorities = t.tags.map((tag) => TAG_PRIORITY_ORDER[tag] ?? 99);
        return Math.min(...priorities);
      };
      const prioA = getPriority(a);
      const prioB = getPriority(b);
      if (prioA !== prioB) {
        return prioA - prioB;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Get ticket by ID or Ticket Number from PostgreSQL
   */
  static async getTicketById(id: string): Promise<Ticket | null> {
    const dbTicket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id }],
      },
      include: {
        reporter: { include: { department: true } },
        assignedTechnician: { include: { department: true } },
        location: true,
        equipment: { include: { location: true } },
        category: true,
        attachments: true,
        tags: { include: { tag: true } },
        statusHistories: {
          orderBy: { changedAt: 'asc' },
          include: { changedByUser: true },
        },
        evaluation: true,
      },
    });

    if (!dbTicket) return null;
    return this.mapDbTicketToDomain(dbTicket);
  }

  /**
   * Create a new ticket in PostgreSQL (BR2, BR3)
   */
  static async createTicket(dto: {
    locationId: string;
    locationDetail?: string;
    category?: string;
    equipmentId?: string;
    assetCode?: string;
    description: string;
    attachmentUrls?: string[];
    reporterId?: string;
  }): Promise<Ticket> {
    // Generate sequential unique ticket number under concurrency
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `REQ-${yearMonth}-`;

    const countThisMonth = await prisma.ticket.count({
      where: {
        ticketNumber: { startsWith: prefix },
      },
    });
    const seqNum = String(countThisMonth + 1).padStart(4, '0');
    const ticketNumber = `${prefix}${seqNum}`;

    // Resolve reporter user
    let reporterUserId = dto.reporterId;
    if (!reporterUserId) {
      const defaultReporter = await prisma.user.findFirst({
        where: { role: 'REPORTER' },
      });
      reporterUserId = defaultReporter?.id || 'usr_reporter_01';
    }

    // Resolve category
    let categoryRecord = await prisma.problemCategory.findFirst({
      where: dto.category ? { categoryName: dto.category } : undefined,
    });
    if (!categoryRecord) {
      categoryRecord = await prisma.problemCategory.findFirst();
    }
    if (!categoryRecord) {
      categoryRecord = await prisma.problemCategory.create({
        data: { categoryName: dto.category || 'ระบบคอมพิวเตอร์และเครือข่าย' },
      });
    }

    // Resolve equipment if provided
    let equipmentId = dto.equipmentId;
    if (!equipmentId && dto.assetCode) {
      const eq = await prisma.equipment.findFirst({
        where: { equipmentCode: dto.assetCode },
      });
      if (eq) equipmentId = eq.id;
    }

    // Resolve location strictly within SC-09 อาคารวิทยวิภาส
    let locationId = dto.locationId;
    if (locationId) {
      const locExists = await prisma.location.findUnique({ where: { id: locationId } });
      if (!locExists) {
        const sc09Loc = await prisma.location.findFirst({
          where: { building: { contains: 'SC-09' } },
        });
        locationId = sc09Loc?.id || 'loc_01';
      }
    } else {
      const sc09Loc = await prisma.location.findFirst({
        where: { building: { contains: 'SC-09' } },
      });
      locationId = sc09Loc?.id || 'loc_01';
    }

    // Atomic transaction: Create Ticket + Default Tag + Attachments + Initial Status History + Audit
    const createdTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          ticketNumber,
          problemDescription: dto.description,
          currentStatus: 'PENDING_DISPATCH',
          urgency: 'NORMAL',
          locationDetail: dto.locationDetail || null,
          reporterUserId: reporterUserId!,
          categoryId: categoryRecord!.id,
          locationId,
          equipmentId: equipmentId || null,
          attachments: {
            create: (dto.attachmentUrls || []).map((url, i) => ({
              filePath: url,
              fileName: `damage_photo_${i + 1}.jpg`,
              fileType: 'image/jpeg',
              phase: 'BEFORE_REPAIR',
              caption: 'ภาพถ่ายความเสียหายก่อนซ่อม (BR2)',
            })),
          },
          statusHistories: {
            create: {
              oldStatus: null,
              newStatus: 'PENDING_DISPATCH',
              changedByUserId: reporterUserId!,
              ticketNotes: 'ผู้ใช้ส่งคำร้องแจ้งซ่อมผ่านระบบออนไลน์ (BR2, BR3)',
            },
          },
        },
      });

      // Default tag: งานทั่วไป
      const defaultTag = await tx.tag.findUnique({ where: { tagName: 'งานทั่วไป' } });
      if (defaultTag) {
        await tx.ticketTagMap.create({
          data: {
            ticketId: ticket.id,
            tagId: defaultTag.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          tableName: 'tickets',
          commandUsed: 'INSERT',
          newData: JSON.stringify({
            ticketNumber: ticket.ticketNumber,
            description: ticket.problemDescription,
          }),
          userId: reporterUserId!,
        },
      });

      return tx.ticket.findUnique({
        where: { id: ticket.id },
        include: {
          reporter: { include: { department: true } },
          assignedTechnician: { include: { department: true } },
          location: true,
          equipment: { include: { location: true } },
          category: true,
          attachments: true,
          tags: { include: { tag: true } },
          statusHistories: {
            orderBy: { changedAt: 'asc' },
            include: { changedByUser: true },
          },
          evaluation: true,
        },
      });
    });

    return this.mapDbTicketToDomain(createdTicket);
  }

  /**
   * Dispatch & assign ticket to a technician in PostgreSQL (Queue-based dispatch: unlimited assigned tasks allowed per technician)
   */
  static async assignTicket(
    ticketId: string,
    technicianId: string,
    tags?: string[],
    targetSlaDate?: string,
    adminNotes?: string,
    adminUserId: string = 'usr_admin_01'
  ): Promise<Ticket | null> {
    const existing = await prisma.ticket.findFirst({
      where: { OR: [{ id: ticketId }, { ticketNumber: ticketId }] },
    });
    if (!existing) return null;

    const tech = await prisma.user.findUnique({ where: { id: technicianId } });
    if (!tech) throw new Error(`ไม่พบข้อมูลช่างรหัส: ${technicianId}`);

    const updated = await prisma.$transaction(async (tx) => {
      // Note: Admin can assign multiple tickets to the technician queue without restrictions.

      // Update tags if provided by Admin
      if (tags && Array.isArray(tags)) {
        await tx.ticketTagMap.deleteMany({
          where: { ticketId: existing.id },
        });

        for (const tagName of tags) {
          let tagRecord = await tx.tag.findUnique({ where: { tagName } });
          if (!tagRecord) {
            tagRecord = await tx.tag.create({ data: { tagName } });
          }
          await tx.ticketTagMap.create({
            data: { ticketId: existing.id, tagId: tagRecord.id },
          });
        }
      }

      // Update equipment status to "ชำรุดรอซ่อม" if equipment is associated (Requirement 5 & 6)
      if (existing.equipmentId) {
        await tx.equipment.update({
          where: { id: existing.equipmentId },
          data: { equipmentStatus: 'ชำรุดรอซ่อม' },
        });
      }

      const t = await tx.ticket.update({
        where: { id: existing.id },
        data: {
          assignedTechnicianId: technicianId,
          currentStatus: 'ASSIGNED',
          targetSlaDate: targetSlaDate ? new Date(targetSlaDate) : existing.targetSlaDate,
          adminNotes: adminNotes || existing.adminNotes,
        },
        include: {
          reporter: { include: { department: true } },
          assignedTechnician: { include: { department: true } },
          location: true,
          equipment: { include: { location: true } },
          category: true,
          attachments: true,
          tags: { include: { tag: true } },
          statusHistories: {
            orderBy: { changedAt: 'asc' },
            include: { changedByUser: true },
          },
          evaluation: true,
        },
      });

      await tx.ticketStatusHistory.create({
        data: {
          ticketId: existing.id,
          oldStatus: existing.currentStatus,
          newStatus: 'ASSIGNED',
          changedByUserId: adminUserId,
          ticketNotes: adminNotes || `จนท. มอบหมายงานให้ช่าง ${tech.firstName} ${tech.lastName} (BR4)`,
        },
      });

      await tx.auditLog.create({
        data: {
          tableName: 'tickets',
          commandUsed: 'UPDATE_ASSIGN',
          oldData: JSON.stringify({ status: existing.currentStatus }),
          newData: JSON.stringify({ status: 'ASSIGNED', assignedTo: tech.email, tags }),
          userId: adminUserId,
        },
      });

      return t;
    });

    return this.mapDbTicketToDomain(updated);
  }

  /**
   * Unassign technician from ticket and release back to PENDING_DISPATCH
   */
  static async unassignTicket(
    ticketId: string,
    adminUserId: string = 'usr_admin_01',
    reason?: string
  ): Promise<Ticket | null> {
    const existing = await prisma.ticket.findFirst({
      where: { OR: [{ id: ticketId }, { ticketNumber: ticketId }] },
      include: { assignedTechnician: true },
    });
    if (!existing) return null;

    if (existing.currentStatus === 'COMPLETED' || existing.currentStatus === 'CANCELLED') {
      throw new Error('ไม่สามารถปลดการมอบหมายงานที่เสร็จสิ้นหรือถูกยกเลิกแล้วได้');
    }

    const prevTechName = existing.assignedTechnician
      ? `${existing.assignedTechnician.firstName} ${existing.assignedTechnician.lastName}`
      : 'ช่างเดิม';

    const updated = await prisma.$transaction(async (tx) => {
      const t = await tx.ticket.update({
        where: { id: existing.id },
        data: {
          assignedTechnicianId: null,
          currentStatus: 'PENDING_DISPATCH',
        },
        include: {
          reporter: { include: { department: true } },
          assignedTechnician: { include: { department: true } },
          location: true,
          equipment: { include: { location: true } },
          category: true,
          attachments: true,
          tags: { include: { tag: true } },
          statusHistories: {
            orderBy: { changedAt: 'asc' },
            include: { changedByUser: true },
          },
          evaluation: true,
        },
      });

      await tx.ticketStatusHistory.create({
        data: {
          ticketId: existing.id,
          oldStatus: existing.currentStatus,
          newStatus: 'PENDING_DISPATCH',
          changedByUserId: adminUserId,
          ticketNotes: `จนท. ปลดการมอบหมายจาก ${prevTechName} เพื่อจัดสรรงานใหม่: ${reason || 'ปรับสมดุลภาระงาน'}`,
        },
      });

      await tx.auditLog.create({
        data: {
          tableName: 'tickets',
          commandUsed: 'UPDATE_UNASSIGN',
          oldData: JSON.stringify({ status: existing.currentStatus, assignedTechnicianId: existing.assignedTechnicianId }),
          newData: JSON.stringify({ status: 'PENDING_DISPATCH', assignedTechnicianId: null }),
          userId: adminUserId,
        },
      });

      return t;
    });

    return this.mapDbTicketToDomain(updated);
  }

  /**
   * Update tags for a ticket by Admin
   */
  static async updateTicketTags(
    ticketId: string,
    tags: string[],
    adminUserId: string = 'usr_admin_01'
  ): Promise<Ticket | null> {
    const existing = await prisma.ticket.findFirst({
      where: { OR: [{ id: ticketId }, { ticketNumber: ticketId }] },
    });
    if (!existing) return null;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.ticketTagMap.deleteMany({
        where: { ticketId: existing.id },
      });

      for (const tagName of tags) {
        let tagRecord = await tx.tag.findUnique({ where: { tagName } });
        if (!tagRecord) {
          tagRecord = await tx.tag.create({ data: { tagName } });
        }
        await tx.ticketTagMap.create({
          data: { ticketId: existing.id, tagId: tagRecord.id },
        });
      }

      const t = await tx.ticket.findUnique({
        where: { id: existing.id },
        include: {
          reporter: { include: { department: true } },
          assignedTechnician: { include: { department: true } },
          location: true,
          equipment: { include: { location: true } },
          category: true,
          attachments: true,
          tags: { include: { tag: true } },
          statusHistories: {
            orderBy: { changedAt: 'asc' },
            include: { changedByUser: true },
          },
          evaluation: true,
        },
      });

      await tx.auditLog.create({
        data: {
          tableName: 'ticket_tag_maps',
          commandUsed: 'UPDATE_TAGS',
          newData: JSON.stringify({ ticketId: existing.id, tags }),
          userId: adminUserId,
        },
      });

      return t;
    });

    return this.mapDbTicketToDomain(updated);
  }


  /**
   * Technician accepts job in PostgreSQL (BR5, BR6)
   */
  /**
   * Technician accepts job in PostgreSQL (BR5, BR6)
   * Strictly enforces max 1 IN_PROGRESS task per technician with PostgreSQL row-level locks
   */
  static async acceptTicket(
    ticketId: string,
    technicianId: string = 'usr_tech_01'
  ): Promise<Ticket | null> {
    const existing = await prisma.ticket.findFirst({
      where: { OR: [{ id: ticketId }, { ticketNumber: ticketId }] },
    });
    if (!existing) return null;

    // Must be assigned to this technician
    if (existing.assignedTechnicianId && existing.assignedTechnicianId !== technicianId) {
      throw new Error('ไม่สามารถรับงานนี้ได้ เนื่องจากถูกมอบหมายให้ช่างคนอื่น');
    }

    if (existing.currentStatus === 'IN_PROGRESS') {
      return this.mapDbTicketToDomain(existing);
    }

    if (existing.currentStatus !== 'ASSIGNED') {
      throw new Error(`ไม่สามารถรับงานนี้ได้ เนื่องจากสถานะปัจจุบันคือ ${existing.currentStatus}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Lock technician user row to serialize concurrent accept requests for the same technician
      await tx.$executeRaw`SELECT 1 FROM users WHERE user_id = ${technicianId} FOR UPDATE`;

      // 2. Concurrency-safe verification: check if technician already has any task in progress
      const ongoingTasks = await tx.ticket.findMany({
        where: {
          assignedTechnicianId: technicianId,
          currentStatus: 'IN_PROGRESS',
        },
        select: { id: true, ticketNumber: true },
      });

      if (ongoingTasks.length > 0) {
        throw new Error(
          `คุณมีงานที่กำลังดำเนินการอยู่ (${ongoingTasks[0].ticketNumber}) กรุณาดำเนินการงานปัจจุบันให้เสร็จก่อนรับงานใหม่`
        );
      }

      // 3. Update ticket status to IN_PROGRESS
      const t = await tx.ticket.update({
        where: { id: existing.id },
        data: {
          currentStatus: 'IN_PROGRESS',
          assignedTechnicianId: technicianId,
        },
        include: {
          reporter: { include: { department: true } },
          assignedTechnician: { include: { department: true } },
          location: true,
          equipment: { include: { location: true } },
          category: true,
          attachments: true,
          tags: { include: { tag: true } },
          statusHistories: {
            orderBy: { changedAt: 'asc' },
            include: { changedByUser: true },
          },
          evaluation: true,
        },
      });

      await tx.ticketStatusHistory.create({
        data: {
          ticketId: existing.id,
          oldStatus: existing.currentStatus,
          newStatus: 'IN_PROGRESS',
          changedByUserId: technicianId,
          ticketNotes: 'ทีมช่างกดรับงานซ่อมแล้ว พร้อมเข้าปฏิบัติหน้าที่ (BR5, BR6)',
        },
      });

      await tx.auditLog.create({
        data: {
          tableName: 'tickets',
          commandUsed: 'UPDATE_ACCEPT',
          oldData: JSON.stringify({ status: existing.currentStatus }),
          newData: JSON.stringify({ status: 'IN_PROGRESS' }),
          userId: technicianId,
        },
      });

      return t;
    }, {
      isolationLevel: 'Serializable',
    });

    return this.mapDbTicketToDomain(updated);
  }

  /**
   * Complete and close ticket with proof photos and repair notes in PostgreSQL (BR8, BR9)
   */
  static async closeTicket(
    ticketId: string,
    repairNotes: string,
    afterProofUrls: string[] = [],
    technicianId: string = 'usr_tech_01'
  ): Promise<Ticket | null> {
    const existing = await prisma.ticket.findFirst({
      where: { OR: [{ id: ticketId }, { ticketNumber: ticketId }] },
    });
    if (!existing) return null;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Add after repair attachments
      if (afterProofUrls.length > 0) {
        await tx.ticketAttachment.createMany({
          data: afterProofUrls.map((url, i) => ({
            ticketId: existing.id,
            filePath: url,
            fileName: `proof_after_${i + 1}.jpg`,
            fileType: 'image/jpeg',
            phase: 'AFTER_REPAIR',
            caption: 'ภาพผลงานหลังซ่อมเสร็จสิ้น (BR8)',
          })),
        });
      }

      // 2. Update ticket status
      const t = await tx.ticket.update({
        where: { id: existing.id },
        data: {
          currentStatus: 'COMPLETED',
          repairNotes,
          completedAt: new Date(),
        },
        include: {
          reporter: { include: { department: true } },
          assignedTechnician: { include: { department: true } },
          location: true,
          equipment: { include: { location: true } },
          category: true,
          attachments: true,
          tags: { include: { tag: true } },
          statusHistories: {
            orderBy: { changedAt: 'asc' },
            include: { changedByUser: true },
          },
          evaluation: true,
        },
      });

      // 3. Status history
      await tx.ticketStatusHistory.create({
        data: {
          ticketId: existing.id,
          oldStatus: existing.currentStatus,
          newStatus: 'COMPLETED',
          changedByUserId: technicianId,
          ticketNotes: repairNotes || 'ช่างบันทึกผลงาน แนบรูปยืนยัน และปิดงานซ่อมเรียบร้อย (BR8, BR9)',
        },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          tableName: 'tickets',
          commandUsed: 'UPDATE_CLOSE',
          oldData: JSON.stringify({ status: existing.currentStatus }),
          newData: JSON.stringify({ status: 'COMPLETED', repairNotes }),
          userId: technicianId,
        },
      });

      // 5. Update equipment status back to "ใช้งานได้ปกติ" if attached
      if (existing.equipmentId) {
        await tx.equipment.update({
          where: { id: existing.equipmentId },
          data: { equipmentStatus: 'ใช้งานได้ปกติ' },
        });
      }

      return t;
    });

    return this.mapDbTicketToDomain(updated);
  }

  /**
   * Cancel ticket in PostgreSQL (UC-5)
   */
  static async cancelTicket(
    ticketId: string,
    reason?: string,
    userId: string = 'usr_reporter_01',
    userRole?: string
  ): Promise<Ticket | null> {
    const existing = await prisma.ticket.findFirst({
      where: { OR: [{ id: ticketId }, { ticketNumber: ticketId }] },
    });
    if (!existing) return null;

    if (existing.currentStatus === 'COMPLETED') {
      throw new Error('ไม่สามารถยกเลิกคำร้องที่ดำเนินการเสร็จสิ้นแล้วได้');
    }

    if (existing.currentStatus === 'CANCELLED') {
      throw new Error('คำร้องนี้ถูกยกเลิกไปแล้ว');
    }

    // Role-based rule: Reporter can only cancel before work starts (PENDING_DISPATCH or ASSIGNED)
    if (userRole === 'REPORTER' || (!userRole && userId.includes('reporter'))) {
      if (existing.currentStatus === 'IN_PROGRESS') {
        throw new Error('ไม่สามารถยกเลิกคำร้องที่ช่างเริ่มปฏิบัติงานแล้วได้ กรุณาประสานงานเจ้าหน้าที่ผู้ดูแล');
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const t = await tx.ticket.update({
        where: { id: existing.id },
        data: {
          currentStatus: 'CANCELLED',
          cancelledAt: new Date(),
        },
        include: {
          reporter: { include: { department: true } },
          assignedTechnician: { include: { department: true } },
          location: true,
          equipment: { include: { location: true } },
          category: true,
          attachments: true,
          tags: { include: { tag: true } },
          statusHistories: {
            orderBy: { changedAt: 'asc' },
            include: { changedByUser: true },
          },
          evaluation: true,
        },
      });

      await tx.ticketStatusHistory.create({
        data: {
          ticketId: existing.id,
          oldStatus: existing.currentStatus,
          newStatus: 'CANCELLED',
          changedByUserId: userId,
          ticketNotes: `ผู้แจ้งขอยกเลิกคำร้อง: ${reason || 'ไม่มีเหตุผลระบุ'} (UC-5)`,
        },
      });

      await tx.auditLog.create({
        data: {
          tableName: 'tickets',
          commandUsed: 'UPDATE_CANCEL',
          oldData: JSON.stringify({ status: existing.currentStatus }),
          newData: JSON.stringify({ status: 'CANCELLED', reason }),
          userId,
        },
      });

      return t;
    });

    return this.mapDbTicketToDomain(updated);
  }

  /**
   * Submit satisfaction evaluation in PostgreSQL (BR10, UC-6 & UC-3)
   */
  static async submitEvaluation(
    ticketId: string,
    rating: number,
    feedback?: string,
    userId: string = 'usr_reporter_01'
  ): Promise<Evaluation | null> {
    const existing = await prisma.ticket.findFirst({
      where: { OR: [{ id: ticketId }, { ticketNumber: ticketId }] },
      include: { evaluation: true },
    });
    if (!existing) return null;

    if (existing.evaluation) {
      throw new Error('คำร้องนี้ได้รับการประเมินความพึงพอใจแล้ว ไม่สามารถประเมินซ้ำได้');
    }

    const evalRecord = await prisma.$transaction(async (tx) => {
      const ev = await tx.evaluation.create({
        data: {
          ticketId: existing.id,
          ratingScore: rating,
          feedback: feedback || null,
          evaluatorUserId: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          tableName: 'evaluations',
          commandUsed: 'INSERT_EVALUATION',
          newData: JSON.stringify({ ticketId: existing.id, rating, feedback }),
          userId,
        },
      });

      return ev;
    });

    return {
      id: evalRecord.id,
      ticketId: evalRecord.ticketId,
      reporterId: evalRecord.evaluatorUserId || userId,
      rating: evalRecord.ratingScore,
      feedback: evalRecord.feedback ?? undefined,
      evaluatedAt: evalRecord.evaluationTime.toISOString(),
    };
  }
}
