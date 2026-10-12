'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
} from 'lucide-react';

interface TicketFormProps {
  onSuccess?: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onSuccess }) => {
  const [locations, setLocations] = useState<Array<{ id: string; building: string; roomName: string; roomNumber: string; floor: string }>>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('loc_03');
  const [locationDetail, setLocationDetail] = useState(
    'โต๊ะแถวที่ 3 เครื่องฝั่งริมหน้าต่างติดเครื่องปรับอากาศ'
  );

  const [category, setCategory] = useState('ระบบคอมพิวเตอร์และเครือข่าย');
  const [assetId, setAssetId] = useState('KKU-CP-67-0891');
  const [isAssetVerified, setIsAssetVerified] = useState(true);

  const [description, setDescription] = useState(
    'เปิดสวิตช์เครื่องแล้วไม่มีไฟเข้าพาวเวอร์ซัพพลาย พัดลมด้านหลังไม่หมุน และมีกลิ่นไหม้ใหม่อ่อน ๆ ตอนแรกคิดว่าปลั๊กไฟหลวมแต่ตรวจสอบสายไฟ AC เสียบแน่นดีแล้วก็ยังไม่ทำงาน'
  );

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

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setLocations(data.data);
          // Default to loc_03 if present, else first
          const found = data.data.find((l: any) => l.id === 'loc_03');
          if (found) setSelectedLocationId(found.id);
          else setSelectedLocationId(data.data[0].id);
        }
      })
      .catch((err) => console.error('Error fetching locations:', err));
  }, []);

  const handleAssetCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAssetId(val);
    setIsAssetVerified(val.includes('KKU-CP') || val.length > 5);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      alert('แนบรูปได้สูงสุด 3 รูป');
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
      alert('กรุณากรอกรายละเอียดอาการชำรุด');
      return;
    }
    if (images.length === 0) {
      alert('กรุณาแนบรูปถ่ายความเสียหายอย่างน้อย 1 ภาพ');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: selectedLocationId || 'loc_03',
          locationDetail,
          category,
          assetCode: assetId,
          description,
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
                รหัสคำร้อง: <strong>{generatedTicketNo}</strong> ระบบได้ส่งต่อคำร้องไปยังเจ้าหน้าที่เรียบร้อยแล้ว
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
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>1. สถานที่เกิดเหตุ / ห้องเรียน</span>
            </div>
            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-600/20">
              * จำเป็น
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="building-select" className="text-sm font-medium text-gray-700 block mb-1.5">
                อาคาร <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="building-select"
                  type="text"
                  readOnly
                  value="SC-09 อาคารวิทยวิภาส"
                  className="w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 font-medium cursor-not-allowed focus:outline-none shadow-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="floor-select" className="text-sm font-medium text-gray-700 block mb-1.5">
                ชั้น <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="floor-select"
                  type="text"
                  readOnly
                  value={locations.find((l) => l.id === selectedLocationId)?.floor || 'ชั้น 3'}
                  className="w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 font-medium cursor-not-allowed focus:outline-none shadow-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="room-select" className="text-sm font-medium text-gray-700 block mb-1.5">
                เลขที่ห้อง / ห้องปฏิบัติการ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="room-select"
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full appearance-none text-sm text-gray-900 bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 font-medium hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-xs"
                >
                  {locations.length > 0 ? (
                    locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.roomNumber} - {loc.roomName} ({loc.floor})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="loc_01">101 - ห้องสำนักงานคณบดีและธุรการ (ชั้น 1)</option>
                      <option value="loc_02">202 - ห้องบรรยาย Smart Classroom 202 (ชั้น 2)</option>
                      <option value="loc_03">304 - Lab High-Performance Computing (ชั้น 3)</option>
                      <option value="loc_04">405 - Network Operation Center & Server Room (ชั้น 4)</option>
                    </>
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="location-detail" className="text-sm font-medium text-gray-700 block mb-1.5">
              จุดสังเกตเฉพาะจุด / ตำแหน่งภายในห้อง
            </label>
            <textarea
              id="location-detail"
              rows={2}
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
              placeholder="เช่น โต๊ะแถวที่ 3 เครื่องฝั่งริมหน้าต่างติดเครื่องปรับอากาศ"
              className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg px-4 py-2.5 font-normal placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-xs resize-none"
            />
          </div>
        </div>

        {/* Section 2: Equipment / Asset */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
              <Laptop className="w-4 h-4 text-blue-600" />
              <span>2. ข้อมูลครุภัณฑ์ / อุปกรณ์</span>
            </div>
            <button
              type="button"
              onClick={() => alert('เปิดกล้องสแกน QR Code ครุภัณฑ์มหาวิทยาลัยขอนแก่น')}
              className="flex items-center space-x-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>สแกน QR Code ครุภัณฑ์</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="category-select" className="text-sm font-medium text-gray-700 block mb-1.5">หมวดหมู่อุปกรณ์</label>
              <div className="relative">
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none text-sm text-gray-900 bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 font-medium hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-xs"
                >
                  <option>ระบบคอมพิวเตอร์และเครือข่าย</option>
                  <option>ระบบปรับอากาศ</option>
                  <option>ระบบไฟฟ้าและแสงสว่าง</option>
                  <option>โสตทัศนูปกรณ์</option>
                  <option>อาคารสถานที่และเฟอร์นิเจอร์</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div>
              <label htmlFor="asset-id" className="text-sm font-medium text-gray-700 block mb-1.5">
                รหัสครุภัณฑ์ (CoP Asset ID)
              </label>
              <div className="relative">
                <input
                  id="asset-id"
                  type="text"
                  value={assetId}
                  onChange={handleAssetCodeChange}
                  placeholder="เช่น KKU-CP-67-0891"
                  className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 font-mono font-medium placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-xs"
                />
                {isAssetVerified && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
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
            <label htmlFor="problem-description" className="text-sm font-bold text-slate-800">
              3. รายละเอียดอาการชำรุด
            </label>
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-600/20">
              * จำเป็น
            </span>
          </div>
          <textarea
            id="problem-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="อธิบายอาการเสีย สภาพที่พบเห็น หรือข้อขัดข้องอย่างละเอียด..."
            className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg px-4 py-2.5 placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-xs resize-none leading-relaxed"
          />
        </div>

        {/* Section 4: Photo Proofs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">
              4. แนบรูปถ่ายความเสียหาย (1-3 รูป)
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

        {/* Action Buttons */}
        <div className="pt-2 flex items-center space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-medium text-xs shadow-xs transition disabled:opacity-50"
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
