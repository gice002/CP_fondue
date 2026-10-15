'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState('dispatch');
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Verify session role for ADMIN_DISPATCH
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.data?.role) {
          setCurrentUserRole(data.data.role);
        } else {
          const match = document.cookie.match(/cp_dev_role=([^;]+)/);
          setCurrentUserRole(match ? match[1] : 'ADMIN_DISPATCH');
        }
      } catch {
        setCurrentUserRole('ADMIN_DISPATCH');
      } finally {
        setIsAuthChecking(false);
      }
    }
    checkAuth();
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

  if (!isAuthChecking && currentUserRole && currentUserRole !== 'ADMIN_DISPATCH' && currentUserRole !== 'EXECUTIVE') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">ไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              หน้านี้สำหรับเจ้าหน้าที่ฝ่ายคัดกรองงานช่าง (Staff Desk) เท่านั้น 
              บัญชีปัจจุบันของคุณคือ: <span className="font-bold text-blue-700">{currentUserRole === 'REPORTER' ? 'ผู้แจ้งเหตุ (Reporter)' : currentUserRole}</span>
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Link
              href="/reporter"
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition text-center"
            >
              กลับสู่หน้าผู้แจ้งเหตุ
            </Link>
            <button
              type="button"
              onClick={() => {
                document.cookie = 'cp_fondue_session=; path=/; max-age=0;';
                document.cookie = 'cp_dev_role=; path=/; max-age=0;';
                window.location.href = '/';
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition text-center cursor-pointer"
            >
              เข้าสู่ระบบใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

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
