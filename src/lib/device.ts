// Device capability checks (client only).
type Nav = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

export function hasFinePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Heuristic for devices that should get the static hero instead of WebGL. */
export function isLowEnd(): boolean {
  const n = navigator as Nav;
  if (n.connection?.saveData) return true;
  if (n.connection?.effectiveType && /2g/.test(n.connection.effectiveType)) return true;
  if (typeof n.hardwareConcurrency === 'number' && n.hardwareConcurrency < 4) return true;
  if (typeof n.deviceMemory === 'number' && n.deviceMemory < 4) return true;
  return false;
}

/** Counts frames for `ms` and returns frames per second. */
export function fpsProbe(ms = 500): Promise<number> {
  return new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();
    const tick = (t: number) => {
      frames += 1;
      if (t - start >= ms) resolve((frames * 1000) / (t - start));
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export function whenIdle(fn: () => void, timeout = 2000): () => void {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}
