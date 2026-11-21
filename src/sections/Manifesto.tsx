import { useRef } from 'react';
import { principles, site } from '../content/site';
import { useGsap } from '../lib/hooks';
import { revealIn } from '../lib/anim';
import { usePrefs } from '../lib/prefs';

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const prefs = usePrefs();
  useGsap(ref, (late) => revealIn(ref.current, late), [prefs.motion], { defer: true });
  return (
    <section className="section manifesto" id="about" ref={ref} aria-labelledby="about-title">
      <div className="wrap manifesto__grid">
        <p className="eyebrow" data-reveal>
          01 — Approach
        </p>
        <h2 className="manifesto__statement" id="about-title" data-split data-vel>
          Evidence <span className="accent">over</span> guesses.
        </h2>
        <div className="manifesto__side">
          <p className="lede" data-reveal>
            {site.intro}
          </p>
        </div>
        <ol className="principles" role="list">
          {principles.map((p) => (
            <li className="principle" key={p.n} data-reveal>
              <span className="principle__n">{p.n}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
        <aside className="howiwork" data-reveal aria-labelledby="how-title">
            <h3 id="how-title">How I work</h3>
            <p>{site.howIWork}</p>
          </aside>
      </div>
    </section>
  );
}
