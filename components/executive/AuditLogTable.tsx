'use client';

import React, { useState } from 'react';
import { Search, Printer, ShieldCheck, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuditLog } from '@/types';

interface AuditLogTableProps {
  logs: AuditLog[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesQuery =
      log.ticketNumber?.toLowerCase().includes(q) ||
      log.location?.toLowerCase().includes(q) ||
      log.problemSummary?.toLowerCase().includes(q) ||
      log.reporterName?.toLowerCase().includes(q) ||
      log.techName?.toLowerCase().includes(q);

    if (statusFilter === 'COMPLETED') return matchesQuery && log.status === 'เสร็จสิ้น';
    if (statusFilter === 'IN_PROGRESS') return matchesQuery && log.status !== 'เสร็จสิ้น';
    return matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>บันทึกประวัติการตรวจสอบย้อนหลัง (Audit Trail &amp; Log Compliance)</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            บันทึกการทำธุรกรรมและสถานะงานซ่อมแบบเรียลไทม์ตามเกณฑ์มาตรฐานสำหรับการตรวจประเมิน EdPEx
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange();
              }}
              placeholder="ค้นหาเลขคำร้อง, ห้อง, ผู้แจ้ง..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              handleFilterChange();
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none"
          >
            <option value="ALL">ทุกสถานะ ({logs.length})</option>
            <option value="COMPLETED">เสร็จสิ้นแล้ว</option>
            <option value="IN_PROGRESS">กำลังปฏิบัติงาน</option>
          </select>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>พิมพ์รายงาน EdPEx</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse table-fixed">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold text-[11px]">
              <th className="py-2.5 px-3 w-[16%]">เลขที่คำร้อง / วันเวลา</th>
              <th className="py-2.5 px-3 w-[26%]">สถานที่ / รายละเอียดปัญหา</th>
              <th className="py-2.5 px-3 w-[15%]">ผู้แจ้งเหตุ</th>
              <th className="py-2.5 px-3 w-[15%]">ช่างรับผิดชอบ</th>
              <th className="py-2.5 px-3 w-[12%]">พัสดุที่ใช้</th>
              <th className="py-2.5 px-3 w-[8%] text-center">สถานะ</th>
              <th className="py-2.5 px-3 w-[8%] text-center">ผลประเมิน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  ไม่พบบันทึกประวัติที่ตรงกับเงื่อนไข
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition text-[11.5px]">
                  <td className="py-2 px-3 truncate">
                    <div className="font-mono font-bold text-blue-700 truncate">{log.ticketNumber}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{log.changedAt}</div>
                  </td>

                  <td className="py-2 px-3">
                    <div className="font-bold text-slate-800 truncate">
                      <span>{log.location}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 line-clamp-1 break-words">{log.problemSummary}</p>
                  </td>

                  <td className="py-2 px-3 text-slate-700 font-medium truncate">
                    {log.reporterName}
                  </td>

                  <td className="py-2 px-3 truncate">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-medium text-slate-800 truncate">{log.techName}</span>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-mono text-[11px] text-slate-600 truncate">
                    {log.partsUsed}
                  </td>

                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ● {log.status || 'เสร็จสิ้น'}
                    </span>
                  </td>

                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1 text-amber-600 font-mono font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{log.rating?.toFixed(1) || '5.0'}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          แสดงข้อมูลลำดับที่ {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, filtered.length)} จากทั้งหมด {filtered.length} รายการ
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
            title="ก่อนหน้า"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
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
            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
            title="ถัดไป"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
