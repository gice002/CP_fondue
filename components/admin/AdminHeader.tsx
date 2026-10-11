import React from 'react';
import { ClipboardCheck, RefreshCw, PlusCircle, Radio } from 'lucide-react';

interface AdminHeaderProps {
  onWalkInClick?: () => void;
  syncTime?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onWalkInClick,
  syncTime = '10:42:15 น.',
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            พอร์ทัลเจ้าหน้าที่คัดกรองและมอบหมายงาน (Admin Dispatch Desk)
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Admin Dispatch Desk
          </span>
        </div>
        <p className="text-xs text-slate-500">
          ระบบคัดกรองคำร้อง มอบหมายงานช่าง และอนุมัติการขอเบิกพัสดุอุปกรณ์ครุภัณฑ์ • อาคารวิทยาลัยการคอมพิวเตอร์
        </p>
      </div>

      <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200 font-mono">
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          <span>ซิงค์ข้อมูลล่าสุด: {syncTime}</span>
        </div>

        <button
          onClick={onWalkInClick}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>สร้างใบงานฉุกเฉิน (Walk-in)</span>
        </button>
      </div>
    </div>
  );
};
