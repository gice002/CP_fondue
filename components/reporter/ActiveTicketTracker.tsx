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

  // If no ticket provided, or ticket is completed/cancelled, don't show active tracker
  if (!ticket || ticket.status === 'COMPLETED' || ticket.status === 'CANCELLED') {
    return null;
  }

  const handleCancelTicket = async () => {
    const confirmCancel = confirm(
      `คุณต้องการขอยกเลิกคำร้อง ${ticket.ticketNumber} ใช่หรือไม่? (UC-5)`
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
        <h3 className="font-extrabold text-sm text-slate-800">คำร้อง {ticket.ticketNumber} ถูกยกเลิกแล้ว (UC-5)</h3>
        <p className="text-xs text-slate-500 mt-1">ผู้แจ้งเหตุได้ยกเลิกคำร้องนี้ ระบบปรับสถานะเป็น &quot;ยกเลิกคำร้อง&quot; เรียบร้อยแล้ว</p>
      </div>
    );
  }

  const isStep1Done = true;
  const isStep2Done = ticket.status === 'ASSIGNED' || ticket.status === 'IN_PROGRESS';
  const isStep3Active = ticket.status === 'IN_PROGRESS';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-blue-600">
              {ticket.status === 'IN_PROGRESS'
                ? 'กำลังเข้าซ่อม (In-Progress)'
                : ticket.status === 'ASSIGNED'
                ? 'มอบหมายช่างแล้ว (Assigned)'
                : 'รอการคัดกรอง (Pending)'}
            </span>
            <span className="text-xs font-mono font-black text-slate-900">
              {ticket.ticketNumber}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
            {ticket.description}
          </h3>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              {ticket.location.building} {ticket.location.floor} {ticket.location.roomName}
              {ticket.equipment ? ` (Asset: ${ticket.equipment.assetCode})` : ''}
            </span>
          </div>
        </div>

        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black shrink-0 ${
          ticket.urgency === 'CRITICAL'
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : ticket.urgency === 'URGENT'
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          <Flame className="w-3.5 h-3.5 mr-1" />
          ระดับ: {ticket.urgency}
        </span>
      </div>

      {/* 4-Step Stepper (UC-2) */}
      <div className="my-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
          สถานะขั้นตอนการดำเนินงาน (UC-2: ติดตามสถานะการซ่อม)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ส่งคำร้องแล้ว</span>
            </div>
            <div className="text-[11px] font-bold text-slate-800">
              {new Date(ticket.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
            </div>
            <div className="text-[10px] text-slate-400">เข้าระบบอัตโนมัติ</div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-start">
            <div className={`flex items-center space-x-1.5 text-xs font-bold mb-1 ${
              isStep2Done ? 'text-emerald-700' : 'text-slate-500'
            }`}>
              {isStep2Done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>คัดกรองมอบหมาย</span>
            </div>
            <div className="text-[11px] font-bold text-slate-800">
              {ticket.assignedTechnician ? 'มอบหมายแล้ว' : 'รอเจ้าหน้าที่'}
            </div>
            <div className="text-[10px] text-slate-400">
              {ticket.assignedTechnician ? ticket.assignedTechnician.firstName : 'คัดกรองงาน'}
            </div>
          </div>

          {/* Step 3 - Current */}
          <div className={`flex flex-col items-start p-2 rounded-lg border ${
            isStep3Active
              ? 'bg-blue-100/60 border-blue-200'
              : 'opacity-60 border-transparent'
          }`}>
            <div className={`flex items-center space-x-1.5 text-xs font-bold mb-1 ${
              isStep3Active ? 'text-blue-800' : 'text-slate-500'
            }`}>
              <Wrench className={`w-4 h-4 shrink-0 ${isStep3Active ? 'text-blue-600 animate-spin' : 'text-slate-400'}`} />
              <span>กำลังตรวจสอบ/ซ่อม</span>
            </div>
            <div className="text-[11px] font-bold text-blue-900">
              {isStep3Active ? 'เข้าดำเนินการ' : 'รอช่างเข้าหน้างาน'}
            </div>
          </div>

          {/* Step 4 - Pending */}
          <div className="flex flex-col items-start opacity-60">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mb-1">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>เสร็จสิ้นสมบูรณ์</span>
            </div>
            <div className="text-[11px] font-bold text-slate-600">รอปิดงานซ่อม</div>
          </div>
        </div>
      </div>

      {/* Assigned Technician Card */}
      {ticket.assignedTechnician && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {ticket.assignedTechnician.firstName.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-extrabold text-slate-900">
                  {ticket.assignedTechnician.firstName} {ticket.assignedTechnician.lastName}
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                  ช่างผู้รับผิดชอบ
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
                <span className="font-bold text-slate-700">{ticket.assignedTechnician.phoneNumber || '081-445-9988'}</span>
                <span>• {ticket.assignedTechnician.departmentName || 'ฝ่ายช่างซ่อมบำรุง'}</span>
              </div>
            </div>
          </div>

          {ticket.assignedTechnician.phoneNumber && (
            <a
              href={`tel:${ticket.assignedTechnician.phoneNumber}`}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>โทรติดต่อช่าง</span>
            </a>
          )}
        </div>
      )}

      {/* Cancellation Notice (UC-5) */}
      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">ยกเลิกคำร้อง (UC-5):</span>
            <p className="text-[11px] text-amber-800">
              สามารถยกเลิกคำร้องได้หากปัญหาได้รับการแก้ไขแล้ว หรือแจ้งข้อมูลผิดพลาด
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isCancelling}
          onClick={handleCancelTicket}
          className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 bg-white hover:bg-red-50 text-xs font-bold shrink-0 transition disabled:opacity-50"
        >
          {isCancelling ? 'กำลังยกเลิก...' : 'ขอยกเลิกคำร้อง (UC-5)'}
        </button>
      </div>
    </div>
  );
};
