import React from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';

interface ExecutiveHeaderProps {
  onExport?: () => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({ onExport }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            ศูนย์สรุปผลและรายงานการซ่อมบำรุง
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            DASHBOARD OVERVIEW
          </span>
        </div>
        <p className="text-xs text-slate-500">
          วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น • รอบการตรวจประเมินคุณภาพการศึกษา EdPEx / AUN-QA ประจำปี 2568
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end text-xs">
        {/* Period Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button className="px-2.5 py-1 rounded-lg bg-white font-bold text-slate-800 shadow-xs">
            ประจำเดือน พ.ค. 2568
          </button>
          <button className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800">
            ไตรมาส 2/2568
          </button>
          <button className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800">
            ปีงบประมาณ 2568
          </button>
        </div>

        {/* Date range picker pill */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 font-mono text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>01 พ.ค. 2568 - 31 พ.ค. 2568</span>
        </div>

        {/* Export Button */}
        <button
          onClick={onExport || (() => alert('ดาวน์โหลดรายงานสรุป EdPEx ในรูปแบบ PDF / Excel สำเร็จ'))}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ส่งออกรายงานสรุปผล (Export)</span>
        </button>
      </div>
    </div>
  );
};
