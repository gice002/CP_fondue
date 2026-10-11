'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStatCards } from '@/components/admin/AdminStatCards';
import { TicketDispatchTable } from '@/components/admin/TicketDispatchTable';
import { TicketVerificationCard } from '@/components/admin/TicketVerificationCard';
import { AssignTechnicianDrawer } from '@/components/admin/AssignTechnicianDrawer';
import { PartApprovalCard } from '@/components/admin/PartApprovalCard';
import { WalkInModal } from '@/components/admin/WalkInModal';
import { Ticket } from '@/types';
import { MOCK_TICKETS, MOCK_USERS } from '@/data/mockData';

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<Ticket>(
    MOCK_TICKETS[0] || ({} as Ticket)
  );
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setTickets(data.data);
        // keep current selection if valid
        const found = data.data.find((t: Ticket) => t.id === selectedTicket.id);
        if (found) setSelectedTicket(found);
        else setSelectedTicket(data.data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        currentRole="ADMIN_DISPATCH"
        userName={`${MOCK_USERS.admin.firstName} ${MOCK_USERS.admin.lastName}`}
        userEmail={MOCK_USERS.admin.email}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <AdminHeader onWalkInClick={() => setIsWalkInOpen(true)} />

        {/* 4 Stat Cards */}
        <AdminStatCards
          pendingCount={tickets.filter((t) => t.status === 'PENDING_DISPATCH').length}
          activeCount={tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length + 5}
          requisitionCount={3}
          slaRate={98.2}
        />

        {/* 2-Column Responsive Grid matching Prototype Page 90 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tickets Queue Table & Detailed Verification */}
          <div className="lg:col-span-7 space-y-6">
            <TicketDispatchTable
              tickets={tickets}
              selectedTicketId={selectedTicket.id}
              onSelectTicket={(t) => setSelectedTicket(t)}
            />

            {selectedTicket?.id && (
              <TicketVerificationCard ticket={selectedTicket} />
            )}
          </div>

          {/* Right Column: Dispatch Drawer & Material Requisition Approval */}
          <div className="lg:col-span-5 space-y-6">
            {selectedTicket?.id && (
              <AssignTechnicianDrawer
                ticket={selectedTicket}
                onAssigned={() => fetchTickets()}
              />
            )}

            <PartApprovalCard onActionComplete={() => fetchTickets()} />
          </div>
        </div>
      </main>

      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        onCreated={() => fetchTickets()}
      />

      <Footer />
    </div>
  );
}
