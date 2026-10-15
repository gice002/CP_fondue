'use client';

import React from 'react';
import useSWR from 'swr';
import { Sidebar } from '@/components/common/Sidebar';
import { ExecutiveHeader } from '@/components/executive/ExecutiveHeader';
import { ExecutiveStatCards } from '@/components/executive/ExecutiveStatCards';
import { AnalyticsCharts } from '@/components/executive/AnalyticsCharts';
import { TechnicianLeaderboard } from '@/components/executive/TechnicianLeaderboard';
import { RequisitionSummaryCard } from '@/components/executive/RequisitionSummaryCard';
import { AuditLogTable } from '@/components/executive/AuditLogTable';
import { PageTransition, SpringButton } from '@/components/common/MotionWrapper';
import { triggerSuccessConfetti } from '@/lib/confetti';
import { fetcher, defaultSwrConfig } from '@/lib/swr';
import { ExecutiveStats, AuditLog } from '@/types';
import { MOCK_EXECUTIVE_STATS, MOCK_AUDIT_LOGS, MOCK_USERS } from '@/data/mockData';
import { Download } from 'lucide-react';

export default function ExecutivePage() {
  const { data: analyticsData } = useSWR<{ success: boolean; data: ExecutiveStats }>(
    '/api/analytics',
    fetcher,
    defaultSwrConfig
  );

  const { data: auditData } = useSWR<{ success: boolean; data: AuditLog[] }>(
    '/api/audit-logs',
    fetcher,
    defaultSwrConfig
  );

  const stats = analyticsData?.data || MOCK_EXECUTIVE_STATS;
  const auditLogs = auditData?.data || MOCK_AUDIT_LOGS;

  const handleExport = () => {
    triggerSuccessConfetti();
    alert('ส่งออกรายงานสรุปผล EdPEx ประจำเดือนเรียบร้อยแล้ว');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans">
      <Sidebar
        currentRole="EXECUTIVE"
        userName={`${MOCK_USERS.executive.firstName} ${MOCK_USERS.executive.lastName}`}
        userEmail={MOCK_USERS.executive.email}
      />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200/90 shadow-2xs">
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              แดชบอร์ดภาพรวมและรายงานสถิติ (Dashboard)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              SC-09 อาคารวิทยวิภาส • วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น
            </p>
          </div>

          <SpringButton
            type="button"
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออกรายงาน EdPEx</span>
          </SpringButton>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-6">
          <PageTransition>
            {/* Header with Evaluation Periods & Export button on mobile */}
            <div className="lg:hidden mb-4">
              <ExecutiveHeader onExport={handleExport} />
            </div>

            {/* 4 Stat Cards */}
            <ExecutiveStatCards stats={stats} />

            {/* Row 1: Analytics Charts (Donut + Weekly Bar Chart) */}
            <AnalyticsCharts stats={stats} />

            {/* Row 2: Technician Performance Leaderboard + Requisitions Inventory Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-6">
              <div className="lg:col-span-6 flex flex-col">
                <TechnicianLeaderboard technicians={stats.technicianLeaderboard} />
              </div>

              <div className="lg:col-span-6 flex flex-col">
                <RequisitionSummaryCard
                  parts={stats.partsUsageSummary}
                  totalCost={stats.totalPartsCost}
                  totalRequisitions={stats.totalRequisitions}
                />
              </div>
            </div>

            {/* Row 3: Audit Trail & Compliance Table (EdPEx) */}
            <div className="mt-6">
              <AuditLogTable logs={auditLogs} />
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
