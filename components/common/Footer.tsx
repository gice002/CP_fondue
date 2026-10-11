import React from 'react';
import { PhoneCall, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-8 mt-16 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-600 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              <strong className="text-slate-800 font-medium">วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น</strong> (CP KKU)
              • อาคาร CP-01 123 ถ.มิตรภาพ ขอนแก่น 40002
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
            <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-medium">สายด่วนฉุกเฉิน:</span>
            <span className="font-mono font-semibold text-slate-900">043-009700 ต่อ 44444</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>© 2025–2026 College of Computing, Khon Kaen University. All rights reserved.</p>
          <p>CP Fondue Online Maintenance Reporting System</p>
        </div>
      </div>
    </footer>
  );
};
