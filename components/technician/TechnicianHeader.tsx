import React from 'react';
import { UserCheck, Shield, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

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
      <div className="p-3 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center justify-between shadow-md shadow-blue-500/20 animate-pulse">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          <span>
            มีใบสั่งงานด่วนใหม่ [<strong>{urgentJobCode}</strong>] รอการตอบรับจากคุณ
          </span>
          <span className="text-blue-100 font-normal">
            (กำหนดเข้าพื้นที่ภายใน {urgentDueMinutes} นาที)
          </span>
        </div>
        <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded text-white font-bold">
          SLA High Priority
        </span>
      </div>

      {/* Profile & KPI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg border-2 border-blue-200 shrink-0">
            อนุ
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-slate-900">ช่างอนุชา พงษ์ศิริ</h2>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                TC-4091
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              ฝ่ายงานช่างเครือข่ายและการสื่อสาร CoP KKU
            </p>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">
              • เข้าเวรภาคบ่าย (13:00 - 21:00 น.)
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">มอบหมายใหม่</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">4</h3>
              <p className="text-[10px] text-red-500 font-bold mt-0.5">! รอยืนยันตอบรับ</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">กำลังทำอยู่</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">1</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">หน้างาน Lab 405</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">ปิดงานวันนี้</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">3</h3>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">~ 100% ตรงเวลา</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
