'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Sidebar } from '@/components/common/Sidebar';
import { ReporterHeader } from '@/components/reporter/ReporterHeader';
import { ReporterStatCards } from '@/components/reporter/ReporterStatCards';
import { TicketForm } from '@/components/reporter/TicketForm';
import { ActiveTicketTracker } from '@/components/reporter/ActiveTicketTracker';
import { EvaluationCard } from '@/components/reporter/EvaluationCard';
import { TicketHistoryTable } from '@/components/reporter/TicketHistoryTable';
import { MobileBottomNav, ReporterMobileTab } from '@/components/reporter/MobileBottomNav';
import { TicketCardSkeleton, StatCardSkeleton } from '@/components/common/Skeleton';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { PageTransition, AnimatePresence, motion } from '@/components/common/MotionWrapper';
import { fetcher, defaultSwrConfig } from '@/lib/swr';
import { Ticket } from '@/types';
import {
  ClipboardList,
  PlusCircle,
  Clock,
  History,
  ArrowRight,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

export default function ReporterPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [activeTab, setActiveTab] = useState<ReporterMobileTab>('create');

  // SWR: Ultra-fast cached data loading with background revalidation
  const {
    data: swrData,
    error: fetchError,
    isLoading,
    mutate: mutateTickets,
  } = useSWR<{ success: boolean; data: Ticket[] }>('/api/tickets', fetcher, defaultSwrConfig);

  const tickets: Ticket[] = swrData?.data || [];

  const defaultActiveTicket = tickets.find(
    (t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED' || t.status === 'PENDING_DISPATCH'
  );

  const selectedTicket = selectedTicketId
    ? tickets.find((t) => t.id === selectedTicketId) || defaultActiveTicket
    : defaultActiveTicket || tickets[0];

  // Prioritize a completed ticket that has NOT been evaluated yet so the user can submit an evaluation
  const completedTicketForEval =
    tickets.find((t) => t.status === 'COMPLETED' && !t.evaluation) ||
    tickets.find((t) => t.status === 'COMPLETED');

  const handleCancelTicket = async (t: Ticket) => {
    const confirmCancel = confirm(`คุณต้องการขอยกเลิกคำร้อง ${t.ticketNumber} ใช่หรือไม่?`);
    if (!confirmCancel) return;

    // Optimistic UI update: update local SWR state immediately
    mutateTickets(
      (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((item) =>
            item.id === t.id ? { ...item, status: 'CANCELLED' as const } : item
          ),
        };
      },
      false
    );

    try {
      const res = await fetch(`/api/tickets/${t.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'CANCEL',
          reason: 'ผู้แจ้งขอยกเลิกคำร้องผ่านหน้าเว็บไซต์',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedTicketId(null);
        mutateTickets();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการยกเลิก');
        mutateTickets(); // Revert
      }
    } catch (e) {
      console.error(e);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อยกเลิกคำร้องได้');
      mutateTickets(); // Revert
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans">
      <Sidebar
        currentRole="REPORTER"
        userName="สมชาย เกียรติวิทยา"
        userEmail="somchai.k@kkumail.com"
      />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar for Desktop */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200/90 shadow-2xs">
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              พอร์ทัลผู้แจ้งเหตุ (Reporter Workspace)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              SC-09 อาคารวิทยวิภาส • วิทยาลัยการคอมพิวเตอร์ มข.
            </p>
          </div>

          {/* Desktop 3-Tab Switcher with Spring Physics */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setFormKey((k) => k + 1);
                setActiveTab('create');
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-blue-700 text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>แจ้งซ่อมใหม่</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative ${
                activeTab === 'tracker'
                  ? 'bg-blue-700 text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>ติดตามสถานะงานสด</span>
              {defaultActiveTicket && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ring-2 ring-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-700 text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <History className="w-4 h-4" />
              <span>รายการคำร้องทั้งหมด</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'history'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tickets.length}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
          {/* Mobile Top Header & Segmented Switcher (< lg) */}
          <div className="lg:hidden mb-4 space-y-3">
            {activeTab !== 'create' && (
              <>
                <ReporterHeader
                  onNewTicketClick={() => {
                    setFormKey((k) => k + 1);
                    setActiveTab('create');
                  }}
                />

                {/* Mobile Secondary Tab Bar */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tracker')}
                    className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-[11.5px] sm:text-xs font-bold transition cursor-pointer ${
                      activeTab === 'tracker'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>ติดตามสถานะสด</span>
                    {defaultActiveTicket && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-[11.5px] sm:text-xs font-bold transition cursor-pointer ${
                      activeTab === 'history'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>รายการคำร้อง ({tickets.length})</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Error Banner with Retry */}
          {fetchError && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-xs font-medium">{fetchError.message || 'ไม่สามารถโหลดข้อมูลคำร้องได้'}</span>
              </div>
              <button
                type="button"
                onClick={() => mutateTickets()}
                className="px-3 py-1.5 rounded-xl bg-amber-200/60 hover:bg-amber-200 text-amber-900 text-xs font-bold transition flex items-center space-x-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>ลองใหม่</span>
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* TAB 1: ยื่นคำร้องแจ้งซ่อมใหม่ (Form Stepper) */}
            {activeTab === 'create' && (
              <PageTransition key="create" className="max-w-4xl mx-auto">
                <TicketForm
                  key={formKey}
                  onSuccess={() => {
                    mutateTickets();
                    setActiveTab('tracker');
                  }}
                  onCancel={() => {
                    setActiveTab('tracker');
                  }}
                />
              </PageTransition>
            )}

            {/* TAB 2: ติดตามสถานะงานสด & การประเมิน (Live Tracker & Evaluation) */}
            {activeTab === 'tracker' && (
              <PageTransition key="tracker" className="space-y-6">
                {/* Stat Summary Cards or Skeletons */}
                {isLoading && tickets.length === 0 ? (
                  <div className="space-y-6">
                    <LoadingScreen message="กำลังโหลดข้อมูลคำร้องและสถานะงาน..." />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                    </div>
                  </div>
                ) : (
                  <ReporterStatCards
                    totalCount={tickets.length}
                    inProgressCount={tickets.filter((t) => t.status === 'IN_PROGRESS').length}
                    pendingCount={tickets.filter((t) => t.status === 'PENDING_DISPATCH').length}
                    completedCount={tickets.filter((t) => t.status === 'COMPLETED').length}
                  />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-8 space-y-6">
                    {isLoading && tickets.length === 0 ? (
                      <TicketCardSkeleton />
                    ) : (
                      <ActiveTicketTracker
                        ticket={selectedTicket}
                        onCancelled={() => {
                          setSelectedTicketId(null);
                          mutateTickets();
                        }}
                      />
                    )}

                    {/* Empty state if tracker tab selected but no tickets */}
                    {!isLoading && !selectedTicket && !completedTicketForEval && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 text-center shadow-xs">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                          <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-[13px] sm:text-sm mb-1">
                          ยังไม่มีรายการแจ้งซ่อมที่ต้องติดตาม
                        </h3>
                        <p className="text-[11.5px] sm:text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
                          เมื่อคุณส่งคำร้องแจ้งซ่อมแล้ว คุณสามารถติดตามสถานะการทำงานของช่างได้ที่หน้านี้แบบเรียลไทม์
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setFormKey((k) => k + 1);
                            setActiveTab('create');
                          }}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[11.5px] sm:text-xs shadow-xs transition cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>ส่งคำร้องแจ้งซ่อมใหม่</span>
                        </button>
                      </div>
                    )}

                    {/* Satisfaction Rating and Feedback */}
                    <EvaluationCard
                      ticket={completedTicketForEval}
                      onEvaluated={() => mutateTickets()}
                    />
                  </div>

                  {/* Quick Info & Switch to History Action */}
                  <div className="lg:col-span-4 space-y-4">
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            <History className="w-3.5 h-3.5" />
                          </div>
                          <h4 className="text-[11.5px] sm:text-xs font-extrabold text-slate-900">
                            ประวัติคำร้องทั้งหมด
                          </h4>
                        </div>
                        <span className="text-[10.5px] sm:text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {tickets.length} คำร้อง
                        </span>
                      </div>

                      <p className="text-[11.5px] sm:text-xs text-slate-500 leading-relaxed mb-4">
                        ดูตารางประวัติคำร้องแจ้งซ่อมทั้งหมดของคุณ ตรวจสอบสถานะย้อนหลัง หรือค้นหาตามห้องและรหัสคำร้อง
                      </p>

                      <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/80 hover:border-blue-200 text-[11.5px] sm:text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>เปิดหน้ารายการคำร้องทั้งหมด</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  </div>
                </div>
              </PageTransition>
            )}

            {/* TAB 3: รายการคำร้องทั้งหมด (Full-width History Table) */}
            {activeTab === 'history' && (
              <PageTransition key="history" className="space-y-6">
                {/* Stat Summary Cards */}
                <ReporterStatCards
                  totalCount={tickets.length}
                  inProgressCount={tickets.filter((t) => t.status === 'IN_PROGRESS').length}
                  pendingCount={tickets.filter((t) => t.status === 'PENDING_DISPATCH').length}
                  completedCount={tickets.filter((t) => t.status === 'COMPLETED').length}
                />

                {/* Full-width Ticket History Table */}
                <div className="w-full">
                  <TicketHistoryTable
                    tickets={tickets}
                    onSelectTicket={(t) => {
                      setSelectedTicketId(t.id);
                      setActiveTab('tracker');
                    }}
                    onCancelTicket={handleCancelTicket}
                  />
                </div>
              </PageTransition>
            )}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar (< lg): Hidden in 'create' tab to leave full screen for stepper actions */}
        {activeTab !== 'create' && (
          <MobileBottomNav
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            hasActiveTicket={Boolean(defaultActiveTicket)}
            historyCount={tickets.length}
          />
        )}
      </div>
    </div>
  );
}
