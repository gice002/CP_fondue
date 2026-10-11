import React from 'react';
import { ShieldCheck, Plus, Building2, MapPin } from 'lucide-react';

interface ReporterHeaderProps {
  onNewTicketClick?: () => void;
}

export const ReporterHeader: React.FC<ReporterHeaderProps> = ({ onNewTicketClick }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            พอร์ทัลผู้แจ้งเหตุ (Reporter Portal)
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            ยืนยันตัวตน KKU SSO (BR1 / BR12)
          </span>
        </div>
        <p className="text-xs text-slate-500">
          สิทธิ์: คณาจารย์ / บุคลากรวิชาการ (ภาควิชาวิทยาการคอมพิวเตอร์) • ประจำอาคาร CP-01
        </p>
      </div>

      <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>ฝ่ายบริการจัดการอาคารและสถานที่:</span>
          <span className="font-bold text-blue-800">อาคาร CP-01 ชั้น 2 ห้อง 201</span>
        </div>

        <button
          onClick={onNewTicketClick}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>แจ้งเรื่องใหม่ทันที</span>
        </button>
      </div>
    </div>
  );
};
