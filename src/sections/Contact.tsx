import { useEffect, useRef, useState } from 'react';
import { site } from '../content/site';
import { useGsap } from '../lib/hooks';
import { revealIn } from '../lib/anim';
import { usePrefs } from '../lib/prefs';
import { copyText } from '../lib/clipboard';
import { IconCopy } from '../components/Icons';

function useIstClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: site.timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const prefs = usePrefs();
  const time = useIstClock();
  useGsap(ref, (late) => revealIn(ref.current, late), [prefs.motion], { defer: true });

  return (
    <section className="section contact" id="contact" ref={ref} aria-labelledby="contact-title">
      <div className="wrap">
        <p className="eyebrow" data-reveal>
          07 — Contact
        </p>
        <h2 className="contact__title" id="contact-title" data-split data-vel>
          Got a hard problem? <span className="accent">Let’s talk.</span>
        </h2>
        <p className="lede" style={{ marginTop: 'var(--space-l)' }} data-reveal>
          {site.availability} Email is the fastest way to reach me.
        </p>
        <button type="button" className="contact__cta" onClick={() => void copyText(site.email, 'Email copied')} data-magnetic data-cursor="copy">
          <IconCopy />
          {site.email}
        </button>
        <div className="contact__row">
          <div className="contact__block" data-reveal>
            <h3>Elsewhere</h3>
            <ul role="list">
              <li>
                <a href={`mailto:${site.email}`}>Email ↗</a>
              </li>
              <li>
                <a href={site.github} target="_blank" rel="noopener noreferrer" data-cursor="open">
                  GitHub · {site.githubHandle} ↗
                </a>
              </li>
              <li>
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer" data-cursor="open">
                  LinkedIn ↗
                </a>
              </li>
            </ul>
          </div>
          <div className="contact__block" data-reveal>
            <h3>Local time · {site.locationShort}</h3>
            <p className="clock" aria-live="off">
              {time ?? '--:--:--'} <span className="muted mono">IST</span>
            </p>
            <p className="muted">UTC+5:30</p>
          </div>
          <div className="contact__block" data-reveal>
            <h3>Education</h3>
            <p>
              {site.education}
              <br />
              <span className="muted">
                {site.schoolGloss} · {site.years} · CGPA {site.cgpa}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
