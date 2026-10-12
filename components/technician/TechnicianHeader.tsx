import React from 'react';
import { UserCheck, Clock, CheckCircle2 } from 'lucide-react';

interface TechnicianHeaderProps {
  urgentJobCode?: string;
  urgentDueMinutes?: number;
}

export const TechnicianHeader: React.FC<TechnicianHeaderProps> = ({
  urgentJobCode = 'WO-202505-0089',
  urgentDueMinutes = 45,
}) => {
  return (
    <div className="mb-6 space-y-4">
      {/* Top Urgent Alert Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between shadow-xs border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>
            มีใบสั่งงานด่วนใหม่ [<strong className="font-semibold text-slate-100">{urgentJobCode}</strong>] รอการตอบรับ
          </span>
          <span className="text-slate-400 font-normal">
            (กำหนดเข้าพื้นที่ภายใน {urgentDueMinutes} นาที)
          </span>
        </div>
        <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full text-slate-200 font-medium">
          SLA Priority
        </span>
      </div>

      {/* Profile & KPI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-base shrink-0">
            อนุ
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">ช่างอนุชา พงษ์ศิริ</h2>
              <span className="text-[10px] font-mono font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                TC-4091
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              ฝ่ายงานช่างเครือข่ายและการสื่อสาร CP KKU
            </p>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              • กะงานบ่าย (13:00 - 21:00 น.)
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">มอบหมายใหม่</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">4</h3>
              <p className="text-[10px] text-amber-600 font-medium mt-0.5">รอยืนยันตอบรับ</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">กำลังทำอยู่</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">1</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Lab 405</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">ปิดงานวันนี้</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">3</h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">100% ตรงเวลา</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
