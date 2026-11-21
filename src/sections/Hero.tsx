import { useEffect, useMemo, useRef, useState } from 'react';
import { site } from '../content/site';
import { evidenceGraph, rng } from '../webgl/layout';
import { motionAllowed, usePrefs } from '../lib/prefs';
import { fpsProbe, hasFinePointer, isLowEnd, webglAvailable, whenIdle } from '../lib/device';
import { ensureGsap } from '../lib/gsap';
import { withBase } from '../lib/base';
import { copyText } from '../lib/clipboard';
import { IconArrowUpRight, IconCopy, IconDownload } from '../components/Icons';

/** Static, art-directed fallback: noise on the left converging into the evidence graph on the right. */
function HeroFallback() {
  const { dots, edges, nodes } = useMemo(() => {
    const g = evidenceGraph(7);
    const rand = rng(31);
    const W = 1600;
    const H = 1000;
    const X = (x: number) => Math.round((0.4 + 0.56 * x) * W);
    const Y = (y: number) => Math.round((0.12 + 0.7 * y) * H);
    const dots = Array.from({ length: 140 }, () => {
      const x = rand();
      return { x: Math.round(x * W * 0.9), y: Math.round(rand() * H), r: Math.round((0.8 + rand() * 1.8) * 10) / 10, o: Math.round((0.12 + (1 - x) * 0.3) * 100) / 100 };
    });
    return {
      dots,
      edges: g.edges.map(([a, b]) => ({ x1: X(g.nodes[a]!.x), y1: Y(g.nodes[a]!.y), x2: X(g.nodes[b]!.x), y2: Y(g.nodes[b]!.y) })),
      nodes: g.nodes.map((n) => ({ x: X(n.x), y: Y(n.y), r: Math.round(n.r * 6), hot: !!n.hot })),
    };
  }, []);
  return (
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">
      <g fill="var(--fg-faint)">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
        ))}
      </g>
      <g stroke="var(--fg-muted)" strokeOpacity="0.35" strokeWidth="1.2">
        {edges.map((e, i) => (
          <line key={i} {...e} />
        ))}
      </g>
      {nodes.map((n, i) =>
        n.hot ? (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.r * 3} fill="none" stroke="var(--accent)" strokeOpacity="0.5" />
            <circle cx={n.x} cy={n.y} r={n.r} fill="var(--accent)" />
          </g>
        ) : (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="var(--fg)" opacity="0.85" />
        ),
      )}
    </svg>
  );
}

export function Hero() {
  const prefs = usePrefs();
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [webgl, setWebgl] = useState(false);

  // WebGL gate: motion on, WebGL available, not low-end, FPS probe passes. On touch devices it waits for the
  // first interaction, so it never competes with first paint.
  useEffect(() => {
    if (!motionAllowed(prefs) || !webglAvailable() || isLowEnd()) return;
    let disposed = false;
    let handle: { dispose(): void } | null = null;
    let cancel: (() => void) | undefined;
    const start = async () => {
      const fps = await fpsProbe(500);
      if (disposed || fps < 40) return;
      const mod = await import('../webgl/hero');
      if (disposed || !canvas.current || !section.current) return;
      try {
        handle = mod.mountHero(canvas.current, section.current);
        setWebgl(true);
      } catch {
        setWebgl(false);
      }
    };
    if (hasFinePointer()) {
      cancel = whenIdle(() => void start(), 2500);
    } else {
      const evs = ['touchstart', 'scroll', 'pointerdown', 'keydown'] as const;
      const kick = () => {
        evs.forEach((ev) => window.removeEventListener(ev, kick));
        void start();
      };
      evs.forEach((ev) => window.addEventListener(ev, kick, { passive: true }));
      cancel = () => evs.forEach((ev) => window.removeEventListener(ev, kick));
    }
    return () => {
      disposed = true;
      cancel?.();
      handle?.dispose();
      setWebgl(false);
    };
  }, [prefs.motion, prefs.recruiter]);

  // Intro: only after the first-visit preloader (content is visible immediately on later visits).
  useEffect(() => {
    const html = document.documentElement;
    if (!html.hasAttribute('data-preload') || !section.current) return;
    const { gsap } = ensureGsap();
    const items = section.current.querySelectorAll('[data-intro]');
    gsap.set(items, { autoAlpha: 0, y: 28 });
    const go = () => gsap.to(items, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.07, delay: 0.25 });
    window.addEventListener('jhj:preloaded', go, { once: true });
    const failsafe = window.setTimeout(go, 3600);
    return () => {
      window.removeEventListener('jhj:preloaded', go);
      window.clearTimeout(failsafe);
    };
  }, []);

  // Variable-font weight follows the pointer across the name.
  useEffect(() => {
    const el = nameRef.current;
    if (!el || !motionAllowed(prefs) || !hasFinePointer()) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>('.char'));
    let raf = 0;
    let px = -9999;
    let py = -9999;
    const apply = () => {
      raf = 0;
      chars.forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        const k = Math.max(0, 1 - d / 260);
        c.style.fontWeight = k > 0.01 ? String(Math.round(760 - k * 520)) : '';
      });
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      px = py = -9999;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
      chars.forEach((c) => (c.style.fontWeight = ''));
    };
  }, [prefs]);

  return (
    <section className="hero" id="top" ref={section} aria-labelledby="hero-name">
      <div className="hero__art" data-webgl={webgl ? '1' : '0'} aria-hidden="true">
        <HeroFallback />
        <canvas ref={canvas} />
      </div>
      <div className="hero__inner wrap">
        <p className="hero__meta" data-intro>
          <span>{site.role}</span>
          <span>B.Tech AI &amp; Data Science, {site.schoolShort} ({site.years})</span>
          <span>{site.locationShort}, India</span>
        </p>
        <h1 className="hero__name" id="hero-name" ref={nameRef} aria-label={site.name}>
          {site.nameLines.map((line, i) => (
            <span className="hero__line" key={line} aria-hidden="true">
              {line.split('').map((ch, j) => (
                <span className="char" key={j}>
                  {ch}
                </span>
              ))}
              {i < site.nameLines.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>
        <div className="hero__bottom">
          <div data-intro>
            <p className="hero__lead">
              {site.heroLead} <em>{site.heroEmphasis}</em>
            </p>
          </div>
          <div style={{ display: 'grid', gap: 'var(--space-s)' }}>
            <p className="hero__gloss" data-intro>
              {site.heroGloss}
            </p>
            <p className="hero__avail" data-intro>
              <span className="pulse" aria-hidden="true" />
              {site.availability}
            </p>
            <div className="hero__ctas" data-intro>
              <a className="btn btn--primary" href={withBase(site.resumePdf)} download data-magnetic>
                <IconDownload /> Resume (PDF)
              </a>
              <a className="btn" href={site.github} target="_blank" rel="noopener noreferrer" data-magnetic data-cursor="open">
                GitHub <IconArrowUpRight />
              </a>
              <button type="button" className="btn" onClick={() => void copyText(site.email, 'Email copied')} data-magnetic data-cursor="copy">
                <IconCopy /> {site.email}
              </button>
            </div>
          </div>
          <p className="hero__scroll mono" aria-hidden="true">
            <i /> Scroll for evidence
          </p>
        </div>
      </div>
    </section>
  );
}
