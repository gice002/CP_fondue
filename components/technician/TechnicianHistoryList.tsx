import React from 'react';
import { Star, CheckCircle, ThumbsUp } from 'lucide-react';

export const TechnicianHistoryList: React.FC = () => {
  const historyItems = [
    {
      id: 'WO-202505-0062',
      title: 'เปลี่ยนพาวเวอร์ซัพพลาย PC ประจำโต๊ะเจ้าหน้าที่ธุรการ',
      location: 'อาคาร CP-02 ห้อง 102',
      completedDate: 'สำเร็จเมื่อ 14 พ.ค. 2568',
      rating: '5.0 (ดีเยี่ยม)',
    },
    {
      id: 'WO-202505-0051',
      title: 'ต่อสายไฟเบอร์ออปติกชั้น 3 ที่ขาดจากหนูกัดสาย',
      location: 'อาคาร CP-01 ตู้ MDB ชั้น 3',
      completedDate: 'สำเร็จเมื่อ 12 พ.ค. 2568',
      rating: '4.8 (ดีมาก)',
    },
    {
      id: 'WO-202505-0044',
      title: 'ติดตั้ง Access Point Wi-Fi 6 สำหรับห้องสัมมนา',
      location: 'ห้องสัมมนา Smart Auditorium',
      completedDate: 'สำเร็จเมื่อ 10 พ.ค. 2568',
      rating: '5.0 (ดีเยี่ยม)',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <h3 className="text-base font-extrabold text-slate-900">
          ประวัติงานซ่อมที่สำเร็จ (Past Completed)
        </h3>
        <button className="text-xs font-bold text-blue-600 hover:underline">
          ดูทั้งหมด (24 งาน) &gt;
        </button>
      </div>

      {/* List */}
      <div className="space-y-3 mb-5">
        {historyItems.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-blue-700 text-xs">{item.id}</span>
              <span className="text-[11px] font-bold text-amber-600 flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{item.rating}</span>
              </span>
            </div>

            <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</h4>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>{item.location}</span>
              <span>{item.completedDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Aggregate Satisfaction Rating Badge */}
      <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-emerald-950">
              ดัชนีความพึงพอใจสะสมเดือนนี้
            </h4>
            <p className="text-[11px] text-emerald-800">จากผู้ประเมิน 28 ท่าน</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-emerald-800 font-mono tracking-tight">
            4.92
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">/ 5.00 คะแนน</div>
        </div>
      </div>
    </div>
  );
};
