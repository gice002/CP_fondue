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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold mb-4 text-blue-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ระบบแจ้งซ่อมออนไลน์ วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              CP Fondue Online Repair System
            </h1>

            <p className="mt-3 text-sm sm:text-base text-blue-100/90 leading-relaxed font-light">
              ต้นแบบระบบเว็บแอปพลิเคชันเต็มรูปแบบ (Full-Stack Prototype) พัฒนาตามการวิเคราะห์ระบบ
              Business Rules (BR1 - BR12), แผนภาพ Use Case / Sequence และ Conceptual ER Schema
              จากวิทยาลัยการคอมพิวเตอร์ มข.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/reporter"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs sm:text-sm text-white shadow-lg shadow-blue-600/30 active:scale-95 transition flex items-center space-x-2"
              >
                <span>เข้าสู่พอร์ทัลผู้แจ้งเหตุ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 font-bold text-xs sm:text-sm text-white active:scale-95 transition"
              >
                เปิดโต๊ะคัดกรองงาน (Dispatch Desk)
              </Link>
            </div>
          </div>

          {/* Background Decorative Graphic */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
            <Wrench className="w-96 h-96 transform rotate-12" />
          </div>
        </div>

        {/* 4 Portals Grid matching Prototypes */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                พอร์ทัลทั้ง 4 บทบาทผู้ใช้งาน (4 Role Portals)
              </h2>
              <p className="text-xs text-slate-500">
                สอดคล้องตามหน้าจอต้นแบบและข้อกำหนดทางธุรกิจในเอกสารรายงาน
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portals.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">
                            {p.title}
                          </h3>
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
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

                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <Link
                      href={p.href}
                      className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs"
                    >
                      <span>เข้าสู่ระบบหน้างาน</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Architecture & Database Readiness */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-10">
          <div className="flex items-center space-x-2.5 mb-4 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                สถาปัตยกรรมและฐานข้อมูล (Database Readiness &amp; Architecture)
              </h3>
              <p className="text-xs text-slate-500">
                ถอดรหัสจาก Chen&apos;s Notation ใน ER_diagram.png สู่ Prisma Relational Schema พร้อม Service Layer
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1.5">
                <FileCode2 className="w-4 h-4 text-blue-600" />
                <span>Prisma Schema Models</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                ครอบคลุม 14 ตารางหลัก: User, Role, Department, Location, Equipment, Ticket,
                TicketAttachment, TicketStatusHistory, Tag, SparePart, SparePartRequest,
                Evaluation, AuditLog และ EmailLog
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Decoupled Service Layer</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                สร้างโครงสร้าง `/services` (TicketService, SparePartService, UserService,
                AuditService) ที่รองรับทั้ง Mock State และเรียก ORM Prisma โดยตรงเมื่อตั้งค่า DATABASE_URL
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1.5">
                <Server className="w-4 h-4 text-cyan-600" />
                <span>API Route Handlers</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                RESTful Endpoints ใน `/app/api`: `/api/tickets`, `/api/tickets/[id]`,
                `/api/spare-parts/requisitions`, `/api/technicians`, `/api/analytics`, `/api/audit-logs`
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
