'use client';

import React, { useState } from 'react';
import { Check, MapPin, Network, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Ticket } from '@/types';

interface NewJobCardProps {
  ticket: Ticket;
  onAccepted?: () => void;
}

export const NewJobCard: React.FC<NewJobCardProps> = ({ ticket, onAccepted }) => {
  const [isAccepted, setIsAccepted] = useState(ticket.status === 'IN_PROGRESS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACCEPT',
          technicianId: 'usr_tech_01',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAccepted(true);
        if (onAccepted) onAccepted();
      }
    } catch (err) {
      console.error(err);
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
            คิวงานใหม่ที่ได้รับมอบหมาย (Assigned Work Order)
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
          ด่วนมาก
        </span>
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

        {/* BR5 & BR6 Policy Box */}
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
          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={() => alert('ส่งต่อให้หัวหน้าทีมเพื่อสับเปลี่ยนช่าง')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition"
            >
              ส่งต่องาน
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs shadow-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'กดรับงาน (Accept Job)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
