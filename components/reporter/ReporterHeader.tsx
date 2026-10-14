import React from 'react';
import { ShieldCheck, Plus, Building2, MapPin } from 'lucide-react';

interface ReporterHeaderProps {
  onNewTicketClick?: () => void;
}

export const ReporterHeader: React.FC<ReporterHeaderProps> = ({ onNewTicketClick }) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs mb-3.5 sm:mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-semibold">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <h1 className="text-[14px] sm:text-lg font-bold text-slate-900 tracking-tight">
            พอร์ทัลผู้แจ้งเหตุ (Reporter Portal)
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
            KKU SSO Verified
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-500">
          คณาจารย์ / บุคลากรวิชาการ (ภาควิชาวิทยาการคอมพิวเตอร์) • ประจำอาคาร CP-01
        </p>
      </div>

      <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 text-xs border border-slate-200/70">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>ฝ่ายบริการจัดการอาคาร:</span>
          <span className="font-semibold text-slate-800">CP-01 ห้อง 201</span>
        </div>

        <button
          onClick={onNewTicketClick}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-medium text-[11.5px] sm:text-xs shadow-xs hover:bg-slate-850 active:scale-95 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>แจ้งซ่อมรายการใหม่</span>
        </button>
      </div>
    </div>
  );
};
