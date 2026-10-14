'use client';

import React from 'react';
import { PlusCircle, Clock, History } from 'lucide-react';

export type ReporterMobileTab = 'create' | 'tracker' | 'history';

interface MobileBottomNavProps {
  activeTab: ReporterMobileTab;
  onChangeTab: (tab: ReporterMobileTab) => void;
  hasActiveTicket?: boolean;
  historyCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  hasActiveTicket = false,
  historyCount = 0,
}) => {
  const tabs = [
    {
      id: 'create' as ReporterMobileTab,
      label: 'แจ้งซ่อมใหม่',
      icon: PlusCircle,
      badge: null,
    },
    {
      id: 'tracker' as ReporterMobileTab,
      label: 'ติดตามสถานะ',
      icon: Clock,
      badge: hasActiveTicket ? 'งานสด' : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'history' as ReporterMobileTab,
      label: 'ประวัติคำร้อง',
      icon: History,
      badge: historyCount > 0 ? String(historyCount) : null,
      badgeColor: 'bg-slate-200 text-slate-700',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 pt-1 pb-safe"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
    >
      <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-150 active:scale-90 cursor-pointer ${
                isActive
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              {/* Active Pill Indicator Background */}
              {isActive && (
                <span className="absolute top-1 inset-x-4 h-9 bg-blue-50/90 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-150" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 text-blue-700' : 'text-slate-500'
                  }`}
                />
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-3 text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
