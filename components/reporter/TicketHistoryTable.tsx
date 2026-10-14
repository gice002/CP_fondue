'use client';

import React, { useState } from 'react';
import { Search, Eye, XCircle, CheckCircle2 } from 'lucide-react';
import { Ticket } from '@/types';

interface TicketHistoryTableProps {
  tickets: Ticket[];
  onSelectTicket?: (ticket: Ticket) => void;
  onCancelTicket?: (ticket: Ticket) => void;
}

export const TicketHistoryTable: React.FC<TicketHistoryTableProps> = ({
  tickets,
  onSelectTicket,
  onCancelTicket,
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

  // Pull completed tickets to the bottom
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const aDone = a.status === 'COMPLETED';
    const bDone = b.status === 'COMPLETED';
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusBadge = (ticket: Ticket) => {
    if (ticket.status === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>กำลังเข้าซ่อม</span>
        </span>
      );
    }
    if (ticket.status === 'PENDING_DISPATCH') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>รอดำเนินการ</span>
        </span>
      );
    }
    if (ticket.status === 'COMPLETED') {
      if (ticket.evaluation) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>ประเมินแล้ว ({ticket.evaluation.rating}★)</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>ซ่อมเสร็จสิ้น</span>
        </span>
      );
    }
    if (ticket.status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
          ยกเลิกแล้ว
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        มอบหมายแล้ว
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-5">
        <div>
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            ประวัติการแจ้งซ่อม (History)
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
            รายการคำร้องทั้งหมด
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
              placeholder="ค้นหารหัส หรือห้อง..."
              className="w-full text-[12px] sm:text-xs bg-slate-50 border border-slate-200/80 rounded-xl pl-8 pr-3 py-1.5 sm:py-2 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-[12px] sm:text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-700 font-medium transition"
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value="IN_PROGRESS">กำลังเข้าซ่อม</option>
            <option value="PENDING">รอดำเนินการ</option>
            <option value="COMPLETED">เสร็จสิ้นแล้ว</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List (< sm) */}
      <div className="sm:hidden space-y-3">
        {sortedTickets.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            ไม่พบคำร้องที่ตรงกับเงื่อนไขค้นหา
          </div>
        ) : (
          sortedTickets.map((t) => {
            const isCompleted = t.status === 'COMPLETED';

            return (
              <div
                key={t.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-mono font-bold text-[11.5px] ${isCompleted ? 'text-emerald-800' : 'text-slate-900'}`}>
                    {t.ticketNumber}
                  </span>
                  <div>{getStatusBadge(t)}</div>
                </div>

                <p className="text-[12px] font-semibold text-slate-800 line-clamp-2 mb-1.5 leading-relaxed">
                  {t.description}
                </p>

                <div className="flex flex-wrap items-center justify-between text-[10.5px] text-slate-500 gap-1 mb-2">
                  <span>
                    {t.location.building} • {t.location.roomName}
                  </span>
                  <span className="font-medium text-slate-400">{t.createdAt.slice(0, 10)}</span>
                </div>

                {t.tags && t.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-medium ${
                          tag === 'งานเร่งด่วน'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : tag === 'งานเร่ง'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : tag === 'งานจำเป็น'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onSelectTicket && onSelectTicket(t)}
                    className="min-h-[36px] inline-flex items-center space-x-1.5 px-3 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-200 rounded-xl transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูรายละเอียด</span>
                  </button>

                  {(t.status === 'PENDING_DISPATCH' || t.status === 'ASSIGNED') && onCancelTicket && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelTicket(t);
                      }}
                      className="min-h-[36px] inline-flex items-center space-x-1.5 px-3 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 border border-rose-200 rounded-xl transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>ยกเลิก</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop / Tablet Table (>= sm) */}
      <div className="hidden sm:block overflow-x-auto min-h-[320px] max-h-[640px] overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs shadow-2xs">
            <tr className="border-b border-slate-200 text-slate-600 font-bold">
              <th className="py-2.5 px-3">รหัสคำร้อง</th>
              <th className="py-2.5 px-3">สถานที่</th>
              <th className="py-2.5 px-3">รายการปัญหา</th>
              <th className="py-2.5 px-3 text-center">วันที่แจ้ง</th>
              <th className="py-2.5 px-3 text-center">สถานะ</th>
              <th className="py-2.5 px-3 text-center">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedTickets.map((t) => {
              const isCompleted = t.status === 'COMPLETED';

              return (
                <tr
                  key={t.id}
                  className={`transition ${
                    isCompleted
                      ? 'bg-emerald-50/70 hover:bg-emerald-100/60 border-l-4 border-l-emerald-500 text-emerald-950'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className={`py-3 px-3 font-mono font-medium ${isCompleted ? 'text-emerald-800 font-bold' : 'text-slate-900'}`}>
                    {t.ticketNumber}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{t.location.building}</div>
                    <div className="text-[11px] text-slate-500">
                      {t.location.floor} • {t.location.roomName}
                    </div>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <p className="font-medium text-slate-700 line-clamp-1">{t.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {t.tags && t.tags.length > 0 ? (
                        t.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              tag === 'งานเร่งด่วน'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : tag === 'งานเร่ง'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : tag === 'งานจำเป็น'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : tag === 'งานที่ต้องรออุปกรณ์'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400">งานทั่วไป</span>
                      )}
                    </div>
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
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer"
                      title="ดูรายละเอียดคำร้องนี้ในแถบด้านบน"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ดูรายละเอียด</span>
                    </button>

                    {(t.status === 'PENDING_DISPATCH' || t.status === 'ASSIGNED') && onCancelTicket && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelTicket(t);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer"
                        title="ยกเลิกคำร้องนี้"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ยกเลิก</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
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
