'use client';

export type WebPermissionType = 'camera_photos' | 'location' | 'notifications';

const PERMISSION_STORAGE_PREFIX = 'cp_fondue_perm_';

export const PERMISSIONS_CHANGED_EVENT = 'cp_permissions_changed';

export const WebPermissionService = {
  isGranted(type: WebPermissionType): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(`${PERMISSION_STORAGE_PREFIX}${type}`) === 'granted';
    } catch {
      return false;
    }
  },

  grant(type: WebPermissionType): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(`${PERMISSION_STORAGE_PREFIX}${type}`, 'granted');
      window.dispatchEvent(new CustomEvent(PERMISSIONS_CHANGED_EVENT));
    } catch {
      // ignore
    }
  },

  revoke(type: WebPermissionType): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(`${PERMISSION_STORAGE_PREFIX}${type}`);
      window.dispatchEvent(new CustomEvent(PERMISSIONS_CHANGED_EVENT));
    } catch {
      // ignore
    }
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(`${PERMISSION_STORAGE_PREFIX}camera_photos`);
      sessionStorage.removeItem(`${PERMISSION_STORAGE_PREFIX}location`);
      sessionStorage.removeItem(`${PERMISSION_STORAGE_PREFIX}notifications`);
      window.dispatchEvent(new CustomEvent(PERMISSIONS_CHANGED_EVENT));
    } catch {
      // ignore
    }
  },
};

if (typeof window !== 'undefined') {
  (window as any).WebPermissionService = WebPermissionService;
}
