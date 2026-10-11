import React from 'react';
import { PhoneCall, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-6 mt-12 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-700">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น</strong> (College of Computing, Khon Kaen University)
              • 123 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40002
            </span>
          </div>

          <div className="flex items-center space-x-2 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            <PhoneCall className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
            <span className="font-semibold">สายด่วนแจ้งซ่อมฉุกเฉิน:</span>
            <span className="font-mono font-bold">043-009700 ต่อ 44444</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/70 text-center md:text-left text-[11px] text-slate-400 flex flex-col md:flex-row justify-between">
          <p>© 2025 - 2026 College of Computing, Khon Kaen University. All rights reserved.</p>
          <p>ระบบแจ้งซ่อมออนไลน์ CP Fondue • Software Analysis & Design Project (CP 421 025)</p>
        </div>
      </div>
    </footer>
  );
};
