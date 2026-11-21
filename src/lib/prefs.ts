// User preferences: theme, motion, sound, recruiter mode. Persisted in localStorage (try/catch).
// The inline <head> script applies theme/motion/recruiter to <html> before first paint;
// this store mirrors that state after hydration (server snapshot = defaults, so hydration never mismatches).
import { useSyncExternalStore } from 'react';
import { createStore } from './store';
import { readLocal, writeLocal } from './storage';

export type Theme = 'dark' | 'light';
export type Motion = 'full' | 'reduced';

export interface Prefs {
  theme: Theme;
  motion: Motion;
  sound: boolean;
  recruiter: boolean;
  /** Secret accent theme — in memory only, resets on reload. */
  secret: boolean;
}

export const DEFAULT_PREFS: Prefs = { theme: 'dark', motion: 'full', sound: false, recruiter: false, secret: false };

const store = createStore<Prefs>(DEFAULT_PREFS);
let initialised = false;

function readInitial(): Prefs {
  const d = document.documentElement;
  const theme: Theme = d.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const motion: Motion = d.getAttribute('data-motion') === 'reduced' ? 'reduced' : 'full';
  const recruiter = d.getAttribute('data-recruiter') === '1';
  const sound = readLocal('sound') === 'on';
  return { theme, motion, sound, recruiter, secret: false };
}

export function initPrefs(): void {
  if (initialised || typeof document === 'undefined') return;
  initialised = true;
  store.set(readInitial());
}

function apply(p: Prefs) {
  const d = document.documentElement;
  d.setAttribute('data-theme', p.theme);
  d.setAttribute('data-motion', p.motion);
  if (p.recruiter) d.setAttribute('data-recruiter', '1');
  else d.removeAttribute('data-recruiter');
  if (p.secret && !p.recruiter) d.setAttribute('data-secret', '1');
  else d.removeAttribute('data-secret');
  const meta = document.querySelectorAll('meta[name="theme-color"]');
  meta.forEach((m) => m.setAttribute('content', p.theme === 'dark' ? '#0b0c0e' : '#efebe3'));
}

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]): void {
  store.set((prev) => ({ ...prev, [key]: value }));
  const p = store.get();
  apply(p);
  if (key === 'theme') writeLocal('theme', String(value));
  if (key === 'motion') writeLocal('motion', String(value));
  if (key === 'sound') writeLocal('sound', value ? 'on' : 'off');
  if (key === 'recruiter') writeLocal('recruiter', value ? '1' : null);
}

export function getPrefs(): Prefs {
  return store.get();
}

export const subscribePrefs = store.subscribe;

export function usePrefs(): Prefs {
  return useSyncExternalStore(store.subscribe, store.get, () => DEFAULT_PREFS);
}

/** True when heavy motion (smooth scroll, pinning, WebGL, cursor) may run. */
export function motionAllowed(p: Prefs = store.get()): boolean {
  return p.motion === 'full' && !p.recruiter;
}
