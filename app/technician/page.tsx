'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { TechnicianHeader } from '@/components/technician/TechnicianHeader';
import { NewJobCard } from '@/components/technician/NewJobCard';
import { CheckInRequisitionCard } from '@/components/technician/CheckInRequisitionCard';
import { CloseJobCard } from '@/components/technician/CloseJobCard';
import { TechnicianHistoryList } from '@/components/technician/TechnicianHistoryList';
import { Ticket } from '@/types';

export default function TechnicianPage() {
  const [activeJob, setActiveJob] = useState<Ticket | null>(null);
  const [allTechTickets, setAllTechTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      // Fetch tickets assigned to this technician
      const res = await fetch('/api/tickets?technicianId=usr_tech_01');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setAllTechTickets(data.data);
        const active = data.data.find(
          (t: Ticket) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS'
        );
        setActiveJob(active || data.data[0]);
      } else {
        // Fallback: fetch any active tickets in system
        const resAll = await fetch('/api/tickets');
        const dataAll = await resAll.json();
        if (dataAll.success && dataAll.data.length > 0) {
          setAllTechTickets(dataAll.data);
          const active = dataAll.data.find(
            (t: Ticket) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS'
          );
          setActiveJob(active || dataAll.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch technician jobs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Navbar
        currentRole="TECHNICIAN"
        userName="นายอนุชา พงษ์ศิริ"
        userEmail="anucha.p@kkumail.com"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Urgent Order Banner & Metrics */}
        <TechnicianHeader
          urgentJobCode={activeJob ? activeJob.ticketNumber : 'ไม่มีงานด่วนค้าง'}
          urgentDueMinutes={45}
        />

        {/* 2-Column Responsive Grid matching Prototype Page 91 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: New Job Assignment & On-site Check-in / Parts Requisition */}
          <div className="lg:col-span-6 space-y-6">
            {activeJob ? (
              <>
                <NewJobCard ticket={activeJob} onAccepted={fetchJobs} />
                <CheckInRequisitionCard ticketId={activeJob.id} onSubmitted={fetchJobs} />
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                ไม่มีงานที่ได้รับมอบหมายในขณะนี้
              </div>
            )}
          </div>

          {/* Right Column: Close Job with Proof & Past Work Order Rating History */}
          <div className="lg:col-span-6 space-y-6">
            {activeJob && (
              <CloseJobCard ticket={activeJob} onClosed={fetchJobs} />
            )}
            <TechnicianHistoryList />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
