// UI overlay state (command palette, terminal, unlock) and toasts.
import { useSyncExternalStore } from 'react';
import { createStore } from './store';

export type Overlay = 'none' | 'palette' | 'terminal';
const overlay = createStore<Overlay>('none');
export const openOverlay = (o: Overlay) => overlay.set(o);
export const closeOverlay = () => overlay.set('none');
export const useOverlay = () => useSyncExternalStore(overlay.subscribe, overlay.get, () => 'none' as Overlay);
export const getOverlay = overlay.get;

const unlock = createStore<number>(0);
export const triggerUnlock = () => unlock.set((n) => n + 1);
export const useUnlock = () => useSyncExternalStore(unlock.subscribe, unlock.get, () => 0);

export interface ToastMsg { id: number; text: string }
const toast = createStore<ToastMsg | null>(null);
let toastId = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
export function showToast(text: string) {
  toastId += 1;
  toast.set({ id: toastId, text });
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => toast.set(null), 2600);
}
export const useToast = () => useSyncExternalStore(toast.subscribe, toast.get, () => null);
