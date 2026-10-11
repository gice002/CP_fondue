'use client';

import React, { useState } from 'react';
import { FileText, CheckSquare, Image as ImageIcon } from 'lucide-react';
import { Ticket } from '@/types';

interface TicketVerificationCardProps {
  ticket: Ticket;
}

export const TicketVerificationCard: React.FC<TicketVerificationCardProps> = ({ ticket }) => {
  const [chkOwnership, setChkOwnership] = useState(true);
  const [chkDuplicate, setChkDuplicate] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            BR2: รายละเอียดและรูปภาพหลักฐานการแจ้งซ่อม
          </span>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-extrabold text-slate-900">
              รหัสอ้างอิง: <span className="font-mono text-blue-700">{ticket.ticketNumber}</span>
            </h3>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          รอส่งมอบงาน (Awaiting Dispatch)
        </span>
      </div>

      {/* Grid of Reporter & Asset Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
        <div>
          <span className="text-slate-400 block text-[11px]">ผู้แจ้งเหตุ:</span>
          <span className="font-bold text-slate-800">
            {ticket.reporter.firstName} {ticket.reporter.lastName}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">เบอร์โทรศัพท์:</span>
          <span className="font-bold text-slate-800 font-mono">
            {ticket.reporter.phoneNumber || '081-456-7890 (ต่อ 44321)'}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">อีเมล KKU Mail:</span>
          <span className="font-bold text-slate-800 font-mono">{ticket.reporter.email}</span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">ห้อง/พิกัด:</span>
          <span className="font-bold text-slate-800">
            {ticket.location.building} {ticket.location.floor} {ticket.location.roomName}
          </span>
        </div>

        <div className="sm:col-span-2">
          <span className="text-slate-400 block text-[11px]">หมายเลขครุภัณฑ์:</span>
          <span className="font-bold text-blue-800 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {ticket.equipment?.assetCode || 'KKU-CP-NET-2023-018'}
          </span>
        </div>
      </div>

      {/* Problem Description */}
      <div className="mb-4">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          คำอธิบายอาการจากผู้แจ้ง:
        </span>
        <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-800 leading-relaxed italic">
          &quot;{ticket.description}&quot;
        </div>
      </div>

      {/* Photo attachments */}
      <div className="mb-4">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center space-x-1">
          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>ภาพถ่ายหลักฐานแนบ ({ticket.attachments.length || 2} ภาพ)</span>
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          {ticket.attachments.length > 0 ? (
            ticket.attachments.map((att, i) => (
              <div
                key={att.id || i}
                className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 group"
              >
                <img
                  src={att.fileUrl}
                  alt="evidence"
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 truncate">
                  {att.caption || (i === 0 ? 'พอร์ต RJ-45 ชำรุด' : 'บรรยากาศห้อง 402')}
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600"
                  alt="evidence"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1">
                  พอร์ต RJ-45 ชำรุด
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600"
                  alt="evidence"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1">
                  บรรยากาศห้อง 402
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Verification Checkboxes (BR4) */}
      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
        <span className="text-xs font-bold text-blue-900 block">
          การตรวจความถูกต้องเบื้องต้น (BR4):
        </span>
        <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={chkOwnership}
            onChange={(e) => setChkOwnership(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span className="font-medium">ครุภัณฑ์อยู่ในความรับผิดชอบของวิทยาลัย CP</span>
        </label>

        <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={chkDuplicate}
            onChange={(e) => setChkDuplicate(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span className="font-medium">ไม่พบประวัติการแจ้งซ้ำซ้อนใน 24 ชั่วโมงที่ผ่านมา</span>
        </label>
      </div>
    </div>
  );
};
