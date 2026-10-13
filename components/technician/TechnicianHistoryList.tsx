import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { Ticket } from '@/types';
import { InfoTooltip } from '@/components/common/InfoTooltip';

interface TechnicianHistoryListProps {
  technicianId?: string;
}

export const TechnicianHistoryList: React.FC<TechnicianHistoryListProps> = ({
  technicianId,
}) => {
  const [completedTickets, setCompletedTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCompleted() {
      try {
        setIsLoading(true);
        const query = technicianId
          ? `/api/tickets?technicianId=${technicianId}&status=COMPLETED`
          : `/api/tickets?status=COMPLETED`;
        const res = await fetch(query, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCompletedTickets(data.data.slice(0, 5));
        }
      } catch (e) {
        console.error('Failed to load completed history:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadCompleted();
  }, [technicianId]);

  // Compute live average rating from evaluations
  const evaluations = completedTickets
    .map((t) => t.evaluation?.rating)
    .filter((r): r is number => typeof r === 'number');

  const avgRating =
    evaluations.length > 0
      ? (evaluations.reduce((a, b) => a + b, 0) / evaluations.length).toFixed(2)
      : '5.00';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-1.5">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            ประวัติงานซ่อมที่สำเร็จ (Past Completed)
          </h3>
          <InfoTooltip text="ประวัติใบงานที่ช่างได้ทำการซ่อมเสร็จสิ้นและปิดงานแล้ว พร้อมผลการประเมินความพึงพอใจจากผู้แจ้งซ่อม" />
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          {completedTickets.length} งานล่าสุด
        </span>
      </div>

      {/* List */}
      <div className="space-y-3 mb-5 max-h-[320px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-slate-400">กำลังโหลดประวัติงาน...</div>
        ) : completedTickets.length > 0 ? (
          completedTickets.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-emerald-200/90 bg-emerald-50/60 hover:bg-emerald-50 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-emerald-800 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  #{item.ticketNumber}
                </span>
                <span className="text-[11px] font-bold text-amber-600 flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>
                    {item.evaluation?.rating
                      ? `${item.evaluation.rating}.0 ดาว`
                      : 'รอประเมิน'}
                  </span>
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.description}</h4>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>
                  {item.location.building} ({item.location.roomNumber})
                </span>
                <span>
                  {item.completedAt
                    ? new Date(item.completedAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })
                    : 'เพิ่งเสร็จสิ้น'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-xs text-slate-400 italic">
            ยังไม่มีประวัติงานซ่อมที่เสร็จสิ้น
          </div>
        )}
      </div>

      {/* Aggregate Satisfaction Rating Badge */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ThumbsUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-blue-950">
              ดัชนีความพึงพอใจสะสม
            </h4>
            <p className="text-[11px] text-blue-800">
              {evaluations.length > 0 ? `จากผู้ประเมิน ${evaluations.length} ท่าน` : 'ประเมินเบื้องต้น'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-blue-900 font-mono tracking-tight">
            {avgRating}
          </div>
          <div className="text-[10px] text-blue-700 font-bold">/ 5.00 คะแนน</div>
        </div>
      </div>
    </div>
  );
};
