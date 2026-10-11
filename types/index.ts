// TypeScript type definitions for CP Fondue Repair System

export type RoleCode = 'REPORTER' | 'ADMIN_DISPATCH' | 'TECHNICIAN' | 'EXECUTIVE';

export type TicketUrgency = 'NORMAL' | 'URGENT' | 'CRITICAL';

export type TicketStatus = 
  | 'PENDING_DISPATCH' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type RequisitionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AttachmentPhase = 'BEFORE_REPAIR' | 'AFTER_REPAIR';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string; // KKU Mail
  phoneNumber?: string;
  avatarUrl?: string;
  roleCode: RoleCode;
  departmentName?: string;
  buildingRef?: string;
}

export interface Location {
  id: string;
  building: string;
  floor: string;
  roomNumber: string;
  roomName: string;
}

export interface Equipment {
  id: string;
  assetCode: string; // e.g. "KKU-CP-67-0891"
  name: string;
  serialNumber?: string;
  specDetails?: string;
  categoryName: string;
  warrantyStatus: 'IN_WARRANTY' | 'OUT_OF_WARRANTY';
  locationId: string;
}

export interface TicketAttachment {
  id: string;
  fileUrl: string;
  fileName?: string;
  fileType: string;
  phase: AttachmentPhase;
  caption?: string;
  uploadedAt: string;
}

export interface TicketStatusHistory {
  id: string;
  ticketId: string;
  oldStatus?: TicketStatus;
  newStatus: TicketStatus;
  notes?: string;
  changedBy: string;
  changedAt: string;
}

export interface Evaluation {
  id: string;
  ticketId: string;
  reporterId: string;
  rating: number; // 1-5
  feedback?: string;
  evaluatedAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. "REQ-202505-0042"
  reporter: User;
  assignedTechnician?: User;
  location: Location;
  locationDetail?: string; // จุดสังเกตเฉพาะจุดภายในห้อง
  equipment?: Equipment;
  category: string;
  description: string;
  urgency: TicketUrgency;
  status: TicketStatus;
  targetSlaDate?: string;
  adminNotes?: string;
  repairNotes?: string;
  attachments: TicketAttachment[];
  statusHistories: TicketStatusHistory[];
  evaluation?: Evaluation;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  tags?: string[];
}

export interface SparePart {
  id: string;
  partCode: string; // e.g. "MAT-NET-008"
  name: string;
  unit: string;
  stockQuantity: number;
  unitCost: number;
  storageRoom: string;
}

export interface SparePartRequestItem {
  id: string;
  partId: string;
  partCode: string;
  partName: string;
  unit: string;
  quantity: number;
}

export interface SparePartRequest {
  id: string;
  requestNumber: string; // e.g. "REQ-INV-092"
  ticketId: string;
  ticketNumber: string;
  requestedBy: User;
  approvedBy?: User;
  status: RequisitionStatus;
  notes?: string;
  items: SparePartRequestItem[];
  createdAt: string;
  approvedAt?: string;
}

export interface AuditLog {
  id: string;
  tableName: string;
  action: string;
  recordId: string;
  ticketNumber?: string;
  location?: string;
  problemSummary?: string;
  reporterName?: string;
  techName?: string;
  partsUsed?: string;
  status?: string;
  rating?: number;
  oldData?: string;
  newData?: string;
  changedBy: string;
  changedAt: string;
}

export interface ExecutiveStats {
  totalTickets: number;
  completedTickets: number;
  completedPercent: number;
  avgResponseTimeMin: number;
  avgRating: number;
  totalEvaluations: number;
  slaSuccessRate: number;
  categoryBreakdown: {
    category: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  weeklyTrends: {
    week: string;
    newCases: number;
    completed: number;
    avgTimeMin: number;
  }[];
  technicianLeaderboard: {
    id: string;
    name: string;
    department: string;
    casesCount: number;
    onTimePercent: number;
    avgTimeMin: number;
    rating: number;
  }[];
  partsUsageSummary: {
    partCode: string;
    partName: string;
    usedQuantity: string;
    stockRemaining: string;
    isLowStock?: boolean;
  }[];
  totalPartsCost: number;
  totalRequisitions: number;
}
