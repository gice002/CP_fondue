'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { ExecutiveHeader } from '@/components/executive/ExecutiveHeader';
import { ExecutiveStatCards } from '@/components/executive/ExecutiveStatCards';
import { AnalyticsCharts } from '@/components/executive/AnalyticsCharts';
import { TechnicianLeaderboard } from '@/components/executive/TechnicianLeaderboard';
import { RequisitionSummaryCard } from '@/components/executive/RequisitionSummaryCard';
import { AuditLogTable } from '@/components/executive/AuditLogTable';
import { ExecutiveStats, AuditLog } from '@/types';
import { MOCK_EXECUTIVE_STATS, MOCK_AUDIT_LOGS, MOCK_USERS } from '@/data/mockData';

export default function ExecutivePage() {
  const [stats, setStats] = useState<ExecutiveStats>(MOCK_EXECUTIVE_STATS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  const fetchData = async () => {
    try {
      const [resStats, resLogs] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/audit-logs'),
      ]);
      const dataStats = await resStats.json();
      const dataLogs = await resLogs.json();

      if (dataStats.success) setStats(dataStats.data);
      if (dataLogs.success) setAuditLogs(dataLogs.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
              ศูนย์สรุปผลและรายงานผู้บริหาร (Executive Suite)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              SC-09 อาคารวิทยวิภาส • รายงานคุณภาพ SLA &amp; เกณฑ์ EdPEx
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert('ส่งออกรายงานสรุปผลคุณภาพ EdPEx ประจำเดือนเรียบร้อยแล้ว')}
            className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition"
          >
            ส่งออกรายงาน EdPEx
          </button>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header with Evaluation Periods & Export button on mobile */}
          <div className="lg:hidden">
            <ExecutiveHeader onExport={() => alert('ส่งออกรายงานสรุปผลคุณภาพ EdPEx ประจำเดือนเรียบร้อยแล้ว')} />
          </div>

          {/* 4 Stat Cards */}
          <ExecutiveStatCards stats={stats} />

          {/* Row 1: Analytics Charts (Donut + Weekly Bar Chart) */}
          <AnalyticsCharts stats={stats} />

          {/* Row 2: Technician Performance Leaderboard + Requisitions Inventory Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
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
          <AuditLogTable logs={auditLogs} />
        </main>
      </div>
    </div>
  );
}
