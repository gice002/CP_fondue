'use client';

import React, { useState } from 'react';
import { Send, Clock, AlertTriangle, CheckCircle2, UserX, XCircle, AlertCircle } from 'lucide-react';
import { Ticket, STANDARD_TAGS, StandardTag } from '@/types';
import { InfoTooltip } from '@/components/common/InfoTooltip';

interface AssignTechnicianDrawerProps {
  ticket: Ticket;
  onAssigned?: (ticketId: string) => void;
}

export const AssignTechnicianDrawer: React.FC<AssignTechnicianDrawerProps> = ({
  ticket,
  onAssigned,
}) => {
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
  const [isCancelling, setIsCancelling] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  const [technicians, setTechnicians] = useState<any[]>([]);

  React.useEffect(() => {
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

  React.useEffect(() => {
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
      // Mutually exclusive priority level: picking one removes any other priority tag
      const existingConditionTags = selectedTags.filter((t) => !PRIORITY_TAGS.includes(t));
      setSelectedTags([tag, ...existingConditionTags]);
    } else {
      // Optional condition tag: toggles on / off independently
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
        headers: { 'Content-Type': 'application/json' },
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

  const handleCancelTicket = async () => {
    const reason = prompt(
      `คุณต้องการยกเลิกคำร้อง ${ticket.ticketNumber} ใช่หรือไม่? กรุณาระบุเหตุผล:`,
      'เจ้าหน้าที่ยกเลิกคำร้อง / ข้อมูลไม่ถูกต้องหรือแจ้งซ้ำ'
    );
    if (reason === null) return;

    setIsCancelling(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'ADMIN_DISPATCH',
        },
        body: JSON.stringify({
          action: 'CANCEL',
          reason: reason || 'เจ้าหน้าที่ยกเลิกคำร้อง',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`ยกเลิกคำร้อง ${ticket.ticketNumber} สำเร็จ`);
        if (onAssigned) onAssigned(ticket.id);
      } else {
        alert(data.error || 'Failed to cancel ticket');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการยกเลิกคำร้อง');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUnassign = async () => {
    const confirmUnassign = confirm(
      `คุณต้องการปลดการมอบหมายงาน ${ticket.ticketNumber} ใช่หรือไม่?`
    );
    if (!confirmUnassign) return;

    setIsUnassigning(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UNASSIGN',
          reason: 'เจ้าหน้าที่ปลดการมอบหมายงานเพื่อกระจายงานใหม่',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('ปลดการมอบหมายงานสำเร็จ คำร้องกลับสู่สถานะรอมอบหมาย');
        if (onAssigned) onAssigned(ticket.id);
      } else {
        alert(data.error || 'Failed to unassign ticket');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการปลดการมอบหมาย');
    } finally {
      setIsUnassigning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            มอบหมายงานช่าง (Technician Dispatch)
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            กำหนดช่างผู้รับผิดชอบ
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs mb-4">
        <span className="font-mono font-medium text-slate-900">#{ticket.ticketNumber}</span>
        <span className="text-slate-500 font-medium">
          {ticket.location.building} • {ticket.location.roomNumber}
        </span>
      </div>

      {assignedSuccess ? (
        <div className="p-5 rounded-2xl bg-emerald-50 text-center ring-1 ring-inset ring-emerald-600/20">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-slate-900">มอบหมายงานสำเร็จแล้ว</h4>
          <p className="text-xs text-slate-600 mt-1">
            ระบบได้เพิ่มงานลงในคิวของช่างผู้รับผิดชอบเรียบร้อยแล้ว
          </p>
          <button
            onClick={() => setAssignedSuccess(false)}
            className="mt-3 text-xs text-slate-900 font-semibold hover:underline"
          >
            มอบหมายงานอื่นต่อ
          </button>
        </div>
      ) : (
        <form onSubmit={handleAssign} className="space-y-4">
          {/* Technician Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span>เลือกช่างผู้รับผิดชอบ</span>
                <span className="text-blue-600 font-bold">(เลือกได้หลายคน: เลือกแล้ว {selectedTechIds.length} คน)</span>
                <InfoTooltip text="สามารถเลือกช่างร่วมปฏิบัติงานได้หลายคน โดยช่างคนแรกที่เลือกจะถือเป็นช่างผู้รับผิดชอบหลัก (Lead Technician)" />
              </label>
              <span className="text-[11px] text-slate-400 font-normal">
                {technicians.length} นายในระบบ
              </span>
            </div>

            <div className="space-y-2">
              {technicians.map((tech) => {
                const isSelected = selectedTechIds.includes(tech.id);
                const isLead = isSelected && selectedTechIds[0] === tech.id;
                return (
                  <div
                    key={tech.id}
                    onClick={() => toggleTech(tech.id)}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        name="technician"
                        checked={isSelected}
                        onChange={() => toggleTech(tech.id)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                          <span>{tech.name}</span>
                          {isLead && selectedTechIds.length > 1 && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-200">
                              ช่างหลัก
                            </span>
                          )}
                          {tech.isExecuting && (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              กำลังลงพื้นที่
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{tech.specialty}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          tech.activeTasks === 0
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                            : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                        }`}
                      >
                        {tech.workload}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tech.duty}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags Selection (Categorized & Mutually Exclusive) */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>ระดับความสำคัญ (เลือกได้ 1 ระดับ):</span>
                  <InfoTooltip text="ระดับความเร่งด่วนจะถูกจัดลำดับในคิวงานของช่าง โดย 'งานเร่งด่วน' จะถูกดันขึ้นอันดับ 1 ของคิวงานโดยอัตโนมัติ" />
                </label>
                <span className="text-[10px] text-slate-400 font-medium">ลำดับความเร่งด่วน</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PRIORITY_TAGS.map((tag) => {
                  const isTagSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        isTagSelected
                          ? tag === 'งานเร่งด่วน'
                            ? 'bg-rose-600 border-rose-600 text-white shadow-xs ring-2 ring-rose-500/20'
                            : tag === 'งานเร่ง'
                            ? 'bg-amber-600 border-amber-600 text-white shadow-xs ring-2 ring-amber-500/20'
                            : tag === 'งานจำเป็น'
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs ring-2 ring-blue-500/20'
                            : 'bg-slate-800 border-slate-800 text-white shadow-xs ring-2 ring-slate-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                เงื่อนไขงานเพิ่มเติม (เลือกเสริมได้):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CONDITION_TAGS.map((tag) => {
                  const isTagSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center space-x-1 ${
                        isTagSelected
                          ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{isTagSelected ? '✓' : '+'}</span>
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes to Technician */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              บันทึกข้อความถึงช่าง:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ระบุข้อแนะนำ เครื่องมือเฉพาะที่ต้องนำไป..."
              className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition resize-none leading-relaxed"
            />
          </div>

          {/* Escalation Policy Banner */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-slate-600 text-[11px] flex items-start space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-900">การมอบหมายงานช่างร่วม (Multi-Technicians):</span>
              <p className="text-slate-600 mt-0.5">
                งาน 1 งานสามารถมอบหมายให้ช่างร่วมรับผิดชอบได้หลายคน โดยงานจะปรากฏในคิวของช่างทุกคนที่ได้รับมอบหมาย
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {ticket.status === 'CANCELLED' ? (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-500 font-semibold">
                คำร้องนี้ถูกยกเลิกแล้ว (CANCELLED)
              </div>
            ) : ticket.status === 'COMPLETED' ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-700 font-semibold">
                คำร้องนี้ดำเนินการเสร็จสิ้นแล้ว (COMPLETED)
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-medium text-xs shadow-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting ? 'กำลังส่งมอบหมายงาน...' : 'ยืนยันมอบหมายงานให้ช่าง'}
                </span>
              </button>
            )}

            {/* Unassign button if ticket is currently assigned or in progress */}
            {(ticket.status === 'ASSIGNED' || ticket.status === 'IN_PROGRESS') && (
              <button
                type="button"
                disabled={isUnassigning}
                onClick={handleUnassign}
                className="w-full py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>{isUnassigning ? 'กำลังปลดการมอบหมาย...' : 'ปลดการมอบหมายงาน (คืนสู่รอมอบหมาย)'}</span>
              </button>
            )}

            {/* Cancel ticket button for Admin (if pending or assigned) */}
            {(ticket.status === 'PENDING_DISPATCH' || ticket.status === 'ASSIGNED') && (
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelTicket}
                className="w-full py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isCancelling ? 'กำลังยกเลิกคำร้อง...' : 'ยกเลิกคำร้องแจ้งเหตุ (Cancel Ticket)'}</span>
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
