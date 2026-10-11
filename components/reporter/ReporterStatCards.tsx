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
      bgColor: 'bg-blue-50/70',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100',
    },
    {
      title: 'กำลังเข้าซ่อม (In Progress)',
      count: inProgressCount,
      subtext: 'ช่างกำลังซ่อมแล้ว CP-01',
      icon: Users,
      bgColor: 'bg-cyan-50/70',
      iconColor: 'text-cyan-600',
      borderColor: 'border-cyan-100',
    },
    {
      title: 'รอดำเนินการคัดกรอง',
      count: pendingCount,
      subtext: 'รอส่งต่อทีมช่างเฉพาะทาง',
      icon: Clock,
      bgColor: 'bg-amber-50/70',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-100',
    },
    {
      title: 'เสร็จสิ้น / ประเมินแล้ว',
      count: completedCount,
      subtext: 'รอประเมินคงเหลือ 2 รายการ',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50/70',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 bg-white rounded-2xl border ${card.borderColor} shadow-xs hover:shadow-md transition flex items-center justify-between`}
          >
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{card.count}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.subtext}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl ${card.bgColor} ${card.iconColor} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
