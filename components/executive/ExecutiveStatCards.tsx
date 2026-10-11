import React from 'react';
import { Inbox, CheckCircle2, Clock, Star, TrendingUp, Sparkles } from 'lucide-react';
import { ExecutiveStats } from '@/types';

interface ExecutiveStatCardsProps {
  stats: ExecutiveStats;
}

export const ExecutiveStatCards: React.FC<ExecutiveStatCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Tickets */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-0.5">คำร้องแจ้งซ่อมทั้งหมด</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalTickets}
            </h3>
            <span className="text-xs font-bold text-slate-400">รายการ</span>
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-bold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+8.4% จากเดือนก่อน</span>
            <span className="text-slate-400 font-normal">• รอตรวจ 13 รายการ</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Inbox className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Completed SLA */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-0.5">ปิดงานซ่อมสมบูรณ์</p>
          <div className="flex items-baseline space-x-1.5">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.completedTickets}
            </h3>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              ({stats.completedPercent}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1.5">
            <span>เป้าหมายมาตรฐาน 85%</span>
            <span className="text-emerald-600 font-bold">• บรรลุเกณฑ์ SLA</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Average Response Time */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-0.5">เวลาเฉลี่ยเข้าปฏิบัติงาน</p>
          <div className="flex items-baseline space-x-1.5">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.avgResponseTimeMin}
            </h3>
            <span className="text-xs font-bold text-slate-500">นาที</span>
          </div>
          <div className="text-[10px] text-blue-600 font-bold mt-1 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>เร็วกว่า SLA 12 นาที</span>
            <span className="text-slate-400 font-normal">(เกณฑ์ 30 นาที)</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Average Rating */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-0.5">ความพึงพอใจเฉลี่ย</p>
          <div className="flex items-baseline space-x-1.5">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.avgRating}
            </h3>
            <span className="text-xs font-bold text-amber-500">/ 5.0 ดาว</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
            <span>{stats.totalEvaluations} แบบประเมิน (UC-6)</span>
            <span className="text-emerald-600 font-bold">• ระดับดีเยี่ยม</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
          <Star className="w-5 h-5 fill-amber-400" />
        </div>
      </div>
    </div>
  );
};
