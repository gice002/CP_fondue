'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, X, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { ToastPayload } from '@/lib/toastService';

export const InAppToast: React.FC = () => {
  const router = useRouter();
  const [activeToast, setActiveToast] = useState<ToastPayload | null>(null);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const closeToast = () => {
    setActiveToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastPayload>;
      const payload = customEvent.detail;
      if (!payload) return;

      // Clear existing timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);

      setActiveToast(payload);
      setProgress(100);

      const duration = payload.durationMs || 5000;
      const stepMs = 50;
      const stepPercent = (stepMs / duration) * 100;

      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev <= stepPercent) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - stepPercent;
        });
      }, stepMs);

      timerRef.current = setTimeout(() => {
        setActiveToast(null);
      }, duration);
    };

    window.addEventListener('cp_inapp_toast', handleShowToast);
    return () => {
      window.removeEventListener('cp_inapp_toast', handleShowToast);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!activeToast) return null;

  const handleActionClick = () => {
    if (activeToast.actionTab) {
      window.dispatchEvent(
        new CustomEvent('cp_switch_reporter_tab', { detail: { tab: activeToast.actionTab } })
      );
    }
    if (activeToast.actionHref) {
      router.push(activeToast.actionHref);
    }
    closeToast();
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300 select-none"
    >
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/90 shadow-xl shadow-emerald-950/10 overflow-hidden ring-1 ring-black/5">
        {/* Top Header Badge Row */}
        <div className="p-3.5 sm:p-4 pb-3">
          <div className="flex items-start justify-between gap-2.5">
            {/* Animated Checkmark Circle */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 animate-in zoom-in-75 duration-200" />
            </div>

            {/* Text Information */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center space-x-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.2 rounded">
                  แจ้งเตือนระบบ
                </span>
                {activeToast.ticketNumber && (
                  <span className="text-[10.5px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                    {activeToast.ticketNumber}
                  </span>
                )}
              </div>

              <h4 className="text-xs sm:text-[13px] font-black text-slate-900 tracking-tight leading-snug">
                {activeToast.title}
              </h4>

              {activeToast.message && (
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                  {activeToast.message}
                </p>
              )}

              {activeToast.location && (
                <div className="flex items-center space-x-1 text-[10.5px] text-slate-600 font-medium mt-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{activeToast.location}</span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeToast}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0 -mr-1 -mt-1"
              aria-label="ปิดการแจ้งเตือน"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Link (e.g. ดูสถานะงานสด) */}
          {activeToast.actionLabel && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleActionClick}
                className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 hover:underline transition cursor-pointer"
              >
                <span>{activeToast.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Animated Countdown Progress Bar at Bottom */}
        <div className="w-full bg-emerald-100/60 h-1 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
