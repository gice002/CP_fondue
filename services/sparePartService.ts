import { prisma } from '@/lib/prisma';
import { SparePart, SparePartRequest, RequisitionStatus } from '@/types';

export class SparePartService {
  /**
   * Get list of spare parts currently in stock from PostgreSQL
   */
  static async getSpareParts(): Promise<SparePart[]> {
    const parts = await prisma.sparePartInventory.findMany({
      orderBy: { partCode: 'asc' },
    });

    return parts.map((p) => ({
      id: p.id,
      partCode: p.partCode || p.id,
      name: p.partName,
      unit: p.unit || 'ชิ้น',
      stockQuantity: p.stockQuantity,
      unitCost: p.unitCost || 0,
      storageRoom: p.storageRoom || 'สโตร์กลาง CoP KKU',
    }));
  }

  /**
   * Get all material requisitions from PostgreSQL (UC-10)
   */
  static async getRequisitions(filter?: { status?: RequisitionStatus }): Promise<SparePartRequest[]> {
    const requisitions = await prisma.sparePartRequisition.findMany({
      where: filter?.status ? { status: filter.status } : undefined,
      include: {
        part: true,
        requestedByUser: true,
        approvedByUser: true,
        ticket: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requisitions.map((r) => ({
      id: r.id,
      requestNumber: r.requisitionNumber || `REQ-INV-${r.id.slice(-4).toUpperCase()}`,
      ticketId: r.ticketId,
      ticketNumber: r.ticket?.ticketNumber || r.ticketId,
      requestedBy: {
        id: r.requestedByUser.id,
        firstName: r.requestedByUser.firstName,
        lastName: r.requestedByUser.lastName,
        email: r.requestedByUser.email,
        phoneNumber: r.requestedByUser.phoneNumber ?? undefined,
        roleCode: (r.requestedByUser.role as any) || 'TECHNICIAN',
      },
      approvedBy: r.approvedByUser
        ? {
            id: r.approvedByUser.id,
            firstName: r.approvedByUser.firstName,
            lastName: r.approvedByUser.lastName,
            email: r.approvedByUser.email,
            phoneNumber: r.approvedByUser.phoneNumber ?? undefined,
            roleCode: (r.approvedByUser.role as any) || 'ADMIN_DISPATCH',
          }
        : undefined,
      status: r.status as RequisitionStatus,
      notes: r.requisitionNotes ?? undefined,
      items: [
        {
          id: `item_${r.id}`,
          partId: r.partId,
          partCode: r.part.partCode || r.part.id,
          partName: r.part.partName,
          unit: r.part.unit || 'ชิ้น',
          quantity: r.quantityRequested,
        },
      ],
      createdAt: r.createdAt.toISOString(),
      approvedAt: r.approvedAt ? r.approvedAt.toISOString() : undefined,
    }));
  }

  /**
   * Submit material requisition by technician in PostgreSQL (UC-10)
   */
  static async createRequisition(dto: {
    ticketId: string;
    ticketNumber?: string;
    technicianId?: string;
    items: { partId: string; quantity: number }[];
    notes?: string;
  }): Promise<SparePartRequest> {
    if (!dto.items || dto.items.length === 0) {
      throw new Error('กรุณาระบุรายการอะไหล่ที่ต้องการเบิก');
    }

    const firstItem = dto.items[0];
    if (firstItem.quantity <= 0) {
      throw new Error('จำนวนที่ขอเบิกต้องมากกว่า 0');
    }

    // Resolve ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id: dto.ticketId }, { ticketNumber: dto.ticketId }],
      },
    });
    if (!ticket) throw new Error(`ไม่พบใบแจ้งซ่อมรหัส: ${dto.ticketId}`);

    // Resolve part
    const part = await prisma.sparePartInventory.findFirst({
      where: {
        OR: [{ id: firstItem.partId }, { partCode: firstItem.partId }],
      },
    });
    if (!part) throw new Error(`ไม่พบอะไหล่รหัส: ${firstItem.partId}`);

    // Resolve technician
    let technicianId = dto.technicianId;
    if (!technicianId) {
      technicianId = ticket.assignedTechnicianId || 'usr_tech_01';
    }

    // Generate unique requisition number
    const count = await prisma.sparePartRequisition.count();
    const requisitionNumber = `REQ-INV-${String(count + 1).padStart(3, '0')}`;

    // Atomic transaction
    const newReq = await prisma.$transaction(async (tx) => {
      const created = await tx.sparePartRequisition.create({
        data: {
          requisitionNumber,
          ticketId: ticket.id,
          partId: part.id,
          requestedByUserId: technicianId!,
          quantityRequested: firstItem.quantity,
          status: 'PENDING',
          requisitionNotes: dto.notes || null,
        },
        include: {
          part: true,
          requestedByUser: true,
          ticket: true,
        },
      });

      await tx.sparePartStatusHistory.create({
        data: {
          requisitionId: created.id,
          oldStatus: null,
          newStatus: 'PENDING',
          approvedByUserId: technicianId!,
        },
      });

      await tx.auditLog.create({
        data: {
          tableName: 'spare_part_requisitions',
          commandUsed: 'INSERT_REQUISITION',
          newData: JSON.stringify({
            requisitionNumber,
            partCode: part.partCode,
            quantity: firstItem.quantity,
          }),
          userId: technicianId!,
        },
      });

      return created;
    });

    return {
      id: newReq.id,
      requestNumber: newReq.requisitionNumber!,
      ticketId: newReq.ticketId,
      ticketNumber: ticket.ticketNumber || ticket.id,
      requestedBy: {
        id: newReq.requestedByUser.id,
        firstName: newReq.requestedByUser.firstName,
        lastName: newReq.requestedByUser.lastName,
        email: newReq.requestedByUser.email,
        roleCode: (newReq.requestedByUser.role as any) || 'TECHNICIAN',
      },
      status: 'PENDING',
      notes: newReq.requisitionNotes ?? undefined,
      items: [
        {
          id: `item_${newReq.id}`,
          partId: part.id,
          partCode: part.partCode || part.id,
          partName: part.partName,
          unit: part.unit || 'ชิ้น',
          quantity: newReq.quantityRequested,
        },
      ],
      createdAt: newReq.createdAt.toISOString(),
    };
  }

