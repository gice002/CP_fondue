'use client';

import React, { useState } from 'react';
import { Send, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            มอบหมายงานช่าง (Technician Dispatch)
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            กำหนดช่างผู้รับผิดชอบและเป้าหมาย SLA
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
            ระบบได้จัดส่งการแจ้งเตือนไปยังช่างผู้รับผิดชอบเรียบร้อยแล้ว
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
              <label className="text-xs font-semibold text-slate-800">
                เลือกช่างผู้รับผิดชอบ
              </label>
              <span className="text-[11px] text-slate-400 font-normal">
                {technicians.length} นายในระบบ
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
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="technician"
                        checked={isSelected}
                        onChange={() => setSelectedTechId(tech.id)}
                        className="w-3.5 h-3.5 text-slate-900 focus:ring-slate-900"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{tech.name}</div>
                        <div className="text-[11px] text-slate-500">{tech.specialty}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          tech.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                            : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
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
                ระดับความเร่งด่วน
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as TicketUrgency)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
              >
                <option value="CRITICAL">ฉุกเฉินมาก (High SLA 4 ชม.)</option>
                <option value="URGENT">เร่งด่วน (Urgent SLA 24 ชม.)</option>
                <option value="NORMAL">ปกติ (Normal SLA 3 วัน)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                เป้าหมายเวลา SLA
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={slaTargetTime}
                  onChange={(e) => setSlaTargetTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-8 font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                />
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
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
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-start space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">นโยบายการรับงาน:</span>
              <p className="text-slate-500 mt-0.5">
                หากช่างไม่กดตอบรับงานภายใน 3 ชั่วโมง ระบบจะแจ้งเตือนเจ้าหน้าที่เพื่อจัดสรรช่างสำรองโดยอัตโนมัติ
              </p>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs shadow-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isSubmitting ? 'กำลังส่งมอบหมายงาน...' : 'ยืนยันมอบหมายงานให้ช่าง'}
            </span>
          </button>
        </form>
      )}
    </div>
  );
};
