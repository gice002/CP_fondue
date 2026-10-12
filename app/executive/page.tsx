'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
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
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Navbar
        currentRole="EXECUTIVE"
        userName={`${MOCK_USERS.executive.firstName} ${MOCK_USERS.executive.lastName}`}
        userEmail={MOCK_USERS.executive.email}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Evaluation Periods & Export button */}
        <ExecutiveHeader onExport={() => alert('ส่งออกรายงานสรุปผลคุณภาพ EdPEx ประจำเดือนเรียบร้อยแล้ว')} />

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

        {/* Row 3: Audit Trail & Compliance Table (BR7, BR11, EdPEx) */}
        <AuditLogTable logs={auditLogs} />
      </main>

      <Footer />
    </div>
  );
}
