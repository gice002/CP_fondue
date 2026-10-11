'use client';

import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Phone,
  AlertCircle,
  XCircle,
  MapPin,
  Flame,
  Wrench,
} from 'lucide-react';

export const ActiveTicketTracker: React.FC = () => {
  const [isCancelled, setIsCancelled] = useState(false);

  const handleCancelTicket = () => {
    const confirmCancel = confirm(
      'คุณต้องการขอยกเลิกคำร้อง REQ-202505-0038 ใช่หรือไม่? (UC-5)'
    );
    if (confirmCancel) {
      setIsCancelled(true);
    }
  };

  if (isCancelled) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm mb-6 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-2">
          <XCircle className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-sm text-slate-800">คำร้อง REQ-202505-0038 ถูกยกเลิกแล้ว (UC-5)</h3>
        <p className="text-xs text-slate-500 mt-1">ผู้แจ้งเหตุได้ยกเลิกคำร้องนี้ ระบบปรับสถานะเป็น "ยกเลิกคำร้อง"</p>
        <button
          onClick={() => setIsCancelled(false)}
          className="mt-3 text-xs text-blue-600 font-bold hover:underline"
        >
          ย้อนกลับ
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-blue-600">
              กำลังเข้าซ่อม (In-Progress)
            </span>
            <span className="text-xs font-mono font-black text-slate-900">
              REQ-202505-0038
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
            เครื่องปรับอากาศรั่ว น้ำหยดลงโต๊ะทำงานอาจารย์
          </h3>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>อาคาร CP-01 ชั้น 2 ห้องพักอาจารย์ 208 (Asset: AC-DAIKIN-36000BTU)</span>
          </div>
        </div>

        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-red-50 text-red-700 border border-red-200 shrink-0">
          <Flame className="w-3.5 h-3.5 mr-1 text-red-500" />
          ระดับเร่งด่วน (Urgent)
        </span>
      </div>

      {/* 4-Step Stepper (UC-2) */}
      <div className="my-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
          สถานะขั้นตอนการดำเนินงาน (UC-2: ติดตามสถานะการซ่อม)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ส่งคำร้องแล้ว</span>
            </div>
            <div className="text-[11px] font-bold text-slate-800">18 พ.ค. 09:15</div>
            <div className="text-[10px] text-slate-400">เข้าระบบอัตโนมัติ</div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>คัดกรองมอบหมาย</span>
            </div>
            <div className="text-[11px] font-bold text-slate-800">18 พ.ค. 10:00</div>
            <div className="text-[10px] text-slate-400">จนท. จิราพร อนุมัติ</div>
          </div>

          {/* Step 3 - Current */}
          <div className="flex flex-col items-start bg-blue-100/60 p-2 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-800 mb-1">
              <Wrench className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />
              <span>กำลังตรวจสอบ/ซ่อม</span>
            </div>
            <div className="text-[11px] font-bold text-blue-900">18 พ.ค. 11:30 (ปัจจุบัน)</div>
            <div className="text-[10px] text-blue-700 font-medium">ช่างกำลังล้างท่อน้ำทิ้ง</div>
          </div>

          {/* Step 4 - Pending */}
          <div className="flex flex-col items-start opacity-60">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mb-1">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>เสร็จสิ้นสมบูรณ์</span>
            </div>
            <div className="text-[11px] font-bold text-slate-600">รอทดสอบระบบ</div>
            <div className="text-[10px] text-slate-400">คาดการณ์ 14:00</div>
          </div>
        </div>
      </div>

      {/* Assigned Technician Card */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            สม
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-extrabold text-slate-900">นายสมศักดิ์ ช่างทอง</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                ช่างผู้รับผิดชอบ
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
              <span className="font-bold text-slate-700">081-945-8821</span>
              <span>• ทีมระบบปรับอากาศและสุขาภิบาล</span>
            </div>
          </div>
        </div>

        <a
          href="tel:0819458821"
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>โทรติดต่อช่าง</span>
        </a>
      </div>

      {/* Cancellation Notice (UC-5) */}
      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">เงื่อนไขการยกเลิกคำร้อง (UC-5 & BR12):</span>
            <p className="text-[11px] text-amber-800">
              คำร้องนี้อยู่ระหว่างขั้นตอน "กำลังเข้าซ่อม" ช่างได้เดินทางถึงหน้างานแล้ว หากต้องการยกเลิกกรุณาติดต่อช่างโดยตรงหรือเจ้าหน้าที่ธุรการ
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCancelTicket}
          className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 bg-white hover:bg-red-50 text-xs font-bold shrink-0 transition"
        >
          ขอยกเลิกคำร้อง (UC-5)
        </button>
      </div>
    </div>
  );
};
