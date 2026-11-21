import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { nav, site } from '../content/site';
import { Link, useRouter } from '../lib/router';
import { withBase } from '../lib/base';
import { scramble } from '../lib/scramble';
import { scrollTo, lockScroll } from '../lib/smooth';
import { motionAllowed, usePrefs } from '../lib/prefs';
import { openOverlay } from '../lib/ui';
import { sfx } from '../lib/audio';
import { Toggles } from './Toggles';
import { IconDownload } from './Icons';

/** Navigates to a home-page section: scrolls when already home, otherwise routes home then scrolls. */
export function useSectionNav() {
  const { route, navigate } = useRouter();
  return (id: string, e?: MouseEvent) => {
    e?.preventDefault();
    if (route.name === 'home') {
      try {
        window.history.replaceState(window.history.state, '', withBase(`/#${id}`));
      } catch {
        /* ignore */
      }
      scrollTo(id);
    } else {
      navigate(`/#${id}`);
    }
  };
}

export function Header() {
  const prefs = usePrefs();
  const { route } = useRouter();
  const go = useSectionNav();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [mod, setMod] = useState('Ctrl');
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setMod(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl');
  }, []);

  // Scrolled background + hide on scroll down, show on scroll up.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        el.dataset.scrolled = y > 24 ? '1' : '0';
        const hide = motionAllowed() && y > 400 && y > last + 4 && !open;
        if (hide) el.dataset.hidden = '1';
        else if (y < last - 4 || y < 400) el.dataset.hidden = '0';
        last = y;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  // Active section (home only).
  useEffect(() => {
    if (route.name !== 'home' || prefs.recruiter) {
      setActive(null);
      return;
    }
    const sections = nav.map((n) => document.getElementById(n.id)).filter((s): s is HTMLElement => !!s);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(en.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [route.name, prefs.recruiter]);

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="header" ref={ref}>
      <div className="header__inner wrap">
        <Link to="/" className="logo" aria-label={`JHJ — ${site.name}, home`} data-cursor="home">
          JHJ<span className="logo__dot" aria-hidden="true" />
        </Link>
        <nav className="nav" aria-label="Sections">
          <ul role="list">
            {nav.map((n) => (
              <li key={n.id}>
                <a
                  href={withBase(`/#${n.id}`)}
                  aria-current={active === n.id ? 'true' : undefined}
                  onClick={(e) => {
                    sfx('tick');
                    go(n.id, e);
                  }}
                  onMouseEnter={(e) => {
                    sfx('hover');
                    const s = e.currentTarget.querySelector('span');
                    if (s && motionAllowed()) scramble(s);
                  }}
                >
                  <span>{n.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header__tools">
          <Toggles />
          <button type="button" className="kbd-btn" onClick={() => openOverlay('palette')} aria-label={`${mod} K: open command palette`}>
            {mod} K
          </button>
          <a className="btn btn--small btn--primary resume-btn" href={withBase(site.resumePdf)} download data-magnetic>
            <IconDownload /> Resume
          </a>
          <button type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
            <span className="menu-btn__bars" aria-hidden="true">
              <span />
              <span />
            </span>
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label="Sections (menu)">
          <ul role="list">
            {nav.map((n, i) => (
              <li key={n.id}>
                <a
                  href={withBase(`/#${n.id}`)}
                  onClick={(e) => {
                    setOpen(false);
                    go(n.id, e);
                  }}
                >
                  <span className="mobile-menu__index">0{i + 1}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Toggles variant="menu" />
        <a className="btn btn--primary" href={withBase(site.resumePdf)} download>
          <IconDownload /> Download resume (PDF)
        </a>
      </div>
    </header>
  );
}
