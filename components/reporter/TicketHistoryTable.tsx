'use client';

import React, { useState } from 'react';
import {
  Search,
  Eye,
  XCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Monitor,
  Clock,
  Tag,
  Star,
  FileText
} from 'lucide-react';
import { Ticket } from '@/types';
import { InfoTooltip } from '@/components/common/InfoTooltip';

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
  const [page, setPage] = useState(1);
  const pageSize = 6; // 6 cards per page = 2 rows of 3 cols or 3 rows of 2 cols

  const filteredTickets = tickets.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.location.roomName || '').toLowerCase().includes(q) ||
      (t.location.building || '').toLowerCase().includes(q) ||
      (t.equipment?.name || '').toLowerCase().includes(q);

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'IN_PROGRESS') return matchesSearch && t.status === 'IN_PROGRESS';
    if (statusFilter === 'PENDING') return matchesSearch && t.status === 'PENDING_DISPATCH';
    if (statusFilter === 'COMPLETED') return matchesSearch && t.status === 'COMPLETED';
    return matchesSearch;
  });

  // Pull completed tickets to the bottom, newest first
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const aDone = a.status === 'COMPLETED';
    const bDone = b.status === 'COMPLETED';
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(sortedTickets.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedTickets = sortedTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleFilterChange = () => {
    setPage(1);
  };

  const getStatusBadge = (ticket: Ticket) => {
    if (ticket.status === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs whitespace-nowrap shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>กำลังเข้าซ่อม</span>
        </span>
      );
    }
    if (ticket.status === 'PENDING_DISPATCH') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs whitespace-nowrap shrink-0">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>รอดำเนินการ</span>
        </span>
      );
    }
    if (ticket.status === 'COMPLETED') {
      if (ticket.evaluation) {
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs whitespace-nowrap shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>ประเมินแล้ว ({ticket.evaluation.rating}★)</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs whitespace-nowrap shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>ซ่อมเสร็จสิ้น</span>
        </span>
      );
    }
    if (ticket.status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap shrink-0">
          ยกเลิกแล้ว
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs whitespace-nowrap shrink-0">
        มอบหมายแล้ว
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              ประวัติการแจ้งซ่อม (Ticket History)
            </span>
            <InfoTooltip text="รายการคำร้องแจ้งซ่อมทั้งหมดของคุณ สามารถตรวจสอบความคืบหน้า รายละเอียดการแก้ไข หรือยกเลิกคำร้องได้ที่นี่" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
            <span>รายการคำร้องทั้งหมด</span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
              {sortedTickets.length} คำร้อง
            </span>
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange();
              }}
              placeholder="ค้นหารหัส, อุปกรณ์, หรือห้อง..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 font-medium focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              handleFilterChange();
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none text-slate-700 font-semibold transition cursor-pointer"
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value="IN_PROGRESS">กำลังเข้าซ่อม</option>
            <option value="PENDING">รอดำเนินการ</option>
            <option value="COMPLETED">เสร็จสิ้นแล้ว</option>
          </select>
        </div>
      </div>

      {/* Responsive Card Grid View (No Horizontal Scroll) */}
      {paginatedTickets.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/80">
          <FileText className="w-9 h-9 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-600">ไม่พบคำร้องที่ตรงกับเงื่อนไขค้นหา</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองสถานะเป็น &quot;ทุกสถานะ&quot;
          </p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedTickets.map((t) => {
              const isCompleted = t.status === 'COMPLETED';

              return (
                <div
                  key={t.id}
                  className={`rounded-2xl border transition-all p-4 flex flex-col justify-between space-y-3 ${
                    isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300 hover:shadow-md'
                      : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {/* Top Bar: Ticket # + Date + Status Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg block">
                        #{t.ticketNumber}
                      </span>
                      <div className="flex items-center gap-1 text-[10.5px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{t.createdAt.slice(0, 10)}</span>
                      </div>
                    </div>

                    {getStatusBadge(t)}
                  </div>

                  {/* Middle: Equipment & Location */}
                  <div className="space-y-2 text-xs">
                    {/* Equipment */}
                    <div className="flex items-start gap-1.5">
                      <Monitor className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate">
                          {t.equipment?.name || 'ไม่ระบุครุภัณฑ์'}
                        </span>
                        {t.equipment?.assetCode && (
                          <span className="font-mono text-[10px] text-slate-400 block truncate">
                            {t.equipment.assetCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-slate-600 text-[11.5px] min-w-0">
                        <span className="font-medium text-slate-800 block truncate">
                          {t.location.building}
                        </span>
                        <span className="text-slate-500 text-[10.5px] block truncate">
                          {t.location.floor} • {t.location.roomName || t.location.roomNumber}
                        </span>
                      </div>
                    </div>

                    {/* Problem Description */}
                    <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                      <p className="text-[11.5px] text-slate-700 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {t.tags && t.tags.length > 0 ? (
                        t.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
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
                        <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                          งานทั่วไป
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectTicket && onSelectTicket(t)}
                      className="flex-1 inline-flex items-center justify-center space-x-1.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-98 border border-blue-200 rounded-xl transition cursor-pointer"
                      title="ดูรายละเอียดคำร้องและติดตามสถานะ"
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
                        className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-98 border border-rose-200 rounded-xl transition cursor-pointer"
                        title="ยกเลิกคำร้องนี้"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ยกเลิก</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer / Pagination */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              แสดงรายการ {sortedTickets.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, sortedTickets.length)} จากทั้งหมด {sortedTickets.length} คำร้อง
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                title="หน้าก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                title="หน้าถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