  /**
   * Admin approves spare parts requisition with atomic inventory decrement (UC-10)
   */
  static async approveRequisition(
    requisitionId: string,
    adminId: string = 'usr_admin_01'
  ): Promise<SparePartRequest | null> {
    const existing = await prisma.sparePartRequisition.findFirst({
      where: {
        OR: [{ id: requisitionId }, { requisitionNumber: requisitionId }],
      },
      include: { part: true, requestedByUser: true, ticket: true },
    });
    if (!existing) return null;

    if (existing.status !== 'PENDING') {
      throw new Error(`คำขอนี้ได้รับการดำเนินการแล้ว (สถานะปัจจุบัน: ${existing.status})`);
    }

    if (existing.part.stockQuantity < existing.quantityRequested) {
      throw new Error(
        `ยอดสต็อกคงเหลือ (${existing.part.stockQuantity} ${existing.part.unit}) ไม่เพียงพอต่อการเบิก (${existing.quantityRequested} ${existing.part.unit})`
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Decrement inventory atomically
      await tx.sparePartInventory.update({
        where: { id: existing.partId },
        data: {
          stockQuantity: {
            decrement: existing.quantityRequested,
          },
        },
      });

      // 2. Update requisition status
      const req = await tx.sparePartRequisition.update({
        where: { id: existing.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedByUserId: adminId,
        },
        include: {
          part: true,
          requestedByUser: true,
          approvedByUser: true,
          ticket: true,
        },
      });

      // 3. Status History
      await tx.sparePartStatusHistory.create({
        data: {
          requisitionId: existing.id,
          oldStatus: existing.status,
          newStatus: 'APPROVED',
          approvedByUserId: adminId,
        },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          tableName: 'spare_part_inventories',
          commandUsed: 'APPROVE_REQUISITION_DECREMENT',
          oldData: JSON.stringify({ stock: existing.part.stockQuantity }),
          newData: JSON.stringify({
            stock: existing.part.stockQuantity - existing.quantityRequested,
            deducted: existing.quantityRequested,
          }),
          userId: adminId,
        },
      });

      return req;
    });

