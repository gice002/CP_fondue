'use client';

import React, { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { Ticket } from '@/types';

interface EvaluationCardProps {
  ticket?: Ticket;
  onEvaluated?: () => void;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({
  ticket,
  onEvaluated,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no ticket or ticket is not completed, don't show evaluation card
  if (!ticket || ticket.status !== 'COMPLETED') {
    return null;
  }

  // If already evaluated
  if (ticket.evaluation || isSubmitted) {
    const existingScore = ticket.evaluation?.rating || rating;
    const existingFeedback = ticket.evaluation?.feedback || feedback;

    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
        <div className="flex items-center space-x-2 text-emerald-700 mb-2">
          <CheckCircle2 className="w-5 h-5" />
          <h3 className="font-extrabold text-sm text-slate-900">
            ประเมินความพึงพอใจเรียบร้อยแล้ว ({ticket.ticketNumber})
          </h3>
        </div>
        <div className="flex items-center space-x-1 my-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-5 h-5 ${
                s <= existingScore ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
              }`}
            />
          ))}
          <span className="text-xs font-bold text-slate-700 ml-2">
            ({existingScore}/5 ดาว)
          </span>
        </div>
        {existingFeedback && (
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
            &quot;{existingFeedback}&quot;
          </p>
        )}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        if (onEvaluated) onEvaluated();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการส่งแบบประเมิน');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถส่งแบบประเมินได้');
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            ประเมินความพึงพอใจ (Satisfaction Survey)
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            ประเมินงานซ่อม #{ticket.ticketNumber}
          </h3>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          เสร็จสิ้นแล้ว
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            ระดับความพึงพอใจในการให้บริการ
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 stroke-1'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-medium text-slate-600 ml-1">
              {getRatingLabel(hoverRating || rating)}
            </span>
          </div>
        </div>

        {/* Feedback Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            ข้อเสนอแนะเพิ่มเติม
          </label>
          <textarea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="ความคิดเห็นเพิ่มเติม เช่น ความรวดเร็ว หรือคุณภาพงานซ่อม..."
            className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition bg-slate-50/50 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-xs transition disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSubmitting ? 'กำลังส่งแบบประเมิน...' : 'ส่งแบบประเมินความพึงพอใจ'}</span>
        </button>
      </form>
    </div>
  );
};
