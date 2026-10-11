'use client';

import React, { useState } from 'react';
import { Package, CheckCircle2, AlertCircle, Check, X } from 'lucide-react';
import { SparePartRequest } from '@/types';

interface PartApprovalCardProps {
  requisition?: SparePartRequest;
  onActionComplete?: () => void;
}

export const PartApprovalCard: React.FC<PartApprovalCardProps> = ({
  requisition,
  onActionComplete,
}) => {
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>(
    requisition?.status || 'PENDING'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/spare-parts/requisitions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: requisition?.id || 'req_inv_092',
          action: 'APPROVE',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('APPROVED');
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/spare-parts/requisitions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: requisition?.id || 'req_inv_092',
          action: 'REJECT',
          notes: 'ขอตรวจสอบชิ้นส่วนชำรุดเดิมก่อนเบิกชิ้นใหม่',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('REJECTED');
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            UC-10: คำขอเบิกพัสดุและอุปกรณ์
          </span>
          <h3 className="text-base font-extrabold text-slate-900">
            ตรวจสอบและอนุมัติการตัดคลังพัสดุงานซ่อม
          </h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          3 รายการรออนุมัติ
        </span>
      </div>

      {/* Active Requisition Box */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-mono font-bold text-blue-700">
            REQ-INV-092 • ลิงก์คำร้อง: REQ-202505-0043
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              status === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-800'
                : status === 'REJECTED'
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {status === 'APPROVED'
              ? 'อนุมัติแล้ว'
              : status === 'REJECTED'
              ? 'ส่งกลับตรวจเพิ่ม'
              : 'รออนุมัติจ่าย'}
          </span>
        </div>

        <div className="text-[11px] text-slate-500 mb-3">
          ผู้ขอเบิก:{' '}
          <strong className="text-slate-800 font-medium">นายอนุชา ช่างเครือข่าย</strong>{' '}
          (เวลา 10:25 น.)
        </div>

        {/* Item List */}
        <div className="space-y-1.5 text-xs mb-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
            <span className="text-slate-800 font-medium">1. สาย LAN CAT6 UTP Patch Cord 3m</span>
            <span className="font-bold text-blue-700 font-mono">2 เส้น</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
            <span className="text-slate-800 font-medium">2. เต้ารับตัวเมีย RJ-45 Modular Jack</span>
            <span className="font-bold text-blue-700 font-mono">4 ตัว</span>
          </div>
        </div>

        {/* Stock Availability status */}
        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] flex items-center space-x-1.5 border border-emerald-200 mb-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            <strong>ตรวจสอบสต็อกกลาง:</strong> มีของพร้อมจ่ายในสต็อก (คงเหลือ 48 ชิ้น)
          </span>
        </div>

        {/* Action Buttons */}
        {status === 'PENDING' ? (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>อนุมัติการเบิก (Approve)</span>
            </button>

            <button
              type="button"
              onClick={handleReject}
              disabled={isProcessing}
              className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs transition"
            >
              ขอตรวจเพิ่ม
            </button>
          </div>
        ) : (
          <div className="text-center text-xs font-bold text-emerald-700 py-1">
            ✓ ดำเนินการเรียบร้อยแล้ว
          </div>
        )}
      </div>

      {/* History item */}
      <div className="p-3 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
            ✓
          </div>
          <div>
            <div className="font-bold text-slate-800">
              REQ-INV-091 • น้ำยาแอร์ R-32 (1 ถัง)
            </div>
            <div className="text-[10px] text-slate-400">
              อนุมัติแล้วเมื่อ 09:15 น. โดย เจ้าหน้าที่จิราพร
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          อนุมัติแล้ว
        </span>
      </div>
    </div>
  );
};