    return {
      id: updated.id,
      requestNumber: updated.requisitionNumber || updated.id,
      ticketId: updated.ticketId,
      ticketNumber: updated.ticket?.ticketNumber || updated.ticketId,
      requestedBy: {
        id: updated.requestedByUser.id,
        firstName: updated.requestedByUser.firstName,
        lastName: updated.requestedByUser.lastName,
        email: updated.requestedByUser.email,
        roleCode: (updated.requestedByUser.role as any) || 'TECHNICIAN',
      },
      approvedBy: updated.approvedByUser
        ? {
            id: updated.approvedByUser.id,
            firstName: updated.approvedByUser.firstName,
            lastName: updated.approvedByUser.lastName,
            email: updated.approvedByUser.email,
            roleCode: (updated.approvedByUser.role as any) || 'ADMIN_DISPATCH',
          }
        : undefined,
      status: 'APPROVED',
      notes: updated.requisitionNotes ?? undefined,
      items: [
        {
          id: `item_${updated.id}`,
          partId: updated.part.id,
          partCode: updated.part.partCode || updated.part.id,
          partName: updated.part.partName,
          unit: updated.part.unit || 'ชิ้น',
          quantity: updated.quantityRequested,
        },
      ],
      createdAt: updated.createdAt.toISOString(),
      approvedAt: updated.approvedAt ? updated.approvedAt.toISOString() : undefined,
    };
  }

  /**
   * Admin rejects spare parts requisition (UC-10)
   */
  static async rejectRequisition(
    requisitionId: string,
    notes?: string,
    adminId: string = 'usr_admin_01'
  ): Promise<SparePartRequest | null> {
    const existing = await prisma.sparePartRequisition.findFirst({
      where: {
        OR: [{ id: requisitionId }, { requisitionNumber: requisitionId }],
      },
      include: { part: true, requestedByUser: true, ticket: true },
    });
    if (!existing) return null;

    if (existing.status !== 'PENDING') {
      throw new Error(`คำขอนี้ได้รับการดำเนินการแล้ว (สถานะปัจจุบัน: ${existing.status})`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const req = await tx.sparePartRequisition.update({
        where: { id: existing.id },
        data: {
          status: 'REJECTED',
          requisitionNotes: notes || existing.requisitionNotes,
          approvedByUserId: adminId,
          approvedAt: new Date(),
        },
        include: {
          part: true,
          requestedByUser: true,
          approvedByUser: true,
          ticket: true,
        },
      });

      await tx.sparePartStatusHistory.create({
        data: {
          requisitionId: existing.id,
          oldStatus: existing.status,
          newStatus: 'REJECTED',
          approvedByUserId: adminId,
        },
      });

      await tx.auditLog.create({
        data: {
          tableName: 'spare_part_requisitions',
          commandUsed: 'REJECT_REQUISITION',
          oldData: JSON.stringify({ status: existing.status }),
          newData: JSON.stringify({ status: 'REJECTED', reason: notes }),
          userId: adminId,
        },
      });

      return req;
    });

    return {
      id: updated.id,
      requestNumber: updated.requisitionNumber || updated.id,
      ticketId: updated.ticketId,
      ticketNumber: updated.ticket?.ticketNumber || updated.ticketId,
      requestedBy: {
        id: updated.requestedByUser.id,
        firstName: updated.requestedByUser.firstName,
        lastName: updated.requestedByUser.lastName,
        email: updated.requestedByUser.email,
        roleCode: (updated.requestedByUser.role as any) || 'TECHNICIAN',
      },
      approvedBy: updated.approvedByUser
        ? {
            id: updated.approvedByUser.id,
            firstName: updated.approvedByUser.firstName,
            lastName: updated.approvedByUser.lastName,
            email: updated.approvedByUser.email,
            roleCode: (updated.approvedByUser.role as any) || 'ADMIN_DISPATCH',
          }
        : undefined,
      status: 'REJECTED',
      notes: updated.requisitionNotes ?? undefined,
      items: [
        {
          id: `item_${updated.id}`,
          partId: updated.part.id,
          partCode: updated.part.partCode || updated.part.id,
          partName: updated.part.partName,
          unit: updated.part.unit || 'ชิ้น',
          quantity: updated.quantityRequested,
        },
      ],
      createdAt: updated.createdAt.toISOString(),
      approvedAt: updated.approvedAt ? updated.approvedAt.toISOString() : undefined,
    };
  }
}
