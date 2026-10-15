'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Send,
  Save,
  ShieldAlert,
  X,
  Laptop,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
  Camera,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import { triggerSuccessConfetti } from '@/lib/confetti';
import {
  analyzePhotoMock,
  MockAiScenario,
  VALID_CATEGORIES,
} from '@/services/mockAiService';
import { InAppPermissionModal, PermissionType } from '@/components/common/InAppPermissionModal';
import { WebPermissionService } from '@/lib/permissionService';

interface TicketFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ConflictingField {
  fieldName: string;
  label: string;
  oldValue: string;
  newValue: string;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onSuccess, onCancel }) => {
  // Mobile step wizard state (1: Photo & Mock AI, 2: Location & Asset, 3: Description & Submit)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // In-App Web Permission Modal State
  const [permissionModal, setPermissionModal] = useState<{
    isOpen: boolean;
    type: PermissionType;
    onAllow: () => void;
  } | null>(null);
  // -------------------------------------------------------------
  // Form State
  // -------------------------------------------------------------
  const [locations, setLocations] = useState<
    Array<{ id: string; building: string; roomName: string; roomNumber: string; floor: string }>
  >([]);
  const [selectedLocationId, setSelectedLocationId] = useState('loc_03');
  const [locationDetail, setLocationDetail] = useState(
    'โต๊ะแถวที่ 3 เครื่องฝั่งริมหน้าต่างติดเครื่องปรับอากาศ'
  );

  const [category, setCategory] = useState<string>('ระบบคอมพิวเตอร์และเครือข่าย');
  const [selectedEquipmentCode, setSelectedEquipmentCode] = useState('');
  const [roomEquipments, setRoomEquipments] = useState<
    Array<{
      equipmentCode: string;
      equipmentName: string;
      statusId?: string;
      status?: { id: string; name: string };
    }>
  >([]);
  const [isLoadingEquipments, setIsLoadingEquipments] = useState(false);

  const [description, setDescription] = useState(
    'เปิดสวิตช์เครื่องแล้วไม่มีไฟเข้าพาวเวอร์ซัพพลาย พัดลมด้านหลังไม่หมุน และมีกลิ่นไหม้ใหม่อ่อน ๆ ตอนแรกคิดว่าปลั๊กไฟหลวมแต่ตรวจสอบสายไฟ AC เสียบแน่นดีแล้วก็ยังไม่ทำงาน'
  );

  // Attached images (Pre-attached demo images so user can test Mock AI immediately)
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',
    'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=600',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedTicketNo, setGeneratedTicketNo] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // -------------------------------------------------------------
  // Mock AI State
  // -------------------------------------------------------------
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisSuccess, setAiAnalysisSuccess] = useState<MockAiScenario | null>(null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  // Overwrite confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAiResult, setPendingAiResult] = useState<MockAiScenario | null>(null);
  const [conflicts, setConflicts] = useState<ConflictingField[]>([]);

  // -------------------------------------------------------------
  // Load Locations & Equipments
  // -------------------------------------------------------------
  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setLocations(data.data);
          const found = data.data.find((l: { id: string }) => l.id === 'loc_03');
          if (found) setSelectedLocationId(found.id);
          else setSelectedLocationId(data.data[0].id);
        }
      })
      .catch((err) => console.error('Error fetching locations:', err));
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadEquipments() {
      if (!selectedLocationId) {
        if (isMounted) {
          setRoomEquipments([]);
          setSelectedEquipmentCode('');
        }
        return;
      }

      setIsLoadingEquipments(true);
      try {
        const res = await fetch(`/api/equipments?locationId=${selectedLocationId}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setRoomEquipments(data.data);
          setSelectedEquipmentCode((prevCode) => {
            const exists = data.data.some(
              (eq: { equipmentCode: string }) => eq.equipmentCode === prevCode
            );
            if (exists) return prevCode;
            return data.data.length > 0 ? data.data[0].equipmentCode : '';
          });
        } else if (isMounted) {
          setRoomEquipments([]);
          setSelectedEquipmentCode('');
        }
      } catch (err) {
        console.error('Error fetching room equipments:', err);
        if (isMounted) {
          setRoomEquipments([]);
          setSelectedEquipmentCode('');
        }
      } finally {
        if (isMounted) {
          setIsLoadingEquipments(false);
        }
      }
    }

    loadEquipments();

    return () => {
      isMounted = false;
    };
  }, [selectedLocationId]);

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEquipmentCode(e.target.value);
  };

  // -------------------------------------------------------------
  // Image Upload & Removal Handlers
  // -------------------------------------------------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      alert('แนบรูปได้สูงสุด 3 รูป');
      return;
    }

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์เกินกำหนด (สูงสุด 5 MB)');
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
        setImages((prev) => [...prev, data.data.fileUrl]);
        setAiAnalysisError(null);
      } else {
        // Fallback to FileReader base64 for instant preview
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          if (typeof uploadEvent.target?.result === 'string') {
            setImages((prev) => [...prev, uploadEvent.target!.result as string]);
            setAiAnalysisError(null);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Upload failed, falling back to local preview:', err);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (typeof uploadEvent.target?.result === 'string') {
          setImages((prev) => [...prev, uploadEvent.target!.result as string]);
          setAiAnalysisError(null);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setAiAnalysisSuccess(null);
  };

  // -------------------------------------------------------------
  // Web-based Permission Handlers (Zero Native Browser Alerts)
  // -------------------------------------------------------------
  const handleRequestCamera = () => {
    if (WebPermissionService.isGranted('camera_photos')) {
      cameraInputRef.current?.click();
    } else {
      setPermissionModal({
        isOpen: true,
        type: 'camera_photos',
        onAllow: () => {
          WebPermissionService.grant('camera_photos');
          setPermissionModal(null);
          setTimeout(() => {
            cameraInputRef.current?.click();
          }, 100);
        },
      });
    }
  };

  const handleRequestGallery = () => {
    if (WebPermissionService.isGranted('camera_photos')) {
      fileInputRef.current?.click();
    } else {
      setPermissionModal({
        isOpen: true,
        type: 'camera_photos',
        onAllow: () => {
          WebPermissionService.grant('camera_photos');
          setPermissionModal(null);
          setTimeout(() => {
            fileInputRef.current?.click();
          }, 100);
        },
      });
    }
  };

  const handleAutoDetectLocation = () => {
    if (WebPermissionService.isGranted('location')) {
      if (locations.length > 0) {
        const sc09Room = locations.find((l) => l.roomNumber === '304') || locations[0];
        setSelectedLocationId(sc09Room.id);
      }
    } else {
      setPermissionModal({
        isOpen: true,
        type: 'location',
        onAllow: () => {
          WebPermissionService.grant('location');
          setPermissionModal(null);
          if (locations.length > 0) {
            const sc09Room = locations.find((l) => l.roomNumber === '304') || locations[0];
            setSelectedLocationId(sc09Room.id);
          }
        },
      });
    }
  };

  // -------------------------------------------------------------
  // Mock AI Analysis Handler
  // -------------------------------------------------------------
  const handleTriggerMockAi = async () => {
    if (images.length === 0) {
      alert('กรุณาแนบรูปภาพความเสียหายก่อนกดตรวจสอบ');
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysisError(null);

    try {
      const result = await analyzePhotoMock(images);

      if (!VALID_CATEGORIES.includes(result.category as (typeof VALID_CATEGORIES)[number])) {
        throw new Error(
          `หมวดหมู่ที่จำลอง (${result.category}) ไม่ตรงกับตัวเลือกที่ระบบรองรับ ข้ามการกรอกข้อมูลอัตโนมัติ`
        );
      }

      // Detect conflicts with current user-entered data
      // AI ONLY fills: 1. Category, 2. Equipment Code, 3. Location (derived from Equipment Code)
      const detectedConflicts: ConflictingField[] = [];

      if (category && category !== result.category) {
        detectedConflicts.push({
          fieldName: 'category',
          label: 'หมวดหมู่อุปกรณ์',
          oldValue: category,
          newValue: result.category,
        });
      }

      if (selectedEquipmentCode && selectedEquipmentCode !== result.equipmentCode) {
        const oldEq = roomEquipments.find((eq) => eq.equipmentCode === selectedEquipmentCode);
        const oldLabel = oldEq ? `${oldEq.equipmentCode} (${oldEq.equipmentName})` : selectedEquipmentCode;
        detectedConflicts.push({
          fieldName: 'equipmentCode',
          label: 'เลขครุภัณฑ์',
          oldValue: oldLabel,
          newValue: `${result.equipmentCode} (${result.equipmentName})`,
        });
      }

      if (selectedLocationId && selectedLocationId !== result.locationId) {
        const oldLoc = locations.find((l) => l.id === selectedLocationId);
        const oldLocLabel = oldLoc
          ? `${oldLoc.building} • ห้อง ${oldLoc.roomNumber} (${oldLoc.roomName})`
          : selectedLocationId;
        detectedConflicts.push({
          fieldName: 'locationId',
          label: 'สถานที่ (ดึงจากเลขครุภัณฑ์)',
          oldValue: oldLocLabel,
          newValue: result.locationName,
        });
      }

      // If user has existing data that would be overwritten, prompt confirmation modal
      if (detectedConflicts.length > 0) {
        setConflicts(detectedConflicts);
        setPendingAiResult(result);
        setShowConfirmModal(true);
      } else {
        applyAiResultToForm(result);
      }
    } catch (err: unknown) {
      console.error('Mock AI analysis failed:', err);
      const errorMsg =
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการตรวจสอบรูปภาพ';
      setAiAnalysisError(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAiResultToForm = (result: MockAiScenario) => {
    // AI fills ONLY: 1. Category, 2. Equipment Code, 3. Location (derived from Equipment Code)
    setCategory(result.category);
    setSelectedEquipmentCode(result.equipmentCode);
    setSelectedLocationId(result.locationId);
    // User's description and locationDetail are intentionally preserved
    setAiAnalysisSuccess(result);
  };

  const handleConfirmOverwrite = () => {
    if (pendingAiResult) {
      applyAiResultToForm(pendingAiResult);
    }
    setShowConfirmModal(false);
    setPendingAiResult(null);
    setConflicts([]);
  };

  const handleCancelOverwrite = () => {
    setShowConfirmModal(false);
    setPendingAiResult(null);
    setConflicts([]);
  };

  // -------------------------------------------------------------
  // Submit Ticket Handler
  // -------------------------------------------------------------
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
          equipmentCode: selectedEquipmentCode || undefined,
          assetCode: selectedEquipmentCode || undefined,
          description,
          attachmentUrls: images,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedTicketNo(data.data.ticketNumber);
        setSubmitSuccess(true);
        triggerSuccessConfetti();
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
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden relative">
      {/* Desktop Stepper Header (hidden on mobile) */}
      <div className="hidden lg:block p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                แจ้งซ่อมออนไลน์
              </span>
              <span className="text-xs text-slate-400 font-semibold">• ขั้นตอนที่ {currentStep} จาก 3</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {currentStep === 1 && '1. ถ่ายรูปความเสียหาย & ตรวจสอบ Mock AI'}
              {currentStep === 2 && '2. ระบุสถานที่เกิดเหตุ & ข้อมูลครุภัณฑ์'}
              {currentStep === 3 && '3. รายละเอียดอาการชำรุด & ยืนยันคำร้อง'}
            </h2>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-medium">รหัสคำร้อง</span>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
              {generatedTicketNo || 'REQ-AUTO'}
            </span>
          </div>
        </div>

        {/* Desktop Stepper Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { step: 1, label: '1. รูปถ่าย & AI' },
            { step: 2, label: '2. สถานที่ & ครุภัณฑ์' },
            { step: 3, label: '3. อาการ & ยืนยัน' },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => {
                if (item.step < currentStep) {
                  setCurrentStep(item.step);
                } else if (item.step === 2 && images.length > 0) {
                  setCurrentStep(2);
                } else if (item.step === 3 && images.length > 0) {
                  setCurrentStep(3);
                }
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer flex items-center justify-center space-x-1.5 ${
                currentStep === item.step
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : item.step < currentStep
                  ? 'bg-blue-50/80 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Step Header & Progress Bar (< lg) */}
      <div className="lg:hidden bg-white border-b border-slate-200/80 p-3.5 sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-1 -ml-1 text-slate-400 hover:text-slate-700 active:scale-90 transition rounded-xl cursor-pointer"
                aria-label="ปิดแบบฟอร์ม"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="text-[9.5px] font-bold text-blue-700 uppercase tracking-wider block">
                ขั้นตอนที่ {currentStep} จาก 3
              </span>
              <h2 className="text-[13px] font-extrabold text-slate-900 leading-tight">
                {currentStep === 1 && 'ถ่ายรูป & วิเคราะห์ Mock AI'}
                {currentStep === 2 && 'สถานที่และข้อมูลอุปกรณ์'}
                {currentStep === 3 && 'รายละเอียดอาการ & ส่งคำร้อง'}
              </h2>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
            {Math.round((currentStep / 3) * 100)}%
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        {/* Step Chips */}
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          {[
            { step: 1, label: '1. รูปถ่าย & AI' },
            { step: 2, label: '2. สถานที่ & อุปกรณ์' },
            { step: 3, label: '3. อาการ & ยืนยัน' },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => {
                if (item.step < currentStep) {
                  setCurrentStep(item.step);
                } else if (item.step === 2 && images.length > 0) {
                  setCurrentStep(2);
                } else if (item.step === 3 && images.length > 0) {
                  setCurrentStep(3);
                }
              }}
              className={`py-1 text-center rounded-lg text-[9.5px] font-bold transition-all cursor-pointer ${
                currentStep === item.step
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : item.step < currentStep
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {submitSuccess && (
        <div className="m-4 sm:m-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-xs sm:text-sm">ส่งคำร้องแจ้งซ่อมเรียบร้อยแล้ว!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                รหัสคำร้อง: <strong>{generatedTicketNo}</strong> ระบบได้ส่งต่อคำร้องไปยังโต๊ะจ่ายงานแล้ว
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="text-xs font-bold text-emerald-800 underline hover:no-underline px-2 py-1 cursor-pointer"
          >
            แจ้งเพิ่ม
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
        {/* ========================================================= */}
        {/* STEP 1: PHOTO ATTACHMENT & MOCK AI (Visible on Step 1)   */}
        {/* ========================================================= */}
        <div className={`space-y-3.5 ${currentStep === 1 ? 'block' : 'hidden'}`}>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-blue-50/50 via-slate-50/30 to-slate-50/60 border border-blue-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
              <div className="flex items-center space-x-2 text-[13px] sm:text-sm font-extrabold text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <span>1. รูปถ่ายความเสียหาย &amp; ตรวจสอบจากรูป</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 ring-1 ring-inset ring-red-600/20">
                  * จำเป็น
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {images.length}/3 รูป
                </span>
              </div>
            </div>

            <p className="text-[11.5px] text-slate-600 leading-relaxed">
              ถ่ายภาพหรือเลือกรูปความเสียหาย เมื่อแนบแล้วสามารถกด{' '}
              <strong className="text-indigo-700 font-bold">&quot;ตรวจสอบจากรูป&quot;</strong> เพื่อจำลองวิเคราะห์และกรอกข้อมูลให้อัตโนมัติ
            </p>

            {/* Hidden inputs for camera capture & file gallery */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Photo Previews (Compact Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden border border-slate-200 h-24 group bg-slate-100 shadow-2xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`ความเสียหาย ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 active:scale-90 text-white rounded-full transition shadow-xs cursor-pointer"
                    title="ลบรูปนี้"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent text-[9px] text-white px-2 py-1 flex items-center justify-between">
                    <span className="font-semibold">ภาพที่ {idx + 1}</span>
                    <span className="bg-emerald-500/90 text-[8.5px] font-bold px-1 py-0.2 rounded">
                      พร้อมตรวจ
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons: Camera & Gallery in 2-column Compact Grid */}
            {images.length < 3 && (
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleRequestCamera}
                  className="py-2 px-3 border border-blue-300 hover:border-blue-500 active:scale-95 rounded-xl flex items-center justify-center space-x-1.5 text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 transition cursor-pointer disabled:opacity-50 text-xs font-bold shadow-2xs"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>ถ่ายภาพทันที (ขอสิทธิ์)</span>
                </button>

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleRequestGallery}
                  className="py-2 px-3 border border-slate-300 hover:border-slate-400 active:scale-95 rounded-xl flex items-center justify-center space-x-1.5 text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 text-xs font-bold shadow-2xs"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{isUploading ? 'กำลังโหลด...' : 'เลือกจากคลัง (ขอสิทธิ์)'}</span>
                </button>
              </div>
            )}

            {/* Mock AI Trigger Button */}
            <div className="pt-2 border-t border-blue-100/80 space-y-2">
              <button
                type="button"
                disabled={images.length === 0 || isAnalyzing}
                onClick={handleTriggerMockAi}
                className={`w-full min-h-[42px] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all duration-150 shadow-sm active:scale-[0.98] cursor-pointer ${
                  images.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : isAnalyzing
                    ? 'bg-indigo-400 text-white cursor-wait animate-pulse'
                    : 'bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white shadow-indigo-500/20'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังตรวจสอบภาพด้วย Mock AI... (1.3s)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>ตรวจสอบจากรูป (Mock AI)</span>
                  </>
                )}
              </button>

              <div className="flex items-center text-[10.5px] text-slate-500 space-x-1.5 bg-white/70 p-2 rounded-xl border border-slate-200/70">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {images.length === 0
                    ? 'แนบภาพอย่างน้อย 1 ภาพเพื่อเปิดปุ่มตรวจสอบ'
                    : 'กดเพื่อจำลองการวิเคราะห์อาการและนำข้อมูลไปกรอกในฟอร์ม'}
                </span>
              </div>
            </div>

            {/* AI Inspection Error Notice */}
            {aiAnalysisError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{aiAnalysisError}</span>
              </div>
            )}

            {/* Mock AI Results Banner (Compact) */}
            {aiAnalysisSuccess && (
              <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-2 text-xs animate-in fade-in duration-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-xs">{aiAnalysisSuccess.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                    ความมั่นใจ {Math.round(aiAnalysisSuccess.confidenceScore * 100)}%
                  </span>
                </div>

                <div className="text-[10.5px] text-indigo-900 bg-white/90 p-2.5 rounded-lg border border-indigo-100 space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-500">1. หมวดหมู่อุปกรณ์:</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {aiAnalysisSuccess.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-500">2. เลขครุภัณฑ์:</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      {aiAnalysisSuccess.equipmentCode}
                    </span>
                    <span className="text-slate-600 font-medium">({aiAnalysisSuccess.equipmentName})</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-500">3. สถานที่ (ดึงจากเลขครุภัณฑ์):</span>
                    <span className="font-bold text-slate-700">
                      {aiAnalysisSuccess.locationName}
                    </span>
                  </div>

                  <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-500">ตรวจพบจากรูป:</span>{' '}
                    <span className="text-slate-700 font-medium">
                      {aiAnalysisSuccess.detectedObjects.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Mandatory Disclaimer */}
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold flex items-start space-x-1.5 leading-snug">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.2" />
                  <span>
                    Mock AI กรอกเฉพาะหมวดหมู่ เลขครุภัณฑ์ และดึงข้อมูลสถานที่ให้อัตโนมัติ (รายละเอียดอาการคงเดิมตามที่คุณระบุ)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Next Button for Step 1 */}
          <div className="hidden lg:flex items-center justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (images.length === 0) {
                  alert('กรุณาแนบรูปภาพความเสียหายอย่างน้อย 1 รูปก่อนไปขั้นตอนถัดไป');
                  return;
                }
                setCurrentStep(2);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>ถัดไป: ระบุสถานที่ &amp; ครุภัณฑ์</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* End of Step 1 Container */}

        {/* ========================================================= */}
        {/* STEP 2: LOCATION & ASSET DETAILS (Visible on Step 2)      */}
        {/* ========================================================= */}
        <div className={`space-y-3.5 ${currentStep === 2 ? 'block' : 'hidden'}`}>
          {/* SECTION 2: LOCATION DETAILS */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <div className="flex items-center space-x-2 text-[13px] sm:text-sm font-extrabold text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>2. สถานที่เกิดเหตุ / ห้องเรียน</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                  title="ขอสิทธิ์พิกัดตำแหน่งเพื่อระบุห้องอัตโนมัติ"
                >
                  <MapPin className="w-3 h-3 text-rose-600" />
                  <span>ตรวจจับห้อง (GPS ขอสิทธิ์)</span>
                </button>
                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 ring-1 ring-inset ring-red-600/20">
                  * จำเป็น
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label htmlFor="building-select" className="text-[11.5px] sm:text-xs font-bold text-slate-700 block mb-1">
                  อาคาร <span className="text-red-500">*</span>
                </label>
                <input
                  id="building-select"
                  type="text"
                  readOnly
                  value="SC-09 อาคารวิทยวิภาส"
                  className="w-full text-[12.5px] sm:text-xs text-slate-800 bg-slate-100/80 border border-slate-300 rounded-xl px-3 py-2 sm:py-2.5 font-semibold cursor-not-allowed focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="floor-select" className="text-[11.5px] sm:text-xs font-bold text-slate-700 block mb-1">
                  ชั้น <span className="text-red-500">*</span>
                </label>
                <input
                  id="floor-select"
                  type="text"
                  readOnly
                  value={locations.find((l) => l.id === selectedLocationId)?.floor || 'ชั้น 3'}
                  className="w-full text-[12.5px] sm:text-xs text-slate-800 bg-slate-100/80 border border-slate-300 rounded-xl px-3 py-2 sm:py-2.5 font-semibold cursor-not-allowed focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="room-select"
                  className="text-[11.5px] sm:text-xs font-bold text-slate-700 flex items-center gap-1 mb-1"
                >
                  <span>เลขที่ห้อง / ปฏิบัติการ</span>
                  <span className="text-red-500">*</span>
                  <InfoTooltip text="เลือกห้องที่พบปัญหา ระบบจะกรองครุภัณฑ์ในห้องมาให้อัตโนมัติ" />
                </label>
                <div className="relative">
                  <select
                    id="room-select"
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="w-full appearance-none text-[12.5px] sm:text-xs text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 sm:py-2.5 pr-8 font-bold hover:border-blue-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 transition shadow-2xs"
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
                        <option value="loc_04">405 - Network Operation Center (ชั้น 4)</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="location-detail" className="text-[11.5px] sm:text-xs font-bold text-slate-700 block mb-1">
                จุดสังเกตเฉพาะจุด / ตำแหน่งภายในห้อง
              </label>
              <textarea
                id="location-detail"
                rows={2}
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="เช่น โต๊ะแถวที่ 3 เครื่องฝั่งริมหน้าต่างติดเครื่องปรับอากาศ"
                className="w-full text-[12.5px] sm:text-xs text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 font-normal placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 transition shadow-2xs resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* SECTION 3: EQUIPMENT / ASSET DETAILS */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <div className="flex items-center space-x-2 text-[12.5px] sm:text-sm font-extrabold text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Laptop className="w-3.5 h-3.5" />
                </div>
                <span>3. ข้อมูลครุภัณฑ์ / อุปกรณ์</span>
              </div>
              <button
                type="button"
                onClick={() => alert('เปิดกล้องสแกน QR Code ครุภัณฑ์มหาวิทยาลัยขอนแก่น')}
                className="flex items-center space-x-1 text-[10.5px] sm:text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl hover:bg-blue-100 active:scale-95 transition cursor-pointer"
              >
                <QrCode className="w-3 h-3" />
                <span>สแกน QR</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="category-select" className="text-[11.5px] sm:text-xs font-bold text-slate-700 block mb-1">
                  หมวดหมู่อุปกรณ์
                </label>
                <div className="relative">
                  <select
                    id="category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none text-[12.5px] sm:text-xs text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 sm:py-2.5 pr-8 font-bold hover:border-blue-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 transition shadow-2xs"
                  >
                    {VALID_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="equipment-select"
                    className="text-[11.5px] sm:text-xs font-bold text-slate-700 flex items-center gap-1"
                  >
                    <span>เลือกครุภัณฑ์ในห้องนี้</span>
                    <span className="text-[9.5px] sm:text-[10px] text-blue-600 font-bold">
                      ({roomEquipments.length} รายการ)
                    </span>
                  </label>
                  {isLoadingEquipments && (
                    <span className="text-[9.5px] sm:text-[10px] text-slate-400 animate-pulse">กำลังโหลด...</span>
                  )}
                </div>
                <div className="relative">
                  <select
                    id="equipment-select"
                    value={selectedEquipmentCode}
                    onChange={handleEquipmentChange}
                    disabled={isLoadingEquipments}
                    className="w-full appearance-none text-[12.5px] sm:text-xs text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 sm:py-2.5 pr-8 font-medium hover:border-blue-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 transition shadow-2xs disabled:bg-slate-100"
                  >
                    <option value="">-- ไม่ระบุครุภัณฑ์ (แจ้งซ่อมสถานที่ / ปัญหาทั่วไป) --</option>
                    {roomEquipments.map((eq) => (
                      <option key={eq.equipmentCode} value={eq.equipmentCode}>
                        {eq.equipmentCode} : {eq.equipmentName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Verified Asset Spec Card */}
            {selectedEquipmentCode &&
            roomEquipments.find((eq) => eq.equipmentCode === selectedEquipmentCode) ? (
              (() => {
                const selectedEquipment = roomEquipments.find(
                  (eq) => eq.equipmentCode === selectedEquipmentCode
                )!;
                return (
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-blue-950 text-[11px]">ครุภัณฑ์ที่เลือก:</span>
                        <span className="text-slate-800 font-semibold text-[11px]">{selectedEquipment.equipmentName}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                        <span>
                          รหัส:{' '}
                          <code className="font-mono text-blue-700 font-bold">
                            {selectedEquipment.equipmentCode}
                          </code>
                        </span>
                        <span>•</span>
                        <span>
                          สถานะ:{' '}
                          <strong className="text-slate-700">
                            {selectedEquipment.status?.name || 'ใช้งานได้ปกติ'}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold shrink-0 ${
                        selectedEquipment.status?.name === 'ชำรุดรอซ่อม'
                          ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                          : 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                      }`}
                    >
                      {selectedEquipment.status?.name || 'ใช้งานได้ปกติ'}
                    </span>
                  </div>
                );
              })()
            ) : !selectedEquipmentCode ? (
              <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-500 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>แจ้งซ่อมหมวดสถานที่ทั่วไป (ไม่มีรหัสครุภัณฑ์ผูกกับคำร้องนี้)</span>
              </div>
            ) : null}
          </div>

          {/* Desktop Next/Prev for Step 2 */}
          <div className="hidden lg:flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>ถัดไป: ระบุอาการชำรุด</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* End of Step 2 Container */}

        {/* ========================================================= */}
        {/* STEP 3: PROBLEM DESCRIPTION & SUBMIT (Visible on Step 3)  */}
        {/* ========================================================= */}
        <div className={`space-y-3.5 ${currentStep === 3 ? 'block' : 'hidden'}`}>
          {/* Quick Recap */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/90 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-blue-950 font-extrabold text-[11.5px]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>ข้อมูลที่ระบุไว้ในขั้นตอนก่อนหน้า</span>
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-[10.5px] text-blue-700 underline font-bold cursor-pointer"
              >
                แก้ไข
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
              <div className="bg-white p-2.5 rounded-xl border border-blue-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 block text-[9.5px] font-bold">
                    รูปถ่ายความเสียหาย ({images.length} รูป)
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[9.5px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    ถ่ายเพิ่ม/แก้ไข
                  </button>
                </div>
                {images.length > 0 ? (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    {images.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 group shadow-2xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`รูปความเสียหาย ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-150"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-mono text-center font-bold">
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-[10px]">ยังไม่ได้แนบรูป</span>
                )}
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-blue-100 space-y-1">
                <span className="text-slate-400 block text-[9.5px] font-bold">สถานที่ &amp; ครุภัณฑ์</span>
                <span className="font-bold text-slate-800 text-xs truncate block">
                  {locations.find((l) => l.id === selectedLocationId)?.roomNumber} - {locations.find((l) => l.id === selectedLocationId)?.roomName || 'ห้องสำนักงาน'}
                </span>
                <span className="text-[10px] text-blue-700 font-medium truncate block">
                  {selectedEquipmentCode
                    ? `ครุภัณฑ์: ${selectedEquipmentCode}`
                    : 'แจ้งซ่อมสถานที่ทั่วไป (ไม่ระบุครุภัณฑ์)'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: PROBLEM DESCRIPTION */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="problem-description" className="text-[11.5px] sm:text-xs font-bold text-slate-800">
                4. รายละเอียดอาการชำรุด
              </label>
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold text-red-600 ring-1 ring-inset ring-red-600/20">
                * จำเป็น
              </span>
            </div>
            <textarea
              id="problem-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายอาการเสีย สภาพที่พบเห็น หรือข้อขัดข้องอย่างละเอียด..."
              className="w-full text-[12.5px] sm:text-xs text-slate-900 bg-white border border-slate-300 rounded-xl p-2.5 sm:p-3 placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 transition shadow-2xs resize-none leading-relaxed"
            />
          </div>

          {/* Desktop Next/Prev/Submit for Step 3 */}
          <div className="hidden lg:flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              ย้อนกลับ
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => alert('บันทึกแบบร่างสำเร็จ')}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>บันทึกแบบร่าง</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'กำลังส่งคำร้อง...' : 'ส่งคำร้องแจ้งซ่อม'}</span>
              </button>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 text-[10.5px] flex items-center space-x-2 border border-slate-200">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="leading-relaxed">
              <strong>นโยบายความปลอดภัยและข้อมูลอุปกรณ์:</strong>{' '}
              ระบบจะแจ้งซ่อมผูกกับฐานข้อมูลพัสดุวิทยาลัยการคอมพิวเตอร์ KKU CoP
            </span>
          </div>
        </div>
        {/* End of Step 3 Container */}

        {/* Mobile Sticky Bottom Action Bar (< lg) */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-2.5 pb-safe shadow-xl">
          <div className="max-w-md mx-auto flex items-center gap-2">
            {currentStep === 1 && (
              <>
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="min-h-[42px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (images.length === 0) {
                      alert('กรุณาแนบรูปภาพความเสียหายอย่างน้อย 1 รูปก่อนไปขั้นตอนถัดไป');
                      return;
                    }
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[42px] flex-1 flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <span>ถัดไป: สถานที่ &amp; ครุภัณฑ์</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[42px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(3);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[42px] flex-1 flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <span>ถัดไป: ระบุอาการชำรุด</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {currentStep === 3 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[42px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[42px] flex-1 flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'กำลังส่งคำร้อง...' : 'ส่งคำร้องแจ้งซ่อม'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </form>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM SHEET MODAL: PREVENT UNINTENDED OVERWRITE   */}
      {/* ========================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-250 ease-out max-h-[85vh] flex flex-col">
            {/* Mobile Sheet Drag Handle Bar */}
            <div className="pt-3 pb-1 flex justify-center sm:hidden">
              <div className="w-12 h-1.5 rounded-full bg-slate-300" />
            </div>

            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/70">
              <div className="flex items-center space-x-2 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  ยืนยันการแทนที่ข้อมูลในแบบฟอร์ม
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCancelOverwrite}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                ระบบตรวจพบว่าคุณมีข้อมูลที่กรอกไว้แล้วในบางช่อง
                การนำผลจาก <strong>Mock AI</strong> ไปกรอกอัตโนมัติจะเปลี่ยนแปลงข้อมูลดังนี้:
              </p>

              <div className="space-y-2.5 border border-slate-200/90 rounded-2xl p-3 sm:p-4 bg-slate-50">
                {conflicts.map((c, idx) => (
                  <div key={idx} className="pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                    <span className="font-extrabold text-slate-900 block text-xs mb-1.5">
                      {idx + 1}. {c.label}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-red-50 text-red-900 p-2.5 rounded-xl border border-red-200/80">
                        <span className="font-bold block text-red-800 mb-1">ข้อมูลเดิมของคุณ:</span>
                        <p className="line-clamp-3 font-medium">{c.oldValue}</p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-950 p-2.5 rounded-xl border border-emerald-200/80">
                        <span className="font-bold block text-emerald-800 mb-1">
                          ข้อมูลจาก Mock AI:
                        </span>
                        <p className="line-clamp-3 font-medium">{c.newValue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-bold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>คุณยังคงสามารถแก้ไขข้อมูลทุกช่องได้ตามปกติหลังจากนำข้อมูลมาใส่ในฟอร์ม</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelOverwrite}
                className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200/60 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer order-2 sm:order-1"
              >
                ยกเลิก (คงข้อมูลเดิมไว้)
              </button>
              <button
                type="button"
                onClick={handleConfirmOverwrite}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm transition shadow-sm shadow-indigo-600/20 cursor-pointer flex items-center justify-center space-x-1.5 order-1 sm:order-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ยืนยันและนำข้อมูลไปกรอก</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Permission Request Modal */}
      {permissionModal && (
        <InAppPermissionModal
          isOpen={permissionModal.isOpen}
          type={permissionModal.type}
          onAllow={permissionModal.onAllow}
          onDeny={() => setPermissionModal(null)}
        />
      )}
    </div>
  );
};
