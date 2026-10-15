'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Wrench, Sparkles, Database, Laptop, Radio } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export function LoadingScreen({
  message = 'กำลังโหลดข้อมูลระบบ CP FONDUE...',
  submessage = 'วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น • ระบบคัดกรองและส่งต่องานซ่อม',
}: LoadingScreenProps) {
  return (
    <div className="min-h-[450px] w-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background soft ambient blobs */}
      <div className="absolute w-72 h-72 rounded-full bg-blue-400/10 blur-3xl -top-12 -left-12 pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl -bottom-12 -right-12 pointer-events-none animate-pulse" />

      {/* Main Animated Icon Emblem */}
      <div className="relative mb-6">
        {/* Outer rotating gradient ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[3px] shadow-lg shadow-blue-500/25"
        >
          <div className="w-full h-full bg-white rounded-[22px]" />
        </motion.div>

        {/* Center glowing logo */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute inset-0 m-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-600/30"
        >
          <Wrench className="w-8 h-8 text-white drop-shadow-sm" />
        </motion.div>

        {/* Orbiting sparkles badge */}
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-md border-2 border-white"
        >
          <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
        </motion.div>
      </div>

      {/* Title & Brand */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center max-w-md space-y-2 z-10"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          <span>CP FONDUE REALTIME</span>
        </div>

        <h3 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
          {message}
        </h3>

        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          {submessage}
        </p>

        {/* Smooth Animated Progress Bar */}
        <div className="w-48 sm:w-64 h-1.5 bg-slate-200/80 rounded-full mx-auto mt-4 overflow-hidden relative">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="w-1/2 h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full"
          />
        </div>

        {/* Feature badges indicator */}
        <div className="pt-4 flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            เชื่อมต่อข้อมูลสด
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-blue-500" />
            PostgreSQL DB
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Laptop className="w-3 h-3 text-indigo-500" />
            SC-09 KKU
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export function DispatchWorkspaceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-7 w-12 bg-slate-300 rounded-lg" />
              <div className="h-2.5 w-16 bg-slate-100 rounded" />
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Main 2-column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Ticket Cards list */}
        <div className="lg:col-span-5 space-y-3">
          <div className="h-10 bg-white rounded-xl border border-slate-200" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-5 w-16 bg-slate-200 rounded-full" />
              </div>
              <div className="h-3.5 w-3/4 bg-slate-300 rounded" />
              <div className="h-3 w-1/2 bg-slate-100 rounded" />
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-14 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Right column: Unified detail workspace */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex justify-between">
            <div className="h-6 w-48 bg-slate-300 rounded-lg" />
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl">
            <div className="h-4 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded" />
          </div>
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-32 bg-slate-200 rounded-xl" />
            <div className="h-32 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-36 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
