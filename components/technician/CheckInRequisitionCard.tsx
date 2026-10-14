'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wifi,
  Package,
  Send,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { SparePart, Ticket } from '@/types';
import {
  getCompatibleSpareParts,
  PartWithCompatibility,
} from '@/services/equipmentPartsMapping';
import {
  SparePartCheckboxCombobox,
  SelectedPartItem,
} from './SparePartCheckboxCombobox';

interface CheckInRequisitionCardProps {
  ticketId?: string;
  ticket?: Ticket | null;
  onSubmitted?: () => void;
}

export const CheckInRequisitionCard: React.FC<CheckInRequisitionCardProps> = ({
  ticketId = 'tkt_0042',
  ticket,
  onSubmitted,
}) => {
  const [isCheckedIn] = useState(true);
  const [availableParts, setAvailableParts] = useState<SparePart[]>([]);
  const [filterMode, setFilterMode] = useState<'compatible_only' | 'all'>('compatible_only');
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedPartItem>>({});
  const [notes, setNotes] = useState('สำหรับเปลี่ยนซ่อมอุปกรณ์ตามคำร้อง');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load parts from inventory
  useEffect(() => {
    async function loadParts() {
      try {
        const res = await fetch('/api/spare-parts');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAvailableParts(data.data);
        }
      } catch (e) {
        console.error('Failed to load parts:', e);
      }
    }
    loadParts();
  }, []);

  // Compute compatible parts based on current active ticket's equipment
  const { allPartsWithCompatibility, equipmentLabel, hasEquipment } = useMemo(() => {
    return getCompatibleSpareParts(ticket, availableParts);
  }, [ticket, availableParts]);

  // Reset selected items when active ticket changes
  useEffect(() => {
    setSelectedItems({});
    setIsSubmitted(false);
    setErrorMessage(null);
    setFilterMode('compatible_only');
  }, [ticket?.id]);

  // Handle toggling checkbox on an item
  const handleToggleItem = (part: PartWithCompatibility) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[part.id]) {
        delete copy[part.id];
      } else {
        copy[part.id] = {
          partId: part.id,
          partCode: part.partCode,
          partName: part.name,
          quantity: 1,
          unit: part.unit,
          maxStock: part.stockQuantity,
        };
      }
      return copy;
    });
  };

  // Handle quantity change for a checked item
  const handleChangeQuantity = (partId: string, quantity: number) => {
    setSelectedItems((prev) => {
      if (!prev[partId]) return prev;
      return {
        ...prev,
        [partId]: {
          ...prev[partId],
          quantity,
        },
      };
    });
  };

  // Submit requisition for all checked items
  const handleSubmitRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const itemsToSubmit = Object.values(selectedItems);
    if (itemsToSubmit.length === 0) {
      setErrorMessage('กรุณาเลือกอะไหล่ใน ComboBox อย่างน้อย 1 รายการ');
      return;
    }

    // Validate quantities against stock
    for (const item of itemsToSubmit) {
      if (item.quantity <= 0) {
        setErrorMessage(`จำนวนของ ${item.partCode} ต้องมากกว่า 0`);
        return;
      }
      if (item.quantity > item.maxStock) {
        setErrorMessage(
          `จำนวนที่ขอเบิก ${item.partCode} (${item.quantity}) เกินกว่าสต็อกคงเหลือ (${item.maxStock})`
        );
        return;
      }
    }

    const actualTicketId = ticket?.id || ticketId;
    setIsSubmitting(true);

    try {
      // Submit requisition for each selected item
      for (const item of itemsToSubmit) {
        const res = await fetch('/api/spare-parts/requisitions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketId: actualTicketId,
            items: [
              {
                partId: item.partId,
                quantity: item.quantity,
              },
            ],
            notes: notes.trim(),
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || `เกิดข้อผิดพลาดในการส่งคำขอเบิก ${item.partCode}`);
        }
      }

      setSubmittedCount(itemsToSubmit.length);
      setIsSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'ไม่สามารถส่งคำขอเบิกอุปกรณ์ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            บันทึกเข้าหน้างานและขอเบิกอุปกรณ์ (On-site &amp; Requisition)
          </h3>
          <span className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium">
            คำร้อง #{ticket?.ticketNumber || ticketId}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          กำลังปฏิบัติงาน
        </span>
      </div>

      {/* Part 1: Check-in On-site */}
      <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11.5px] sm:text-xs font-semibold text-slate-800">
              ตรวจสอบตำแหน่งหน้างาน (On-site Check-in)
            </span>
          </div>
          {isCheckedIn ? (
            <span className="flex items-center space-x-1 text-[10.5px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-emerald-600/20">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>ยืนยันพิกัดแล้ว</span>
            </span>
          ) : (
            <span className="text-[10.5px] sm:text-[11px] text-slate-400">ยังไม่เช็คอิน</span>
          )}
        </div>
        <p className="text-[10.5px] sm:text-[11px] text-slate-500">
          เชื่อมต่อ Wi-Fi CoP-Secure @ อาคาร SC-09 พิกัดตรงกับสถานที่แจ้งซ่อม{' '}
          {ticket?.location ? `ห้อง ${ticket.location.roomNumber}` : ''}
        </p>
      </div>

      {/* Part 2: Material Requisition Form with Checkbox Combobox */}
      <form onSubmit={handleSubmitRequisition} className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
            <h4 className="text-[11.5px] sm:text-xs font-bold text-slate-900">
              เลือกอะไหล่ที่ต้องการเบิก (Combobox &amp; Checkbox)
            </h4>
          </div>
        </div>

        {/* Checkbox Combobox with Search and Equipment Compatibility */}
        <SparePartCheckboxCombobox
          parts={allPartsWithCompatibility}
          selectedItems={selectedItems}
          onToggleItem={handleToggleItem}
          onChangeQuantity={handleChangeQuantity}
          equipmentLabel={equipmentLabel}
          hasEquipment={hasEquipment}
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
          disabled={isSubmitting || isSubmitted}
        />

        {/* Notes */}
        <div>
          <label className="text-[10.5px] sm:text-[11px] font-bold text-slate-500 block mb-1">
            หมายเหตุการขอเบิก
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting || isSubmitted}
            placeholder="ระบุเหตุผลในการเบิก เช่น เพื่อเปลี่ยนสายสัญญาณชำรุด หรือเปลี่ยนพาวเวอร์ซัพพลาย"
            className="w-full text-[11.5px] sm:text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
          />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Requisition Button */}
        {isSubmitted ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold">
                ส่งคำขอเบิกอะไหล่จำนวน {submittedCount} รายการเรียบร้อยแล้ว (รอเจ้าหน้าที่พิจารณาอนุมัติ)
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setSelectedItems({});
              }}
              className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ขอเบิกรายการอื่นเพิ่ม</span>
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting || selectedCount === 0}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-[11.5px] sm:text-xs flex items-center justify-center space-x-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังส่งคำขอเบิกอะไหล่...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>
                  {selectedCount === 0
                    ? 'กรุณาเลือกอะไหล่ก่อนส่งคำขอ'
                    : `ส่งคำขอเบิกอะไหล่ (${selectedCount} รายการ)`}
                </span>
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
};
