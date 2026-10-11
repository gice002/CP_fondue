import React from 'react';
import { Mail, Users, Box, CheckSquare, ArrowUpRight } from 'lucide-react';

interface AdminStatCardsProps {
  pendingCount?: number;
  activeCount?: number;
  requisitionCount?: number;
  slaRate?: number;
}

export const AdminStatCards: React.FC<AdminStatCardsProps> = ({
  pendingCount = 5,
  activeCount = 8,
  requisitionCount = 3,
  slaRate = 98.2,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Pending Dispatches */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-0.5">
            คำร้องใหม่รอดำเนินการ (BR4)
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              0{pendingCount}
            </h3>
            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              ! เร่งด่วนสูงสุด 2 เคส
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">ตรวจคัดกรองทันที</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Active in progress */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-0.5">
            คำร้องกำลังปฏิบัติงาน
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              0{activeCount}
            </h3>
            <span className="text-[11px] font-medium text-slate-500">
              → ทีมช่าง 4 ฝ่าย
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">ส่งงานแล้ว 100%</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Requisitions pending approval */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-0.5">
            รอเบิกพัสดุ/อุปกรณ์ (UC-10)
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              0{requisitionCount}
            </h3>
            <span className="text-[11px] font-medium text-slate-500">
              มูลค่า ~฿4,850
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">เช็กสต็อกพร้อมจ่าย</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Box className="w-5 h-5" />
        </div>
      </div>

      {/* 4. SLA rate */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-0.5">
            อัตราปิดงานตาม SLA
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {slaRate}%
            </h3>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              +1.4% รอบสัปดาห์
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">เป้าหมาย &gt;= 95%</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckSquare className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
