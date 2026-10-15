'use client';

import React, { useState } from 'react';
import {
  Camera,
  Image as ImageIcon,
  MapPin,
  Bell,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from '@/components/common/MotionWrapper';

export type PermissionType = 'camera_photos' | 'location' | 'notifications' | 'confirm_action';

export interface PermissionModalProps {
  isOpen: boolean;
  type: PermissionType;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  requireReasonInput?: boolean;
  reasonPlaceholder?: string;
  defaultValue?: string;
  onAllow: (inputValue?: string) => void;
  onDeny: () => void;
}

export const InAppPermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  type,
  title,
  description,
  confirmText,
  cancelText,
  requireReasonInput = false,
  reasonPlaceholder = 'กรุณาระบุเหตุผล...',
  defaultValue = '',
  onAllow,
  onDeny,
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  if (!isOpen) return null;

  const getPermissionConfig = () => {
    switch (type) {
      case 'camera_photos':
        return {
          icon: Camera,
          badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
          ringColor: 'ring-blue-500/20',
          iconColor: 'text-blue-600',
          title: title || 'ขออนุญาตเข้าถึงกล้องและคลังรูปภาพ',
          subtitle: 'Camera & Photo Library Access • CP FONDUE',
          description:
            description ||
            'ระบบ CP FONDUE จำเป็นต้องขอสิทธิ์เข้าถึงกล้องถ่ายภาพและคลังรูปภาพบนอุปกรณ์ของคุณ เพื่อใช้ถ่ายรูปความเสียหาย ตรวจสอบอาการขัดข้อง หรือแนบภาพถ่ายผลงานหลังการซ่อมแซม',
          benefits: [
            'ถ่ายภาพความเสียหาย ณ จุดเกิดเหตุได้ทันทีผ่านกล้อง',
            'เลือกรูปภาพและหลักฐานที่บันทึกไว้จากอัลบั้มรูปภาพ',
            'ภาพถ่ายจะถูกจัดเก็บในระบบ CoP KKU ปลอดภัยตามมาตรฐาน PDPA',
          ],
          confirmBtn: confirmText || 'อนุญาตให้เข้าถึง (Allow Access)',
          cancelBtn: cancelText || 'ไม่อนุญาต',
          btnBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
        };
      case 'location':
        return {
          icon: MapPin,
          badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
          ringColor: 'ring-rose-500/20',
          iconColor: 'text-rose-600',
          title: title || 'ขออนุญาตเข้าถึงตำแหน่งที่ตั้งปัจจุบัน',
          subtitle: 'GPS & Location Access • CP FONDUE',
          description:
            description ||
            'ระบบต้องการเข้าถึงตำแหน่งปัจจุบันของคุณ เพื่อช่วยระบุพิกัดอาคาร (เช่น อาคาร SC-09 วิทยวิภาส) ชั้น และห้องปฏิบัติการที่เกิดเหตุโดยอัตโนมัติ',
          benefits: [
            'ระบุตำแหน่งห้องและอาคารที่เกิดเหตุได้อย่างแม่นยำ',
            'ลดขั้นตอนและเวลาในการพิมพ์ค้นหาห้องด้วยตนเอง',
            'พิกัดจะถูกใช้เฉพาะขณะระบุสถานที่แจ้งซ่อมเท่านั้น',
          ],
          confirmBtn: confirmText || 'อนุญาตพิกัดตำแหน่ง (Allow Location)',
          cancelBtn: cancelText || 'ไม่อนุญาต',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
        };
      case 'notifications':
        return {
          icon: Bell,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
          ringColor: 'ring-amber-500/20',
          iconColor: 'text-amber-600',
          title: title || 'ขออนุญาตเปิดการแจ้งเตือนคำสั่งงาน',
          subtitle: 'Push Notifications • CP FONDUE',
          description:
            description ||
            'เปิดการแจ้งเตือนผ่านหน้าเว็บ เพื่อรับการแจ้งเตือนแบบเรียลไทม์เมื่อมีใบสั่งงานด่วนใหม่ส่งมายังช่าง หรือส่งแจ้งเตือนไปยังผู้แจ้งเมื่อช่างเริ่มเข้าซ่อม',
          benefits: [
            'แจ้งเตือนใบสั่งงานเร่งด่วนเข้าสู่คิวงานทันที',
            'ติดตามสถานะความคืบหน้างานซ่อมแบบเรียลไทม์',
            'สามารถเลือกเปิด-ปิดการแจ้งเตือนได้ตลอดเวลา',
          ],
          confirmBtn: confirmText || 'เปิดการแจ้งเตือน (Enable)',
          cancelBtn: cancelText || 'ไว้ภายหลัง',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
        };
      case 'confirm_action':
      default:
        return {
          icon: AlertTriangle,
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
          ringColor: 'ring-slate-500/20',
          iconColor: 'text-slate-800',
          title: title || 'ยืนยันการทำรายการ',
          subtitle: 'Confirmation • CP FONDUE',
          description: description || 'กรุณาตรวจสอบรายละเอียดก่อนยืนยันการทำรายการ',
          benefits: [],
          confirmBtn: confirmText || 'ยืนยันดำเนินการ',
          cancelBtn: cancelText || 'ยกเลิก',
          btnBg: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-500/20',
        };
    }
  };

  const config = getPermissionConfig();
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onAllow(inputValue);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 overflow-hidden text-left">
        {/* Top ambient glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onDeny}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title="ปิด"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Tag */}
        <div className="flex items-start space-x-3.5 mb-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${config.badgeColor} ring-4 ${config.ringColor}`}
          >
            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div className="min-w-0 pr-6">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              <Lock className="w-2.5 h-2.5" />
              {config.subtitle}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 leading-snug mt-0.5">
              {config.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {config.description}
        </p>

        {/* Benefits list (if any) */}
        {config.benefits.length > 0 && (
          <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100/90 mb-5 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              จุดประสงค์การใช้งานสิทธิ์:
            </span>
            {config.benefits.map((b, i) => (
              <div key={i} className="flex items-start space-x-2 text-[11.5px] text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        )}

        {/* Optional Reason/Text Input for cancellation/reasons */}
        {requireReasonInput && (
          <div className="mb-5 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              เหตุผลประกอบการดำเนินการ:
            </label>
            <textarea
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={reasonPlaceholder}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition font-medium"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 pt-1">
          <button
            type="button"
            onClick={onDeny}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition cursor-pointer active:scale-98 text-center"
          >
            {config.cancelBtn}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition cursor-pointer active:scale-98 text-center ${config.btnBg}`}
          >
            {config.confirmBtn}
          </button>
        </div>

        {/* Privacy Note */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-center space-x-1 text-[10px] text-slate-400 font-medium">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>ระบบรักษาความปลอดภัยข้อมูล มหาวิทยาลัยขอนแก่น</span>
        </div>
      </div>
    </div>
  );
};
