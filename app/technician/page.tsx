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
  const [allTechTickets, setAllTechTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      // Fetch tickets assigned to this technician
      const res = await fetch('/api/tickets?technicianId=usr_tech_01');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setAllTechTickets(data.data);
      } else {
        // Fallback: fetch any active tickets in system
        const resAll = await fetch('/api/tickets');
        const dataAll = await resAll.json();
        if (dataAll.success && dataAll.data.length > 0) {
          setAllTechTickets(dataAll.data);
        } else {
          setAllTechTickets([]);
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

  // Find if technician has an ongoing task in progress
  const ongoingTask = allTechTickets.find((t) => t.status === 'IN_PROGRESS');

  // Determine activeJob: prioritized by selectedTicketId, then ongoingTask, then first assigned task, then first ticket
  const activeJob =
    (selectedTicketId && allTechTickets.find((t) => t.id === selectedTicketId)) ||
    ongoingTask ||
    allTechTickets.find((t) => t.status === 'ASSIGNED') ||
    allTechTickets[0] ||
    null;

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

        {/* Assigned Jobs Queue Selector */}
        {allTechTickets.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <h3 className="text-xs font-bold text-slate-800">
                  รายการงานที่ได้รับมอบหมายทั้งหมด ({allTechTickets.length} งาน - เรียงตามลำดับความสำคัญของ Tags)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">คลิกที่งานเพื่อดูและปฏิบัติงาน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allTechTickets.map((t) => {
                const isSelected = activeJob?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTicketId(t.id);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        #{t.ticketNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : t.status === 'ASSIGNED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.status === 'IN_PROGRESS'
                          ? 'กำลังซ่อม'
                          : t.status === 'ASSIGNED'
                          ? 'มอบหมายแล้ว'
                          : 'เสร็จสิ้น'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium line-clamp-1 mb-2">
                      {t.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{t.location.roomNumber} ({t.location.floor})</span>
                      <div className="flex flex-wrap gap-1">
                        {t.tags && t.tags.length > 0 ? (
                          t.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                                tag === 'งานเร่งด่วน'
                                  ? 'bg-red-100 text-red-700'
                                  : tag === 'งานเร่ง'
                                  ? 'bg-amber-100 text-amber-700'
                                  : tag === 'งานจำเป็น'
                                  ? 'bg-blue-100 text-blue-700'
                                  : tag === 'งานที่ต้องรออุปกรณ์'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-slate-400">งานทั่วไป</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2-Column Responsive Grid matching Prototype Page 91 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: New Job Assignment & On-site Check-in / Parts Requisition */}
          <div className="lg:col-span-6 space-y-6">
            {activeJob ? (
              <>
                <NewJobCard
                  ticket={activeJob}
                  hasOngoingTask={Boolean(ongoingTask && ongoingTask.id !== activeJob.id)}
                  onAccepted={fetchJobs}
                />
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
