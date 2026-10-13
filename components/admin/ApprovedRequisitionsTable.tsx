'use client';

import React, { useState } from 'react';
import { Package, Search, CheckCircle2, User, Clock, FileText } from 'lucide-react';
import { SparePartRequest } from '@/types';
import { InfoTooltip } from '@/components/common/InfoTooltip';

interface ApprovedRequisitionsTableProps {
  requisitions: SparePartRequest[];
}

export const ApprovedRequisitionsTable: React.FC<ApprovedRequisitionsTableProps> = ({
  requisitions,
}) => {
  const [search, setSearch] = useState('');

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              บันทึกการเบิกจ่ายอะไหล่ (Approved Requisitions Log)
            </span>
            <InfoTooltip text="ตารางสรุปประวัติรายการอะไหล่และพัสดุที่ได้รับการอนุมัติเบิกจ่ายจากคลังพัสดุ โดยตัดสต็อกและบันทึกผู้รับผิดชอบเรียบร้อยแล้ว" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
            <span>ตารางรวมประวัติการเบิกพัสดุที่อนุมัติแล้ว</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              อนุมัติแล้ว {approvedList.length} รายการ
            </span>
          </h3>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่ออะไหล่, ช่าง, เลขที่ใบเบิก..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 font-medium focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs shadow-2xs">
              <tr className="border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-3">เลขที่ใบเบิก</th>
                <th className="py-2.5 px-3">อ้างอิงใบงาน</th>
                <th className="py-2.5 px-3">รายการพัสดุ / รหัสอะไหล่</th>
                <th className="py-2.5 px-3 text-center">จำนวนที่เบิก</th>
                <th className="py-2.5 px-3">ช่างผู้ขอเบิก</th>
                <th className="py-2.5 px-3">ผู้อนุมัติ</th>
                <th className="py-2.5 px-3 text-center">วันที่และเวลาอนุมัติ</th>
                <th className="py-2.5 px-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((r) => {
                const item = r.items[0];
                return (
                  <tr key={r.id} className="hover:bg-emerald-50/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      #{r.requestNumber}
                    </td>

                    <td className="py-3 px-3 font-mono text-blue-600 font-semibold whitespace-nowrap">
                      #{r.ticketNumber}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">
                        {item?.partName || 'อะไหล่ซ่อมบำรุง'}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {item?.partCode || '-'}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item?.quantity} {item?.unit || 'ชิ้น'}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{r.requestedBy.firstName} {r.requestedBy.lastName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">ทีมช่างเทคนิค</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-700">
                        {r.approvedBy ? `${r.approvedBy.firstName} ${r.approvedBy.lastName}` : 'เจ้าหน้าที่พัสดุ'}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {r.approvedAt
                        ? new Date(r.approvedAt).toLocaleString('th-TH', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : new Date(r.createdAt).toLocaleString('th-TH', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>อนุมัติจ่ายพัสดุแล้ว</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-600">ยังไม่มีรายการที่ได้รับการอนุมัติเบิกจ่าย</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            เมื่อมีช่างขอเบิกพัสดุและเจ้าหน้าที่กดอนุมัติ รายการจะปรากฏในตารางบันทึกนี้โดยอัตโนมัติ
          </p>
        </div>
      )}
    </div>
  );
};
