'use client';

import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  Upload,
  Check,
  X,
  Camera,
} from 'lucide-react';
import { Ticket } from '@/types';
import { triggerSuccessConfetti } from '@/lib/confetti';
import { InAppPermissionModal, PermissionType } from '@/components/common/InAppPermissionModal';
import { WebPermissionService } from '@/lib/permissionService';

interface CloseJobCardProps {
  ticket?: Ticket | null;
  technicianId?: string;
  onClosed?: () => void;
}

export const CloseJobCard: React.FC<CloseJobCardProps> = ({
  ticket,
  technicianId,
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

  // In-App Modal Dialog State (Zero browser alerts)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: PermissionType;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onAllow: () => void;
    onDeny: () => void;
  } | null>(null);

  React.useEffect(() => {
    setIsClosed(false);
  }, [ticket?.id]);

  // If no ticket, or ticket not in progress, don't show close card
  if (!ticket || ticket.status !== 'IN_PROGRESS') {
    return null;
  }

  const handleRequestUploadPhoto = () => {
    if (WebPermissionService.isGranted('camera_photos')) {
      fileInputRef.current?.click();
    } else {
      setModalConfig({
        isOpen: true,
        type: 'camera_photos',
        title: 'ขออนุญาตเข้าถึงกล้องและคลังรูปภาพ',
        description: 'ระบบจำเป็นต้องขอสิทธิ์เข้าถึงกล้องและคลังรูปภาพ เพื่อใช้บันทึกภาพถ่ายยืนยันผลงานการซ่อมแซมเสร็จสิ้น',
        confirmText: 'อนุญาตการเข้าถึง (Allow Access)',
        cancelText: 'ไม่อนุญาต',
        onAllow: () => {
          WebPermissionService.grant('camera_photos');
          setModalConfig(null);
          setTimeout(() => {
            fileInputRef.current?.click();
          }, 100);
        },
        onDeny: () => setModalConfig(null),
      });
    }
  };

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
        setModalConfig({
          isOpen: true,
          type: 'confirm_action',
          title: 'อัปโหลดรูปภาพไม่สำเร็จ',
          description: data.error || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์รูปภาพหลักฐาน',
          confirmText: 'ตกลง',
          onAllow: () => setModalConfig(null),
          onDeny: () => setModalConfig(null),
        });
      }
    } catch (err) {
      console.error(err);
      setModalConfig({
        isOpen: true,
        type: 'confirm_action',
        title: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        description: 'ไม่สามารถอัปโหลดไฟล์รูปภาพได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
        confirmText: 'ตกลง',
        onAllow: () => setModalConfig(null),
        onDeny: () => setModalConfig(null),
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCloseJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairNotes.trim()) {
      setModalConfig({
        isOpen: true,
        type: 'confirm_action',
        title: 'กรุณากรอกบันทึกสรุปผลการซ่อม',
        description: 'เพื่อความสมบูรณ์ของประวัติการซ่อมบำรุงและรายงานผู้บริหาร โปรดระบุรายละเอียดการแก้ไขปัญหา',
        confirmText: 'ตกลง',
        onAllow: () => setModalConfig(null),
        onDeny: () => setModalConfig(null),
      });
      return;
    }

    const isCurrentTechAssigned =
      technicianId &&
      (ticket.assignedTechnician?.id === technicianId ||
        ticket.assignedTechnicians?.some((t) => t.id === technicianId));

    const techIdToUse = isCurrentTechAssigned
      ? technicianId
      : ticket.assignedTechnician?.id || technicianId || 'usr_tech_01';

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'TECHNICIAN',
          'x-user-id': techIdToUse,
        },
        body: JSON.stringify({
          action: 'CLOSE',
          technicianId: techIdToUse,
          repairNotes: repairNotes.trim(),
          afterProofUrls: proofUrls,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsClosed(true);
        triggerSuccessConfetti();
        if (onClosed) onClosed();
      } else {
        setModalConfig({
          isOpen: true,
          type: 'confirm_action',
          title: 'เกิดข้อผิดพลาดในการปิดงานซ่อม',
          description: data.error || 'ระบบไม่สามารถบันทึกปิดงานซ่อมได้',
          confirmText: 'ตกลง',
          onAllow: () => setModalConfig(null),
          onDeny: () => setModalConfig(null),
        });
      }
    } catch (err) {
      console.error(err);
      setModalConfig({
        isOpen: true,
        type: 'confirm_action',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถปิดงานซ่อมได้ กรุณาลองใหม่อีกครั้ง',
        confirmText: 'ตกลง',
        onAllow: () => setModalConfig(null),
        onDeny: () => setModalConfig(null),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isClosed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 text-center mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/20 mx-auto flex items-center justify-center mb-3">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-sm text-slate-900">
          ปิดงานซ่อม #{ticket.ticketNumber} เรียบร้อยแล้ว
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          ระบบบันทึกสถานะเป็น &quot;ดำเนินการเสร็จสิ้น&quot; และส่งแจ้งเตือนประเมินความพึงพอใจแล้ว
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-6">
      <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
        <h3 className="text-sm font-bold text-slate-900">
          บันทึกส่งมอบงาน &amp; ยืนยันผลการซ่อม (Close Job)
        </h3>
      </div>

      <form onSubmit={handleCloseJob} className="space-y-4">
        {/* Repair Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            สรุปผลการตรวจซ่อม / อะไหล่ที่เปลี่ยน <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={repairNotes}
            onChange={(e) => setRepairNotes(e.target.value)}
            placeholder="อธิบายสรุปผลการซ่อมแซม อะไหล่ที่นำไปเปลี่ยน หรือวิธีแก้ไข..."
            className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-xl p-3 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
          />
        </div>

        {/* Upload Proof Images */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              รูปถ่ายหลักฐานยืนยันหลังการซ่อมแซม (After Proofs)
            </label>
            <span className="text-[11px] text-slate-400">
              {proofUrls.length} รูป
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            {proofUrls.map((url, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`proof ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setProofUrls(proofUrls.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition cursor-pointer"
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
            onClick={handleRequestUploadPhoto}
            className="w-full py-2.5 border border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-700 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-50/50 flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-4 h-4 text-blue-600" />
            <span>{isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพยืนยันหลังซ่อม (ขอสิทธิ์)'}</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isSubmitting ? 'กำลังบันทึกและปิดงาน...' : 'ยืนยันและปิดงานซ่อม'}</span>
        </button>
      </form>

      {/* In-App Permission / Confirmation Modal */}
      {modalConfig && (
        <InAppPermissionModal
          isOpen={modalConfig.isOpen}
          type={modalConfig.type}
          title={modalConfig.title}
          description={modalConfig.description}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onAllow={modalConfig.onAllow}
          onDeny={modalConfig.onDeny}
        />
      )}
    </div>
  );
};
