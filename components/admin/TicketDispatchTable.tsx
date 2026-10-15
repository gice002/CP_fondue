'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Eye, Check, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Ticket } from '@/types';
import { InfoTooltip } from '@/components/common/InfoTooltip';

interface TicketDispatchTableProps {
  tickets: Ticket[];
  selectedTicketId: string;
  onSelectTicket: (ticket: Ticket) => void;
}

export const TicketDispatchTable: React.FC<TicketDispatchTableProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [buildingFilter, setBuildingFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredTickets = tickets.filter((t) => {
    if (t.status === 'CANCELLED') return false;

    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.reporter.firstName.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.location.roomName.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesBld = buildingFilter === 'ALL' || t.location.building.includes(buildingFilter);

    return matchesSearch && matchesCat && matchesBld;
  });

  // Pull completed tickets to the bottom of the list
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const aCompleted = a.status === 'COMPLETED';
    const bCompleted = b.status === 'COMPLETED';
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedTickets.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedTickets = sortedTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
      {/* Search & Filters (Compact) */}
      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 mb-3 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange();
            }}
            placeholder="ค้นหารหัสคำร้อง, ชื่อผู้แจ้ง, ครุภัณฑ์, ห้อง..."
            className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-8.5 pr-3 py-1.5 font-medium focus:ring-1 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                handleFilterChange();
              }}
              className="w-full bg-white border border-slate-200 rounded-lg p-1 text-[11px] text-slate-700 font-medium outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">ประเภท (ทั้งหมด)</option>
              <option value="ระบบคอมพิวเตอร์และเครือข่าย">คอมพิวเตอร์และเครือข่าย</option>
              <option value="ระบบปรับอากาศ">ระบบปรับอากาศ</option>
              <option value="ระบบไฟฟ้าและแสงสว่าง">ไฟฟ้าและแสงสว่าง</option>
            </select>
          </div>

          <div>
            <select
              value={buildingFilter}
              onChange={(e) => {
                setBuildingFilter(e.target.value);
                handleFilterChange();
              }}
              className="w-full bg-white border border-slate-200 rounded-lg p-1 text-[11px] text-slate-700 font-medium outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">อาคารทั้งหมด</option>
              <option value="SC-09">SC-09 อาคารวิทยวิภาส</option>
            </select>
          </div>

          <div>
            <span className="w-full inline-flex items-center justify-center p-1 bg-slate-100/70 border border-slate-200/60 rounded-lg text-[11px] font-medium text-slate-600 truncate">
              หน้าละ 5 รายการ
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
                setBuildingFilter('ALL');
                setPage(1);
              }}
              className="w-full flex items-center justify-center space-x-1 p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-500 text-[11px] font-medium transition cursor-pointer"
              title="รีเซ็ตตัวกรอง"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ต</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Header Info */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs font-bold text-slate-800">
            คิวคำร้องแจ้งซ่อม
          </h3>
          <span className="text-[10.5px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.2 rounded-full">
            {filteredTickets.length} รายการ
          </span>
        </div>

        <div className="flex items-center space-x-1 text-[10.5px] font-medium text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>WebSocket Realtime</span>
        </div>
      </div>

      {/* Queue List Items (Jira / Gmail Inbox Style - 100% No Horizontal Scroll) */}
      <div className="space-y-2.5">
        {paginatedTickets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
            ไม่พบรายการคำร้องที่ตรงกับเงื่อนไข
          </div>
        ) : (
          paginatedTickets.map((t) => {
            const isSelected = t.id === selectedTicketId;
            const isCompleted = t.status === 'COMPLETED';

            const priorityTag =
              t.tags?.find((tag) =>
                ['งานเร่งด่วน', 'งานเร่ง', 'งานจำเป็น', 'งานทั่วไป'].includes(tag)
              ) || 'งานทั่วไป';

            const conditionTag = t.tags?.find((tag) => tag === 'งานที่ต้องรออุปกรณ์');

            return (
              <div
                key={t.id}
                onClick={() => onSelectTicket(t)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs relative ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/30 hover:bg-emerald-50/60 border-slate-200/90 hover:border-emerald-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-blue-300'
                }`}
              >
                {/* Active Indicator Bar */}
                {isSelected && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 rounded-r-full" />
                )}

                {/* Line 1: Ticket ID + Date & Status Badge */}
                <div className="flex items-center justify-between mb-1.5 pl-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-mono font-bold text-xs ${
                        isSelected ? 'text-blue-700' : 'text-slate-900'
                      }`}
                    >
                      #{t.ticketNumber}
                    </span>
                    <span className="text-[10.5px] text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <div>
                    {t.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>เสร็จสิ้น</span>
                      </span>
                    ) : t.status === 'IN_PROGRESS' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>กำลังซ่อม</span>
                      </span>
                    ) : t.status === 'ASSIGNED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <span>มอบหมายแล้ว</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span>รอคัดกรอง</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Line 2: Reporter Name & Room Location */}
                <div className="flex items-center justify-between text-xs mb-1.5 pl-1.5 gap-2">
                  <div className="font-semibold text-slate-800 truncate">
                    {t.reporter.firstName} {t.reporter.lastName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium shrink-0">
                    {t.location.roomName || t.location.roomNumber} ({t.location.floor})
                  </div>
                </div>

                {/* Line 3: Equipment / Category & Tags */}
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100/90 pl-1.5 gap-2">
                  <div className="text-slate-500 truncate font-medium">
                    {t.equipment?.name || t.category}
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                        priorityTag === 'งานเร่งด่วน'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : priorityTag === 'งานเร่ง'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : priorityTag === 'งานจำเป็น'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {priorityTag}
                    </span>

                    {conditionTag && (
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {conditionTag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dynamic Working Pagination */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="text-[11px] text-slate-400">
          แสดง {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedTickets.length)} จากทั้งหมด {sortedTickets.length} คำร้อง
        </div>

        <div className="flex items-center space-x-1 text-xs">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            title="หน้าก่อนหน้า"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum)}
                className={`w-6 h-6 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            title="หน้าถัดไป"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
