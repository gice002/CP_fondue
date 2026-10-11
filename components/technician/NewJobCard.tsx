'use client';

import React, { useState } from 'react';
import { Check, X, MapPin, Network, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h3 className="text-base font-extrabold text-slate-900">
            คิวงานใหม่ที่ได้รับมอบหมาย (New Assigned Job)
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-50 text-red-700 border border-red-200">
          ● ด่วนมาก (High)
        </span>
      </div>

      {/* Ticket Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-slate-800">WO-202505-0089</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-blue-600">อ้างอิงคำร้อง {ticket.ticketNumber}</span>
          </div>
          <span className="text-slate-400 text-[11px] font-medium flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>แจ้งเมื่อ: วันนี้ 14:15 น. (28 นาทีที่แล้ว)</span>
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[11px]">สถานที่เกิดเหตุ:</span>
              <span className="font-bold text-slate-800">
                {ticket.location.building} {ticket.location.floor} ห้อง {ticket.location.roomNumber}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Network className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[11px]">ประเภทและระบบ:</span>
              <span className="font-bold text-slate-800">{ticket.category}</span>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            รายละเอียดปัญหาจากผู้แจ้งเหตุ (อ.ประจักษ์ โภคทรัพย์):
          </span>
          <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-800 leading-relaxed italic">
            &quot;{ticket.description}&quot;
          </div>
        </div>

        {/* Evidence Image */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            ภาพหลักฐานที่ผู้แจ้งแนบมา (1 ภาพ):
          </span>
          <div className="relative rounded-xl overflow-hidden aspect-video max-h-52 border border-slate-200 bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800"
              alt="switch rack"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[11px] p-1.5 font-mono">
              หลักฐาน_rack_room405.jpg
            </div>
          </div>
        </div>

        {/* BR5 & BR6 Policy Box */}
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">ตามข้อกำหนด BR5 &amp; BR6:</span>
            <p className="text-[11px] text-blue-800">
              เมื่อคุณกดรับงาน ระบบจะปรับสถานะเป็น &quot;รับงานแล้ว&quot; และแสดงชื่อ-เบอร์ติดต่อช่างไปยังผู้แจ้งเหตุทันที
            </p>
          </div>
        </div>

        {/* Actions */}
        {isAccepted ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>คุณได้กดรับงานนี้แล้ว (สถานะ: กำลังปฏิบัติงาน In Progress)</span>
            </div>
            <span className="text-[11px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded font-mono">
              14:20 น.
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={() => alert('ส่งต่อหรือแจ้งหัวหน้าทีมเพื่อโอนงานให้ช่างท่านอื่น')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs transition"
            >
              ปฏิเสธงาน / ส่งต่อ
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'กดรับงาน (Accept Job)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
