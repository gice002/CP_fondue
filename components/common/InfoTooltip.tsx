'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  text,
  className = '',
  align = 'center',
}) => {
  const [show, setShow] = useState(false);

  const alignClasses =
    align === 'left'
      ? 'left-0'
      : align === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <span className={`relative inline-flex items-center align-middle ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShow(!show);
        }}
        className="text-slate-400 hover:text-blue-600 transition p-0.5 rounded-full hover:bg-slate-100 cursor-help"
        aria-label="คำแนะนำเพิ่มเติม"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {show && (
        <span
          role="tooltip"
          className={`absolute z-50 w-60 sm:w-64 p-2.5 bg-slate-900/95 backdrop-blur-xs text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl border border-slate-700 pointer-events-none transform bottom-full mb-1.5 ${alignClasses}`}
        >
          {text}
        </span>
      )}
    </span>
  );
};
