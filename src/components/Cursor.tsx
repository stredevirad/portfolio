// Custom cursor (ring + dot) with contextual labels, magnetic targets and card tilt.
// Fine pointers only, full motion only, never in recruiter mode.
import { useEffect, useRef, useState } from 'react';
import { coreGsap } from '../lib/gsap';
import { hasFinePointer } from '../lib/device';
import { motionAllowed, usePrefs } from '../lib/prefs';

const LABELS: Record<string, string> = { view: 'View', drag: 'Drag', open: 'Open', copy: 'Copy', home: 'Home' };

export function Cursor() {
  const prefs = usePrefs();
  const [on, setOn] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setOn(hasFinePointer() && motionAllowed(prefs));
  }, [prefs]);

  useEffect(() => {
    if (!on || !ring.current || !dot.current || !root.current) return;
    const gsap = coreGsap();
    const html = document.documentElement;
    html.classList.add('cursor-on');
    const el = root.current;
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3.out' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3.out' });
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'none' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'none' });
    let magnet: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;
    el.dataset.state = 'hidden';

    const release = (m: HTMLElement | null) => {
      if (m) gsap.to(m, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    };
    const untilt = (t: HTMLElement | null) => {
      if (t) gsap.to(t, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
      const target = e.target instanceof Element ? e.target : null;
      // Context label
      const ctx = target?.closest<HTMLElement>('[data-cursor]');
      const key = ctx?.dataset.cursor;
      if (key && LABELS[key]) {
        el.dataset.state = 'label';
        if (label.current) label.current.textContent = LABELS[key] ?? '';
      } else if (target?.closest('a, button, [role="button"], input, label')) {
        el.dataset.state = 'link';
      } else {
        el.dataset.state = 'default';
      }
      // Magnetic
      const m = target?.closest<HTMLElement>('[data-magnetic]') ?? null;
      if (m !== magnet) {
        release(magnet);
        magnet = m;
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const mx = (e.clientX - (r.left + r.width / 2)) * 0.3;
        const my = (e.clientY - (r.top + r.height / 2)) * 0.35;
        gsap.to(magnet, { x: mx, y: my, duration: 0.4, ease: 'power3.out' });
      }
      // Tilt
      const t = target?.closest<HTMLElement>('[data-tilt]') ?? null;
      if (t !== tilt) {
        untilt(tilt);
        tilt = t;
      }
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(tilt, { rotateY: px * 5, rotateX: -py * 5, duration: 0.6, ease: 'power3.out', transformPerspective: 1200 });
      }
    };
    const onLeave = () => {
      el.dataset.state = 'hidden';
      release(magnet);
      untilt(tilt);
      magnet = null;
      tilt = null;
    };
    const onDown = () => (el.dataset.down = '1');
    const onUp = () => (el.dataset.down = '0');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      html.classList.remove('cursor-on');
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      release(magnet);
      untilt(tilt);
    };
  }, [on]);

  if (!on) return null;
  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <div className="cursor__ring" ref={ring}>
        <span className="cursor__label" ref={label} />
      </div>
      <div className="cursor__dot" ref={dot} />
    </div>
  );
}
