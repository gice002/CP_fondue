'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Package,
  Send,
  CheckCircle2,
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
  const [isCheckedIn] = useState(true);
  const [availableParts, setAvailableParts] = useState<SparePart[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('สำหรับเปลี่ยนซ่อมอุปกรณ์ตามคำร้อง');

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

  const selectedPart = availableParts.find((p) => p.id === selectedPartId);

  const handleSubmitRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId) {
      alert('กรุณาเลือกรายการอุปกรณ์ที่ต้องการเบิก');
      return;
    }

    if (quantity <= 0) {
      alert('จำนวนที่เบิกต้องมากกว่า 0');
      return;
    }

    if (selectedPart && quantity > selectedPart.stockQuantity) {
      alert(`จำนวนที่ขอเบิก (${quantity}) เกินกว่าสต็อกคงเหลือ (${selectedPart.stockQuantity})`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/spare-parts/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          items: [
            {
              partId: selectedPartId,
              quantity,
            },
          ],
          notes: notes.trim(),
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            บันทึกเข้าหน้างานและขอเบิกอุปกรณ์ (On-site &amp; Requisition)
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          กำลังปฏิบัติงาน
        </span>
      </div>

      {/* Part 1: Check-in On-site */}
      <div className="mb-5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-800">
              ตรวจสอบตำแหน่งหน้างาน (On-site Check-in)
            </span>
          </div>
          {isCheckedIn ? (
            <span className="flex items-center space-x-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-emerald-600/20">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>ยืนยันพิกัดแล้ว</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">ยังไม่เช็คอิน</span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          เชื่อมต่อ Wi-Fi CoP-Secure @ อาคาร SC-09 พิกัดตรงกับสถานที่แจ้งซ่อม
        </p>
      </div>

      {/* Part 2: Material Requisition Form - 1 Item Per Requisition Contract */}
      <form onSubmit={handleSubmitRequisition}>
        <div className="flex items-center space-x-2 mb-3">
          <Package className="w-4 h-4 text-slate-500" />
          <h4 className="text-xs font-semibold text-slate-900">
            ขอเบิกอะไหล่ (1 ชนิดต่อ 1 ใบเบิก)
          </h4>
        </div>

        {/* Input Add Row */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 mb-3 space-y-3">
          <div>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                จำนวนที่ต้องการเบิก ({selectedPart?.unit || 'หน่วย'})
              </label>
              <input
                type="number"
                min="1"
                max={selectedPart ? selectedPart.stockQuantity : 100}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-bold text-center focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                คงเหลือในคลัง
              </label>
              <div className="p-2 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-700 text-center">
                {selectedPart ? `${selectedPart.stockQuantity} ${selectedPart.unit}` : '-'}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">
              หมายเหตุการขอเบิก
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ระบุเหตุผลในการเบิก เช่น เพื่อเปลี่ยนสายสัญญาณชำรุด"
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>
        </div>

        {/* Submit Requisition Button */}
        {isSubmitted ? (
          <div className="p-3 rounded-xl bg-emerald-50 text-center text-xs font-medium text-emerald-800 flex items-center justify-center space-x-1.5 ring-1 ring-inset ring-emerald-600/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ส่งคำขอเบิกอะไหล่เรียบร้อยแล้ว (รอเจ้าหน้าที่พิจารณาอนุมัติ)</span>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting || !selectedPartId}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-xs transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอเบิกอะไหล่'}</span>
          </button>
        )}
      </form>
    </div>
  );
};
