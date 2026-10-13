'use client';

import React, { useState, useEffect } from 'react';
import { Package, Check, X, RefreshCw } from 'lucide-react';
import { SparePartRequest } from '@/types';
import { InfoTooltip } from '@/components/common/InfoTooltip';

interface PartApprovalCardProps {
  requisition?: SparePartRequest;
  onActionComplete?: () => void;
}

export const PartApprovalCard: React.FC<PartApprovalCardProps> = ({
  requisition: propReq,
  onActionComplete,
}) => {
  const [currentReq, setCurrentReq] = useState<SparePartRequest | null>(propReq || null);
  const [pendingList, setPendingList] = useState<SparePartRequest[]>([]);
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>(
    propReq?.status || 'PENDING'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPendingRequisitions = async () => {
    try {
      const res = await fetch('/api/spare-parts/requisitions?status=PENDING', {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPendingList(data.data);
        if (data.data.length > 0) {
          setCurrentReq(data.data[0]);
          setStatus(data.data[0].status);
        } else {
          setCurrentReq(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (propReq) {
      setCurrentReq(propReq);
      setStatus(propReq.status);
    } else {
      fetchPendingRequisitions();
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
        // Delay slightly before loading next pending requisition
        setTimeout(() => {
          fetchPendingRequisitions();
        }, 800);
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
        setTimeout(() => {
          fetchPendingRequisitions();
        }, 800);
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 text-center text-xs text-slate-400">
        <Package className="w-6 h-6 text-slate-300 mx-auto mb-2" />
        ไม่มีคำขอเบิกอะไหล่ที่รอการอนุมัติในขณะนี้
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              คำขอเบิกอุปกรณ์ (Material Requisition)
            </span>
            <InfoTooltip text="คำขอเบิกพัสดุจากช่างเทคนิคที่หน้างาน เมื่อกด 'อนุมัติเบิกพัสดุ' ระบบจะตัดยอดคงเหลือในคลังพัสดุอัตโนมัติ และบันทึกประวัติลงตารางการเบิกจ่าย" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            พิจารณาอนุมัติการเบิก #{currentReq.requestNumber}
            {pendingList.length > 1 && (
              <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                (มีค้างอีก {pendingList.length - 1} รายการ)
              </span>
            )}
          </h3>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'APPROVED'
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
              : status === 'REJECTED'
              ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
              : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
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
        <div className="p-3 bg-slate-50/70 rounded-xl space-y-1.5 border border-slate-200/70">
          <div className="flex justify-between">
            <span className="text-slate-500">อ้างอิงคำร้อง:</span>
            <span className="font-mono font-medium text-slate-900">#{currentReq.ticketNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ช่างผู้ขอเบิก:</span>
            <span className="font-semibold text-slate-900">
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
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400 block">รายการอะไหล่ที่ขอเบิก:</span>
          {currentReq.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100"
            >
              <div>
                <span className="font-semibold text-slate-800 block">{item.partName}</span>
                <span className="text-[10px] font-mono text-slate-400">{item.partCode}</span>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
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
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs flex items-center justify-center space-x-1 transition disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            <span>ปฏิเสธ</span>
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleApprove}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center space-x-1 shadow-xs transition disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>อนุมัติเบิกพัสดุ</span>
          </button>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
          คำขอนี้ได้รับการดำเนินการแล้ว
        </div>
      )}
    </div>
  );
};
