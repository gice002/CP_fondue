'use client';

import React from 'react';
import { ClipboardList, Clock, Users, CheckCircle2 } from 'lucide-react';
import { SpringCard, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';

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
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'กำลังเข้าซ่อม (In Progress)',
      count: inProgressCount,
      subtext: 'ช่างกำลังปฏิบัติงาน',
      icon: Users,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'รอดำเนินการคัดกรอง',
      count: pendingCount,
      subtext: 'รอเจ้าหน้าที่มอบหมายช่าง',
      icon: Clock,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'เสร็จสิ้น / ประเมินแล้ว',
      count: completedCount,
      subtext: 'งานซ่อมที่ปิดงานสำเร็จ',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <StaggerItem key={idx}>
            <SpringCard className="p-3 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-shadow flex items-center justify-between cursor-default">
              <div className="min-w-0 pr-1">
                <p className="text-[10.5px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1 truncate">
                  {card.title}
                </p>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {card.count}
                </h3>
                <p className="text-[9.5px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                  {card.subtext}
                </p>
              </div>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${card.color} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </SpringCard>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
};
