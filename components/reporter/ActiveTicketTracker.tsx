'use client';

import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Phone,
  AlertCircle,
  XCircle,
  MapPin,
  Flame,
  Wrench,
} from 'lucide-react';
import { Ticket } from '@/types';

interface ActiveTicketTrackerProps {
  ticket?: Ticket;
  onCancelled?: () => void;
}

export const ActiveTicketTracker: React.FC<ActiveTicketTrackerProps> = ({
  ticket,
  onCancelled,
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  React.useEffect(() => {
    setIsCancelled(false);
  }, [ticket?.id]);

  // If no ticket provided, don't show tracker
  if (!ticket) {
    return null;
  }

  const handleCancelTicket = async () => {
    const confirmCancel = confirm(
      `คุณต้องการขอยกเลิกคำร้อง ${ticket.ticketNumber} ใช่หรือไม่?`
    );
    if (!confirmCancel) return;

    setIsCancelling(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CANCEL',
          reason: 'ผู้แจ้งขอยกเลิกคำร้องผ่านหน้าเว็บไซต์',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCancelled(true);
        if (onCancelled) onCancelled();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการยกเลิกคำร้อง');
      }
    } catch (e) {
      console.error(e);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อยกเลิกคำร้องได้');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isCancelled) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm mb-6 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-2">
          <XCircle className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-sm text-slate-800">คำร้อง {ticket.ticketNumber} ถูกยกเลิกแล้ว</h3>
        <p className="text-xs text-slate-500 mt-1">ผู้แจ้งเหตุได้ยกเลิกคำร้องนี้ ระบบปรับสถานะเป็น &quot;ยกเลิกคำร้อง&quot; เรียบร้อยแล้ว</p>
      </div>
    );
  }

  const isStep1Done = true;
  const isStep2Done = ticket.status === 'ASSIGNED' || ticket.status === 'IN_PROGRESS';
  const isStep3Active = ticket.status === 'IN_PROGRESS';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-900">
              {ticket.status === 'IN_PROGRESS'
                ? 'กำลังเข้าซ่อม (In-Progress)'
                : ticket.status === 'ASSIGNED'
                ? 'มอบหมายช่างแล้ว (Assigned)'
                : ticket.status === 'COMPLETED'
                ? 'ซ่อมเสร็จสิ้น (Completed)'
                : ticket.status === 'CANCELLED'
                ? 'ยกเลิกคำร้องแล้ว (Cancelled)'
                : 'รอการคัดกรอง (Pending)'}
            </span>
            <span className="text-xs font-mono font-medium text-slate-500">
              #{ticket.ticketNumber}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            {ticket.description}
          </h3>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {ticket.location.building} {ticket.location.floor} {ticket.location.roomName}
              {ticket.equipment ? ` (Asset: ${ticket.equipment.assetCode})` : ''}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 justify-end">
          {ticket.tags && ticket.tags.length > 0 ? (
            ticket.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                  tag === 'งานเร่งด่วน'
                    ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                    : tag === 'งานเร่ง'
                    ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                    : tag === 'งานจำเป็น'
                    ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                    : tag === 'งานที่ต้องรออุปกรณ์'
                    ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20'
                    : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
                }`}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              งานทั่วไป
            </span>
          )}
        </div>
      </div>

      {/* 4-Step Stepper */}
      <div className="my-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-3">
          ความคืบหน้างานซ่อม (Status Timeline)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ส่งคำร้องแล้ว</span>
            </div>
            <div className="text-[11px] font-medium text-slate-700">
              {new Date(ticket.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
            </div>
            <div className="text-[10px] text-slate-400">เข้าระบบแล้ว</div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-start">
            <div className={`flex items-center space-x-1.5 text-xs font-semibold mb-1 ${
              isStep2Done ? 'text-emerald-700' : 'text-slate-500'
            }`}>
              {isStep2Done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>คัดกรองงาน</span>
            </div>
            <div className="text-[11px] font-medium text-slate-700">
              {ticket.assignedTechnician ? 'มอบหมายแล้ว' : 'รอคัดกรอง'}
            </div>
            <div className="text-[10px] text-slate-400">
              {ticket.assignedTechnician ? ticket.assignedTechnician.firstName : 'รอเจ้าหน้าที่'}
            </div>
          </div>

          {/* Step 3 - Current */}
          <div className={`flex flex-col items-start p-2 rounded-lg border ${
            isStep3Active
              ? 'bg-white border-slate-200 shadow-2xs'
              : 'opacity-60 border-transparent'
          }`}>
            <div className={`flex items-center space-x-1.5 text-xs font-semibold mb-1 ${
              isStep3Active ? 'text-slate-900' : 'text-slate-500'
            }`}>
              <Wrench className={`w-4 h-4 shrink-0 ${isStep3Active ? 'text-slate-900 animate-spin' : 'text-slate-400'}`} />
              <span>กำลังปฏิบัติงาน</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-900">
              {isStep3Active ? 'ช่างเข้าพื้นที่' : 'รอเข้าซ่อม'}
            </div>
          </div>

          {/* Step 4 - Pending */}
          <div className="flex flex-col items-start opacity-50">
            <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 mb-1">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>เสร็จสิ้น</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500">รอปิดงานซ่อม</div>
          </div>
        </div>
      </div>

      {/* Assigned Technician Card */}
      {ticket.assignedTechnician && (
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {ticket.assignedTechnician.firstName.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-900">
                  {ticket.assignedTechnician.firstName} {ticket.assignedTechnician.lastName}
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                  ช่างผู้รับผิดชอบ
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
                <span className="font-medium text-slate-700">{ticket.assignedTechnician.phoneNumber || '081-445-9988'}</span>
                <span>• {ticket.assignedTechnician.departmentName || 'ฝ่ายช่างซ่อมบำรุง'}</span>
              </div>
            </div>
          </div>

          {ticket.assignedTechnician.phoneNumber && (
            <a
              href={`tel:${ticket.assignedTechnician.phoneNumber}`}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>โทรติดต่อช่าง</span>
            </a>
          )}
        </div>
      )}

      {/* Cancellation Notice */}
      {(ticket.status === 'PENDING_DISPATCH' || ticket.status === 'ASSIGNED') && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">ยกเลิกคำร้อง:</span>
              <p className="text-[11px] text-slate-500">
                กรณีปัญหาได้รับการแก้ไขแล้ว หรือต้องการยกเลิกคำขอนี้ก่อนช่างเริ่มปฏิบัติงาน
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isCancelling}
            onClick={handleCancelTicket}
            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 text-xs font-semibold shrink-0 transition disabled:opacity-50"
          >
            {isCancelling ? 'กำลังยกเลิก...' : 'ขอยกเลิกคำร้อง'}
          </button>
        </div>
      )}
    </div>
  );
};
