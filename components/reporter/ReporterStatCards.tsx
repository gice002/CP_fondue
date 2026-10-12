import React from 'react';
import { ClipboardList, Clock, Users, CheckCircle2 } from 'lucide-react';

interface ReporterStatCardsProps {
  totalCount?: number;
  inProgressCount?: number;
  pendingCount?: number;
  completedCount?: number;
}

export const ReporterStatCards: React.FC<ReporterStatCardsProps> = ({
  totalCount = 12,
  inProgressCount = 1,
  pendingCount = 1,
  completedCount = 8,
}) => {
  const cards = [
    {
      title: 'คำร้องทั้งหมดของฉัน',
      count: totalCount,
      subtext: 'บันทึกตลอดปี 2568',
      icon: ClipboardList,
    },
    {
      title: 'กำลังเข้าซ่อม (In Progress)',
      count: inProgressCount,
      subtext: 'ช่างกำลังปฏิบัติงาน',
      icon: Users,
    },
    {
      title: 'รอดำเนินการคัดกรอง',
      count: pendingCount,
      subtext: 'รอเจ้าหน้าที่มอบหมายช่าง',
      icon: Clock,
    },
    {
      title: 'เสร็จสิ้น / ประเมินแล้ว',
      count: completedCount,
      subtext: 'งานซ่อมที่ปิดงานสำเร็จ',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{card.count}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.subtext}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
