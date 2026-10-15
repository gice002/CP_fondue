'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  UserCheck,
  CheckSquare,
  Image as ImageIcon,
  XCircle,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserX,
  User,
  Phone,
  Mail,
  MapPin,
  Monitor,
  Maximize2,
  X
} from 'lucide-react';
import { Ticket, StandardTag } from '@/types';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import { InAppPermissionModal, PermissionType } from '@/components/common/InAppPermissionModal';

interface UnifiedDispatchCardProps {
  ticket: Ticket;
  onCancelled?: () => void;
  onAssigned?: (ticketId: string) => void;
}

export const UnifiedDispatchCard: React.FC<UnifiedDispatchCardProps> = ({
  ticket,
  onCancelled,
  onAssigned,
}) => {
  // Verification states
  const [chkOwnership, setChkOwnership] = useState(true);
  const [chkDuplicate, setChkDuplicate] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null);

  // In-App Modal Dialog State (Zero native browser prompts)
  const [inAppModal, setInAppModal] = useState<{
    isOpen: boolean;
    type: PermissionType;
    title: string;
    description: string;
    requireReasonInput?: boolean;
    reasonPlaceholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
    onAllow: (val?: string) => void;
  } | null>(null);

  // Technician Assignment states
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>(() => {
    if (ticket.assignedTechnicians && ticket.assignedTechnicians.length > 0) {
      return ticket.assignedTechnicians.map((t) => t.id);
    }
    return ticket.assignedTechnician?.id ? [ticket.assignedTechnician.id] : [];
  });

  const [selectedTags, setSelectedTags] = useState<StandardTag[]>(
    ticket.tags && ticket.tags.length > 0 ? (ticket.tags as StandardTag[]) : ['งานทั่วไป']
  );

  const [notes, setNotes] = useState(
    'โปรดนำหัว RJ-45 และคีมย้ำสาย Cat6 สำรองไปด้วย พอร์ตเบอร์ 12-16 หลวม'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);

  // Update states on ticket prop change
  useEffect(() => {
    setSelectedTags(
      ticket.tags && ticket.tags.length > 0 ? (ticket.tags as StandardTag[]) : ['งานทั่วไป']
    );
    setAssignedSuccess(false);

    if (ticket.assignedTechnicians && ticket.assignedTechnicians.length > 0) {
      setSelectedTechIds(ticket.assignedTechnicians.map((t) => t.id));
    } else if (ticket.assignedTechnician?.id) {
      setSelectedTechIds([ticket.assignedTechnician.id]);
    }
  }, [ticket.id, ticket.tags, ticket.assignedTechnician, ticket.assignedTechnicians]);

  // Load technicians from DB
  useEffect(() => {
    async function loadTechs() {
      try {
        const res = await fetch('/api/technicians');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          const list = data.data.map((t: any) => ({
            id: t.id,
            name: `${t.firstName} ${t.lastName}`,
            specialty: t.specialty || t.departmentName || 'ช่างซ่อมบำรุง',
            inProgressCount: t.inProgressCount || 0,
            queuedCount: t.queuedCount || 0,
            activeTasks: t.activeTasks || 0,
            workload:
              t.activeTasks === 0
                ? 'ว่าง (0 งาน)'
                : t.inProgressCount > 0
                ? `กำลังทำ 1 งาน (ในคิว ${t.queuedCount})`
                : `ในคิว ${t.queuedCount} งาน`,
            duty: 'On-duty SC-09 KKU',
            isExecuting: (t.inProgressCount || 0) > 0,
          }));
          setTechnicians(list);
          setSelectedTechIds((current) => {
            if (current.length > 0) return current;
            if (ticket.assignedTechnicians && ticket.assignedTechnicians.length > 0) {
              return ticket.assignedTechnicians.map((t) => t.id);
            }
            if (ticket.assignedTechnician?.id) return [ticket.assignedTechnician.id];
            return [list[0].id];
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadTechs();
  }, [ticket.id]);

  const toggleTech = (techId: string) => {
    setSelectedTechIds((prev) => {
      if (prev.includes(techId)) {
        if (prev.length === 1) {
          alert('ต้องเลือกช่างอย่างน้อย 1 คน');
          return prev;
        }
        return prev.filter((id) => id !== techId);
      } else {
        return [...prev, techId];
      }
    });
  };

  const PRIORITY_TAGS: StandardTag[] = ['งานเร่งด่วน', 'งานเร่ง', 'งานจำเป็น', 'งานทั่วไป'];
  const CONDITION_TAGS: StandardTag[] = ['งานที่ต้องรออุปกรณ์'];

  const toggleTag = (tag: StandardTag) => {
    if (PRIORITY_TAGS.includes(tag)) {
      const existingConditionTags = selectedTags.filter((t) => !PRIORITY_TAGS.includes(t));
      setSelectedTags([tag, ...existingConditionTags]);
    } else {
      if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
      } else {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTechIds.length === 0) {
      alert('กรุณาเลือกช่างผู้รับผิดชอบอย่างน้อย 1 คน');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'ADMIN_DISPATCH',
          'x-user-id': 'usr_admin_01',
        },
        body: JSON.stringify({
          action: 'ASSIGN',
          technicianIds: selectedTechIds,
          technicianId: selectedTechIds[0],
          tags: selectedTags,
          adminNotes: notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAssignedSuccess(true);
        if (onAssigned) onAssigned(ticket.id);
      } else {
        alert(data.error || 'Failed to assign ticket');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการมอบหมายงาน');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelTicket = () => {
    setInAppModal({
      isOpen: true,
      type: 'confirm_action',
      title: `ขอยกเลิกคำร้อง #${ticket.ticketNumber}`,
      description: 'กรุณาระบุเหตุผลการยกเลิกคำร้องเพื่อบันทึกประวัติการตรวจสอบของเจ้าหน้าที่',
      requireReasonInput: true,
      reasonPlaceholder: 'เช่น ตรวจสอบไม่ผ่าน / แจ้งซ้ำซ้อนหรืออยู่นอกความรับผิดชอบ...',
      defaultValue: 'ตรวจสอบไม่ผ่านเกณฑ์การรับแจ้ง',
      confirmText: 'ยืนยันยกเลิกคำร้อง',
      cancelText: 'ย้อนกลับ',
      onAllow: async (reason) => {
        setInAppModal(null);
        setIsCancelling(true);
        try {
          const res = await fetch(`/api/tickets/${ticket.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-user-role': 'ADMIN_DISPATCH',
              'x-user-id': 'usr_admin_01',
            },
            body: JSON.stringify({
              action: 'CANCEL',
              reason: reason || 'ตรวจสอบไม่ผ่านเกณฑ์',
            }),
          });

          const data = await res.json();
          if (data.success) {
            if (onCancelled) onCancelled();
          } else {
            alert(data.error || 'Failed to cancel ticket');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsCancelling(false);
        }
      },
    });
  };

  const handleUnassign = () => {
    setInAppModal({
      isOpen: true,
      type: 'confirm_action',
      title: `ปลดการมอบหมายงาน #${ticket.ticketNumber}`,
      description: 'คุณต้องการปลดช่างออกจากงานนี้ใช่หรือไม่? คำร้องจะกลับสู่สถานะรอมอบหมายใหม่ทันที',
      confirmText: 'ยืนยันปลดการมอบหมาย',
      cancelText: 'ยกเลิก',
      onAllow: async () => {
        setInAppModal(null);
        setIsUnassigning(true);
        try {
          const res = await fetch(`/api/tickets/${ticket.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-user-role': 'ADMIN_DISPATCH',
              'x-user-id': 'usr_admin_01',
            },
            body: JSON.stringify({
              action: 'UNASSIGN',
              reason: 'เจ้าหน้าที่ปลดการมอบหมายงานเพื่อกระจายงานใหม่',
            }),
          });

          const data = await res.json();
          if (data.success) {
            if (onAssigned) onAssigned(ticket.id);
          } else {
            alert(data.error || 'Failed to unassign ticket');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsUnassigning(false);
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* 1. Master Header: Ticket Reference & Status */}
      <div className="p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            โต๊ะคัดกรองและมอบหมายงานช่าง (Unified Dispatch Workspace)
          </span>
          <div className="flex items-center space-x-2 mt-0.5">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              รหัสคำร้อง: <span className="font-mono text-blue-700">#{ticket.ticketNumber}</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              • วันที่ {new Date(ticket.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {ticket.status === 'COMPLETED' ? (
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>ซ่อมเสร็จสิ้น (COMPLETED)</span>
            </span>
          ) : ticket.status === 'IN_PROGRESS' ? (
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>กำลังเข้าซ่อม (IN_PROGRESS)</span>
            </span>
          ) : ticket.status === 'ASSIGNED' ? (
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
              มอบหมายช่างแล้ว (ASSIGNED)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>รอมอบหมายงาน (PENDING_DISPATCH)</span>
            </span>
          )}

          {/* Action button to reject ticket if still pending */}
          {(ticket.status === 'PENDING_DISPATCH' || ticket.status === 'ASSIGNED') && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleCancelTicket}
              className="px-2.5 py-1 rounded-xl border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 text-xs font-bold transition disabled:opacity-50 cursor-pointer flex items-center space-x-1"
              title="ยกเลิกคำร้องหรือปฏิเสธการแจ้ง"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{isCancelling ? 'กำลังยกเลิก...' : 'ปฏิเสธคำร้อง'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* ============================================================ */}
        {/* SECTION A: รายละเอียดผู้แจ้ง ครุภัณฑ์ และรูปภาพหลักฐาน */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              1. รายละเอียดข้อมูลและภาพถ่ายหลักฐาน
            </h3>
          </div>

          {/* 4-Item Information Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
            {/* 1. ครุภัณฑ์ */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1">
                <Monitor className="w-3 h-3 text-blue-600" />
                ครุภัณฑ์ / หมวดหมู่:
              </span>
              <span className="font-bold text-slate-900 block truncate">
                {ticket.equipment?.name || ticket.category}
              </span>
              <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 inline-block">
                {ticket.equipment?.assetCode || 'KKU-CP-NET-2023-018'}
              </span>
            </div>

            {/* 2. สถานที่ */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" />
                สถานที่ / พิกัดห้อง:
              </span>
              <span className="font-bold text-slate-900 block">
                {ticket.location.building}
              </span>
              <span className="text-slate-600 text-[11px] block">
                {ticket.location.floor} • {ticket.location.roomName || ticket.location.roomNumber}
              </span>
            </div>

            {/* 3. ผู้แจ้งเหตุ */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-600" />
                ผู้แจ้งเหตุ &amp; สังกัด:
              </span>
              <span className="font-bold text-slate-900 block truncate">
                {ticket.reporter.firstName} {ticket.reporter.lastName}
              </span>
              <span className="text-slate-500 text-[10.5px] block truncate">
                {ticket.reporter.departmentName || 'วิทยาลัยการคอมพิวเตอร์'}
              </span>
            </div>

            {/* 4. ช่องทางติดต่อ */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1">
                <Phone className="w-3 h-3 text-indigo-600" />
                ช่องทางติดต่อ:
              </span>
              <span className="font-mono font-bold text-slate-800 block">
                {ticket.reporter.phoneNumber || '081-456-7890'}
              </span>
              <span className="font-mono text-[10.5px] text-slate-500 block truncate">
                {ticket.reporter.email}
              </span>
            </div>
          </div>

          {/* Problem Description Note */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              คำอธิบายอาการขัดข้องจากผู้แจ้ง:
            </span>
            <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium italic">
              &quot;{ticket.description}&quot;
            </div>
          </div>

          {/* Photo Attachments Grid with Click to Zoom */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>ภาพถ่ายหลักฐานแนบ ({ticket.attachments.length || 2} ภาพ)</span>
              </span>
              <span className="text-[10.5px] text-slate-400">คลิกที่รูปเพื่อขยายดูหลักฐาน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ticket.attachments.length > 0 ? (
                ticket.attachments.map((att, i) => (
                  <div
                    key={att.id || i}
                    onClick={() => setActiveImageZoom(att.fileUrl)}
                    className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 group cursor-pointer shadow-2xs hover:shadow-md transition"
                  >
                    <img
                      src={att.fileUrl}
                      alt="evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="bg-white/90 text-slate-900 rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1 shadow-md">
                        <Maximize2 className="w-3 h-3" />
                        <span>ขยายรูป</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[10.5px] font-medium p-2 truncate">
                      {att.caption || (i === 0 ? 'ภาพถ่ายความเสียหายก่อนซ่อม' : 'ภาพผลงานหลังซ่อมเสร็จสิ้น')}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div
                    onClick={() => setActiveImageZoom('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800')}
                    className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 group cursor-pointer shadow-2xs hover:shadow-md transition"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600"
                      alt="evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="bg-white/90 text-slate-900 rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1 shadow-md">
                        <Maximize2 className="w-3 h-3" />
                        <span>ขยายรูป</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[10.5px] font-medium p-2">
                      ภาพถ่ายความเสียหายก่อนซ่อม (BR2)
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveImageZoom('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800')}
                    className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 group cursor-pointer shadow-2xs hover:shadow-md transition"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600"
                      alt="evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="bg-white/90 text-slate-900 rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1 shadow-md">
                        <Maximize2 className="w-3 h-3" />
                        <span>ขยายรูป</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[10.5px] font-medium p-2">
                      ภาพผลงานหลังซ่อมเสร็จสิ้น (BR8)
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Verification Checkboxes */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
            <span className="text-xs font-bold text-blue-900 block">
              การตรวจความถูกต้องเบื้องต้น:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chkOwnership}
                  onChange={(e) => setChkOwnership(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="font-medium">ครุภัณฑ์อยู่ในความรับผิดชอบของวิทยาลัย CP</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chkDuplicate}
                  onChange={(e) => setChkDuplicate(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="font-medium">ไม่พบประวัติการแจ้งซ้ำซ้อนใน 24 ชั่วโมง</span>
              </label>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION B: มอบหมายงานช่าง (TECHNICIAN DISPATCH) */}
        {/* ============================================================ */}
        <section className="space-y-4 pt-4 border-t-2 border-slate-100">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                2. มอบหมายช่างผู้รับผิดชอบและกำหนด SLA
              </h3>
            </div>
            <InfoTooltip text="เลือกช่างเทคนิคที่ตรงกับความเชี่ยวชาญ ระบบอนุญาตให้เลือกช่างร่วม (Multi-Technicians) สำหรับงานขนาดใหญ่ได้" />
          </div>

          <form onSubmit={handleAssign} className="space-y-4">
            {/* List of Technicians */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  เลือกช่างผู้รับผิดชอบ{' '}
                  <span className="text-blue-600 font-normal">
                    (เลือกได้หลายคน: เลือกแล้ว {selectedTechIds.length} คน)
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {technicians.length} นายในระบบ
                </span>
              </div>

              <div className="space-y-2">
                {technicians.map((tech) => {
                  const isChecked = selectedTechIds.includes(tech.id);
                  const isPrimary = selectedTechIds[0] === tech.id;

                  return (
                    <div
                      key={tech.id}
                      onClick={() => toggleTech(tech.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/70 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer pointer-events-none"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900">
                              {tech.name}
                            </span>
                            {isChecked && isPrimary && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-blue-600 text-white shadow-2xs">
                                ช่างหลัก
                              </span>
                            )}
                            {tech.isExecuting && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                กำลังลงพื้นที่
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            ผู้เชี่ยวชาญ {tech.specialty}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tech.activeTasks === 0
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : tech.isExecuting
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {tech.workload}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {tech.duty}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tags & SLA */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  กำหนด Tags ลำดับความสำคัญและประเภทงาน
                </span>
                <span className="text-[11px] text-slate-400">
                  เรียงตามลำดับความสำคัญ
                </span>
              </div>

              {/* Priority tags (Mutually exclusive) */}
              <div className="flex flex-wrap gap-2 mb-2">
                {PRIORITY_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? tag === 'งานเร่งด่วน'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : tag === 'งานเร่ง'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : tag === 'งานจำเป็น'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                      }`}
                    >
                      <span>{tag}</span>
                    </button>
                  );
                })}

                {/* Condition tags */}
                {CONDITION_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                      }`}
                    >
                      <span>+ {tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes to Technician */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                บันทึกข้อความถึงช่าง:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="ระบุข้อความ กำชับอุปกรณ์ หรือข้อควรระวังแก่ช่าง..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition"
              />
            </div>

            {/* Info notice about multi-assignment */}
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/80 text-[11px] text-blue-900 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">การมอบหมายงานช่างร่วม (Multi-Technicians):</span>
                <span className="text-slate-600 ml-1">
                  งาน 1 งานสามารถมอบหมายร่วมกันได้ โดยงานจะปรากฏในคิวของช่างทุกคนที่ได้รับมอบหมาย
                </span>
              </div>
            </div>

            {/* Submission / Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {ticket.status === 'ASSIGNED' ? (
                <button
                  type="button"
                  disabled={isUnassigning}
                  onClick={handleUnassign}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>{isUnassigning ? 'กำลังปลด...' : 'ปลดการมอบหมาย'}</span>
                </button>
              ) : (
                <div />
              )}

              {ticket.status === 'COMPLETED' ? (
                <div className="w-full text-center py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-300 text-xs font-bold">
                  คำร้องนี้ดำเนินการเสร็จสิ้นแล้ว (COMPLETED)
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || selectedTechIds.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting
                      ? 'กำลังบันทึกมอบหมายงาน...'
                      : ticket.status === 'ASSIGNED'
                      ? 'อัปเดตการมอบหมายงานช่าง'
                      : 'ยืนยันมอบหมายงานช่าง (Dispatch)'}
                  </span>
                </button>
              )}
            </div>

            {assignedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>มอบหมายงานช่างสำเร็จ ระบบได้แจ้งเตือนไปยังช่างผู้รับผิดชอบแล้ว</span>
              </div>
            )}
          </form>
        </section>
      </div>

      {/* Fullscreen Image Zoom Modal */}
      {activeImageZoom && (
        <div
          onClick={() => setActiveImageZoom(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
          >
            <button
              type="button"
              onClick={() => setActiveImageZoom(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center z-10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={activeImageZoom}
              alt="zoomed evidence"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* In-App Confirmation / Action Modal */}
      {inAppModal && (
        <InAppPermissionModal
          isOpen={inAppModal.isOpen}
          type={inAppModal.type}
          title={inAppModal.title}
          description={inAppModal.description}
          requireReasonInput={inAppModal.requireReasonInput}
          reasonPlaceholder={inAppModal.reasonPlaceholder}
          defaultValue={inAppModal.defaultValue}
          confirmText={inAppModal.confirmText}
          cancelText={inAppModal.cancelText}
          onAllow={inAppModal.onAllow}
          onDeny={() => setInAppModal(null)}
        />
      )}
    </div>
  );
};
