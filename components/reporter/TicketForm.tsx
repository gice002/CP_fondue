'use client';

import React, { useState } from 'react';
import {
  MapPin,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Send,
  Save,
  ShieldAlert,
  X,
  Laptop,
} from 'lucide-react';
import { TicketUrgency } from '@/types';

interface TicketFormProps {
  onSuccess?: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onSuccess }) => {
  const [building, setBuilding] = useState('CP-01 อาคารวิทยวิภาส');
  const [floor, setFloor] = useState('ชั้น 3 (ห้องปฏิบัติการ)');
  const [room, setRoom] = useState('CP-304 Lab High-Performance Computing');
  const [locationDetail, setLocationDetail] = useState(
    'โต๊ะแถวที่ 3 เครื่องฝั่งริมหน้าต่างติดเครื่องปรับอากาศ'
  );

  const [category, setCategory] = useState('ระบบคอมพิวเตอร์และเครือข่าย');
  const [assetId, setAssetId] = useState('KKU-CP-67-0891');
  const [isAssetVerified, setIsAssetVerified] = useState(true);

  const [description, setDescription] = useState(
    'เปิดสวิตช์เครื่องแล้วไม่มีไฟเข้าพาวเวอร์ซัพพลาย พัดลมด้านหลังไม่หมุน และมีกลิ่นไหม้ใหม่อ่อน ๆ ตอนแรกคิดว่าปลั๊กไฟหลวมแต่ตรวจสอบสายไฟ AC เสียบแน่นดีแล้วก็ยังไม่ทำงาน'
  );

  const [urgency, setUrgency] = useState<TicketUrgency>('URGENT');

  // Attached images
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',
    'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=600',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedTicketNo, setGeneratedTicketNo] = useState('');

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAssetCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAssetId(val);
    setIsAssetVerified(val.includes('KKU-CP') || val.length > 5);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      alert('แนบรูปได้สูงสุด 3 รูป (BR2)');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data?.fileUrl) {
        setImages([...images, data.data.fileUrl]);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('ไม่สามารถอัปโหลดไฟล์ได้');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('กรุณากรอกรายละเอียดอาการชำรุด (BR2)');
      return;
    }
    if (images.length === 0) {
      alert('กรุณาแนบรูปถ่ายความเสียหายอย่างน้อย 1 ภาพ (BR2)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: 'loc_03',
          locationDetail,
          category,
          assetCode: assetId,
          description,
          urgency,
          attachmentUrls: images,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedTicketNo(data.data.ticketNumber);
        setSubmitSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        alert(data.error || 'Failed to submit ticket');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการส่งคำร้อง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            ยื่นคำร้องแจ้งซ่อม (Create Request)
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">แบบฟอร์มแจ้งเหตุขัดข้อง</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กรอกข้อมูลสถานที่และอาการชำรุดเพื่อจัดส่งให้ทีมช่าง
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">รหัสคำร้อง</span>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">
            {generatedTicketNo || 'REQ-AUTO'}
          </span>
        </div>
      </div>

      {submitSuccess && (
        <div className="m-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-bold text-xs">ส่งคำร้องแจ้งซ่อมเรียบร้อยแล้ว!</p>
              <p className="text-[11px] text-emerald-700">
                รหัสคำร้อง: <strong>{generatedTicketNo}</strong> ระบบได้ส่งต่อคำร้องไปยังเจ้าหน้าที่แล้ว (BR3)
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="text-xs font-bold underline hover:no-underline"
          >
            แจ้งเพิ่ม
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Section 1: Location */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>1. สถานที่เกิดเหตุ / ห้องเรียน</span>
            </div>
            <span className="text-[11px] font-bold text-red-500">* จำเป็น</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">อาคาร</label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>CP-01 อาคารวิทยวิภาส</option>
                <option>CP-02</option>
                <option>CP-03</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">ชั้น</label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>ชั้น 1</option>
                <option>ชั้น 2</option>
                <option>ชั้น 3 (ห้องปฏิบัติการ)</option>
                <option>ชั้น 4</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">เลขที่ห้อง</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>CP-304 Lab High-Performance Computing</option>
                <option>201 ห้องพักอาจารย์ CS</option>
                <option>208 ห้องพักอาจารย์ 208</option>
                <option>405 Lab Comp</option>
                <option>402 ห้องแล็บเครือข่าย</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">
              จุดสังเกตเฉพาะจุด / ตำแหน่งภายในห้อง
            </label>
            <input
              type="text"
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
              placeholder="เช่น โต๊ะแถวที่ 3 เครื่องฝั่งริมหน้าต่าง"
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Section 2: Equipment / Asset */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Laptop className="w-4 h-4 text-blue-600" />
              <span>2. ข้อมูลครุภัณฑ์ / อุปกรณ์</span>
            </div>
            <button
              type="button"
              onClick={() => alert('เปิดกล้องสแกน QR Code ครุภัณฑ์มหาวิทยาลัยขอนแก่น')}
              className="flex items-center space-x-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-100 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>สแกน QR Code ครุภัณฑ์</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">หมวดหมู่อุปกรณ์</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>ระบบคอมพิวเตอร์และเครือข่าย</option>
                <option>ระบบปรับอากาศ</option>
                <option>ระบบไฟฟ้าและแสงสว่าง</option>
                <option>โสตทัศนูปกรณ์</option>
                <option>อาคารสถานที่และเฟอร์นิเจอร์</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                รหัสครุภัณฑ์ (CoP Asset ID)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={assetId}
                  onChange={handleAssetCodeChange}
                  placeholder="เช่น KKU-CP-67-0891"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 pr-8 font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {isAssetVerified && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />
                )}
              </div>
            </div>
          </div>

          {/* Verified Asset Spec Card */}
          {isAssetVerified && (
            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-blue-900">Spec:</span>
                <span className="text-slate-700">Workstation Dell Precision 3660 (SN: 8JK92L3)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                อยู่ในระยะประกัน
              </span>
            </div>
          )}
        </div>

        {/* Section 3: Problem Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">
              3. รายละเอียดอาการชำรุด (BR2 บังคับกรอก)
            </label>
            <span className="text-[11px] font-bold text-red-500">* จำเป็น</span>
          </div>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="อธิบายอาการเสีย สภาพที่พบเห็น หรือข้อขัดข้องอย่างละเอียด..."
            className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Section 4: Photo Proofs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">
              4. แนบรูปถ่ายความเสียหาย (BR2 บังคับแนบ 1-3 รูป)
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              แนบแล้ว {images.length}/3 รูป
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group bg-slate-100"
              >
                <img
                  src={imgUrl}
                  alt={`proof ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition"
                  title="ลบรูปนี้"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white px-1.5 py-0.5 truncate">
                  {idx === 0 ? 'power_unit_fault.jpg' : 'station_overview.jpg'}
                </div>
              </div>
            ))}

            {images.length < 3 && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl aspect-video flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mb-1" />
                  <span className="text-[11px] font-bold">
                    {isUploading ? 'กำลังอัปโหลด...' : `เพิ่มภาพที่ ${images.length + 1}`}
                  </span>
                  <span className="text-[9px] text-slate-400">JPG, PNG &lt; 5MB</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Section 5: Urgency Level */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-800 block">
            5. ระดับความเร่งด่วน (Urgency)
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setUrgency('NORMAL')}
              className={`p-3 rounded-xl border text-center transition-all ${
                urgency === 'NORMAL'
                  ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <div className="text-xs font-semibold mb-0.5">ทั่วไป (Normal)</div>
              <div className={`text-[10px] ${urgency === 'NORMAL' ? 'text-slate-300' : 'text-slate-400'}`}>ภายใน 3 วัน</div>
            </button>

            <button
              type="button"
              onClick={() => setUrgency('URGENT')}
              className={`p-3 rounded-xl border text-center transition-all ${
                urgency === 'URGENT'
                  ? 'border-amber-600 bg-amber-500 text-white font-semibold shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <div className="text-xs font-semibold mb-0.5">เร่งด่วน (Urgent)</div>
              <div className={`text-[10px] ${urgency === 'URGENT' ? 'text-amber-100' : 'text-slate-400'}`}>ภายใน 24 ชม.</div>
            </button>

            <button
              type="button"
              onClick={() => setUrgency('CRITICAL')}
              className={`p-3 rounded-xl border text-center transition-all ${
                urgency === 'CRITICAL'
                  ? 'border-rose-600 bg-rose-600 text-white font-semibold shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <div className="text-xs font-semibold mb-0.5">ฉุกเฉิน (Critical)</div>
              <div className={`text-[10px] ${urgency === 'CRITICAL' ? 'text-rose-100' : 'text-slate-400'}`}>ทันที &lt; 2 ชม.</div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs shadow-xs transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'กำลังส่งคำร้อง...' : 'ส่งคำร้องแจ้งซ่อม'}</span>
          </button>

          <button
            type="button"
            onClick={() => alert('บันทึกแบบร่างสำเร็จ')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center space-x-1.5 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึกแบบร่าง</span>
          </button>
        </div>

        {/* Security / Compliance Notice */}
        <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-[11px] flex items-center space-x-2 border border-slate-200">
          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong>นโยบายความปลอดภัยและข้อมูลอุปกรณ์:</strong>{' '}
            ระบบจะแจ้งซ่อมผูกกับฐานข้อมูลพัสดุวิทยาลัยการคอมพิวเตอร์ KKU CoP หากเป็นทรัพย์สินส่วนตัวของนักศึกษาไม่สามารถแจ้งผ่านช่องทางนี้ได้
          </span>
        </div>
      </form>
    </div>
  );
};
