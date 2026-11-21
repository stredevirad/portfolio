// Theme / Motion / Sound / Recruiter toggles. Each persists in localStorage (see lib/prefs.ts).
import type { MouseEvent } from 'react';
import { setPref, usePrefs, getPrefs } from '../lib/prefs';
import type { Theme } from '../lib/prefs';
import { sfx, setHum } from '../lib/audio';
import { IconMoon, IconMotion, IconSoundOff, IconSoundOn, IconStill, IconSun } from './Icons';
import { scrollTo } from '../lib/smooth';

type VT = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

/** Switches theme with a circular reveal from (x, y) via the View Transitions API; plain cross-fade otherwise. */
export function switchTheme(next: Theme, x?: number, y?: number): void {
  const doc = document as VT;
  const reduced = getPrefs().motion === 'reduced';
  if (!doc.startViewTransition || reduced) {
    setPref('theme', next);
    return;
  }
  const cx = x ?? window.innerWidth - 40;
  const cy = y ?? 40;
  const r = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));
  const t = doc.startViewTransition(() => setPref('theme', next));
  t.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${r}px at ${cx}px ${cy}px)`] },
        { duration: 750, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => {
      /* transition skipped */
    });
}

export function setSound(on: boolean): void {
  setPref('sound', on);
  setHum(on);
  if (on) sfx('toggle');
}

export function setRecruiter(on: boolean): void {
  setPref('recruiter', on);
  scrollTo(0, { immediate: true });
}

function center(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function Toggles({ variant = 'bar' }: { variant?: 'bar' | 'menu' }) {
  const p = usePrefs();
  const themeBtn = (
    <button
      type="button"
      className="icon-btn"
      aria-label={p.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title="Theme"
      data-magnetic
      onClick={(e) => {
        const c = center(e);
        switchTheme(p.theme === 'dark' ? 'light' : 'dark', c.x, c.y);
        sfx('toggle');
      }}
    >
      {p.theme === 'dark' ? <IconSun /> : <IconMoon />}
    </button>
  );
  const motionBtn = (
    <button
      type="button"
      className="icon-btn"
      aria-pressed={p.motion === 'reduced'}
      aria-label="Reduce motion"
      title={p.motion === 'reduced' ? 'Motion: reduced' : 'Motion: full'}
      data-magnetic
      onClick={() => {
        setPref('motion', p.motion === 'full' ? 'reduced' : 'full');
        sfx('toggle');
      }}
    >
      {p.motion === 'reduced' ? <IconStill /> : <IconMotion />}
    </button>
  );
  const soundBtn = (
    <button
      type="button"
      className="icon-btn"
      aria-pressed={p.sound}
      aria-label="Sound"
      title={p.sound ? 'Sound: on' : 'Sound: off'}
      data-magnetic
      onClick={() => setSound(!p.sound)}
    >
      {p.sound ? <IconSoundOn /> : <IconSoundOff />}
    </button>
  );
  const recruiterBtn = (
    <button type="button" className="recruiter-btn" aria-pressed={p.recruiter} onClick={() => setRecruiter(!p.recruiter)} data-magnetic>
      <span className="switch" aria-hidden="true" />
      Recruiter mode
    </button>
  );

  if (variant === 'menu') {
    return (
      <div className="mobile-menu__tools">
        <div className="toggle-row">
          <span>Recruiter mode — plain, fast, printable</span>
          {recruiterBtn}
        </div>
        <div className="toggle-row">
          <span>Theme: {p.theme}</span>
          {themeBtn}
        </div>
        <div className="toggle-row">
          <span>Motion: {p.motion}</span>
          {motionBtn}
        </div>
        <div className="toggle-row">
          <span>Sound: {p.sound ? 'on' : 'off'}</span>
          {soundBtn}
        </div>
      </div>
    );
  }
  return (
    <div className="toggles" role="group" aria-label="Display preferences">
      {recruiterBtn}
      {themeBtn}
      {motionBtn}
      {soundBtn}
    </div>
  );
}
