'use client';

import React, { useState } from 'react';
import { Check, MapPin, Network, Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Ticket } from '@/types';
import { InAppPermissionModal, PermissionType } from '@/components/common/InAppPermissionModal';

interface NewJobCardProps {
  ticket?: Ticket | null;
  technicianId?: string;
  hasOngoingTask?: boolean;
  onAccepted?: () => void;
}

export const NewJobCard: React.FC<NewJobCardProps> = ({
  ticket,
  technicianId,
  hasOngoingTask = false,
  onAccepted,
}) => {
  const [isAccepted, setIsAccepted] = useState(ticket?.status === 'IN_PROGRESS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // In-App Modal Dialog State (Zero browser alerts)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: PermissionType;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onAllow: () => void;
    onDeny: () => void;
  } | null>(null);

  React.useEffect(() => {
    if (ticket) {
      setIsAccepted(ticket.status === 'IN_PROGRESS');
      setErrorMessage('');
    }
  }, [ticket?.id, ticket?.status]);

  if (!ticket) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 text-center text-xs text-slate-400">
        ไม่มีงานที่ต้องดำเนินการรับงานในขณะนี้
      </div>
    );
  }

  const handleAccept = async () => {
    if (hasOngoingTask && ticket.status !== 'IN_PROGRESS') {
      setModalConfig({
        isOpen: true,
        type: 'confirm_action',
        title: 'คุณมีงานที่กำลังดำเนินการอยู่ (Active Task Warning)',
        description:
          'ระบบจำกัดการเข้าปฏิบัติงานได้ครั้งละ 1 งาน กรุณาดำเนินการซ่อมและบันทึกปิดงานปัจจุบันให้เสร็จสิ้นก่อนรับงานใหม่',
        confirmText: 'รับทราบ',
        cancelText: 'ปิด',
        onAllow: () => setModalConfig(null),
        onDeny: () => setModalConfig(null),
      });
      return;
    }

    // Match assigned technician for this ticket so accept always succeeds
    const isCurrentTechAssigned =
      technicianId &&
      (ticket.assignedTechnician?.id === technicianId ||
        ticket.assignedTechnicians?.some((t) => t.id === technicianId));

    const techIdToAccept = isCurrentTechAssigned
      ? technicianId
      : ticket.assignedTechnician?.id || technicianId || 'usr_tech_01';

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'TECHNICIAN',
          'x-user-id': techIdToAccept,
        },
        body: JSON.stringify({
          action: 'ACCEPT',
          technicianId: techIdToAccept,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAccepted(true);
        if (onAccepted) onAccepted();
      } else {
        const err = data.error || 'ไม่สามารถรับงานได้';
        setErrorMessage(err);
        setModalConfig({
          isOpen: true,
          type: 'confirm_action',
          title: 'ไม่สามารถรับงานได้',
          description: err,
          confirmText: 'ตกลง',
          cancelText: 'ปิด',
          onAllow: () => setModalConfig(null),
          onDeny: () => setModalConfig(null),
        });
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
      setErrorMessage(msg);
      setModalConfig({
        isOpen: true,
        type: 'confirm_action',
        title: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        description: msg,
        confirmText: 'ตกลง',
        cancelText: 'ปิด',
        onAllow: () => setModalConfig(null),
        onDeny: () => setModalConfig(null),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-slate-900"></span>
          <h3 className="text-sm font-bold text-slate-900">
            คิวงานที่ได้รับมอบหมาย (Assigned Work Order)
          </h3>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {ticket.tags && ticket.tags.length > 0 ? (
            ticket.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              งานทั่วไป
            </span>
          )}
        </div>
      </div>

      {/* Ticket Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-medium text-slate-900">#{ticket.ticketNumber}</span>
          </div>
          <span className="text-slate-400 text-[11px] font-normal flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>เข้าคิวงานแล้ว</span>
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs">
          <div className="flex items-start space-x-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[11px]">สถานที่:</span>
              <span className="font-semibold text-slate-800">
                {ticket.location.building} {ticket.location.floor} ห้อง {ticket.location.roomNumber}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Network className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[11px]">หมวดหมู่:</span>
              <span className="font-semibold text-slate-800">{ticket.category}</span>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            รายละเอียดปัญหา:
          </span>
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs text-slate-800 leading-relaxed">
            &quot;{ticket.description}&quot;
          </div>
        </div>

        {/* Co-technicians team if multiple */}
        {ticket.assignedTechnicians && ticket.assignedTechnicians.length > 1 && (
          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs">
            <span className="font-semibold text-blue-900 block mb-1">
              ทีมช่างร่วมรับผิดชอบ ({ticket.assignedTechnicians.length} คน):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ticket.assignedTechnicians.map((t) => (
                <span key={t.id} className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-blue-200 text-[11px] text-slate-700 font-medium">
                  {t.firstName} {t.lastName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Acceptance Policy Box */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">การตอบรับงาน:</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              เมื่อกดรับงาน ระบบจะปรับสถานะเป็น &quot;กำลังปฏิบัติงาน&quot; และส่งการแจ้งเตือนไปยังผู้แจ้งเหตุอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Actions */}
        {isAccepted ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 font-medium text-xs flex items-center justify-between ring-1 ring-inset ring-emerald-600/20">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>คุณได้ตอบรับงานนี้แล้ว (กำลังเข้าปฏิบัติงาน)</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {hasOngoingTask && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                ⚠️ คุณมีงานอื่นที่กำลังปฏิบัติงานอยู่ (จำกัดเริ่มงานครั้งละ 1 งาน) โปรดดำเนินการปิดงานปัจจุบันให้เสร็จสิ้นก่อนรับงานนี้
              </div>
            )}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMessage}
              </div>
            )}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() =>
                  setModalConfig({
                    isOpen: true,
                    type: 'confirm_action',
                    title: 'ส่งต่อคำสั่งงาน (Reassign Request)',
                    description: 'ระบบจะส่งคำร้องนี้กลับไปยังโต๊ะคัดกรองงานของ Admin Desk เพื่อให้จัดสรรช่างคนใหม่',
                    confirmText: 'ยืนยันส่งต่องาน',
                    cancelText: 'ยกเลิก',
                    onAllow: () => {
                      setModalConfig(null);
                    },
                    onDeny: () => setModalConfig(null),
                  })
                }
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition cursor-pointer"
              >
                ส่งต่องาน
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={isSubmitting || hasOngoingTask}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs shadow-xs flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? 'กำลังบันทึก...'
                    : hasOngoingTask
                    ? 'ไม่สามารถรับงานซ้อนได้'
                    : 'กดรับงาน (Accept Job)'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* In-App Permission / Confirmation Modal */}
      {modalConfig && (
        <InAppPermissionModal
          isOpen={modalConfig.isOpen}
          type={modalConfig.type}
          title={modalConfig.title}
          description={modalConfig.description}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onAllow={modalConfig.onAllow}
          onDeny={modalConfig.onDeny}
        />
      )}
    </div>
  );
};
