'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  ChevronDown,
  X,
  PackageCheck,
  Sparkles,
  Layers,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { SparePart } from '@/types';
import { PartWithCompatibility } from '@/services/equipmentPartsMapping';

export interface SelectedPartItem {
  partId: string;
  partCode: string;
  partName: string;
  quantity: number;
  unit: string;
  maxStock: number;
}

interface SparePartCheckboxComboboxProps {
  parts: PartWithCompatibility[];
  selectedItems: Record<string, SelectedPartItem>;
  onToggleItem: (part: PartWithCompatibility) => void;
  onChangeQuantity: (partId: string, quantity: number) => void;
  equipmentLabel: string;
  hasEquipment: boolean;
  filterMode: 'compatible_only' | 'all';
  onFilterModeChange: (mode: 'compatible_only' | 'all') => void;
  disabled?: boolean;
}

export const SparePartCheckboxCombobox: React.FC<SparePartCheckboxComboboxProps> = ({
  parts,
  selectedItems,
  onToggleItem,
  onChangeQuantity,
  equipmentLabel,
  hasEquipment,
  filterMode,
  onFilterModeChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Count compatible parts
  const compatibleCount = useMemo(() => {
    return parts.filter((p) => p.isCompatible).length;
  }, [parts]);

  // Filter parts by mode and search query
  const displayedParts = useMemo(() => {
    let list = parts;
    if (filterMode === 'compatible_only') {
      list = parts.filter((p) => p.isCompatible);
      // Fallback if none compatible
      if (list.length === 0) list = parts;
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.trim().toLowerCase();
    return list.filter((p) => {
      const code = p.partCode.toLowerCase();
      const name = p.name.toLowerCase();
      const reason = (p.matchReason || '').toLowerCase();
      const room = (p.storageRoom || '').toLowerCase();
      return code.includes(query) || name.includes(query) || reason.includes(query) || room.includes(query);
    });
  }, [parts, filterMode, searchQuery]);

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <div className="space-y-2">
      {/* Equipment Reference Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
              อิงตามครุภัณฑ์ในใบแจ้งซ่อม
            </span>
            <p className="text-xs font-extrabold text-blue-950 truncate">
              {equipmentLabel}
            </p>
          </div>
        </div>

        {/* Filter Toggle Pills */}
        <div className="flex items-center space-x-1 self-start sm:self-auto bg-white/90 p-0.5 rounded-lg border border-blue-200/70 shrink-0">
          <button
            type="button"
            onClick={() => onFilterModeChange('compatible_only')}
            className={`px-2 py-1 rounded-md text-[10.5px] font-bold transition cursor-pointer flex items-center space-x-1 ${
              filterMode === 'compatible_only'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>เฉพาะอะไหล่ที่ตรงรุ่น ({compatibleCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterModeChange('all')}
            className={`px-2 py-1 rounded-md text-[10.5px] font-bold transition cursor-pointer flex items-center space-x-1 ${
              filterMode === 'all'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-2.5 h-2.5" />
            <span>อะไหล่ทั้งหมด ({parts.length})</span>
          </button>
        </div>
      </div>

      {/* Combobox Trigger Field */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full min-h-[44px] p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer bg-white ${
            isOpen
              ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <div className="flex-1 min-w-0 flex items-center flex-wrap gap-1.5 mr-2">
            {selectedCount === 0 ? (
              <span className="text-xs text-slate-400 font-medium flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>คลิกเพื่อค้นหาและเลือกอะไหล่ (มี Checkbox ให้เลือกได้หลายรายการ)</span>
              </span>
            ) : (
              Object.values(selectedItems).map((item) => (
                <span
                  key={item.partId}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-900 font-mono text-[11px] font-bold border border-blue-200"
                >
                  <span>{item.partCode}</span>
                  <span className="text-blue-700 font-sans">×{item.quantity}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      const found = parts.find((p) => p.id === item.partId);
                      if (found) onToggleItem(found);
                    }}
                    className="cursor-pointer hover:text-rose-600 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              ))
            )}
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 text-slate-400">
            {selectedCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-700 text-white">
                เลือกแล้ว {selectedCount}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown Overlay / Popover with Search & Checkbox List */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Search Input Bar */}
            <div className="p-2.5 bg-slate-50/80 border-b border-slate-200/90 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารหัสอะไหล่ (MAT-...), ชื่ออะไหล่ หรือสโตร์จัดเก็บ..."
                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-slate-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Header info in Dropdown */}
            <div className="px-3 py-1.5 bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>
                แสดง {displayedParts.length} รายการ{' '}
                {filterMode === 'compatible_only' ? '(กรองเฉพาะที่ตรงรุ่น)' : '(ทั้งหมดในคลัง)'}
              </span>
              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    Object.values(selectedItems).forEach((item) => {
                      const found = parts.find((p) => p.id === item.partId);
                      if (found) onToggleItem(found);
                    });
                  }}
                  className="text-rose-600 hover:text-rose-800 text-[10.5px] font-bold cursor-pointer"
                >
                  ล้างที่เลือกทั้งหมด
                </button>
              )}
            </div>

            {/* Scrollable Checkbox List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 custom-scrollbar p-1">
              {displayedParts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <AlertCircle className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                  <p className="font-semibold text-slate-600">ไม่พบอะไหล่ที่ค้นหา</p>
                  <p className="text-[11px] mt-0.5">
                    ลองพิมพ์คำค้นอื่น หรือคลิกปุ่ม &quot;อะไหล่ทั้งหมด&quot; ด้านบน
                  </p>
                </div>
              ) : (
                displayedParts.map((part) => {
                  const isChecked = Boolean(selectedItems[part.id]);
                  const currentQty = selectedItems[part.id]?.quantity || 1;
                  const isOutOfStock = part.stockQuantity <= 0;

                  return (
                    <div
                      key={part.id}
                      className={`p-2.5 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isChecked
                          ? 'bg-blue-50/70 border border-blue-200/70'
                          : 'hover:bg-slate-50'
                      } ${isOutOfStock ? 'opacity-50' : ''}`}
                    >
                      {/* Checkbox & Item Info */}
                      <label
                        className={`flex items-start space-x-2.5 flex-1 min-w-0 ${
                          isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isOutOfStock}
                            onChange={() => onToggleItem(part)}
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                              isChecked
                                ? 'bg-blue-700 border-blue-700 text-white'
                                : 'border-slate-300 bg-white hover:border-blue-400'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {part.partCode}
                            </span>
                            <span className="text-xs font-medium text-slate-800">
                              {part.name}
                            </span>
                            {part.isCompatible && (
                              <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                <span>ตรงรุ่น</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-[10.5px] text-slate-500 mt-0.5">
                            <span
                              className={`font-semibold ${
                                isOutOfStock ? 'text-rose-600' : 'text-slate-600'
                              }`}
                            >
                              คงเหลือ: {part.stockQuantity} {part.unit}
                            </span>
                            <span>•</span>
                            <span className="truncate">{part.storageRoom}</span>
                          </div>

                          {part.matchReason && (
                            <p className="text-[10px] text-blue-700 font-medium mt-0.5">
                              {part.matchReason}
                            </p>
                          )}
                        </div>
                      </label>

                      {/* Quantity Stepper (Active when item is checked) */}
                      {isChecked && (
                        <div className="flex items-center space-x-1 self-end sm:self-center bg-white border border-blue-200 rounded-lg p-0.5 shrink-0 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onChangeQuantity(part.id, Math.max(1, currentQty - 1))}
                            disabled={currentQty <= 1}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={part.stockQuantity}
                            value={currentQty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) {
                                onChangeQuantity(
                                  part.id,
                                  Math.min(part.stockQuantity, Math.max(1, val))
                                );
                              }
                            }}
                            className="w-10 text-center font-bold text-xs text-blue-900 border-none outline-hidden p-0"
                          />
                          <span className="text-[10px] text-slate-400 pr-1">
                            {part.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onChangeQuantity(
                                part.id,
                                Math.min(part.stockQuantity, currentQty + 1)
                              )
                            }
                            disabled={currentQty >= part.stockQuantity}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Done Action */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600">
                เลือกแล้ว{' '}
                <strong className="text-blue-700 font-bold">{selectedCount}</strong> รายการ
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="py-1 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition cursor-pointer"
              >
                ยืนยันการเลือก
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Items summary breakdown box */}
      {selectedCount > 0 && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <PackageCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>รายการอะไหล่ที่จะขอเบิก ({selectedCount} ชนิด)</span>
            </span>
          </div>

          <div className="space-y-1.5">
            {Object.values(selectedItems).map((item) => (
              <div
                key={item.partId}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white border border-slate-200/70"
              >
                <div className="flex items-center space-x-2 truncate mr-2">
                  <span className="font-mono font-bold text-blue-700">{item.partCode}</span>
                  <span className="truncate text-slate-700">{item.partName}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-bold text-slate-900">
                    {item.quantity} {item.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const found = parts.find((p) => p.id === item.partId);
                      if (found) onToggleItem(found);
                    }}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
