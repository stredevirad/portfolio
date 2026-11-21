// Small shell pieces: skip link, toast, footer, grain, curtain, SVG filter defs.
import { site } from '../content/site';
import { useToast } from '../lib/ui';
import { scrollTo } from '../lib/smooth';
import { IconArrow } from './Icons';

export function SkipLink() {
  return (
    <a className="skip-link" href="#main">
      Skip to content
    </a>
  );
}

export function Toast() {
  const t = useToast();
  return (
    <div aria-live="polite" role="status">
      {t && (
        <div className="toast" key={t.id}>
          {t.text}
        </div>
      )}
    </div>
  );
}

export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}

export function Curtain() {
  return (
    <div className="curtain" aria-hidden="true">
      <span className="curtain__label" />
    </div>
  );
}

/** Shared SVG filter for the hover distortion on work-card images (animated from WorkReel). */
export function FilterDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="distort" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__row">
          <p>
            © 2026 {site.name}. Designed and directed by Joshua; built with Claude Code.
          </p>
          <button type="button" className="link" onClick={() => scrollTo(0)}>
            Back to top <IconArrow style={{ display: 'inline', width: '1em', transform: 'rotate(-90deg)', verticalAlign: '-0.15em' }} />
          </button>
        </div>
        <div className="footer__row">
          <p>
            Press <kbd>Ctrl</kbd> + <kbd>K</kbd> for commands, or <kbd>`</kbd> for a terminal.
          </p>
          <p>
            Facts last checked against the repos on {site.lastVerified}. Fonts: Bricolage Grotesque, Instrument Sans, JetBrains Mono (SIL OFL). Sounds are synthesised in the browser — no samples.
          </p>
        </div>
      </div>
    </footer>
  );
}
