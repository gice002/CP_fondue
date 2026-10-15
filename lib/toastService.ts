'use client';

export interface ToastPayload {
  id?: string;
  title: string;
  message?: string;
  ticketNumber?: string;
  location?: string;
  actionLabel?: string;
  actionTab?: string;
  actionHref?: string;
  durationMs?: number;
}

export const ToastService = {
  show(payload: ToastPayload) {
    if (typeof window === 'undefined') return;
    const detail: ToastPayload = {
      id: payload.id || `toast_${Date.now()}`,
      durationMs: payload.durationMs || 5000,
      ...payload,
    };
    window.dispatchEvent(new CustomEvent('cp_inapp_toast', { detail }));
  },
};

if (typeof window !== 'undefined') {
  (window as any).ToastService = ToastService;
}
