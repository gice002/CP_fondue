'use client';

import React, { useState } from 'react';
import { Package, Search, CheckCircle2, User, UserCheck, Clock, FileText, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { SparePartRequest } from '@/types';
import { InfoTooltip } from '@/components/common/InfoTooltip';

interface ApprovedRequisitionsTableProps {
  requisitions: SparePartRequest[];
}

export const ApprovedRequisitionsTable: React.FC<ApprovedRequisitionsTableProps> = ({
  requisitions,
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6; // 6 cards per page = 3 rows in 2-col grid

  // Filter only approved requisitions
  const approvedList = requisitions.filter((r) => r.status === 'APPROVED');

  const filtered = approvedList.filter((r) => {
    const q = search.toLowerCase();
    const item = r.items[0];
    return (
      r.requestNumber.toLowerCase().includes(q) ||
      r.ticketNumber.toLowerCase().includes(q) ||
      (item?.partName || '').toLowerCase().includes(q) ||
      (item?.partCode || '').toLowerCase().includes(q) ||
      `${r.requestedBy.firstName} ${r.requestedBy.lastName}`.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedReqs = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              บันทึกการเบิกจ่ายอะไหล่ (Approved Requisitions Log)
            </span>
            <InfoTooltip text="รายการประวัติอะไหล่และพัสดุที่ได้รับการอนุมัติเบิกจ่ายจากคลัง โดยตัดสต็อกและบันทึกผู้รับผิดชอบเรียบร้อยแล้ว" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
            <span>ประวัติการเบิกพัสดุที่อนุมัติแล้ว</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              อนุมัติแล้ว {approvedList.length} รายการ
            </span>
          </h3>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange();
            }}
            placeholder="ค้นหาชื่ออะไหล่, ช่าง, เลขที่ใบเบิก..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 font-medium focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition"
          />
        </div>
      </div>

      {/* Card Grid View (No Horizontal Scroll) */}
      {filtered.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedReqs.map((r) => {
              const item = r.items[0];
              const formattedDate = r.approvedAt
                ? new Date(r.approvedAt).toLocaleString('th-TH', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : new Date(r.createdAt).toLocaleString('th-TH', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all p-4 flex flex-col justify-between space-y-3.5"
                >
                  {/* Top Bar: Requisition Number + Ticket Ref + Status Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                        #{r.requestNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        อ้างอิง #{r.ticketNumber}
                      </span>
                    </div>

                    {/* Full Status Badge (Never Cut Off) */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs whitespace-nowrap shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>อนุมัติจ่ายพัสดุแล้ว</span>
                    </span>
                  </div>

                  {/* Middle Content: Part Info & Quantity */}
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {item?.partName || 'อะไหล่ซ่อมบำรุง'}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 pl-5.5">
                        รหัส: {item?.partCode || '-'}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-block font-mono font-extrabold text-xs sm:text-sm text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-2xs">
                        {item?.quantity} {item?.unit || 'ชิ้น'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Metadata: Tech, Approver, Timestamp */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600">
                    {/* Tech */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 block truncate">
                          {r.requestedBy.firstName} {r.requestedBy.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">ช่างผู้ขอเบิก</span>
                      </div>
                    </div>

                    {/* Approver */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 block truncate">
                          {r.approvedBy ? `${r.approvedBy.firstName} ${r.approvedBy.lastName}` : 'เจ้าหน้าที่พัสดุ'}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">ผู้อนุมัติจ่าย</span>
                      </div>
                    </div>

                    {/* Date/Time */}
                    <div className="flex items-center gap-1.5 min-w-0 sm:justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="font-mono text-[11px] text-slate-600 truncate">
                        {formattedDate}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              แสดงรายการ {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filtered.length)} จากทั้งหมด {filtered.length} รายการ
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                title="ก่อนหน้า"
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
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                title="ถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-600">ยังไม่มีรายการที่ได้รับการอนุมัติเบิกจ่าย</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            เมื่อมีช่างขอเบิกพัสดุและเจ้าหน้าที่กดอนุมัติ รายการจะปรากฏในบันทึกนี้โดยอัตโนมัติ
          </p>
        </div>
      )}
    </div>
  );
};
