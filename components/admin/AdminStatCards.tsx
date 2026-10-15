'use client';

import React from 'react';
import { Mail, Users, Box, CheckSquare, ArrowUpRight } from 'lucide-react';
import { SpringCard, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';

interface AdminStatCardsProps {
  pendingCount?: number;
  activeCount?: number;
  requisitionCount?: number;
  completedCount?: number;
}

export const AdminStatCards: React.FC<AdminStatCardsProps> = ({
  pendingCount = 5,
  activeCount = 8,
  requisitionCount = 3,
  completedCount = 12,
}) => {
  return (
    <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Pending Dispatches */}
      <StaggerItem>
        <SpringCard className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between cursor-default">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">
              คำร้องใหม่รอดำเนินการ
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {pendingCount}
              </h3>
              <span className="text-[11px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                ! เร่งด่วนสูงสุด
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">ตรวจคัดกรองทันที</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
        </SpringCard>
      </StaggerItem>

      {/* 2. Active in progress */}
      <StaggerItem>
        <SpringCard className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between cursor-default">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">
              คำร้องกำลังปฏิบัติงาน
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeCount}
              </h3>
              <span className="text-[11px] font-medium text-slate-500">
                → ทีมช่างผู้รับผิดชอบ
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">กำลังดำเนินการ</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </SpringCard>
      </StaggerItem>

      {/* 3. Requisitions pending approval */}
      <StaggerItem>
        <SpringCard className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between cursor-default">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">
              รอเบิกพัสดุ/อุปกรณ์
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {requisitionCount}
              </h3>
              <span className="text-[11px] font-medium text-slate-500">
                เคาน์เตอร์พัสดุ
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">เช็กสต็อกพร้อมจ่าย</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Box className="w-5 h-5" />
          </div>
        </SpringCard>
      </StaggerItem>

      {/* 4. Completed tasks */}
      <StaggerItem>
        <SpringCard className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between cursor-default">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">
              งานที่เสร็จสิ้นแล้ว
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {completedCount}
              </h3>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
                <ArrowUpRight className="w-3 h-3" />
                สมบูรณ์
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">ปิดงานเรียบร้อย</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
        </SpringCard>
      </StaggerItem>
    </StaggerContainer>
  );
};
