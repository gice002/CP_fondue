'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  Image as ImageIcon,
} from 'lucide-react';

export const CloseJobCard: React.FC = () => {
  const [repairNotes, setRepairNotes] = useState(
    'ทำความสะอาดท่อน้ำทิ้งแอร์ที่อุดตันด้วยตะกรัน ล้างแผ่นกรองอากาศ 2 แผง และเปลี่ยนเทปพันท่อน้ำยาแอร์ใหม่ ทดสอบเปิด 18 องศาเซลเซียส เป็นเวลา 30 นาที อุณหภูมิกลับมาเย็นฉ่ำ ไม่มีน้ำรั่วซึม'
  );

  const [isClosed, setIsClosed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCloseJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets/tkt_0078', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOSE',
          repairNotes,
          afterProofUrls: [
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsClosed(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <h3 className="text-base font-extrabold text-slate-900">
            บันทึกผลและปิดงานซ่อม
          </h3>
        </div>
        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          WO-202505-0078
        </span>
      </div>

      {isClosed ? (
        <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="font-extrabold text-sm text-emerald-900">
            บันทึกผลงานและปิดงานซ่อมสำเร็จแล้ว! (BR9)
          </h4>
          <p className="text-xs text-emerald-700 leading-relaxed">
            สถานะคำร้องถูกปรับเป็น &quot;ดำเนินการเสร็จสิ้น&quot; ระบบได้ส่งแบบประเมินความพึงพอใจ
            5 ดาว ไปยังผู้แจ้งเหตุเรียบร้อยแล้ว (BR10)
          </p>
          <button
            onClick={() => setIsClosed(false)}
            className="mt-2 text-xs font-bold text-blue-600 hover:underline"
          >
            แก้ไขข้อมูลปิดงาน
          </button>
        </div>
      ) : (
        <form onSubmit={handleCloseJob} className="space-y-4">
          {/* Job Overview */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                แก้ระบบเครื่องปรับอากาศน้ำหยด &amp; ทำความสะอาดแผ่นกรอง
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ห้องบรรยาย 201 (ชั้น 2) • ผู้แจ้ง: ผศ.ดร.กานดา
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              ซ่อมเสร็จ 100%
            </span>
          </div>

          {/* Repair Details Textarea */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              บันทึกรายละเอียดวิธีแก้ปัญหา / อะไหล่ที่เปลี่ยน:
            </label>
            <textarea
              rows={3}
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Proof Photos Before vs After (BR8) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>แนบรูปภาพเปรียบเทียบผลงานซ่อม (BR8 - บังคับอย่างน้อย 2 ภาพ)</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                ครบถ้วน (2/2)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Before */}
              <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 group">
                <img
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600"
                  alt="before repair"
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] p-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>ภาพก่อนซ่อม (Before)</span>
                  </span>
                  <RotateCcw className="w-3 h-3 text-slate-300" />
                </div>
              </div>

              {/* After */}
              <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 group">
                <img
                  src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600"
                  alt="after repair"
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] p-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>ภาพหลังซ่อม (After)</span>
                  </span>
                  <RotateCcw className="w-3 h-3 text-slate-300" />
                </div>
              </div>
            </div>
          </div>

          {/* BR9 & BR10 Compliance Note */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">ข้อกำหนด BR9 &amp; BR10:</span>
              <p className="text-[11px] text-emerald-800">
                เมื่อคลิกปิดงาน ระบบจะอัปเดตสถานะคำร้องเป็น &quot;ดำเนินการเสร็จสิ้น&quot;
                พร้อมส่งลิงก์แบบประเมินความพึงพอใจ 5 ดาว ไปยัง LINE และอีเมลของผู้แจ้งเหตุทันที
              </p>
            </div>
          </div>

          {/* Complete Job Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>
              {isSubmitting ? 'กำลังปิดงาน...' : 'บันทึกผลและปิดงานซ่อม (Complete & Close Job)'}
            </span>
          </button>
        </form>
      )}
    </div>
  );
};
