'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { TechnicianHeader, TechnicianInfo } from '@/components/technician/TechnicianHeader';
import { NewJobCard } from '@/components/technician/NewJobCard';
import { CheckInRequisitionCard } from '@/components/technician/CheckInRequisitionCard';
import { CloseJobCard } from '@/components/technician/CloseJobCard';
import { TechnicianHistoryList } from '@/components/technician/TechnicianHistoryList';
import { Ticket } from '@/types';
import { Inbox, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { TicketForm } from '@/components/reporter/TicketForm';
import { InfoTooltip } from '@/components/common/InfoTooltip';

export default function TechnicianPage() {
  const [allTechTickets, setAllTechTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTechId, setSelectedTechId] = useState<string>('all');
  const [techniciansList, setTechniciansList] = useState<TechnicianInfo[]>([]);
  const [currentTechId, setCurrentTechId] = useState<string>('usr_tech_01');
  const [currentTechName, setCurrentTechName] = useState<string>('นายอนุชา พงษ์ศิริ');
  const [currentTechEmail, setCurrentTechEmail] = useState<string>('anucha.p@kkumail.com');
  const [currentTechCode, setCurrentTechCode] = useState<string>('TC-4091');
  const [currentTechDepartment, setCurrentTechDepartment] = useState<string>(
    'ฝ่ายงานช่างเครือข่ายและการสื่อสาร CP KKU'
  );
  const [activeSubView, setActiveSubView] = useState<'desk' | 'report'>('desk');

  // Load available technicians for switcher
  useEffect(() => {
    async function loadTechnicians() {
      try {
        const res = await fetch('/api/technicians', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const list: TechnicianInfo[] = data.data.map((t: any) => ({
            id: t.id,
            name: `${t.firstName} ${t.lastName}`,
            email: t.email,
            specialty: t.specialty || t.departmentName || 'ช่างซ่อมบำรุง',
            code: `TC-${t.id.slice(-4).toUpperCase()}`,
          }));
          setTechniciansList(list);
        }
      } catch (e) {
        console.error('Failed to load technicians list:', e);
      }
    }
    loadTechnicians();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);

      // Check session
      try {
        const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
        const sessionData = await sessionRes.json();
        if (sessionData.success && sessionData.data?.userId && sessionData.data.role === 'TECHNICIAN') {
          setCurrentTechId(sessionData.data.userId);
          setCurrentTechName(`${sessionData.data.firstName} ${sessionData.data.lastName}`);
          setCurrentTechEmail(sessionData.data.email);
        }
      } catch {
        // keep defaults
      }

      // Query tickets according to selectedTechId
      let url = '/api/tickets';
      if (selectedTechId !== 'all') {
        url = `/api/tickets?technicianId=${selectedTechId}`;
      } else {
        // when 'all', fetch all active/completed tickets
        url = '/api/tickets?excludeStatus=CANCELLED';
      }

      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // If 'all' was selected, filter only tickets that are ASSIGNED, IN_PROGRESS, or COMPLETED
        const relevant =
          selectedTechId === 'all'
            ? data.data.filter((t: Ticket) =>
                ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(t.status)
              )
            : data.data;

        setAllTechTickets(relevant);

        // Select first active ticket if none currently selected
        if (!selectedTicketId && relevant.length > 0) {
          const firstActive = relevant.find((t: Ticket) => t.status !== 'COMPLETED') || relevant[0];
          setSelectedTicketId(firstActive.id);
        }
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
  }, [selectedTechId]);

  const handleSelectTech = (techId: string) => {
    setSelectedTechId(techId);
    if (techId !== 'all') {
      const found = techniciansList.find((t) => t.id === techId);
      if (found) {
        setCurrentTechId(found.id);
        setCurrentTechName(found.name);
        setCurrentTechEmail(found.email);
        setCurrentTechCode(found.code || 'TC-4091');
        setCurrentTechDepartment(found.specialty || 'ฝ่ายงานช่าง CP KKU');
      }
    } else {
      setCurrentTechName('ภาพรวมคิวงานทีมช่าง (All)');
      setCurrentTechCode('TEAM-ALL');
      setCurrentTechDepartment('ฝ่ายซ่อมบำรุงและเทคนิคทั้งหมด วิทยาลัยการคอมพิวเตอร์');
    }
  };

  // Compute live dynamic counts
  const assignedCount = allTechTickets.filter((t) => t.status === 'ASSIGNED').length;
  const inProgressCount = allTechTickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = allTechTickets.filter((t) => t.status === 'COMPLETED').length;

  // Find if technician has an ongoing task in progress
  const ongoingTask = allTechTickets.find((t) => t.status === 'IN_PROGRESS');

  // Determine activeJob: prioritized by ongoingTask first, then selectedTicketId, then first assigned task
  const activeJob =
    (selectedTicketId && allTechTickets.find((t) => t.id === selectedTicketId)) ||
    ongoingTask ||
    allTechTickets.find((t) => t.status === 'ASSIGNED') ||
    null;

  // Sort queue: Pull COMPLETED tickets to the bottom!
  const sortedTickets = [...allTechTickets].sort((a, b) => {
    const aIsCompleted = a.status === 'COMPLETED' ? 1 : 0;
    const bIsCompleted = b.status === 'COMPLETED' ? 1 : 0;
    if (aIsCompleted !== bIsCompleted) {
      return aIsCompleted - bIsCompleted;
    }
    return 0; // Keep existing order (tag priority order)
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans">
      <Sidebar
        currentRole="TECHNICIAN"
        userName={currentTechName}
        userEmail={currentTechEmail}
        activeSubView={activeSubView}
        onSelectSubView={(view) => setActiveSubView(view as 'desk' | 'report')}
      />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header with Urgent Order Banner & Metrics */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200/90 shadow-2xs">
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              {activeSubView === 'report'
                ? 'แบบฟอร์มแจ้งซ่อม / แจ้งเหตุขัดข้อง'
                : 'โต๊ะปฏิบัติการช่างเทคนิค (Technician Field Desk)'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              SC-09 อาคารวิทยวิภาส • ฝ่ายช่างซ่อมบำรุง CoP KKU
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/80">
              <span
                className={`w-2 h-2 rounded-full ${
                  ongoingTask ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`}
              ></span>
              {ongoingTask ? 'กำลังปฏิบัติงาน 1 งาน' : 'พร้อมรับงานใหม่'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          {activeSubView === 'report' ? (
            <div className="max-w-3xl mx-auto">
              <TicketForm onSuccess={fetchJobs} />
            </div>
          ) : (
            <>
              <TechnicianHeader
                urgentJobCode={
                  ongoingTask
                    ? ongoingTask.ticketNumber
                    : activeJob?.status === 'ASSIGNED'
                    ? activeJob.ticketNumber
                    : 'ไม่มีงานด่วนค้าง'
                }
                urgentDueMinutes={45}
                assignedCount={assignedCount}
                inProgressCount={inProgressCount}
                completedCount={completedCount}
                currentTechName={currentTechName}
                currentTechCode={currentTechCode}
                currentTechDepartment={currentTechDepartment}
                technicians={techniciansList}
                selectedTechId={selectedTechId}
                onSelectTech={handleSelectTech}
                onRefresh={fetchJobs}
                isRefreshing={isLoading}
              />

              {/* Assigned Jobs Queue Selector */}
              {sortedTickets.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-700 animate-pulse"></span>
                      <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>
                          คิวงานในระบบ ({sortedTickets.length} งาน - เรียงตาม Tags ความสำคัญ)
                        </span>
                        <InfoTooltip text="งานที่มีสถานะ 'เสร็จสิ้นแล้ว' จะถูกไฮไลต์สีเขียวชัดเจนและจัดเรียงไว้ด้านล่างสุดของคิวงานโดยอัตโนมัติ" />
                      </h3>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        มอบหมาย: {assignedCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        กำลังทำ: {inProgressCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        เสร็จแล้ว: {completedCount}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {sortedTickets.map((t) => {
                      const isSelected = activeJob?.id === t.id;
                      const isCompleted = t.status === 'COMPLETED';
                      const isInProgress = t.status === 'IN_PROGRESS';

                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicketId(t.id)}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition relative ${
                            isCompleted
                              ? isSelected
                                ? 'border-emerald-600 bg-emerald-100/80 ring-2 ring-emerald-500/40 shadow-xs'
                                : 'border-emerald-200/90 bg-emerald-50/70 hover:bg-emerald-100/60 hover:border-emerald-300'
                              : isSelected
                              ? isInProgress
                                ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/30 shadow-xs'
                                : 'border-blue-700 bg-blue-50/80 ring-2 ring-blue-600/30 shadow-xs'
                              : isInProgress
                              ? 'border-amber-200 bg-amber-50/30 hover:bg-amber-100/40 hover:border-amber-300'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`font-mono text-xs font-black ${
                                isCompleted ? 'text-emerald-900' : 'text-slate-900'
                              }`}
                            >
                              #{t.ticketNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isInProgress
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {isCompleted ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>เสร็จสิ้นแล้ว</span>
                                </>
                              ) : isInProgress ? (
                                <>
                                  <Wrench className="w-3 h-3 text-amber-600" />
                                  <span>กำลังซ่อม</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-blue-600" />
                                  <span>มอบหมายแล้ว</span>
                                </>
                              )}
                            </span>
                          </div>

                          <p
                            className={`text-xs font-semibold line-clamp-1 mb-2 ${
                              isCompleted ? 'text-emerald-950/80' : 'text-slate-700'
                            }`}
                          >
                            {t.description}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>
                              {t.location.roomNumber} ({t.location.floor})
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isCompleted
                                  ? 'text-emerald-800 bg-emerald-100/60'
                                  : 'text-blue-700 bg-blue-50'
                              }`}
                            >
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
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    ยังไม่มีงานซ่อมที่ได้รับมอบหมายในขณะนี้
                  </h3>
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
                  <TechnicianHistoryList technicianId={currentTechId} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
