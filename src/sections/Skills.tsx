import { useRef, useState } from 'react';
import { skillGroups, projectsForSkill, skillLabel } from '../content/skills';
import { projects } from '../content/projects';
import type { SkillId } from '../content/types';
import { Link } from '../lib/router';
import { useGsap } from '../lib/hooks';
import { revealIn } from '../lib/anim';
import { usePrefs } from '../lib/prefs';
import { sfx } from '../lib/audio';

const withSkills = projects.filter((p) => p.skills.length > 0);

export function Skills() {
  const ref = useRef<HTMLElement>(null);
  const prefs = usePrefs();
  const [active, setActive] = useState<SkillId | null>(null);
  useGsap(ref, (late) => revealIn(ref.current, late), [prefs.motion], { defer: true });

  const used = active ? new Set(projectsForSkill(active).map((p) => p.slug)) : null;
  const pick = (id: SkillId | null) => {
    if (id && id !== active) sfx('hover');
    setActive(id);
  };

  return (
    <section className="section" id="skills" ref={ref} aria-labelledby="skills-title">
      <div className="wrap">
        <div className="section__head section__head--split">
          <div style={{ display: 'grid', gap: 'var(--space-m)' }}>
            <p className="eyebrow" data-reveal>
              06 — Skills
            </p>
            <h2 className="h-section" id="skills-title" data-split data-vel>
              Python first. Then the rest.
            </h2>
          </div>
          <p className="lede" data-reveal>
            Grouped, not graded. Hover or focus a skill to see which projects use it.
          </p>
        </div>
        <div className="skills" data-hovering={active ? '1' : '0'}>
          <div className="skill-groups" onMouseLeave={() => pick(null)}>
            {skillGroups.map((g) => (
              <div className="skill-group" key={g.id} data-reveal>
                <h3>{g.label}</h3>
                <ul role="list">
                  {g.skills.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className={`skill${s.primary ? ' skill--primary' : ''}`}
                        data-active={active === s.id ? '1' : '0'}
                        aria-pressed={active === s.id}
                        aria-describedby="skill-panel-title"
                        onMouseEnter={() => pick(s.id)}
                        onFocus={() => pick(s.id)}
                        onClick={() => pick(active === s.id ? null : s.id)}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <aside className="skill-panel" aria-live="polite" data-reveal>
            <h3 id="skill-panel-title">{active ? skillLabel(active) : 'Projects'}</h3>
            <p className="skill-note">
              {active
                ? used && used.size > 0
                  ? `Used in ${used.size} project${used.size === 1 ? '' : 's'} on this site.`
                  : 'Not shown in a public project here yet.'
                : 'Pick a skill to light up the projects that use it.'}
            </p>
            <ul role="list">
              {withSkills.map((p) => (
                <li key={p.slug} data-on={used ? (used.has(p.slug) ? '1' : '0') : undefined}>
                  {p.caseStudy ? (
                    <Link to={`/work/${p.slug}/`}>{p.title}</Link>
                  ) : p.repo ? (
                    <a href={p.repo} target="_blank" rel="noopener noreferrer">
                      {p.title}
                    </a>
                  ) : (
                    <span>{p.title}</span>
                  )}
                  <span className="mono">{p.kicker.split(' · ')[0]}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
