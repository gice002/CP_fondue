'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Wifi,
  Package,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { SparePart } from '@/types';
import { MOCK_SPARE_PARTS } from '@/data/mockData';

interface CheckInRequisitionCardProps {
  ticketId?: string;
}

export const CheckInRequisitionCard: React.FC<CheckInRequisitionCardProps> = ({
  ticketId = 'tkt_0042',
}) => {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [selectedPartId, setSelectedPartId] = useState('prt_01');
  const [quantity, setQuantity] = useState(10);

  const [requestedItems, setRequestedItems] = useState([
    {
      id: 'it_1',
      partId: 'prt_01',
      name: 'หัวคอนเน็กเตอร์ RJ-45 Cat6 Shielded',
      code: 'MAT-NET-008',
      quantity: 10,
      unit: 'ชิ้น',
    },
    {
      id: 'it_2',
      partId: 'prt_07',
      name: 'หัวทดสอบสัญญาณสาย LAN (อุปกรณ์ยืมเฉพาะกิจ)',
      code: 'TOOL-NT-02',
      quantity: 1,
      unit: 'ชุด',
    },
  ]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = () => {
    const part = MOCK_SPARE_PARTS.find((p) => p.id === selectedPartId);
    if (!part) return;

    setRequestedItems([
      ...requestedItems,
      {
        id: `it_${Date.now()}`,
        partId: part.id,
        name: part.name,
        code: part.partCode,
        quantity,
        unit: part.unit,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setRequestedItems(requestedItems.filter((i) => i.id !== id));
  };

  const handleSubmitRequisition = async () => {
    if (requestedItems.length === 0) {
      alert('กรุณาเพิ่มรายการอุปกรณ์ที่ต้องการเบิก');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/spare-parts/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          ticketNumber: 'REQ-202505-0042',
          technicianId: 'usr_tech_01',
          items: requestedItems.map((it) => ({
            partId: it.partId,
            quantity: it.quantity,
          })),
          notes: 'สำหรับเปลี่ยนซ่อมสายสัญญาณและเต้ารับแล็บ 405',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            บันทึกเข้าหน้างาน &amp; ส่งคำขอเบิกอุปกรณ์
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
          สถานะ: กำลังปฏิบัติงาน (In Progress)
        </span>
      </div>

      {/* Part 1: Check-in On-site */}
      <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>บันทึกเวลาเข้าตรวจสถานที่จริง (Check-in On-site)</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>บันทึกแล้ว 14:32 น.</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">วันที่และเวลาเข้าตรวจสภาพหน้างาน</span>
            <div className="font-mono font-bold text-slate-800 bg-white p-2 rounded-lg border border-slate-200 mt-1">
              15 พฤษภาคม 2568 - 14:32:18 น.
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block">พิกัด / การยืนยันตำแหน่ง</span>
            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 mt-1 font-mono text-[11px]">
              <span className="flex items-center space-x-1.5 text-slate-800 font-bold">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>CP KKU Wi-Fi Beacon: AP-405-N</span>
              </span>
              <span className="text-emerald-700 font-bold">ยืนยันอัตโนมัติ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Material Requisition */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
            <Package className="w-4 h-4 text-blue-600" />
            <span>สร้างใบเบิกอุปกรณ์ซ่อมบำรุง (Material Requisition)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            คลัง: สโตร์กลาง CoP-Wh01
          </span>
        </div>

        {/* Add Part inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3">
          <div className="sm:col-span-7">
            <select
              value={selectedPartId}
              onChange={(e) => setSelectedPartId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {MOCK_SPARE_PARTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit}) - คงเหลือ {p.stockQuantity}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-center outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มรายการ</span>
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2 mb-4">
          {requestedItems.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-800">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">รหัส: {item.code}</span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="font-mono font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {item.quantity} {item.unit}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Requisition Status & Submit */}
        {isSubmitted ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              ส่งคำขอเบิกอุปกรณ์เรียบร้อยแล้ว (รหัสคำขอ: REQ-INV-092 รอเจ้าหน้าที่อนุมัติ)
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-slate-500">
              สถานะคำขอเบิก: พร้อมส่งให้หัวหน้างาน/เจ้าหน้าที่พัสดุอนุมัติ
            </span>

            <button
              type="button"
              onClick={handleSubmitRequisition}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 active:scale-98 text-white font-bold text-xs shadow-md shadow-cyan-700/20 flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอเบิกอุปกรณ์ (Submit Request)'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
