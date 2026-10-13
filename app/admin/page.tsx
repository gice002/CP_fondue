'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStatCards } from '@/components/admin/AdminStatCards';
import { TicketDispatchTable } from '@/components/admin/TicketDispatchTable';
import { TicketVerificationCard } from '@/components/admin/TicketVerificationCard';
import { AssignTechnicianDrawer } from '@/components/admin/AssignTechnicianDrawer';
import { PartApprovalCard } from '@/components/admin/PartApprovalCard';
import { ApprovedRequisitionsTable } from '@/components/admin/ApprovedRequisitionsTable';
import { TicketForm } from '@/components/reporter/TicketForm';
import { Ticket, SparePartRequest } from '@/types';

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [requisitions, setRequisitions] = useState<SparePartRequest[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [resTickets, resReqs] = await Promise.all([
        fetch('/api/tickets', { cache: 'no-store' }),
        fetch('/api/spare-parts/requisitions', { cache: 'no-store' }),
      ]);
      const data = await resTickets.json();
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

      const reqData = await resReqs.json();
      if (reqData.success && Array.isArray(reqData.data)) {
        setRequisitions(reqData.data);
      } else {
        setRequisitions([]);
      }
    } catch (e) {
      console.error('Failed to fetch admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const pendingCount = tickets.filter((t) => t.status === 'PENDING_DISPATCH').length;
  const activeCount = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
  const completedCount = tickets.filter((t) => t.status === 'COMPLETED').length;
  const pendingRequisitionCount = requisitions.filter((r) => r.status === 'PENDING').length;

  const [activeSubView, setActiveSubView] = useState('dispatch');

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
          {/* SubView 1: Dispatch Desk */}
          {activeSubView === 'dispatch' && (
            <>
              <AdminStatCards
                pendingCount={pendingCount}
                activeCount={activeCount}
                requisitionCount={pendingRequisitionCount}
                completedCount={completedCount}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
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
                      onCancelled={() => fetchAdminData()}
                    />
                  )}
                </div>

                {/* Right Column: Dispatch Drawer */}
                <div className="lg:col-span-5 space-y-6">
                  {selectedTicket && (
                    <AssignTechnicianDrawer
                      ticket={selectedTicket}
                      onAssigned={() => fetchAdminData()}
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {/* SubView 2: Inventory & Store Operations */}
          {activeSubView === 'inventory' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <PartApprovalCard onActionComplete={() => fetchAdminData()} />
              <ApprovedRequisitionsTable requisitions={requisitions} />
            </div>
          )}

          {/* SubView 3: Report Ticket (Same as Reporter) */}
          {activeSubView === 'report' && (
            <div className="max-w-3xl mx-auto">
              <TicketForm onSuccess={() => fetchAdminData()} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
