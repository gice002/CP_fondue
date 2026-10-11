'use client';

import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  Upload,
  Check,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { Ticket } from '@/types';

interface CloseJobCardProps {
  ticket?: Ticket;
  onClosed?: () => void;
}

export const CloseJobCard: React.FC<CloseJobCardProps> = ({
  ticket,
  onClosed,
}) => {
  const [repairNotes, setRepairNotes] = useState(
    'ตรวจสอบและซ่อมแซมเรียบร้อยแล้ว ทดสอบการทำงานไม่มีข้อผิดพลาด'
  );
  const [proofUrls, setProofUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isClosed, setIsClosed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no ticket, or ticket not in progress, don't show close card
  if (!ticket || ticket.status !== 'IN_PROGRESS') {
    return null;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data?.fileUrl) {
        setProofUrls([...proofUrls, data.data.fileUrl]);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์รูปภาพ');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถอัปโหลดไฟล์ได้');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCloseJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairNotes.trim()) {
      alert('กรุณากรอกบันทึกสรุปผลการซ่อม (BR8)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOSE',
          repairNotes: repairNotes.trim(),
          afterProofUrls: proofUrls,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsClosed(true);
        if (onClosed) onClosed();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการปิดงานซ่อม');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถปิดงานซ่อมได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isClosed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-base text-slate-900">
          ปิดงานซ่อม {ticket.ticketNumber} เรียบร้อยแล้ว (BR8, BR9)
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          ระบบบันทึกสถานะเป็น &quot;ดำเนินการเสร็จสิ้น&quot; และส่งแจ้งเตือนประเมินความพึงพอใจแล้ว
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <h3 className="text-base font-extrabold text-slate-900">
            บันทึกผลและปิดงานซ่อม
          </h3>
        </div>
        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {ticket.ticketNumber}
        </span>
      </div>

      <form onSubmit={handleCloseJob} className="space-y-4">
        {/* Repair Notes Input (BR8) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-800">
              บันทึกผลการซ่อมและวิธีแก้ไข (Repair Notes)
            </label>
            <span className="text-[10px] text-red-500 font-bold">* บังคับ (BR8)</span>
          </div>
          <textarea
            rows={3}
            value={repairNotes}
            onChange={(e) => setRepairNotes(e.target.value)}
            placeholder="ระบุสาเหตุของปัญหา รายการที่ซ่อมแซม ผลการทดสอบการใช้งาน..."
            className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition resize-none leading-relaxed"
          />
        </div>

        {/* Upload Proof Photos (BR8) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800">
              แนบรูปถ่ายหลักฐานยืนยันหลังซ่อมเสร็จ (After Proof)
            </label>
            <span className="text-[10px] text-slate-500">
              แนบแล้ว {proofUrls.length} ภาพ
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            {proofUrls.map((url, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group bg-slate-100">
                <img src={url} alt={`proof ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setProofUrls(proofUrls.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/40 flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพยืนยันหลังซ่อม'}</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{isSubmitting ? 'กำลังบันทึกและปิดงาน...' : 'ยืนยันและปิดงานซ่อม (BR9)'}</span>
        </button>
      </form>
    </div>
  );
};
