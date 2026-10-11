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
import { MOCK_TICKETS, MOCK_USERS } from '@/data/mockData';

export default function TechnicianPage() {
  const [activeJob, setActiveJob] = useState<Ticket>(
    MOCK_TICKETS.find((t) => t.ticketNumber === 'REQ-202505-0042') || MOCK_TICKETS[0]
  );

  const fetchJob = async () => {
    try {
      const res = await fetch('/api/tickets/tkt_0042');
      const data = await res.json();
      if (data.success) {
        setActiveJob(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJob();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        currentRole="TECHNICIAN"
        userName={`${MOCK_USERS.tech_anucha.firstName} ${MOCK_USERS.tech_anucha.lastName}`}
        userEmail={MOCK_USERS.tech_anucha.email}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Urgent Order Banner & Metrics */}
        <TechnicianHeader urgentJobCode="WO-202505-0089" urgentDueMinutes={45} />

        {/* 2-Column Responsive Grid matching Prototype Page 91 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: New Job Assignment & On-site Check-in / Parts Requisition */}
          <div className="lg:col-span-6 space-y-6">
            <NewJobCard ticket={activeJob} onAccepted={() => fetchJob()} />
            <CheckInRequisitionCard ticketId={activeJob.id} />
          </div>

          {/* Right Column: Close Job with Proof & Past Work Order Rating History */}
          <div className="lg:col-span-6 space-y-6">
            <CloseJobCard />
            <TechnicianHistoryList />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
