'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { TechnicianHeader } from '@/components/technician/TechnicianHeader';
import { NewJobCard } from '@/components/technician/NewJobCard';
import { CheckInRequisitionCard } from '@/components/technician/CheckInRequisitionCard';
import { CloseJobCard } from '@/components/technician/CloseJobCard';
import { TechnicianHistoryList } from '@/components/technician/TechnicianHistoryList';
import { Ticket } from '@/types';
import { Inbox, CheckCircle2 } from 'lucide-react';

export default function TechnicianPage() {
  const [allTechTickets, setAllTechTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTechId, setCurrentTechId] = useState<string>('usr_tech_01');
  const [currentTechName, setCurrentTechName] = useState<string>('นายอนุชา พงษ์ศิริ');
  const [currentTechEmail, setCurrentTechEmail] = useState<string>('anucha.p@kkumail.com');

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      // 1. Resolve active session from backend
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      let techIdToQuery = currentTechId;

      if (sessionData.success && sessionData.data?.userId) {
        techIdToQuery = sessionData.data.userId;
        setCurrentTechId(sessionData.data.userId);
        setCurrentTechName(`${sessionData.data.firstName} ${sessionData.data.lastName}`);
        setCurrentTechEmail(sessionData.data.email);
      } else {
        // Fallback: check technicians list
        const techRes = await fetch('/api/technicians');
        const techData = await techRes.json();
        if (techData.success && Array.isArray(techData.data) && techData.data.length > 0) {
          const found = techData.data.find((t: any) => t.email === 'anucha.p@kkumail.com') || techData.data[0];
          if (found) {
            techIdToQuery = found.id;
            setCurrentTechId(found.id);
            setCurrentTechName(`${found.firstName} ${found.lastName}`);
            setCurrentTechEmail(found.email);
          }
        }
      }

      // 2. Fetch tickets strictly assigned to this technician (do NOT fall back to all tickets)
      const res = await fetch(`/api/tickets?technicianId=${techIdToQuery}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAllTechTickets(data.data);
      } else {
        setAllTechTickets([]);
      }
    } catch (e) {
      console.error('Failed to fetch technician jobs:', e);
      setAllTechTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Find if technician has an ongoing task in progress
  const ongoingTask = allTechTickets.find((t) => t.status === 'IN_PROGRESS');

  // Determine activeJob: prioritized by ongoingTask first, then selectedTicketId, then first assigned task
  const activeJob =
    ongoingTask ||
    (selectedTicketId && allTechTickets.find((t) => t.id === selectedTicketId)) ||
    allTechTickets.find((t) => t.status === 'ASSIGNED') ||
    null;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans">
      <Sidebar
        currentRole="TECHNICIAN"
        userName={currentTechName}
        userEmail={currentTechEmail}
      />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header with Urgent Order Banner & Metrics */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200/90 shadow-2xs">
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              โต๊ะปฏิบัติการช่างเทคนิค (Technician Field Desk)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              SC-09 อาคารวิทยวิภาส • ฝ่ายช่างซ่อมบำรุง CoP KKU
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/80">
              <span className={`w-2 h-2 rounded-full ${ongoingTask ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              {ongoingTask ? 'กำลังปฏิบัติงาน 1 งาน' : 'พร้อมรับงานใหม่'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <TechnicianHeader
            urgentJobCode={activeJob ? activeJob.ticketNumber : 'ไม่มีงานด่วนค้าง'}
            urgentDueMinutes={45}
          />

          {/* Assigned Jobs Queue Selector */}
          {allTechTickets.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 mb-6">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-700 animate-pulse"></span>
                  <h3 className="text-xs font-extrabold text-slate-900">
                    คิวงานที่ได้รับมอบหมาย ({allTechTickets.length} งาน - เรียงตามลำดับความสำคัญของ Tags)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">คลิกเพื่อเลือกดูรายละเอียดงาน</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allTechTickets.map((t) => {
                  const isSelected = activeJob?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition relative ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-extrabold text-slate-900">
                          #{t.ticketNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                        <span className="text-[10px] font-semibold text-blue-700">
                          {t.tags?.[0] || 'งานทั่วไป'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-8 mb-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">ยังไม่มีงานซ่อมที่ได้รับมอบหมายในขณะนี้</h3>
              <p className="text-xs text-slate-500">
                ระบบจะแจ้งเตือนเมื่อเจ้าหน้าที่ (Admin Desk) จ่ายงานซ่อมใหม่เข้ามาในคิวของคุณ
              </p>
            </div>
          ) : null}

          {/* Workflow Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <NewJobCard
                ticket={activeJob}
                technicianId={currentTechId}
                hasOngoingTask={Boolean(ongoingTask && ongoingTask.id !== activeJob?.id)}
                onAccepted={fetchJobs}
              />
              <CheckInRequisitionCard
                ticketId={activeJob?.id}
                onSubmitted={fetchJobs}
              />
            </div>

            <div className="space-y-6">
              <CloseJobCard
                ticket={activeJob}
                technicianId={currentTechId}
                onClosed={fetchJobs}
              />
              <TechnicianHistoryList
                technicianId={currentTechId}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
