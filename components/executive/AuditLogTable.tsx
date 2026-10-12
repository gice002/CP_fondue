'use client';

import React, { useState } from 'react';
import { Search, Printer, ShieldCheck, Star } from 'lucide-react';
import { AuditLog } from '@/types';

interface AuditLogTableProps {
  logs: AuditLog[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    return (
      log.ticketNumber?.toLowerCase().includes(q) ||
      log.location?.toLowerCase().includes(q) ||
      log.problemSummary?.toLowerCase().includes(q) ||
      log.reporterName?.toLowerCase().includes(q) ||
      log.techName?.toLowerCase().includes(q)
    );
  });

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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขคำร้อง, ห้อง, ผู้แจ้ง..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none">
            <option>ดำเนินการเสร็จสิ้น (129)</option>
            <option>กำลังปฏิบัติงาน</option>
            <option>ทั้งหมด</option>
          </select>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>พิมพ์รายงาน EdPEx</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
              <th className="py-2.5 px-3">เลขที่คำร้อง / วันเวลา</th>
              <th className="py-2.5 px-3">สถานที่ / รายละเอียดปัญหา</th>
              <th className="py-2.5 px-3">ผู้แจ้งเหตุ</th>
              <th className="py-2.5 px-3">ช่างรับผิดชอบ</th>
              <th className="py-2.5 px-3">พัสดุที่ใช้</th>
              <th className="py-2.5 px-3 text-center">สถานะ</th>
              <th className="py-2.5 px-3 text-center">ผลประเมิน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-3">
                  <div className="font-mono font-bold text-blue-700">{log.ticketNumber}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{log.changedAt}</div>
                </td>

                <td className="py-3 px-3 max-w-xs">
                  <div className="font-bold text-slate-800 flex items-center space-x-1">
                    <span>{log.location}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{log.problemSummary}</p>
                </td>

                <td className="py-3 px-3 text-slate-700 font-medium">
                  {log.reporterName}
                </td>

                <td className="py-3 px-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="font-medium text-slate-800">{log.techName}</span>
                  </div>
                </td>

                <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                  {log.partsUsed}
                </td>

                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ● {log.status || 'เสร็จสิ้น'}
                  </span>
                </td>

                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center space-x-1 text-amber-600 font-mono font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{log.rating?.toFixed(1) || '5.0'}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div>
          แสดงข้อมูลลำดับที่ 1 - {filtered.length} จากทั้งหมด 129 รายการที่สมบูรณ์ (รอบเดือน พ.ค. 2568)
        </div>
        <div className="flex items-center space-x-1">
          <button className="px-2 py-0.5 rounded border border-slate-200">ก่อนหน้า</button>
          <button className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold">1</button>
          <button className="px-2 py-0.5 rounded border border-slate-200">2</button>
          <button className="px-2 py-0.5 rounded border border-slate-200">3</button>
          <span className="px-1 text-slate-300">...</span>
          <button className="px-2 py-0.5 rounded border border-slate-200">13</button>
          <button className="px-2 py-0.5 rounded border border-slate-200">ถัดไป</button>
        </div>
      </div>
    </div>
  );
};
