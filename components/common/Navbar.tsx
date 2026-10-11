'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wrench, Bell, User as UserIcon, Shield, Laptop, ClipboardList, BarChart3 } from 'lucide-react';

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
      name: 'พอร์ทัลผู้แจ้งเหตุ',
      href: '/reporter',
      role: 'REPORTER',
      icon: Laptop,
    },
    {
      name: 'พอร์ทัลเจ้าหน้าที่',
      href: '/admin',
      role: 'ADMIN_DISPATCH',
      icon: ClipboardList,
    },
    {
      name: 'พอร์ทัลทีมช่าง',
      href: '/technician',
      role: 'TECHNICIAN',
      icon: Wrench,
    },
    {
      name: 'ระบบผู้ดูแล & รายงานสรุป',
      href: '/executive',
      role: 'EXECUTIVE',
      icon: BarChart3,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-lg">CP REPAIR</span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                    ระบบเปิดให้บริการปกติ (Online)
                  </span>
                </div>
                <p className="text-xs text-slate-500">ระบบแจ้งซ่อมออนไลน์ • วิทยาลัยการคอมพิวเตอร์ มข.</p>
              </div>
            </Link>
          </div>

          {/* Navigation Tabs (Prototypes 4 Roles) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Notifications */}
          <div className="flex items-center space-x-3">
            {/* Notification button */}
            <button
              type="button"
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="การแจ้งเตือนระบบ"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {/* Profile badge matching prototype */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
              <div className="hidden sm:block text-right leading-tight">
                <div className="text-xs font-bold text-slate-800">{userName}</div>
                <div className="text-[11px] text-slate-500 font-mono flex items-center justify-end space-x-1">
                  <span>{userEmail}</span>
                  <span className="text-[10px] text-blue-600 font-medium">(KKU Single Sign-On)</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 border-2 border-blue-200 flex items-center justify-center font-bold text-sm shadow-sm">
                <UserIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden flex overflow-x-auto py-2 px-4 space-x-2 border-t border-slate-200 bg-slate-50">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
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
