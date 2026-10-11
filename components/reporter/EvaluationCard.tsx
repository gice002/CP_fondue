'use client';

import React, { useState } from 'react';
import { Star, Send, CheckCircle2, MessageSquare, Video } from 'lucide-react';

export const EvaluationCard: React.FC = () => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState(
    'ช่างเข้ามาตรวจเร็วมากตามเวลากำหนด ตรวจเช็คสายสัญญาณ HDMI สำรองให้ด้วย ประทับใจการบริการครับ'
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets/tkt_0031/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return 'ดีเยี่ยมมาก (5/5 ดาว)';
      case 4:
        return 'ดีมาก (4/5 ดาว)';
      case 3:
        return 'ปานกลาง (3/5 ดาว)';
      case 2:
        return 'ควรปรับปรุง (2/5 ดาว)';
      case 1:
        return 'ต้องแก้ไขเร่งด่วน (1/5 ดาว)';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            UC-6: ประเมินความพึงพอใจ &amp; UC-3: ข้อเสนอแนะ (BR10)
          </span>
          <h3 className="text-base font-extrabold text-slate-900">
            ประเมินงานซ่อมที่เพิ่งเสร็จสิ้น
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          ซ่อมเสร็จเรียบร้อยแล้ว
        </span>
      </div>

      {isSubmitted ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
          <h4 className="font-extrabold text-sm text-emerald-900">
            ขอบคุณสำหรับการประเมินและข้อเสนอแนะ!
          </h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            ระบบได้บันทึกคะแนน {rating} ดาว และความคิดเห็นเพื่อนำไปปรับปรุงการให้บริการต่อไปแล้ว
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Ticket Details */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3 text-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Video className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-700">REQ-202505-0031</span>
                <span className="text-[11px] text-slate-400">เสร็จเมื่อวาน 16:20</span>
              </div>
              <p className="font-bold text-slate-800 mt-0.5">
                โปรเจกเตอร์ห้อง 302 หลอดภาพติดขัด ดับระหว่างบรรยาย
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ช่างผู้ดำเนินงาน: ชัยวัฒน์ สุริยะ (เปลี่ยนชุดหลอดภาพ EPSON สำเร็จ)
              </p>
            </div>
          </div>

          {/* Star Rating Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                ให้คะแนนความรวดเร็วและความพึงพอใจในการบริการ (1-5 ดาว) <span className="text-red-500">*</span>
              </label>
              <span className="text-xs font-bold text-blue-700 font-mono">
                {getRatingLabel(hoverRating || rating)}
              </span>
            </div>

            <div className="flex items-center space-x-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>ความคิดเห็นและข้อเสนอแนะเพื่อพัฒนาบริการ (UC-3)</span>
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="เขียนคำติชม หรือเสนอแนะเพิ่มเติม..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              เมื่อส่งประเมิน สถานะจะถูกบันทึกเป็น &quot;ประเมินแล้ว&quot; ถาวร
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'กำลังส่ง...' : 'ส่งแบบประเมินและข้อเสนอแนะ (BR10)'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
