'use client';

import React, { useState } from 'react';
import { Send, Clock, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Ticket, TicketUrgency } from '@/types';

interface AssignTechnicianDrawerProps {
  ticket: Ticket;
  onAssigned?: (ticketId: string) => void;
}

export const AssignTechnicianDrawer: React.FC<AssignTechnicianDrawerProps> = ({
  ticket,
  onAssigned,
}) => {
  const [selectedTechId, setSelectedTechId] = useState('usr_tech_01');
  const [urgency, setUrgency] = useState<TicketUrgency>('CRITICAL');
  const [slaTargetTime, setSlaTargetTime] = useState('18 พ.ค. 14:00 น.');
  const [notes, setNotes] = useState(
    'โปรดนำหัว RJ-45 และคีมย้ำสาย Cat6 สำรองไปด้วย พอร์ตเบอร์ 12-16 หลวม'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  const [technicians, setTechnicians] = useState<any[]>([]);

  React.useEffect(() => {
    async function loadTechs() {
      try {
        const res = await fetch('/api/technicians');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setTechnicians(
            data.data.map((t: any) => ({
              id: t.id,
              name: `${t.firstName} ${t.lastName}`,
              specialty: t.specialty || t.departmentName || 'ช่างซ่อมบำรุง',
              workload: t.activeTasks === 0 ? 'ว่าง (0 งาน)' : `มี ${t.activeTasks} งานค้าง`,
              duty: 'On-duty CP KKU',
              isAvailable: t.isAvailable,
            }))
          );
          setSelectedTechId(data.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadTechs();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN',
          technicianId: selectedTechId,
          urgency,
          targetSlaDate: '2026-05-18T14:00:00Z',
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            UC-9: มอบหมายงานให้ทีมช่าง
          </span>
          <h3 className="text-base font-extrabold text-slate-900">
            กำหนดเจ้าหน้าที่และควบคุมเวลาเป้าหมาย SLA
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
        <span className="font-mono font-bold text-blue-700">{ticket.ticketNumber}</span>
        <span className="text-slate-600 font-medium">
          {ticket.location.building} • {ticket.location.roomNumber}
        </span>
      </div>

      {assignedSuccess ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
          <h4 className="font-extrabold text-sm text-emerald-900">
            มอบหมายงานสำเร็จแล้ว! (BR4)
          </h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            ระบบส่งงานไปยังพอร์ทัลช่าง พร้อมส่งอีเมลแจ้งเตือนเรียบร้อย ช่างมีเวลาตอบรับ 45 นาที
          </p>
          <button
            onClick={() => setAssignedSuccess(false)}
            className="mt-3 text-xs text-blue-600 font-bold hover:underline"
          >
            มอบหมายงานถัดไป
          </button>
        </div>
      ) : (
        <form onSubmit={handleAssign} className="space-y-4">
          {/* Technician Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                เลือกช่างผู้รับผิดชอบตามสังกัดงาน
              </label>
              <span className="text-[11px] text-blue-600 font-medium">
                ฝ่ายเครือข่ายและระบบ (3 นาย)
              </span>
            </div>

            <div className="space-y-2">
              {technicians.map((tech) => {
                const isSelected = selectedTechId === tech.id;
                return (
                  <div
                    key={tech.id}
                    onClick={() => setSelectedTechId(tech.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-400'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="technician"
                        checked={isSelected}
                        onChange={() => setSelectedTechId(tech.id)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{tech.name}</div>
                        <div className="text-[11px] text-slate-500">{tech.specialty}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tech.isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
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

          {/* SLA target & Urgency adjustment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                ปรับระดับความเร่งด่วน
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as TicketUrgency)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="CRITICAL">เร่งด่วนมาก (High SLA 4 ชม.)</option>
                <option value="URGENT">เร่งด่วน (Urgent SLA 24 ชม.)</option>
                <option value="NORMAL">ปกติ (Normal SLA 3 วัน)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                เป้าหมายซ่อมเสร็จภายใน
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={slaTargetTime}
                  onChange={(e) => setSlaTargetTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 pr-8 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Notes to Technician */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              บันทึกข้อความถึงช่างผู้รับงาน:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ระบุข้อแนะนำ เครื่องมือเฉพาะที่ต้องนำไป..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Escalation Policy Banner */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">ข้อกำหนดนโยบายความรับผิดชอบ (BR4/Escalation Flow):</span>
              <p className="text-amber-800">
                หากช่างไม่กดตอบรับงานภายใน 3 ชั่วโมง งานจะถูกดึงกลับมายังคิวเจ้าหน้าที่เพื่อพิจารณาเปลี่ยนช่างโดยอัตโนมัติ
              </p>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isSubmitting ? 'กำลังส่งมอบหมายงาน...' : 'ยืนยันมอบหมายงานให้ช่าง (Assign Task)'}
            </span>
          </button>
        </form>
      )}
    </div>
  );
};
