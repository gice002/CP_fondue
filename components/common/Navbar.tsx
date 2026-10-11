'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wrench,
  Bell,
  User as UserIcon,
  Laptop,
  ClipboardList,
  BarChart3,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  currentRole?: 'REPORTER' | 'ADMIN_DISPATCH' | 'TECHNICIAN' | 'EXECUTIVE';
  userName?: string;
  userEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole = 'REPORTER',
  userName = 'สมชาย เกียรติวิทยา',
  userEmail = 'somchai.k@kkumail.com',
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'ผู้แจ้งเหตุ',
      badge: 'Reporter',
      href: '/reporter',
      role: 'REPORTER',
      icon: Laptop,
    },
    {
      name: 'เจ้าหน้าที่คัดกรอง',
      badge: 'Admin Desk',
      href: '/admin',
      role: 'ADMIN_DISPATCH',
      icon: ClipboardList,
    },
    {
      name: 'ทีมช่างซ่อม',
      badge: 'Technician',
      href: '/technician',
      role: 'TECHNICIAN',
      icon: Wrench,
    },
    {
      name: 'ผู้บริหารและสถิติ',
      badge: 'Analytics',
      href: '/executive',
      role: 'EXECUTIVE',
      icon: BarChart3,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-slate-800 transition">
                <Layers className="w-4 h-4 text-slate-100" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 tracking-tight text-base">CP FONDUE</span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 tracking-normal">
                  ระบบแจ้งซ่อมออนไลน์ • วิทยาลัยการคอมพิวเตอร์ มข.
                </p>
              </div>
            </Link>
          </div>

          {/* Minimalist Segmented Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition duration-150 ${
                    isActive
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Notifications */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition"
              title="การแจ้งเตือนระบบ"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>

            {/* Profile badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:block text-right leading-tight">
                <div className="text-xs font-semibold text-slate-900">{userName}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {userEmail}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200 flex items-center justify-center font-semibold text-xs shadow-xs">
                <UserIcon className="w-3.5 h-3.5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden flex overflow-x-auto py-2 px-4 space-x-2 border-t border-slate-200/80 bg-white">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200/80'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
};
