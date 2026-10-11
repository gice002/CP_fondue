'use client';

import React, { useState, useEffect } from 'react';
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

interface CheckInRequisitionCardProps {
  ticketId?: string;
  onSubmitted?: () => void;
}

export const CheckInRequisitionCard: React.FC<CheckInRequisitionCardProps> = ({
  ticketId = 'tkt_0042',
  onSubmitted,
}) => {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [availableParts, setAvailableParts] = useState<SparePart[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('สำหรับเปลี่ยนซ่อมอุปกรณ์ตามคำร้อง');

  const [requestedItems, setRequestedItems] = useState<
    { id: string; partId: string; name: string; code: string; quantity: number; unit: string }[]
  >([]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadParts() {
      try {
        const res = await fetch('/api/spare-parts');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setAvailableParts(data.data);
          setSelectedPartId(data.data[0].id);
        }
      } catch (e) {
        console.error('Failed to load parts:', e);
      }
    }
    loadParts();
  }, []);

  const handleAddItem = () => {
    const part = availableParts.find((p) => p.id === selectedPartId);
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
          items: requestedItems.map((it) => ({
            partId: it.partId,
            quantity: it.quantity,
          })),
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        if (onSubmitted) onSubmitted();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการส่งคำขอเบิก');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถส่งคำขอเบิกอุปกรณ์ได้');
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
            บันทึกเข้าหน้างาน &amp; ส่งคำขอเบิกอุปกรณ์ (UC-10)
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
          สถานะ: กำลังปฏิบัติงาน (In Progress)
        </span>
      </div>

      {/* Part 1: Check-in On-site */}
      <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-extrabold text-slate-900">
              ระบบตรวจสอบตำแหน่งหน้างาน (On-site Wi-Fi Check-in)
            </span>
          </div>
          {isCheckedIn ? (
            <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              <span>ยืนยันพิกัดแล้ว</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">ยังไม่เช็คอิน</span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          เชื่อมต่อ Wi-Fi CoP-Secure @ อาคาร CP-01 ตรวจพบพิกัดตรงกับสถานที่แจ้งซ่อม
        </p>
      </div>

      {/* Part 2: Material Requisition Form */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Package className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-extrabold text-slate-900">
            รายการเบิกอะไหล่/เครื่องมือซ่อม (UC-10)
          </h4>
        </div>

        {/* Input Add Row */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 mb-3 space-y-2">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-8">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                เลือกอะไหล่ในคลัง
              </label>
              <select
                value={selectedPartId}
                onChange={(e) => setSelectedPartId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
              >
                {availableParts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.partCode} - {p.name} (คงเหลือ: {p.stockQuantity} {p.unit})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-4">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                จำนวน
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-bold text-center focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shrink-0"
                  title="เพิ่มรายการ"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* List of Added Items */}
        {requestedItems.length > 0 ? (
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 divide-y divide-slate-100">
            {requestedItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-white flex items-center justify-between text-xs hover:bg-slate-50 transition"
              >
                <div>
                  <div className="font-extrabold text-slate-900">{item.name}</div>
                  <div className="text-[10px] font-mono text-slate-500">{item.code}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-slate-800">
                    {item.quantity} {item.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-3 border border-dashed border-slate-200 rounded-xl mb-3">
            ยังไม่มีรายการขอเบิกอะไหล่
          </p>
        )}

        {/* Notes */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-slate-500 block mb-1">
            หมายเหตุการขอเบิก
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-hidden"
          />
        </div>

        {/* Submit Requisition Button */}
        {isSubmitted ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-emerald-800 flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ส่งคำขอเบิกไปยังเจ้าหน้าที่เรียบร้อยแล้ว (รอการอนุมัติ)</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={isSubmitting || requestedItems.length === 0}
            onClick={handleSubmitRequisition}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอเบิกอะไหล่ (UC-10)'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
