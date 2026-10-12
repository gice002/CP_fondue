import React from 'react';
import { Package, FileSpreadsheet } from 'lucide-react';
import { ExecutiveStats } from '@/types';

interface RequisitionSummaryCardProps {
  parts: ExecutiveStats['partsUsageSummary'];
  totalCost: number;
  totalRequisitions: number;
}

export const RequisitionSummaryCard: React.FC<RequisitionSummaryCardProps> = ({
  parts,
  totalCost,
  totalRequisitions,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-1.5">
              <Package className="w-4 h-4 text-blue-600" />
              <span>สรุปการเบิกจ่ายอุปกรณ์ซ่อมบำรุง</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              รายงานการตัดจ่ายคลังพัสดุ
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {totalRequisitions} ครั้ง
          </span>
        </div>

        {/* List of high volume parts */}
        <div className="space-y-2.5 mb-4">
          {parts.map((p, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
            >
              <div>
                <h4 className="font-bold text-slate-800">{p.partName}</h4>
                <p className="text-[10px] text-slate-400 font-mono">รหัสพัสดุ: {p.partCode}</p>
              </div>

              <div className="text-right">
                <span className="font-mono font-black text-slate-900">{p.usedQuantity}</span>
                <div
                  className={`text-[10px] font-medium mt-0.5 ${
                    p.isLowStock ? 'text-amber-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  {p.stockRemaining}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Material Cost & Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
            มูลค่าการใช้วัสดุประจำงวด:
          </span>
          <span className="text-base font-black text-slate-900 font-mono">
            ฿{totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
          </span>
        </div>

        <button
          onClick={() => alert('เปิดรายงานตรวจสอบคลังพัสดุแบบละเอียด (Inventory Log)')}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
          <span>ใบเบิกพัสดุเต็ม</span>
        </button>
      </div>
    </div>
  );
};
