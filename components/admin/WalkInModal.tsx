'use client';

import React, { useState } from 'react';
import { X, Plus, AlertTriangle } from 'lucide-react';
import { STANDARD_TAGS, StandardTag } from '@/types';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const WalkInModal: React.FC<WalkInModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [description, setDescription] = useState('');
  const [locationId, setLocationId] = useState('loc_03');
  const [selectedTag, setSelectedTag] = useState<StandardTag>('งานเร่งด่วน');
  const [reporterName, setReporterName] = useState('ผู้ติดต่อ Walk-in หน้าเคาน์เตอร์');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('กรุณากรอกอาการเสีย');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          locationDetail: `Walk-in ติดต่อแจ้งที่อาคาร SC-09 อาคารวิทยวิภาส`,
          category: 'งานฉุกเฉินเฉพาะหน้า (Walk-in)',
          description: `[Walk-in โดย ${reporterName}] ${description}`,
          attachmentUrls: [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Update tags for walk-in if needed
        if (data.data?.id && selectedTag) {
          await fetch(`/api/tickets/${data.data.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'UPDATE_TAGS',
              tags: [selectedTag],
            }),
          });
        }
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                สร้างใบงานฉุกเฉิน (Walk-in Ticket)
              </h3>
              <p className="text-[11px] text-slate-500">
                สำหรับผู้แจ้งที่มาติดต่อหน้าเคาน์เตอร์ธุรการหรือแจ้งทางวิทยุสื่อสาร
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">ชื่อผู้แจ้งเหตุ (Walk-in):</label>
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">สถานที่ / ห้อง (SC-09):</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="loc_01">101 ห้องธุรการ (ชั้น 1)</option>
                <option value="loc_02">202 Smart Classroom (ชั้น 2)</option>
                <option value="loc_03">304 Lab High-Performance (ชั้น 3)</option>
                <option value="loc_04">405 Network NOC (ชั้น 4)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">กำหนด Tag ลำดับความสำคัญ:</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value as StandardTag)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {STANDARD_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">รายละเอียดอาการเสีย:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุอาการชำรุดฉุกเฉิน..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'เปิดใบงานทันที'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
