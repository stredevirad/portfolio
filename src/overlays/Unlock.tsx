// Hidden unlock moment (see CLAUDE.md for the triggers). Lazy chunk; original art only (two SVG strokes).
// Never rendered in recruiter mode; the accent it unlocks lives in memory and resets on reload.
import { useEffect, useRef, useState } from 'react';
import { ensureGsap } from '../lib/gsap';
import { getPrefs, setPref } from '../lib/prefs';
import { sfx } from '../lib/audio';
import { showToast } from '../lib/ui';

// Lightly encoded so the word is not sitting in plain text in the bundle.
const decode = (codes: number[]) => String.fromCharCode(...codes.map((c) => c - 7));
const HANDLE = decode([82, 112, 121, 112, 123, 118]);

export default function Unlock({ run }: { run: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (getPrefs().recruiter) {
      setVisible(false);
      return;
    }
    setVisible(true);
    setPref('secret', true);
    const el = ref.current;
    if (!el) return;
    const { gsap } = ensureGsap();
    const reduced = getPrefs().motion === 'reduced';
    const slashes = el.querySelectorAll<SVGPathElement>('.slash');
    slashes.forEach((s) => {
      const len = s.getTotalLength();
      s.style.strokeDasharray = `${len}`;
      s.style.strokeDashoffset = `${len}`;
    });
    sfx('slash');
    const tl = gsap.timeline({ onComplete: () => setVisible(false) });
    if (reduced) {
      tl.set(slashes, { strokeDashoffset: 0 })
        .fromTo(el.querySelector('.unlock__card'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
        .add(() => sfx('chime'))
        .to(el, { autoAlpha: 0, duration: 0.3, delay: 2.2 });
    } else {
      tl.to(slashes[0]!, { strokeDashoffset: 0, duration: 0.22, ease: 'power4.in' })
        .to(el.querySelector('.unlock__flash'), { opacity: 0.35, duration: 0.05, yoyo: true, repeat: 1 }, '<0.18')
        .add(() => sfx('slash'))
        .to(slashes[1]!, { strokeDashoffset: 0, duration: 0.22, ease: 'power4.in' }, '+=0.05')
        .to(el.querySelector('.unlock__flash'), { opacity: 0.35, duration: 0.05, yoyo: true, repeat: 1 }, '<0.18')
        .fromTo(el.querySelector('.unlock__card'), { autoAlpha: 0, scale: 0.85, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)' })
        .add(() => sfx('chime'), '<')
        .to(slashes, { autoAlpha: 0, duration: 0.6 }, '+=0.6')
        .to(el, { autoAlpha: 0, duration: 0.5, delay: 1.4 });
    }
    showToast('Secret accent unlocked until you reload');
    return () => {
      tl.kill();
    };
  }, [run]);

  if (!visible) return null;
  return (
    <div className="unlock" ref={ref} role="status" aria-live="assertive">
      <div className="unlock__flash" />
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="blade-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="0.5" stopColor="var(--accent)" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
          <linearGradient id="blade-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <path className="slash" d="M-40 140 L1040 860" stroke="url(#blade-a)" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path className="slash" d="M1040 140 L-40 860" stroke="url(#blade-b)" strokeWidth="7" strokeLinecap="round" fill="none" />
      </svg>
      <div className="unlock__card">
        <p>Player unlocked</p>
        <p>
          Player: {HANDLE}, a.k.a. Joshua
        </p>
      </div>
    </div>
  );
}
