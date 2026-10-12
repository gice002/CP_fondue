import React from 'react';
import { RotateCw, CheckCircle2, ChevronRight } from 'lucide-react';
import { ExecutiveStats } from '@/types';

interface AnalyticsChartsProps {
  stats: ExecutiveStats;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      {/* 1. Category Breakdown Donut */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-extrabold text-slate-900">
              จำแนกตามประเภทอุปกรณ์
            </h3>
            <button className="p-1 text-slate-400 hover:text-slate-600 transition">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-4">สัดส่วนคำร้องตามลักษณะงานซ่อมบำรุง</p>

          <div className="flex items-center space-x-6 my-2">
            {/* Donut representation */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background ring */}
                <path
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Slice 1: AC (38%) */}
                <path
                  className="text-blue-600"
                  strokeDasharray="38, 100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Slice 2: Network (32%) */}
                <path
                  className="text-cyan-500"
                  strokeDasharray="32, 100"
                  strokeDashoffset="-38"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Slice 3: Electric (18%) */}
                <path
                  className="text-emerald-500"
                  strokeDasharray="18, 100"
                  strokeDashoffset="-70"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Slice 4: Building (12%) */}
                <path
                  className="text-purple-500"
                  strokeDasharray="12, 100"
                  strokeDashoffset="-88"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-900 block font-mono">
                  {stats.totalTickets}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">เคสสะสม</span>
              </div>
            </div>

            {/* Legends */}
            <div className="space-y-2 flex-1 text-xs">
              {stats.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className="text-slate-700 font-medium truncate">{cat.category}</span>
                  </div>
                  <div className="font-mono text-slate-900 font-bold shrink-0 ml-2">
                    {cat.count} รายการ{' '}
                    <span className="text-slate-400 font-normal">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>สถิติสูงสุด: ห้องปฏิบัติการ CP ComLab 3 อาคาร 1 ชั้น 2</span>
          <button className="text-blue-600 font-bold hover:underline flex items-center">
            <span>ดูรายละเอียดโซน</span>
            <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>

      {/* 2. Weekly Bar Chart Comparison */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-extrabold text-slate-900">
              ปริมาณงานและเวลาดำเนินการตามสัปดาห์
            </h3>
            {/* Legend pills */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
                <span>รับเรื่องใหม่</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700"></span>
                <span>ซ่อมเสร็จสิ้น</span>
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mb-4">
            เปรียบเทียบคำร้องใหม่และงานที่ปิดสำเร็จ (W1 - W4 พฤษภาคม 2568)
          </p>

          {/* Bar rows */}
          <div className="space-y-3.5 my-2">
            {stats.weeklyTrends.map((w, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{w.week}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    เฉลี่ย <strong>{w.avgTimeMin}</strong> นาที
                  </span>
                </div>

                <div className="space-y-1">
                  {/* New Cases Bar */}
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-3.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(w.newCases / 50) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-blue-700 w-12 text-right">
                      {w.newCases} เคส
                    </span>
                  </div>

                  {/* Completed Bar */}
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-3.5 overflow-hidden">
                      <div
                        className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(w.completed / 50) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-800 w-12 text-right">
                      {w.completed} เสร็จ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1 text-emerald-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>อัตราความสำเร็จตามข้อตกลง SLA รวมทั้งสิ้น: {stats.slaSuccessRate}%</span>
          </div>
          <span className="text-slate-400 font-mono">อัปเดตล่าสุด: วันนี้ เวลา 16:45 น.</span>
        </div>
      </div>
    </div>
  );
};
