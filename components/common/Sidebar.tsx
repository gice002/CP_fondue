'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Laptop,
  ClipboardList,
  Wrench,
  BarChart3,
  Layers,
  ChevronRight,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  Package,
  LogOut,
  RotateCcw,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { RoleCode } from '@/types';
import { WebPermissionService } from '@/lib/permissionService';

interface SidebarProps {
  currentRole: RoleCode;
  userName?: string;
  userEmail?: string;
  activeSubView?: string;
  onSelectSubView?: (subView: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  userName = 'ผู้ใช้งานระบบ',
  userEmail = 'user@kkumail.com',
  activeSubView,
  onSelectSubView,
}) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetPermissions = () => {
    WebPermissionService.clearAll();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
    }, 2500);
  };

  // Specific sub-navigation items for REPORTER
  const reporterSubNav = [
    { id: 'create', name: 'แจ้งซ่อมใหม่', icon: PlusCircle },
    { id: 'tracker', name: 'ติดตามสถานะงานสด', icon: Clock },
    { id: 'history', name: 'ประวัติการแจ้งเหตุ', icon: ClipboardList },
  ];

  // Specific sub-navigation items for ADMIN_DISPATCH
  const adminSubNav = [
    { id: 'dispatch', name: 'โต๊ะคัดกรองงานช่าง', icon: ClipboardList },
    { id: 'inventory', name: 'งานพัสดุเคาน์เตอร์', icon: Package },
    { id: 'report', name: 'แจ้งซ่อม / แจ้งเหตุ', icon: Laptop },
  ];

  // Specific sub-navigation items for TECHNICIAN
  const technicianSubNav = [
    { id: 'desk', name: 'โต๊ะปฏิบัติการช่าง', icon: Wrench },
    { id: 'report', name: 'แจ้งซ่อม / แจ้งเหตุ', icon: Laptop },
  ];

  // Specific sub-navigation items for EXECUTIVE
  const executiveSubNav = [
    { id: 'overview', name: 'แดชบอร์ดภาพรวม', icon: BarChart3 },
    { id: 'leaderboard', name: 'ประสิทธิภาพทีมช่าง', icon: Wrench },
    { id: 'audit', name: 'บันทึกประวัติ (Audit)', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 h-14 flex items-center justify-between shadow-2xs">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-sm">CP FONDUE</span>
            <span className="block text-[10px] text-blue-700 font-semibold">
              วิทยาลัยการคอมพิวเตอร์ มข.
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & App Info */}
        <div className="p-4 border-b border-slate-100">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-700 group-hover:bg-blue-800 text-white flex items-center justify-center shadow-sm shadow-blue-700/20 transition">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-slate-900 tracking-tight text-base">CP FONDUE</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                ระบบแจ้งซ่อมและจ่ายงาน
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {/* Section: Current Workspace Status */}
          <div className="px-3 py-2 rounded-xl bg-blue-50/70 border border-blue-100">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-0.5">
              บทบาทปัจจุบัน (Role)
            </span>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>
                {currentRole === 'REPORTER'
                  ? 'ผู้แจ้งเหตุ (Reporter)'
                  : currentRole === 'ADMIN_DISPATCH'
                  ? 'เจ้าหน้าที่ (Staff)'
                  : currentRole === 'TECHNICIAN'
                  ? 'ทีมช่างซ่อม (Technician)'
                  : 'แดชบอร์ดภาพรวม (Dashboard)'}
              </span>
            </div>
          </div>

          {/* Special Sub-navigation for REPORTER */}
          {currentRole === 'REPORTER' && onSelectSubView && (
            <div className="space-y-1">
              <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                เมนูผู้แจ้งเหตุ (Reporter Views)
              </span>
              {reporterSubNav.map((sub) => {
                const Icon = sub.icon;
                const isSelected = activeSubView === sub.id || (!activeSubView && sub.id === 'create');
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      onSelectSubView(sub.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Special Sub-navigation for ADMIN_DISPATCH */}
          {currentRole === 'ADMIN_DISPATCH' && onSelectSubView && (
            <div className="space-y-1">
              <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                เมนูเจ้าหน้าที่ (Staff Views)
              </span>
              {adminSubNav.map((sub) => {
                const Icon = sub.icon;
                const isSelected = activeSubView === sub.id || (!activeSubView && sub.id === 'dispatch');
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      onSelectSubView(sub.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Special Sub-navigation for TECHNICIAN */}
          {currentRole === 'TECHNICIAN' && onSelectSubView && (
            <div className="space-y-1">
              <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                เมนูช่าง (Technician Views)
              </span>
              {technicianSubNav.map((sub) => {
                const Icon = sub.icon;
                const isSelected = activeSubView === sub.id || (!activeSubView && sub.id === 'desk');
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      onSelectSubView(sub.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Special Sub-navigation for EXECUTIVE */}
          {currentRole === 'EXECUTIVE' && onSelectSubView && (
            <div className="space-y-1">
              <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                เมนูผู้บริหาร (Executive Views)
              </span>
              {executiveSubNav.map((sub) => {
                const Icon = sub.icon;
                const isSelected = activeSubView === sub.id || (!activeSubView && sub.id === 'overview');
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      onSelectSubView(sub.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* QA & Testing: Reset In-App Permissions & Switch Account */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="px-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>ทดสอบระบบ (Dev / QA)</span>
            </div>
            <button
              type="button"
              onClick={handleResetPermissions}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                resetSuccess
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 border border-transparent'
              }`}
              title="ล้างสิทธิ์ที่เคยอนุญาตไว้ทั้งหมด เพื่อทดสอบกล่องข้อความขอสิทธิ์ใหม่"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <RotateCcw
                  className={`w-3.5 h-3.5 shrink-0 ${
                    resetSuccess ? 'text-emerald-600 animate-spin' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">
                  {resetSuccess ? 'ล้างสิทธิ์ทั้งหมดแล้ว!' : 'รีเซ็ตสิทธิ์ (เคลียร์สิทธิ์)'}
                </span>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  resetSuccess
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {resetSuccess ? 'DONE' : 'RESET'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                document.cookie = 'cp_fondue_session=; path=/; max-age=0;';
                document.cookie = 'cp_dev_role=; path=/; max-age=0;';
                window.location.href = '/';
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 border border-transparent transition cursor-pointer group"
              title="สลับบัญชีเพื่อทดสอบบทบาทอื่นผ่านหน้า Login"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">สลับบัญชีทดสอบด่วน</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                LOGIN
              </span>
            </button>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs ring-1 ring-blue-200 shrink-0">
                <UserIcon className="w-4 h-4 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0 leading-tight">
                <div className="text-xs font-bold text-slate-800 truncate">{userName}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">{userEmail}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                document.cookie = 'cp_fondue_session=; path=/; max-age=0;';
                document.cookie = 'cp_dev_role=; path=/; max-age=0;';
                window.location.href = '/';
              }}
              title="ออกจากระบบ (Sign Out)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>SC-09 อาคารวิทยวิภาส</span>
            <span className="font-mono">v1.2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
