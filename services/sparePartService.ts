import { prisma } from '@/lib/prisma';
import { MOCK_SPARE_PARTS, MOCK_REQUISITIONS, MOCK_USERS } from '@/data/mockData';
import { SparePart, SparePartRequest, RequisitionStatus } from '@/types';

let sparePartsState: SparePart[] = [...MOCK_SPARE_PARTS];
let requisitionsState: SparePartRequest[] = [...MOCK_REQUISITIONS];

const isMockMode = () => process.env.USE_MOCK_DATA !== 'false';

export class SparePartService {
  /**
   * Get list of spare parts currently in stock
   */
  static async getSpareParts(): Promise<SparePart[]> {
    if (!isMockMode()) {
      try {
        const parts = await prisma.sparePart.findMany();
        return parts.map((p: any) => ({
          id: p.id,
          partCode: p.partCode,
          name: p.name,
          unit: p.unit,
          stockQuantity: p.stockQuantity,
          unitCost: Number(p.unitCost),
          storageRoom: p.storageRoom ?? 'สโตร์กลาง CoP-Wh01',
        }));
      } catch (err) {
        console.warn('Prisma query failed, using mock parts:', err);
      }
    }
    return sparePartsState;
  }

  /**
   * Get all material requisitions (UC-10)
   */
  static async getRequisitions(filter?: { status?: RequisitionStatus }): Promise<SparePartRequest[]> {
    if (filter?.status) {
      return requisitionsState.filter((r) => r.status === filter.status);
    }
    return requisitionsState;
  }

  /**
   * Submit material requisition by technician (UC-10)
   */
  static async createRequisition(dto: {
    ticketId: string;
    ticketNumber: string;
    technicianId: string;
    items: { partId: string; quantity: number }[];
    notes?: string;
  }): Promise<SparePartRequest> {
    const tech =
      Object.values(MOCK_USERS).find((u) => u.id === dto.technicianId) ||
      MOCK_USERS.tech_anucha;

    const seq = Math.floor(100 + Math.random() * 900);
    const requestNumber = `REQ-INV-${seq}`;

    const populatedItems = dto.items.map((it, idx) => {
      const part = sparePartsState.find((p) => p.id === it.partId) || sparePartsState[0];
      return {
        id: `item_${Date.now()}_${idx}`,
        partId: part.id,
        partCode: part.partCode,
        partName: part.name,
        unit: part.unit,
        quantity: it.quantity,
      };
    });

    const newReq: SparePartRequest = {
      id: `req_${Date.now()}`,
      requestNumber,
      ticketId: dto.ticketId,
      ticketNumber: dto.ticketNumber,
      requestedBy: tech,
      status: 'PENDING',
      notes: dto.notes,
      items: populatedItems,
      createdAt: new Date().toISOString(),
    };

    requisitionsState.unshift(newReq);
    return newReq;
  }

  /**
   * Admin approves spare parts requisition (UC-10)
   */
  static async approveRequisition(requisitionId: string, adminId?: string): Promise<SparePartRequest | null> {
    const req = requisitionsState.find(
      (r) => r.id === requisitionId || r.requestNumber === requisitionId
    );
    if (!req) return null;

    req.status = 'APPROVED';
    req.approvedAt = new Date().toISOString();
    req.approvedBy = MOCK_USERS.admin;

    // Deduct stock quantity
    req.items.forEach((item) => {
      const part = sparePartsState.find((p) => p.id === item.partId);
      if (part) {
        part.stockQuantity = Math.max(0, part.stockQuantity - item.quantity);
      }
    });

    return req;
  }

  /**
   * Admin rejects or asks for more inspection
   */
  static async rejectRequisition(requisitionId: string, notes?: string): Promise<SparePartRequest | null> {
    const req = requisitionsState.find(
      (r) => r.id === requisitionId || r.requestNumber === requisitionId
    );
    if (!req) return null;

    req.status = 'REJECTED';
    req.notes = notes ? `${req.notes || ''} [ขอตรวจเพิ่ม: ${notes}]` : req.notes;
    return req;
  }
}
