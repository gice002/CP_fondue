'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Laptop,
  ClipboardList,
  Wrench,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Loader2,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RoleCode } from '@/types';
import { motion } from 'motion/react';

function saveDevRoleCookie(role: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `cp_dev_role=${role}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('somchai.k@kkumail.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLoadingRole, setActiveLoadingRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(true);

  // Automatically reset all loading states whenever navigating to/viewing this page
  useEffect(() => {
    setActiveLoadingRole(null);
    setIsSubmitting(false);

    const resetStates = () => {
      setActiveLoadingRole(null);
      setIsSubmitting(false);
    };

    window.addEventListener('pageshow', resetStates);
    window.addEventListener('focus', resetStates);
    return () => {
      window.removeEventListener('pageshow', resetStates);
      window.removeEventListener('focus', resetStates);
    };
  }, []);

  // 4 Roles for evaluation and quick switching matching seed data
  const roleCards = [
    {
      role: 'REPORTER' as RoleCode,
      title: 'ผู้แจ้งเหตุ (Reporter)',
      badge: 'นักศึกษา / อาจารย์ / บุคลากร',
      user: 'สมชาย เกียรติวิทยา',
      email: 'somchai.k@kkumail.com',
      href: '/reporter',
      icon: Laptop,
      theme: 'blue',
      features: [
        'แนบรูปถ่ายความเสียหายพร้อม Mock AI วิเคราะห์เบื้องต้น',
        'ติดตามความคืบหน้างานซ่อม 4 ขั้นตอนแบบเรียลไทม์',
        'ประเมินความพึงพอใจ 5 ดาวหลังงานเสร็จสิ้น',
      ],
    },
    {
      role: 'ADMIN_DISPATCH' as RoleCode,
      title: 'เจ้าหน้าที่ (Staff Desk)',
      badge: 'โต๊ะคัดกรอง & บริหารพัสดุ',
      user: 'จิราพร สว่างเนตร',
      email: 'jiraporn.s@kkumail.com',
      href: '/admin',
      icon: ClipboardList,
      theme: 'indigo',
      features: [
        'โต๊ะคัดกรองคำร้องและจัดลำดับความสำคัญ 5 Tags',
        'มอบหมายงานให้ช่างพร้อมเช็กภาระงานคงค้าง',
        'อนุมัติใบขอเบิกพัสดุและอะไหล่ในคลัง',
      ],
    },
    {
      role: 'TECHNICIAN' as RoleCode,
      title: 'ทีมช่างซ่อม (Technician)',
      badge: 'ช่างเทคนิค & งานสนาม',
      user: 'อนุชา พงษ์ศิริ',
      email: 'anucha.p@kkumail.com',
      href: '/technician',
      icon: Wrench,
      theme: 'amber',
      features: [
        'รับการแจ้งเตือนงานด่วนและกดรับงานหน้างาน',
        'สร้างใบเบิกอุปกรณ์ซ่อมบำรุง',
        'แนบภาพถ่ายยืนยันผลงานก่อนปิดงาน',
      ],
    },
    {
      role: 'EXECUTIVE' as RoleCode,
      title: 'ผู้บริหาร / ภาพรวม (Executive)',
      badge: 'แดชบอร์ด & สถิติภาพรวม',
      user: 'อานันท์ ชัยวิสุทธิ์',
      email: 'anan.c@kkumail.com',
      href: '/executive',
      icon: BarChart3,
      theme: 'emerald',
      features: [
        'แดชบอร์ดสรุปสถิติและอัตราการซ่อมสำเร็จ',
        'ชาร์ตจำแนกหมวดหมู่ปัญหาและแนวโน้มการชำรุด',
        'ตารางอันดับประสิทธิภาพทีมช่างและ Audit Trail',
      ],
    },
  ];

  // Perform login via session API
  const handleQuickLogin = async (role: RoleCode, targetHref: string, userEmail?: string) => {
    setActiveLoadingRole(role);
    setErrorMessage(null);

    try {
      // 1. Set dev cookie client-side
      saveDevRoleCookie(role);

      // 2. Call session API to establish authenticated session
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, email: userEmail }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(targetHref);
      } else {
        // Fallback to route directly if preview environment allows
        router.push(targetHref);
      }
    } catch (err: unknown) {
      console.warn('Session API failed, routing directly to portal:', err);
      router.push(targetHref);
    } finally {
      // Clear loading state after navigation begins so that when returning, it is not stuck
      setTimeout(() => {
        setActiveLoadingRole(null);
      }, 500);
    }
  };

  // Form submit via KKU SSO Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const inputEmail = email.trim().toLowerCase();

    // Determine target role by email keywords or default to reporter
    let targetRole: RoleCode = 'REPORTER';
    let targetHref = '/reporter';

    if (inputEmail.includes('admin') || inputEmail.includes('staff') || inputEmail.includes('jiraporn')) {
      targetRole = 'ADMIN_DISPATCH';
      targetHref = '/admin';
    } else if (inputEmail.includes('tech') || inputEmail.includes('anucha') || inputEmail.includes('somsak')) {
      targetRole = 'TECHNICIAN';
      targetHref = '/technician';
    } else if (inputEmail.includes('exec') || inputEmail.includes('anan')) {
      targetRole = 'EXECUTIVE';
      targetHref = '/executive';
    }

    try {
      saveDevRoleCookie(targetRole);

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inputEmail, role: targetRole }),
      });

      const data = await res.json();
      if (data.success && data.data?.role) {
        const userRole = data.data.role as RoleCode;
        if (userRole === 'ADMIN_DISPATCH') targetHref = '/admin';
        else if (userRole === 'TECHNICIAN') targetHref = '/technician';
        else if (userRole === 'EXECUTIVE') targetHref = '/executive';
        else targetHref = '/reporter';
      }

      router.push(targetHref);
    } catch {
      router.push(targetHref);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-700/25">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base">CP FONDUE</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    SSO Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  ระบบแจ้งซ่อมและจ่ายงานออนไลน์ • วิทยาลัยการคอมพิวเตอร์ มข.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/70">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>SC-09 อาคารวิทยวิภาส</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Hero Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-6 sm:mb-8 shadow-lg shadow-blue-900/10 border border-blue-800/40 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-blue-100 mb-2.5 sm:mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              <span>KKU Single Sign-On • ระบบยืนยันตัวตนกลาง</span>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
              เข้าสู่ระบบ CP Fondue Maintenance
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              ศูนย์รวมการแจ้งซ่อมและบริหารจัดการงานบำรุงรักษาอัจฉริยะ อาคาร SC-09 อาคารวิทยวิภาส
              เข้าสู่ระบบด้วยบัญชี KKU Mail หรือเลือกทดสอบด่วนตามบทบาทงาน
            </p>
          </div>
        </div>

        {/* Main Login Area: Center-aligned by default, or 2-column grid when role switcher is open */}
        <div
          className={`transition-all duration-300 ${
            showRoleSwitcher
              ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start'
              : 'max-w-xl mx-auto'
          }`}
        >
          {/* LEFT: KKU SSO Form Card */}
          <div
            className={`${
              showRoleSwitcher ? 'lg:col-span-5' : 'w-full'
            } bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4.5 sm:p-7 transition-all duration-200`}
          >
            <div className="mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-0.5">
                    KKU Authentication
                  </span>
                  <h2 className="text-[15px] sm:text-lg font-black text-slate-900 tracking-tight">
                    เข้าสู่ระบบด้วย KKU Mail
                  </h2>
                </div>
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                ใช้บัญชี @kkumail.com หรืออีเมลบุคลากรมหาวิทยาลัยขอนแก่น
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-[11.5px] sm:text-xs font-bold text-slate-700 mb-1">
                  อีเมลมหาวิทยาลัยขอนแก่น (KKU Mail)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="somchai.k@kkumail.com"
                    className="w-full text-[12.5px] sm:text-xs bg-slate-50/80 border border-slate-200 rounded-xl pl-8.5 sm:pl-9 pr-3 py-2 sm:py-2.5 font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11.5px] sm:text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-[12.5px] sm:text-xs bg-slate-50/80 border border-slate-200 rounded-xl pl-8.5 sm:pl-9 pr-9 sm:pr-10 py-2 sm:py-2.5 font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 sm:right-3 top-2 sm:top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs pt-0.5">
                <label className="flex items-center space-x-1.5 sm:space-x-2 text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span>จดจำการเข้าสู่ระบบ</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('สำหรับระบบทดสอบ: คุณสามารถใช้ปุ่มทางลัดบทบาทด้านขวาเพื่อเข้าสู่ระบบได้ทันที')}
                  className="text-blue-700 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[42px] py-2 sm:py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-700/20 transition flex items-center justify-center space-x-1.5 sm:space-x-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                    <span>กำลังยืนยันตัวตน KKU SSO...</span>
                  </>
                ) : (
                  <>
                    <span>เข้าสู่ระบบด้วย KKU Account</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick autofill helper chips */}
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 sm:mb-2">
                คลิกเพื่อกรอกอีเมลตัวอย่าง:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'ผู้แจ้ง: somchai.k', email: 'somchai.k@kkumail.com' },
                  { label: 'เจ้าหน้าที่: jiraporn.s', email: 'jiraporn.s@kkumail.com' },
                  { label: 'ช่างซ่อม: anucha.p', email: 'anucha.p@kkumail.com' },
                  { label: 'ผู้บริหาร: anan.c', email: 'anan.c@kkumail.com' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setEmail(item.email);
                      setPassword('••••••••');
                    }}
                    className="text-[10.5px] sm:text-[11px] px-2.5 py-0.5 sm:py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium border border-slate-200/70 transition cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Button for Quick Role Testing Hub */}
            <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRoleSwitcher((prev) => !prev)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/80 hover:bg-blue-50/60 text-slate-600 hover:text-blue-700 text-[11.5px] sm:text-xs font-semibold transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-2xs group"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>
                  {showRoleSwitcher
                    ? 'ซ่อนเครื่องมือทดสอบด่วนตามบทบาท (Hide Role Switcher)'
                    : 'ทดสอบระบบด่วนตามบทบาท (1-Click Demo Login)'}
                </span>
                {showRoleSwitcher ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: 1-Click Role Testing Hub Card (Hidden by default, shown when showRoleSwitcher is true) */}
          {showRoleSwitcher && (
            <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4.5 sm:p-7 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 mb-3.5 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      โหมดประเมินและตรวจให้คะแนน
                    </span>
                  </div>
                  <h3 className="text-[15px] sm:text-lg font-black text-slate-900 tracking-tight mt-1">
                    ทดสอบระบบด่วนตามบทบาท (1-Click Role Switcher)
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium">
                    ไม่ต้องพิมพ์รหัสผ่าน
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRoleSwitcher(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    title="ซ่อนเครื่องมือ"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

            <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed mb-3.5 sm:mb-4">
              คลิกที่การ์ดบทบาทด้านล่างเพื่อเข้าสู่พอร์ทัลการทำงานของแต่ละฝ่ายได้ทันที พร้อมเซสชันและข้อมูลจำลองครบถ้วน:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roleCards.map((r) => {
                const Icon = r.icon;
                const isLoading = activeLoadingRole === r.role;

                return (
                  <motion.div
                    key={r.role}
                    whileHover={{ y: -3, scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-shadow flex flex-col justify-between group bg-slate-50/50 hover:bg-white cursor-default"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2 sm:space-x-2.5">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold group-hover:bg-blue-700 group-hover:text-white transition duration-200 shadow-2xs shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                              {r.title}
                            </h4>
                            <span className="text-[9.5px] sm:text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded">
                              {r.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10.5px] sm:text-[11px] text-slate-500 mb-2">
                        <span className="font-semibold text-slate-700">{r.user}</span> •{' '}
                        <span className="font-mono text-slate-400">{r.email}</span>
                      </div>

                      <ul className="space-y-1 mb-3">
                        {r.features.map((feat, fIdx) => (
                          <li
                            key={fIdx}
                            className="flex items-start space-x-1.5 text-[10.5px] sm:text-[11px] text-slate-600 leading-snug"
                          >
                            <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={Boolean(activeLoadingRole)}
                      onClick={() => handleQuickLogin(r.role, r.href, r.email)}
                      className="w-full min-h-[38px] sm:min-h-[40px] py-1.5 sm:py-2 px-3 rounded-xl bg-white hover:bg-blue-700 text-slate-700 hover:text-white font-bold text-[11px] sm:text-xs border border-slate-200 hover:border-blue-700 shadow-2xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังเข้าสู่ระบบ...</span>
                        </>
                      ) : (
                        <>
                          <span>เข้าสู่ระบบเป็น {r.title.split(' ')[0]}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-xs text-slate-500">
          <div>
            © 2026 วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น (College of Computing, KKU)
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span>SC-09 อาคารวิทยวิภาส</span>
            <span>•</span>
            <span>KKU SSO Protected</span>
            <span>•</span>
            <span className="font-mono">v1.2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
