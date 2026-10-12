'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Eye, Radio, Check } from 'lucide-react';
import { Ticket } from '@/types';

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

  const filteredTickets = tickets.filter((t) => {
    // Exclude cancelled tickets from Admin dispatch queue
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
      {/* Search & Filters */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 mb-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหารหัสคำร้อง, ชื่อผู้แจ้ง, ครุภัณฑ์, ห้อง..."
            className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ประเภทครุภัณฑ์ (ทั้งหมด)</option>
              <option value="ระบบคอมพิวเตอร์และเครือข่าย">คอมพิวเตอร์และเครือข่าย</option>
              <option value="ระบบปรับอากาศ">ระบบปรับอากาศ</option>
              <option value="ระบบไฟฟ้าและแสงสว่าง">ไฟฟ้าและแสงสว่าง</option>
            </select>
          </div>

          <div>
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">อาคารทั้งหมด (SC-09)</option>
              <option value="SC-09">SC-09 อาคารวิทยวิภาส</option>
            </select>
          </div>

          <div>
            <select className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500">
              <option>รอดำเนินการ / มอบหมาย</option>
              <option>กำลังปฏิบัติงาน</option>
              <option>เสร็จสิ้นแล้ว</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              className="flex-1 flex items-center justify-center space-x-1 p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 font-medium transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ตัวกรองละเอียด</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
                setBuildingFilter('ALL');
              }}
              className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-500 transition"
              title="รีเซ็ต"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-extrabold text-slate-900">
            ตารางรายการคำร้องแจ้งซ่อมใหม่ (SC-09 อาคารวิทยวิภาส)
          </h3>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            {filteredTickets.length} รายการรอดำเนินการ
          </span>
        </div>

        <div className="flex items-center space-x-1 text-[11px] font-medium text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>สดผ่าน WebSocket</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
              <th className="py-2.5 px-3">รหัส / วันที่</th>
              <th className="py-2.5 px-3">ผู้แจ้ง &amp; สังกัด</th>
              <th className="py-2.5 px-3">สถานที่</th>
              <th className="py-2.5 px-3">ครุภัณฑ์ / อาการขัดข้อง</th>
              <th className="py-2.5 px-3 text-center">Tags / ความสำคัญ</th>
              <th className="py-2.5 px-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTickets.map((t) => {
              const isSelected = t.id === selectedTicketId;
              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTicket(t)}
                  className={`cursor-pointer transition ${
                    isSelected ? 'bg-blue-50/80 ring-1 ring-blue-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="font-mono font-black text-blue-600 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{t.ticketNumber}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {new Date(t.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-800">
                      {t.reporter.firstName} {t.reporter.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {t.reporter.departmentName || 'นักศึกษา / บุคลากร'}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-200/70 font-mono font-bold text-[11px] text-slate-800 mb-0.5">
                      {t.location.building.slice(0, 5)} {t.location.roomNumber}
                    </span>
                    <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                      {t.location.roomName}
                    </div>
                  </td>

                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-bold text-slate-900 truncate">
                      {t.equipment?.name || t.category}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>
                  </td>

                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {t.tags && t.tags.length > 0 ? (
                        t.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
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
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          งานทั่วไป
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {isSelected ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] shadow-xs">
                        <Check className="w-3 h-3" />
                        <span>กำลังเลือก</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(t);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 font-semibold text-[11px] border border-slate-200 transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>ตรวจดู</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div>แสดง 1-{filteredTickets.length} จาก 5 คำร้องใหม่</div>
        <div className="flex items-center space-x-1 font-mono">
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold">1</span>
        </div>
      </div>
    </div>
  );
};
