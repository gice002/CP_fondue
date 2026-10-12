import React from 'react';
import { Star, Award } from 'lucide-react';
import { ExecutiveStats } from '@/types';

interface TechnicianLeaderboardProps {
  technicians: ExecutiveStats['technicianLeaderboard'];
}

export const TechnicianLeaderboard: React.FC<TechnicianLeaderboardProps> = ({
  technicians,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              <span>ประสิทธิภาพทีมช่างประจำการ</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              ประเมินภาระงาน, ความรวดเร็วในการเข้าซ่อม และคะแนนความพึงพอใจ
            </p>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:underline">
            ดูทั้งหมด (6 นาย) &gt;
          </button>
        </div>

        {/* Table / List */}
        <div className="space-y-3">
          {technicians.map((tech, idx) => (
            <div
              key={tech.id}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs hover:bg-slate-50 transition"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                    idx === 0
                      ? 'bg-blue-600'
                      : idx === 1
                      ? 'bg-cyan-600'
                      : idx === 2
                      ? 'bg-emerald-600'
                      : 'bg-purple-600'
                  }`}
                >
                  {tech.name.slice(3, 5)}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900">{tech.name}</h4>
                  <p className="text-[11px] text-slate-400">{tech.department}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-800">
                    {tech.casesCount} เคส
                  </div>
                  <div className="text-[10px] text-slate-400">
                    เฉลี่ย {tech.avgTimeMin} นาที
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                    {tech.onTimePercent}%
                  </span>
                  <div className="flex items-center space-x-0.5 justify-end text-[11px] font-bold text-amber-500 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{tech.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
