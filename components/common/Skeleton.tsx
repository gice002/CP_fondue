'use client';

import React from 'react';

export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      {...props}
    />
  );
}

export function TicketCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
        <Skeleton className="h-5 w-28 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4 animate-pulse">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-7 w-14 rounded" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}
