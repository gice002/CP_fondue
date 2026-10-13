import React from 'react';
import { UserCheck, Clock, CheckCircle2, RefreshCw, User, ChevronDown } from 'lucide-react';
import { InfoTooltip } from '@/components/common/InfoTooltip';

export interface TechnicianInfo {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  code?: string;
}

interface TechnicianHeaderProps {
  urgentJobCode?: string;
  urgentDueMinutes?: number;
  assignedCount?: number;
  inProgressCount?: number;
  completedCount?: number;
  currentTechName?: string;
  currentTechCode?: string;
  currentTechDepartment?: string;
  technicians?: TechnicianInfo[];
  selectedTechId?: string;
  onSelectTech?: (techId: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TechnicianHeader: React.FC<TechnicianHeaderProps> = ({
  urgentJobCode,
  urgentDueMinutes = 45,
  assignedCount = 0,
  inProgressCount = 0,
  completedCount = 0,
  currentTechName = 'ช่างอนุชา พงษ์ศิริ',
  currentTechCode = 'TC-4091',
  currentTechDepartment = 'ฝ่ายงานช่างเครือข่ายและการสื่อสาร CP KKU',
  technicians = [],
  selectedTechId = 'all',
  onSelectTech,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="mb-6 space-y-4">
      {/* Top Urgent Alert Banner */}
      {urgentJobCode && urgentJobCode !== 'ไม่มีงานด่วนค้าง' && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between shadow-xs border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>
              มีใบสั่งงานด่วนใหม่ [<strong className="font-semibold text-slate-100">{urgentJobCode}</strong>] รอการตอบรับ
            </span>
          </div>
          <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full text-slate-200 font-medium">
            งานเร่งด่วน
          </span>
        </div>
      )}

      {/* Profile & KPI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Profile Card & Technician Switcher (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center font-extrabold text-sm shrink-0">
                {currentTechName.slice(0, 3)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-extrabold text-slate-900">{currentTechName}</h2>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {currentTechCode}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {currentTechDepartment}
                </p>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  • กะงานบ่าย (13:00 - 21:00 น.) • On-duty
                </p>
              </div>
            </div>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="รีเฟรชข้อมูลคิวงานช่าง"
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition flex items-center space-x-1 shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                <span className="text-[11px] font-bold hidden sm:inline">รีเฟรช</span>
              </button>
            )}
          </div>

          {/* Technician Switcher for Testing/Role Play */}
          {technicians.length > 0 && onSelectTech && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400">
                  สลับดูคิวงานของช่าง:
                </span>
                <InfoTooltip text="เลือกเปลี่ยนมุมมองช่างเพื่อดูงานที่ได้รับมอบหมายของแต่ละคน หรือเลือก 'ดูงานช่างทั้งหมด' เพื่อตรวจสอบภาพรวมของทีม" />
              </div>
              <div className="relative">
                <select
                  value={selectedTechId}
                  onChange={(e) => onSelectTech(e.target.value)}
                  className="w-full appearance-none text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 font-semibold hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
                >
                  <option value="all">🌐 แสดงคิวงานช่างทั้งหมดในระบบ (All Technicians)</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      👤 {t.name} ({t.specialty || 'ช่างเทคนิค'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          )}
        </div>

        {/* 3 Dynamic Metric Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-3 gap-3">
          {/* Card 1: Assigned */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <p className="text-xs font-bold text-slate-500">มอบหมายใหม่</p>
                <InfoTooltip text="งานที่เจ้าหน้าที่ Dispatch ส่งมายังคิวงานของคุณแล้วและกำลังรอให้คุณกดยืนยันรับงาน" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{assignedCount}</h3>
              <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                {assignedCount > 0 ? 'รอยืนยันตอบรับ' : 'ไม่มีงานค้างรับ'}
              </p>
            </div>
          </div>

          {/* Card 2: In Progress */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <p className="text-xs font-bold text-slate-500">กำลังทำอยู่</p>
                <InfoTooltip text="งานที่คุณตอบรับแล้วและกำลังลงพื้นที่ตรวจสอบหรือซ่อมแซม ณ จุดเกิดเหตุ" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{inProgressCount}</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                {inProgressCount > 0 ? 'กำลังเข้าซ่อม' : 'ไม่มีงานกำลังทำ'}
              </p>
            </div>
          </div>

          {/* Card 3: Completed */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <p className="text-xs font-bold text-slate-500">ปิดงานแล้ว</p>
                <InfoTooltip text="งานซ่อมที่ผ่านการแก้ไขและปิดงานเรียบร้อยแล้ว พร้อมส่งต่อให้ผู้แจ้งประเมินความพึงพอใจ" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{completedCount}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">เสร็จสิ้นสมบูรณ์</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
