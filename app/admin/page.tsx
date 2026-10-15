'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Sidebar } from '@/components/common/Sidebar';
import { AdminStatCards } from '@/components/admin/AdminStatCards';
import { TicketDispatchCards } from '@/components/admin/TicketDispatchCards';
import { UnifiedDispatchCard } from '@/components/admin/UnifiedDispatchCard';
import { PartApprovalCard } from '@/components/admin/PartApprovalCard';
import { ApprovedRequisitionsTable } from '@/components/admin/ApprovedRequisitionsTable';
import { TicketForm } from '@/components/reporter/TicketForm';
import { LoadingScreen, DispatchWorkspaceSkeleton } from '@/components/common/LoadingScreen';
import { PageTransition, AnimatePresence } from '@/components/common/MotionWrapper';
import { fetcher, defaultSwrConfig } from '@/lib/swr';
import { Ticket, SparePartRequest } from '@/types';

export default function AdminPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState('dispatch');

  // Synchronize session cookie for ADMIN_DISPATCH
  useEffect(() => {
    document.cookie = 'cp_dev_role=ADMIN_DISPATCH; path=/; max-age=86400; SameSite=Lax';
    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN_DISPATCH' }),
    }).catch(() => {});
  }, []);

  // Fast Cached SWR queries
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    mutate: mutateTickets,
  } = useSWR<{ success: boolean; data: Ticket[] }>('/api/tickets', fetcher, defaultSwrConfig);

  const {
    data: reqsData,
    mutate: mutateReqs,
  } = useSWR<{ success: boolean; data: SparePartRequest[] }>(
    '/api/spare-parts/requisitions',
    fetcher,
    defaultSwrConfig
  );

  const tickets = ticketsData?.data || [];
  const requisitions = reqsData?.data || [];

  const selectedTicket = selectedTicketId
    ? tickets.find((t) => t.id === selectedTicketId) || tickets[0]
    : tickets[0] || null;

  const refreshAll = () => {
    mutateTickets();
    mutateReqs();
  };

  const pendingCount = tickets.filter((t) => t.status === 'PENDING_DISPATCH').length;
  const activeCount = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
  const completedCount = tickets.filter((t) => t.status === 'COMPLETED').length;
  const pendingRequisitionCount = requisitions.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans">
      <Sidebar
        currentRole="ADMIN_DISPATCH"
        userName="จิราพร สว่างเนตร"
        userEmail="jiraporn.s@kkumail.com"
        activeSubView={activeSubView}
        onSelectSubView={(view) => setActiveSubView(view)}
      />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top View Title Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200/90 shadow-2xs">
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              {activeSubView === 'inventory'
                ? 'งานพัสดุและเคาน์เตอร์เบิกจ่าย'
                : activeSubView === 'report'
                ? 'แบบฟอร์มแจ้งซ่อม / แจ้งเหตุขัดข้อง'
                : 'โต๊ะคัดกรองและจ่ายงานช่าง (Dispatch Desk)'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              SC-09 อาคารวิทยวิภาส • วิทยาลัยการคอมพิวเตอร์ มข.
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {/* SubView 1: Dispatch Desk */}
            {activeSubView === 'dispatch' && (
              <PageTransition key="dispatch">
                {isTicketsLoading && tickets.length === 0 ? (
                  <div className="space-y-6">
                    <LoadingScreen message="กำลังโหลดคิวงานซ่อมและข้อมูลระบบ CP FONDUE..." />
                    <DispatchWorkspaceSkeleton />
                  </div>
                ) : (
                  <>
                    <AdminStatCards
                      pendingCount={pendingCount}
                      activeCount={activeCount}
                      requisitionCount={pendingRequisitionCount}
                      completedCount={completedCount}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
                      {/* Left Column: Tickets Queue Cards (5 cards per page) */}
                      <div className="lg:col-span-5 space-y-4">
                        <TicketDispatchCards
                          tickets={tickets}
                          selectedTicketId={selectedTicket?.id || ''}
                          onSelectTicket={(t) => {
                            setSelectedTicketId(t.id);
                          }}
                        />
                      </div>

                      {/* Right Column: Unified Dispatch Card (Merged Evidence, Details & Technician Assignment) */}
                      <div className="lg:col-span-7 space-y-4">
                        {selectedTicket ? (
                          <UnifiedDispatchCard
                            ticket={selectedTicket}
                            onCancelled={() => refreshAll()}
                            onAssigned={() => refreshAll()}
                          />
                        ) : (
                          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center text-slate-400 text-xs">
                            กรุณาเลือกคำร้องจากการ์ดคิวงานทางซ้ายมือ
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </PageTransition>
            )}

            {/* SubView 2: Inventory & Store Operations */}
            {activeSubView === 'inventory' && (
              <PageTransition key="inventory" className="max-w-5xl mx-auto space-y-6">
                <PartApprovalCard onActionComplete={() => refreshAll()} />
                <ApprovedRequisitionsTable requisitions={requisitions} />
              </PageTransition>
            )}

            {/* SubView 3: Report Ticket (Same as Reporter) */}
            {activeSubView === 'report' && (
              <PageTransition key="report" className="max-w-3xl mx-auto">
                <TicketForm onSuccess={() => refreshAll()} />
              </PageTransition>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
