'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
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
    const confirmCancel = confirm(`คุณต้องการขอยกเลิกคำร้อง ${t.ticketNumber} ใช่หรือไม่? (UC-5)`);
    if (!confirmCancel) return;

    try {
      const res = await fetch(`/api/tickets/${t.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'REPORTER',
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
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Navbar currentRole="REPORTER" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <ReporterHeader onNewTicketClick={() => setFormKey((k) => k + 1)} />

        {/* 4 Stat Cards */}
        <ReporterStatCards
          totalCount={tickets.length}
          inProgressCount={tickets.filter((t) => t.status === 'IN_PROGRESS').length}
          pendingCount={tickets.filter((t) => t.status === 'PENDING_DISPATCH').length}
          completedCount={tickets.filter((t) => t.status === 'COMPLETED').length}
        />

        {/* 2-Column Responsive Grid matching Prototype Page 89 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: UC-1 Repair Submission Form */}
          <div className="lg:col-span-5 space-y-6">
            <TicketForm key={formKey} onSuccess={refreshTickets} />
          </div>

          {/* Right Column: Tracking, Evaluation, and Past History */}
          <div className="lg:col-span-7 space-y-6">
            {/* UC-2: Active In-Progress Ticket Tracker */}
            <ActiveTicketTracker
              ticket={selectedTicket}
              onCancelled={() => {
                setSelectedTicketId(null);
                refreshTickets();
              }}
            />

            {/* UC-6 & UC-3: Satisfaction Rating and Feedback */}
            <EvaluationCard
              ticket={completedTicketForEval}
              onEvaluated={refreshTickets}
            />

            {/* UC-4: Ticket History & Past Requests */}
            <TicketHistoryTable
              tickets={tickets}
              onSelectTicket={(t) => setSelectedTicketId(t.id)}
              onCancelTicket={handleCancelTicket}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
