'use client';

import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, AlertCircle, Check, X } from 'lucide-react';
import { SparePartRequest } from '@/types';

interface PartApprovalCardProps {
  requisition?: SparePartRequest;
  onActionComplete?: () => void;
}

export const PartApprovalCard: React.FC<PartApprovalCardProps> = ({
  requisition: propReq,
  onActionComplete,
}) => {
  const [currentReq, setCurrentReq] = useState<SparePartRequest | null>(propReq || null);
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>(
    propReq?.status || 'PENDING'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (propReq) {
      setCurrentReq(propReq);
      setStatus(propReq.status);
    } else {
      // Fetch latest pending requisition from real database
      async function fetchLatestPending() {
        try {
          const res = await fetch('/api/spare-parts/requisitions?status=PENDING');
          const data = await res.json();
          if (data.success && data.data.length > 0) {
            setCurrentReq(data.data[0]);
            setStatus(data.data[0].status);
          }
        } catch (e) {
          console.error(e);
        }
      }
      fetchLatestPending();
    }
  }, [propReq]);

  const handleApprove = async () => {
    if (!currentReq) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/spare-parts/requisitions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentReq.id,
          action: 'APPROVE',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('APPROVED');
        if (onActionComplete) onActionComplete();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการอนุมัติเบิกอะไหล่');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่ออนุมัติได้');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!currentReq) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/spare-parts/requisitions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentReq.id,
          action: 'REJECT',
          notes: 'ขอตรวจสอบชิ้นส่วนชำรุดเดิมก่อนเบิกชิ้นใหม่',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('REJECTED');
        if (onActionComplete) onActionComplete();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการปฏิเสธคำขอ');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อปฏิเสธคำขอได้');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentReq) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 text-center text-xs text-slate-400">
        <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        ไม่มีคำขอเบิกอะไหล่ที่รอการอนุมัติในขณะนี้
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            UC-10: คำขอเบิกพัสดุและอุปกรณ์
          </span>
          <h3 className="text-base font-extrabold text-slate-900">
            พิจารณาอนุมัติการเบิก ({currentReq.requestNumber})
          </h3>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            status === 'APPROVED'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : status === 'REJECTED'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {status === 'APPROVED'
            ? 'อนุมัติแล้ว'
            : status === 'REJECTED'
            ? 'ไม่อนุมัติ'
            : 'รอการอนุมัติ'}
        </span>
      </div>

      {/* Requisition Details */}
      <div className="space-y-3 mb-4 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200/70">
          <div className="flex justify-between">
            <span className="text-slate-500">อ้างอิงคำร้องซ่อม:</span>
            <span className="font-mono font-bold text-slate-900">{currentReq.ticketNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ช่างผู้ขอเบิก:</span>
            <span className="font-bold text-slate-900">
              {currentReq.requestedBy.firstName} {currentReq.requestedBy.lastName}
            </span>
          </div>
          {currentReq.notes && (
            <div className="flex justify-between">
              <span className="text-slate-500">หมายเหตุ:</span>
              <span className="text-slate-700">{currentReq.notes}</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-500">รายการอะไหล่ที่ขอเบิก:</span>
          {currentReq.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-lg border border-slate-100"
            >
              <div>
                <span className="font-bold text-slate-900 block">{item.partName}</span>
                <span className="text-[10px] font-mono text-slate-500">{item.partCode}</span>
              </div>
              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {item.quantity} {item.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {status === 'PENDING' ? (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleReject}
            className="py-2.5 px-3 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs flex items-center justify-center space-x-1 transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span>ไม่อนุมัติ (Reject)</span>
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleApprove}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-xs transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>อนุมัติเบิก (Approve)</span>
          </button>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
          รายการนี้ได้รับการดำเนินการเรียบร้อยแล้ว
        </div>
      )}
    </div>
  );
};
