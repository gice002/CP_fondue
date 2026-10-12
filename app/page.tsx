'use client';

import React from 'react';
import Link from 'next/link';
import {
  Laptop,
  ClipboardList,
  Wrench,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const portals = [
    {
      title: 'ผู้แจ้งเหตุ (Reporter)',
      badge: 'อาจารย์ / บุคลากร / นักศึกษา',
      desc: 'ยื่นคำร้องแจ้งซ่อมพร้อมแนบรูปถ่ายความเสียหาย ตรวจสอบประกันครุภัณฑ์ ติดตามสถานะงานซ่อมแบบเรียลไทม์ และประเมินความพึงพอใจ 5 ดาว',
      href: '/reporter',
      icon: Laptop,
      color: 'blue',
      features: [
        'แบบฟอร์มแจ้งซ่อมอาคาร SC-09 สะดวกรวดเร็ว',
        'ติดตามความคืบหน้า 4 ขั้นตอน',
        'ประเมินความพึงพอใจและข้อเสนอแนะ',
        'ประวัติและสิทธิ์ยกเลิกคำร้องก่อนช่างเริ่มงาน',
      ],
    },
    {
      title: 'เจ้าหน้าที่คัดกรอง (Admin Desk)',
      badge: 'เจ้าหน้าที่คัดกรอง & มอบหมายงาน',
      desc: 'ตรวจสอบความถูกต้องของคำร้อง มอบหมายงานช่างตามคิว กำหนด 5 Tags ลำดับความสำคัญ ควบคุมเวลา SLA และอนุมัติการเบิกจ่ายพัสดุในคลัง',
      href: '/admin',
      icon: ClipboardList,
      color: 'blue',
      features: [
        'โต๊ะคัดกรองคำร้องใหม่ & ด่วนพิเศษ',
        'มอบหมายงานช่างพร้อมเช็กภาระงานคงค้าง',
        'กำหนด 5 Tags ลำดับความสำคัญ',
        'อนุมัติใบเบิกพัสดุและเปิดงาน Walk-in',
      ],
    },
    {
      title: 'ทีมช่างซ่อม (Technician)',
      badge: 'ช่างเทคนิค & งานสนาม',
      desc: 'รับการแจ้งเตือนงานด่วน กดตอบรับงาน (จำกัด 1 งานขณะปฏิบัติการ) ตรวจสอบพิกัดหน้างาน ขอเบิกอะไหล่ และแนบภาพถ่ายยืนยันก่อนปิดงาน',
      href: '/technician',
      icon: Wrench,
      color: 'blue',
      features: [
        'กดรับงานพร้อมแจ้งสถานะถึงผู้แจ้งทันที',
        'ลำดับคิวงานตามความสำคัญของ Tags',
        'สร้างใบเบิกอุปกรณ์ซ่อมบำรุง',
        'แนบภาพยืนยันผลงานและบันทึกปิดงาน',
      ],
    },
    {
      title: 'ผู้บริหาร (Executive)',
      badge: 'ผู้บริหาร & ประกันคุณภาพ',
      desc: 'แดชบอร์ดติดตามประสิทธิภาพ SLA รวม วิเคราะห์สัดส่วนหมวดหมู่อุปกรณ์ที่ชำรุด อันดับทีมช่าง สรุปมูลค่าการเบิกจ่ายพัสดุ และประวัติการตรวจสอบ EdPEx',
      href: '/executive',
      icon: BarChart3,
      color: 'blue',
      features: [
        'วิเคราะห์อัตราการบรรลุเกณฑ์ SLA รวม',
        'ชาร์ตจำแนกหมวดหมู่ปัญหาและแนวโน้ม',
        'ตารางอันดับประสิทธิภาพทีมช่าง',
        'Audit Trail บันทึกการตรวจสอบย้อนหลัง',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-700/25">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base">CP FONDUE</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  ระบบแจ้งซ่อมและจ่ายงานออนไลน์ • วิทยาลัยการคอมพิวเตอร์ มข.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-600">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">SC-09 อาคารวิทยวิภาส</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Friendly Hero Card */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 mb-10 shadow-lg shadow-blue-900/10 border border-blue-800/40 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              <span>วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              CP Fondue Maintenance System
            </h1>
            <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
              ศูนย์รวมการแจ้งซ่อมและบริหารจัดการงานบำรุงรักษาอัจฉริยะ อาคาร SC-09 อาคารวิทยวิภาส
              เลือกบทบาทเพื่อเข้าสู่ระบบงานที่ต้องการ
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/reporter"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 font-bold text-xs sm:text-sm text-blue-900 shadow-sm active:scale-98 transition flex items-center gap-2"
              >
                <span>ยื่นคำร้องแจ้งซ่อมทันที</span>
                <ArrowRight className="w-4 h-4 text-blue-800" />
              </Link>
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-xl bg-blue-950/60 hover:bg-blue-950/80 border border-blue-400/30 font-semibold text-xs sm:text-sm text-white active:scale-98 transition"
              >
                โต๊ะคัดกรองงาน (Dispatch)
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Portals Selection Grid */}
        <div className="mb-10">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              เลือกพอร์ทัลตามบทบาทผู้ใช้งาน (Role Portals)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกเพื่อเข้าสู่หน้าทำงานหลักของแต่ละบทบาท
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {portals.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold group-hover:bg-blue-700 group-hover:text-white transition duration-200 shadow-2xs">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {p.title}
                          </h3>
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-md">
                            {p.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {p.desc}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      {p.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-center space-x-2 text-[11px] text-slate-600 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/80 border-t border-slate-100">
                    <Link
                      href={p.href}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-blue-700 hover:text-white border border-slate-200 hover:border-blue-700 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition duration-150 shadow-2xs"
                    >
                      <span>เข้าสู่ระบบงาน</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

