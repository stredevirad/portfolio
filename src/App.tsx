import { Suspense, lazy, useEffect, useRef } from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { motionAllowed, setPref, usePrefs } from './lib/prefs';
import { readLocal } from './lib/storage';
import { ensureGsap } from './lib/gsap';
import { hasFinePointer } from './lib/device';
import { scrollTo, startSmooth, stopSmooth } from './lib/smooth';
import { closeOverlay, getOverlay, openOverlay, triggerUnlock, useOverlay, useUnlock } from './lib/ui';
import { listenSequence } from './lib/keys';
import { setHum } from './lib/audio';
import { applyMeta } from './seo';
import { Header } from './components/Header';
import { Cursor } from './components/Cursor';
import { Preloader } from './components/Preloader';
import { Curtain, Footer, Grain, SkipLink, Toast } from './components/Chrome';
import { Home } from './pages/Home';
import { CaseStudy } from './pages/CaseStudy';
import { Resume } from './pages/Resume';
import { NotFound } from './pages/NotFound';

const CommandPalette = lazy(() => import('./overlays/CommandPalette'));
const Terminal = lazy(() => import('./overlays/Terminal'));
const Unlock = lazy(() => import('./overlays/Unlock'));

function isTyping(t: EventTarget | null) {
  return t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
}

function Overlays() {
  const overlay = useOverlay();
  const unlock = useUnlock();
  return (
    <Suspense fallback={null}>
      {overlay === 'palette' && <CommandPalette />}
      {overlay === 'terminal' && <Terminal />}
      {unlock > 0 && <Unlock run={unlock} />}
    </Suspense>
  );
}

function Shell() {
  const prefs = usePrefs();
  const { route, path, kind, seq } = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const motionOk = motionAllowed(prefs);

  // Smooth scroll: fine pointers + full motion + not recruiter mode.
  useEffect(() => {
    if (motionOk && hasFinePointer()) startSmooth();
    else stopSmooth();
    return () => stopSmooth();
  }, [motionOk]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (getOverlay() === 'palette') closeOverlay();
        else openOverlay('palette');
        return;
      }
      if (e.key === 'Escape' && getOverlay() !== 'none') {
        closeOverlay();
        return;
      }
      if (e.key === '`' && !isTyping(e.target) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openOverlay(getOverlay() === 'terminal' ? 'none' : 'terminal');
      }
    };
    window.addEventListener('keydown', onKey);
    const stopSeq = listenSequence(() => {
      if (!document.documentElement.hasAttribute('data-recruiter')) triggerUnlock();
    });
    return () => {
      window.removeEventListener('keydown', onKey);
      stopSeq();
    };
  }, []);

  // Route changes: scroll position, focus, meta, ScrollTrigger refresh.
  const firstRun = useRef(true);
  useEffect(() => {
    const { ScrollTrigger } = ensureGsap();
    const hash = window.location.hash.slice(1);
    if (firstRun.current) {
      firstRun.current = false;
      const refresh = () => {
        ScrollTrigger.refresh();
        if (hash) scrollTo(hash, { immediate: true });
      };
      void (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(refresh));
      window.addEventListener('load', refresh, { once: true });
      return;
    }
    applyMeta(path);
    const state = window.history.state as { scrollY?: number } | null;
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (kind === 'pop' && typeof state?.scrollY === 'number') scrollTo(state.scrollY, { immediate: true });
      else if (hash) scrollTo(hash, { immediate: true });
      else scrollTo(0, { immediate: true });
      if (kind === 'push') mainRef.current?.focus({ preventScroll: true });
    });
  }, [seq, path, kind]);

  // Scroll velocity → variable-font weight on display headings and a slight skew on cards.
  useEffect(() => {
    if (!motionOk) return;
    const { gsap, ScrollTrigger } = ensureGsap();
    let v = 0;
    let cur = 0;
    let applied = 0;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        v = gsap.utils.clamp(-1, 1, self.getVelocity() / 2600);
      },
    });
    const tick = () => {
      cur += (v - cur) * 0.14;
      v *= 0.9;
      if (Math.abs(cur) < 0.002) cur = 0;
      if (cur === applied) return;
      applied = cur;
      const w = String(Math.round(-Math.abs(cur) * 360));
      document.querySelectorAll<HTMLElement>('[data-vel]').forEach((el) => el.style.setProperty('--vel-wght', w));
      document.querySelectorAll<HTMLElement>('[data-skew]').forEach((el) => {
        el.style.transform = cur ? `skewY(${(cur * 2.4).toFixed(3)}deg)` : '';
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      document.querySelectorAll<HTMLElement>('[data-vel]').forEach((el) => el.style.removeProperty('--vel-wght'));
      document.querySelectorAll<HTMLElement>('[data-skew]').forEach((el) => (el.style.transform = ''));
    };
  }, [motionOk, seq]);

  // Ambient hum resumes on the first gesture when sound was left on (browsers block audio before a gesture).
  useEffect(() => {
    if (!prefs.sound) return;
    const start = () => setHum(true);
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, [prefs.sound]);

  // Follow the OS reduced-motion setting unless the visitor chose explicitly.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      if (readLocal('motion') === null) setPref('motion', mq.matches ? 'reduced' : 'full');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const recruiterHome = prefs.recruiter && route.name === 'home';
  let page;
  if (route.name === 'home') page = recruiterHome ? <Resume mode="recruiter" /> : <Home />;
  else if (route.name === 'work') page = <CaseStudy key={route.slug} slug={route.slug} />;
  else if (route.name === 'resume') page = <Resume mode="page" />;
  else page = <NotFound />;

  return (
    <>
      <SkipLink />
      {route.name === 'home' && <Preloader />}
      <Cursor />
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1}>
        {page}
      </main>
      <Footer />
      <Toast />
      <Curtain />
      <Grain />
      <Overlays />
    </>
  );
}

export function App({ initialPath }: { initialPath: string }) {
  return (
    <RouterProvider initialPath={initialPath}>
      <Shell />
    </RouterProvider>
  );
}
