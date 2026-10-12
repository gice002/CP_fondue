'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
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
              {activeSubView === 'operations'
                ? 'งานบริหารพัสดุและเคาน์เตอร์บริการ'
                : 'โต๊ะคัดกรองและจ่ายงานช่าง (Dispatch Desk)'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              SC-09 อาคารวิทยวิภาส • วิทยาลัยการคอมพิวเตอร์ มข.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsWalkInOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition"
            >
              + เปิดใบงานฉุกเฉิน (Walk-in)
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          {/* 4 Stat Cards */}
          <AdminStatCards
            pendingCount={pendingCount}
            activeCount={activeCount}
            requisitionCount={1}
            slaRate={98.2}
          />

          {/* SubView 1: Dispatch Desk */}
          {activeSubView === 'dispatch' && (
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
                    onCancelled={() => fetchTickets()}
                  />
                )}
              </div>

              {/* Right Column: Dispatch Drawer */}
              <div className="lg:col-span-5 space-y-6">
                {selectedTicket && (
                  <AssignTechnicianDrawer
                    ticket={selectedTicket}
                    onAssigned={() => fetchTickets()}
                  />
                )}
              </div>
            </div>
          )}

          {/* SubView 2: Store Operations & Walk-ins */}
          {activeSubView === 'operations' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
              <div className="lg:col-span-8 space-y-6">
                <PartApprovalCard onActionComplete={() => fetchTickets()} />
              </div>

              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
                <h3 className="font-extrabold text-sm text-slate-900 mb-2">
                  เปิดใบงานหน้าเคาน์เตอร์ (Walk-in Desk)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 font-normal">
                  สำหรับกรณีอาจารย์ บุคลากร หรือนักศึกษาเดินทางมาติดต่อแจ้งซ่อมหน้าเคาน์เตอร์ธุรการ SC-09 โดยตรง
                </p>
                <button
                  type="button"
                  onClick={() => setIsWalkInOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition"
                >
                  + สร้างใบงานฉุกเฉินทันที
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        onCreated={() => fetchTickets()}
      />
    </div>
  );
}
