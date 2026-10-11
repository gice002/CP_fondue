'use client';

import React, { useState } from 'react';
import { Search, Eye, XCircle, Star, Filter } from 'lucide-react';
import { Ticket } from '@/types';

interface TicketHistoryTableProps {
  tickets: Ticket[];
  onSelectTicket?: (ticket: Ticket) => void;
}

export const TicketHistoryTable: React.FC<TicketHistoryTableProps> = ({
  tickets,
  onSelectTicket,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.roomName.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'IN_PROGRESS') return matchesSearch && t.status === 'IN_PROGRESS';
    if (statusFilter === 'PENDING') return matchesSearch && t.status === 'PENDING_DISPATCH';
    if (statusFilter === 'COMPLETED') return matchesSearch && t.status === 'COMPLETED';
    return matchesSearch;
  });

  const getStatusBadge = (ticket: Ticket) => {
    if (ticket.status === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
          ● กำลังเข้าซ่อม
        </span>
      );
    }
    if (ticket.status === 'PENDING_DISPATCH') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
          รอดำเนินการ
        </span>
      );
    }
    if (ticket.status === 'COMPLETED') {
      if (ticket.evaluation) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            ประเมินแล้ว ({ticket.evaluation.rating}★)
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
          ซ่อมเสร็จแล้ว
        </span>
      );
    }
    if (ticket.status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
          ยกเลิกแล้ว
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
        มอบหมายแล้ว
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            UC-4: ตรวจสอบประวัติคำร้องย้อนหลัง
          </span>
          <h3 className="text-base font-extrabold text-slate-900">
            รายการคำร้องของฉันทั้งหมด
          </h3>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหารหัส/ห้อง..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value="IN_PROGRESS">กำลังเข้าซ่อม</option>
            <option value="PENDING">รอดำเนินการ</option>
            <option value="COMPLETED">เสร็จสิ้นแล้ว</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
              <th className="py-2.5 px-3">รหัสคำร้อง</th>
              <th className="py-2.5 px-3">สถานที่ / ห้อง</th>
              <th className="py-2.5 px-3">รายการปัญหาที่แจ้ง</th>
              <th className="py-2.5 px-3 text-center">วันที่แจ้ง</th>
              <th className="py-2.5 px-3 text-center">สถานะ</th>
              <th className="py-2.5 px-3 text-center">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTickets.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-3 font-mono font-bold text-blue-600">
                  {t.ticketNumber}
                </td>
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-800">{t.location.building}</div>
                  <div className="text-[11px] text-slate-500">
                    {t.location.floor} • {t.location.roomName}
                  </div>
                </td>
                <td className="py-3 px-3 max-w-xs">
                  <p className="font-medium text-slate-800 line-clamp-1">{t.description}</p>
                  <span
                    className={`inline-block text-[10px] font-bold mt-0.5 ${
                      t.urgency === 'CRITICAL'
                        ? 'text-red-600'
                        : t.urgency === 'URGENT'
                        ? 'text-orange-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {t.urgency === 'CRITICAL'
                      ? 'ฉุกเฉิน'
                      : t.urgency === 'URGENT'
                      ? 'เร่งด่วน'
                      : 'ปกติ'}
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-slate-600 font-medium whitespace-nowrap">
                  {t.createdAt.slice(0, 10)}
                </td>
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  {getStatusBadge(t)}
                </td>
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-1.5">
                    <button
                      onClick={() => onSelectTicket && onSelectTicket(t)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="ดูรายละเอียด"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {t.status === 'PENDING_DISPATCH' && (
                      <button
                        onClick={() => alert(`ขอยกเลิกคำร้อง ${t.ticketNumber} (UC-5)`)}
                        className="px-2 py-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition"
                      >
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>แสดงรายการ 1-{filteredTickets.length} จากทั้งหมด {tickets.length} คำร้อง</div>
        <div className="flex items-center space-x-1">
          <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50">&lt;</button>
          <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold">1</button>
          <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50">2</button>
          <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50">&gt;</button>
        </div>
      </div>
    </div>
  );
};
