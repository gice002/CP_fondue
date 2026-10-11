'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import {
  Laptop,
  ClipboardList,
  Wrench,
  BarChart3,
  ArrowRight,
  Database,
  CheckCircle2,
  FileCode2,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const portals = [
    {
      title: '1. พอร์ทัลผู้แจ้งเหตุ (Reporter Portal)',
      badge: 'อาจารย์ / บุคลากร / นักศึกษา',
      desc: 'ยื่นคำร้องแจ้งซ่อมแซมพร้อมแนบรูปถ่ายความเสียหาย (BR2), สแกน QR Code ตรวจสอบประกันครุภัณฑ์, ติดตามสถานะงานซ่อมแบบเรียลไทม์ (UC-2) และทำแบบประเมินความพึงพอใจ 5 ดาว (BR10, UC-6)',
      href: '/reporter',
      icon: Laptop,
      color: 'blue',
      features: [
        'แบบฟอร์มแจ้งซ่อมแยกโซนและครุภัณฑ์ (UC-1)',
        'ตัวติดตามสถานะงาน 4 ขั้นตอน (In-Progress)',
        'การประเมิน 1-5 ดาว พร้อมข้อเสนอแนะ (UC-3, UC-6)',
        'ประวัติและสิทธิ์ยกเลิกคำร้อง (UC-4, UC-5)',
      ],
    },
    {
      title: '2. พอร์ทัลเจ้าหน้าที่ (Admin Dispatch Desk)',
      badge: 'เจ้าหน้าที่คัดกรอง & มอบหมายงาน',
      desc: 'ตรวจสอบความถูกต้องของคำร้อง (BR4), คัดกรองและมอบหมายงานให้ช่างตามความเชี่ยวชาญ (UC-9), ควบคุมกำหนดเวลา SLA และอนุมัติการเบิกจ่ายพัสดุอุปกรณ์ในคลัง (UC-10)',
      href: '/admin',
      icon: ClipboardList,
      color: 'amber',
      features: [
        'คิวกราฟิกคำร้องใหม่ & ด่วนพิเศษ (BR4)',
        'มอบหมายช่างพร้อมเช็กภาระงานคงค้าง (UC-9)',
        'อนุมัติใบเบิกพัสดุและตัดคลังอัตโนมัติ (UC-10)',
        'เปิดใบงานฉุกเฉินหน้าเคาน์เตอร์ (Walk-in)',
      ],
    },
    {
      title: '3. พอร์ทัลทีมช่าง (Technician Portal)',
      badge: 'ช่างเทคนิค & งานสนาม',
      desc: 'รับการแจ้งเตือนงานด่วน, กดตอบรับงาน (BR5, BR6), เช็กอินเวลาเข้าตรวจหน้างานผ่าน Wi-Fi Beacon, ขอเบิกอะไหล่หน้างาน และแนบภาพถ่ายเปรียบเทียบผลงาน Before / After ก่อนปิดงาน (BR8, BR9)',
      href: '/technician',
      icon: Wrench,
      color: 'cyan',
      features: [
        'กดรับงานพร้อมแจ้งสถานะถึงผู้แจ้ง (BR5, BR6)',
        'Check-in พิกัดและเวลาเข้าหน้างานจริง',
        'สร้างใบเบิกอุปกรณ์ซ่อมบำรุง (Material Requisition)',
        'แนบภาพ Before / After และปิดงาน (BR8, BR9)',
      ],
    },
    {
      title: '4. ศูนย์สรุปผลและรายงาน (Executive Suite)',
      badge: 'ผู้บริหาร & งานประกันคุณภาพ',
      desc: 'แดชบอร์ดติดตามประสิทธิภาพ SLA รวม, วิเคราะห์สัดส่วนหมวดหมู่อุปกรณ์ที่ชำรุดบ่อย, ตารางอันดับประสิทธิภาพทีมช่าง, สรุปมูลค่าการเบิกจ่ายพัสดุ และบันทึกประวัติการตรวจสอบย้อนหลัง (Audit Trail สำหรับ EdPEx)',
      href: '/executive',
      icon: BarChart3,
      color: 'purple',
      features: [
        'วิเคราะห์อัตราการบรรลุเกณฑ์ SLA (96.2%)',
        'ชาร์ตจำแนกอุปกรณ์และแนวโน้มรายสัปดาห์',
        'Leaderboard ประสิทธิภาพและเวลาเฉลี่ยทีมช่าง',
        'Audit Trail & Compliance สำหรับตรวจ EdPEx',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Modern Minimal Hero */}
        <div className="relative bg-slate-950 text-white rounded-3xl p-8 sm:p-12 mb-10 overflow-hidden border border-slate-800/80 shadow-lg">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-300 mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              CP Fondue
              <span className="block text-xl sm:text-2xl font-normal text-slate-400 mt-1 tracking-normal">
                Online Maintenance & Dispatch System
              </span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
              ระบบแจ้งซ่อมและบริหารจัดการงานบำรุงรักษาอัจฉริยะ วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น
              เชื่อมต่อฐานข้อมูล PostgreSQL ผ่าน Prisma ORM เต็มรูปแบบ ครอบคลุมวงจรคำร้อง การมอบหมายงาน
              การเบิกจ่ายอะไหล่ และการประเมินความพึงพอใจ
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/reporter"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 font-semibold text-xs sm:text-sm text-slate-950 shadow-sm active:scale-95 transition-all flex items-center gap-2"
              >
                <span>ยื่นคำร้องแจ้งซ่อม</span>
                <ArrowRight className="w-4 h-4 text-slate-900" />
              </Link>
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 font-semibold text-xs sm:text-sm text-slate-200 active:scale-95 transition-all"
              >
                โต๊ะคัดกรองงาน (Dispatch)
              </Link>
            </div>
          </div>

          {/* Decorative Subtle Background Accents */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center">
            <Wrench className="w-80 h-80 transform rotate-12 text-white" />
          </div>
        </div>

        {/* 4 Portals Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
                พอร์ทัลตามบทบาทผู้ใช้งาน
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกบทบาทเพื่อเข้าสู่ระบบงานที่ต้องการ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {portals.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-semibold group-hover:bg-slate-900 group-hover:text-white transition duration-200">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {p.title}
                          </h3>
                          <span className="text-[11px] font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md">
                            {p.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {p.desc}
                    </p>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      {p.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-center space-x-2 text-[11px] text-slate-600"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                    <Link
                      href={p.href}
                      className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:text-slate-900 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition duration-150 shadow-2xs"
                    >
                      <span>เข้าสู่ระบบ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Architecture & Database Readiness */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-10">
          <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-semibold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                สถาปัตยกรรมระบบและฐานข้อมูล (Architecture &amp; Data Pipeline)
              </h3>
              <p className="text-xs text-slate-500">
                เชื่อมโยง Next.js App Router และ Prisma ORM เข้ากับ PostgreSQL บน Supabase แบบครบวงจร
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
              <div className="flex items-center space-x-2 font-semibold text-slate-900 mb-1.5">
                <FileCode2 className="w-4 h-4 text-slate-600" />
                <span>Prisma Relational Models</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                ครอบคลุม 18 ตาราง: User, Role, Department, Location, Equipment, Ticket,
                TicketAttachment, TicketStatusHistory, SparePartInventory, Requisition,
                Evaluation, และ AuditLog
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
              <div className="flex items-center space-x-2 font-semibold text-slate-900 mb-1.5">
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Transactional Service Layer</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                รวมฟังก์ชันธุรกรรมแบบ ACID ใน `/services`: มอบหมายงาน, ตัดสต็อกอะไหล่แบบอะตอมิก,
                บันทึกผลการปิดงานพร้อมรูปหลักฐาน และบันทึก Audit Logs
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
              <div className="flex items-center space-x-2 font-semibold text-slate-900 mb-1.5">
                <Server className="w-4 h-4 text-slate-600" />
                <span>Verified REST Route Handlers</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Endpoints ครบวงจร `/api/tickets`, `/api/tickets/[id]`, `/api/spare-parts/requisitions`,
                `/api/technicians`, `/api/upload`, และ `/api/analytics`
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
