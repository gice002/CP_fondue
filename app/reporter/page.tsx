'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { ReporterHeader } from '@/components/reporter/ReporterHeader';
import { ReporterStatCards } from '@/components/reporter/ReporterStatCards';
import { TicketForm } from '@/components/reporter/TicketForm';
import { ActiveTicketTracker } from '@/components/reporter/ActiveTicketTracker';
import { EvaluationCard } from '@/components/reporter/EvaluationCard';
import { TicketHistoryTable } from '@/components/reporter/TicketHistoryTable';
import { Ticket } from '@/types';

export default function ReporterPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formKey, setFormKey] = useState(0);

  const refreshTickets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch tickets:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTickets();
  }, []);

  const defaultActiveTicket = tickets.find(
    (t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED' || t.status === 'PENDING_DISPATCH'
  );

  const selectedTicket = selectedTicketId
    ? tickets.find((t) => t.id === selectedTicketId) || defaultActiveTicket
    : defaultActiveTicket || tickets[0];

  const completedTicketForEval = tickets.find((t) => t.status === 'COMPLETED');

  const handleCancelTicket = async (t: Ticket) => {
    const confirmCancel = confirm(`คุณต้องการขอยกเลิกคำร้อง ${t.ticketNumber} ใช่หรือไม่?`);
    if (!confirmCancel) return;

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
        alert(`ยกเลิกคำร้อง ${t.ticketNumber} เรียบร้อยแล้ว`);
        setSelectedTicketId(null);
        refreshTickets();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการยกเลิก');
      }
    } catch (e) {
      console.error(e);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อยกเลิกคำร้องได้');
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
        {/* Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200/90 shadow-2xs">
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              พอร์ทัลผู้แจ้งเหตุ (Reporter Workspace)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              SC-09 อาคารวิทยวิภาส • วิทยาลัยการคอมพิวเตอร์ มข.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFormKey((k) => k + 1)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition"
          >
            + แบบฟอร์มแจ้งซ่อมใหม่
          </button>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          {/* Header on mobile */}
          <div className="lg:hidden mb-4">
            <ReporterHeader onNewTicketClick={() => setFormKey((k) => k + 1)} />
          </div>

          {/* 4 Stat Cards */}
          <ReporterStatCards
            totalCount={tickets.length}
            inProgressCount={tickets.filter((t) => t.status === 'IN_PROGRESS').length}
            pendingCount={tickets.filter((t) => t.status === 'PENDING_DISPATCH').length}
            completedCount={tickets.filter((t) => t.status === 'COMPLETED').length}
          />

          {/* 2-Column Responsive Grid matching Prototype Page 89 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
            {/* Left Column: Repair Submission Form */}
            <div className="lg:col-span-5 space-y-6">
              <TicketForm key={formKey} onSuccess={refreshTickets} />
            </div>

            {/* Right Column: Tracking, Evaluation, and Past History */}
            <div className="lg:col-span-7 space-y-6">
              {/* Active In-Progress Ticket Tracker */}
              <ActiveTicketTracker
                ticket={selectedTicket}
                onCancelled={() => {
                  setSelectedTicketId(null);
                  refreshTickets();
                }}
              />

              {/* Satisfaction Rating and Feedback */}
              <EvaluationCard
                ticket={completedTicketForEval}
                onEvaluated={refreshTickets}
              />

              {/* Ticket History & Past Requests */}
              <TicketHistoryTable
                tickets={tickets}
                onSelectTicket={(t) => setSelectedTicketId(t.id)}
                onCancelTicket={handleCancelTicket}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
