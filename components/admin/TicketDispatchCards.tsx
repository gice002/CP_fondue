'use client';

import React, { useState } from 'react';
import {
  Search,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Monitor,
  MapPin,
  User,
  Clock,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Ticket, StandardTag } from '@/types';

interface TicketDispatchCardsProps {
  tickets: Ticket[];
  selectedTicketId: string;
  onSelectTicket: (ticket: Ticket) => void;
}

export const TicketDispatchCards: React.FC<TicketDispatchCardsProps> = ({
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

    const query = search.toLowerCase();
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(query) ||
      t.reporter.firstName.toLowerCase().includes(query) ||
      t.reporter.lastName.toLowerCase().includes(query) ||
      (t.reporter.departmentName || '').toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.location.roomName.toLowerCase().includes(query) ||
      t.location.building.toLowerCase().includes(query) ||
      (t.equipment?.name || '').toLowerCase().includes(query) ||
      (t.equipment?.assetCode || '').toLowerCase().includes(query) ||
      (t.category || '').toLowerCase().includes(query);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>เสร็จสิ้น</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>กำลังซ่อม</span>
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <span>มอบหมายแล้ว</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>รอคัดกรอง</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
      {/* Search & Filters */}
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
            placeholder="ค้นหาครุภัณฑ์, สถานที่, ผู้แจ้ง, รหัสคำร้อง..."
            className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-8.5 pr-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition"
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
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] text-slate-700 font-medium outline-none focus:border-blue-600 cursor-pointer"
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
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] text-slate-700 font-medium outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="ALL">อาคารทั้งหมด</option>
              <option value="SC-09">SC-09 อาคารวิทยวิภาส</option>
            </select>
          </div>

          <div>
            <span className="w-full inline-flex items-center justify-center p-1.5 bg-slate-100/70 border border-slate-200/60 rounded-lg text-[11px] font-medium text-slate-600 truncate">
              หน้าละ {pageSize} การ์ด
            </span>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
                setBuildingFilter('ALL');
                setPage(1);
              }}
              className="w-full flex items-center justify-center space-x-1 p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 text-[11px] font-semibold transition cursor-pointer"
              title="รีเซ็ตตัวกรอง"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ต</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">
            คิวคำร้องแจ้งซ่อม
          </h3>
          <span className="text-[10.5px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            {filteredTickets.length} คำร้อง
          </span>
        </div>

        <div className="flex items-center space-x-1 text-[10.5px] font-medium text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Realtime Live Queue</span>
        </div>
      </div>

      {/* Ticket Cards List (ครุภัณฑ์ + สถานที่ + สถานะ + ชื่อผู้แจ้ง) */}
      <div className="space-y-3">
        {paginatedTickets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-6">
            <AlertCircle className="w-7 h-7 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">ไม่พบคิวคำร้องที่ตรงกับเงื่อนไข</p>
            <p className="text-[11px] text-slate-400 mt-0.5">ลองปรับคำค้นหาหรือตัวกรองหมวดหมู่</p>
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
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/25 shadow-md -translate-y-0.5'
                    : isCompleted
                    ? 'bg-emerald-50/30 hover:bg-emerald-50/60 border-slate-200/90 hover:border-emerald-300'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Active Indicator Strip */}
                {isSelected && (
                  <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-blue-600 rounded-r-full shadow-xs" />
                )}

                {/* Header: Ticket No + Date & Status Badge */}
                <div className="flex items-center justify-between mb-2 pl-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-mono font-bold text-xs ${
                        isSelected ? 'text-blue-700' : 'text-slate-900'
                      }`}
                    >
                      #{t.ticketNumber}
                    </span>
                    <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {new Date(t.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <div>{getStatusBadge(t.status)}</div>
                </div>

                {/* 1. ครุภัณฑ์ (Equipment) - Prominent */}
                <div className="mb-2 pl-1">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Monitor className="w-3 h-3" />
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900 truncate tracking-tight">
                      {t.equipment?.name || t.category || 'ครุภัณฑ์ประจำห้อง'}
                    </h4>
                  </div>
                  {t.equipment?.assetCode && (
                    <span className="font-mono text-[10px] text-slate-400 pl-6 block">
                      รหัส: {t.equipment.assetCode}
                    </span>
                  )}
                </div>

                {/* 2. สถานที่ (Location) */}
                <div className="flex items-center space-x-1.5 text-xs text-slate-600 mb-2 pl-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="font-semibold truncate">
                    {t.location.building} • {t.location.roomName || t.location.roomNumber} ({t.location.floor})
                  </span>
                </div>

                {/* 3. ผู้แจ้งเหตุ (Reporter) & Tags */}
                <div className="pt-2 border-t border-slate-100 pl-1 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-700 truncate">
                      {t.reporter.firstName} {t.reporter.lastName}
                    </span>
                  </div>

                  {/* Priority & Condition Badges */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
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
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
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

      {/* Pagination Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="text-[11px] text-slate-400">
          แสดง {(currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, sortedTickets.length)} จาก {sortedTickets.length} คำร้อง
        </div>

        <div className="flex items-center space-x-1">
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
