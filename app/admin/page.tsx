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

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setTickets(data.data);
        const nonCancelled = data.data.filter((t: Ticket) => t.status !== 'CANCELLED');
        const found = selectedTicket
          ? data.data.find((t: Ticket) => t.id === selectedTicket.id)
          : null;
        if (found && found.status !== 'CANCELLED') {
          setSelectedTicket(found);
        } else {
          setSelectedTicket(nonCancelled.length > 0 ? nonCancelled[0] : data.data[0]);
        }
      } else {
        setTickets([]);
        setSelectedTicket(null);
      }
    } catch (e) {
      console.error('Failed to fetch admin tickets:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const pendingCount = tickets.filter((t) => t.status === 'PENDING_DISPATCH').length;
  const activeCount = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Navbar
        currentRole="ADMIN_DISPATCH"
        userName="จิราพร สว่างเนตร"
        userEmail="jiraporn.s@kkumail.com"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <AdminHeader onWalkInClick={() => setIsWalkInOpen(true)} />

        {/* 4 Stat Cards */}
        <AdminStatCards
          pendingCount={pendingCount}
          activeCount={activeCount}
          requisitionCount={1}
          slaRate={98.2}
        />

        {/* 2-Column Responsive Grid matching Prototype Page 90 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tickets Queue Table & Detailed Verification */}
          <div className="lg:col-span-7 space-y-6">
            <TicketDispatchTable
              tickets={tickets}
              selectedTicketId={selectedTicket?.id || ''}
              onSelectTicket={(t) => setSelectedTicket(t)}
            />

            {selectedTicket && (
              <TicketVerificationCard
                ticket={selectedTicket}
                onCancelled={() => fetchTickets()}
              />
            )}
          </div>

          {/* Right Column: Dispatch Drawer & Material Requisition Approval */}
          <div className="lg:col-span-5 space-y-6">
            {selectedTicket && (
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
