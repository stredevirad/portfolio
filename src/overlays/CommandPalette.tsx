// Ctrl/⌘+K command palette. Lazy-loaded on first open.
import { useEffect, useMemo, useRef, useState } from 'react';
import { nav, site } from '../content/site';
import { caseStudies } from '../content/projects';
import { useRouter } from '../lib/router';
import { closeOverlay, openOverlay } from '../lib/ui';
import { getPrefs, setPref } from '../lib/prefs';
import { copyText } from '../lib/clipboard';
import { withBase } from '../lib/base';
import { sfx } from '../lib/audio';
import { scrollTo } from '../lib/smooth';
import { setRecruiter, setSound, switchTheme } from '../components/Toggles';

interface Cmd {
  id: string;
  group: 'Go to' | 'Case studies' | 'Preferences' | 'Actions' | 'On record';
  /** Only listed when the query matches (claims search). */
  searchOnly?: boolean;
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
}

export default function CommandPalette() {
  const { route, navigate } = useRouter();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<Element | null>(null);

  const commands = useMemo<Cmd[]>(() => {
    const p = getPrefs();
    const goSection = (id: string) => () => {
      if (route.name === 'home' && !p.recruiter) scrollTo(id);
      else {
        if (p.recruiter) setRecruiter(false);
        navigate(`/#${id}`);
      }
    };
    return [
      { id: 'top', group: 'Go to', label: 'Top', keywords: 'home hero start', run: goSection('top') },
      ...nav.map((n) => ({ id: `go-${n.id}`, group: 'Go to' as const, label: n.label, keywords: n.id, run: goSection(n.id) })),
      { id: 'go-projects', group: 'Go to', label: 'All projects', keywords: 'index archive filter', run: goSection('projects') },
      { id: 'go-resume', group: 'Go to', label: 'Resume page', keywords: 'cv', run: () => navigate('/resume/') },
      ...caseStudies.map((c) => ({ id: `cs-${c.slug}`, group: 'Case studies' as const, label: c.title, hint: c.kicker, keywords: c.tags.join(' '), run: () => navigate(`/work/${c.slug}/`) })),
      { id: 'theme', group: 'Preferences', label: `Switch to ${p.theme === 'dark' ? 'light' : 'dark'} theme`, keywords: 'theme dark light mode colour color', run: () => switchTheme(p.theme === 'dark' ? 'light' : 'dark') },
      { id: 'motion', group: 'Preferences', label: p.motion === 'full' ? 'Reduce motion' : 'Turn full motion on', keywords: 'animation motion reduce', run: () => setPref('motion', p.motion === 'full' ? 'reduced' : 'full') },
      { id: 'sound', group: 'Preferences', label: p.sound ? 'Turn sound off' : 'Turn sound on', keywords: 'audio sound mute', run: () => setSound(!p.sound) },
      { id: 'recruiter', group: 'Preferences', label: p.recruiter ? 'Exit recruiter mode' : 'Recruiter mode', hint: 'plain, fast, printable', keywords: 'resume plain print simple', run: () => setRecruiter(!p.recruiter) },
      { id: 'copy', group: 'Actions', label: 'Copy email address', hint: site.email, keywords: 'email contact mail', run: () => void copyText(site.email, 'Email copied') },
      { id: 'pdf', group: 'Actions', label: 'Download resume (PDF)', keywords: 'cv pdf resume download', run: () => window.location.assign(withBase(site.resumePdf)) },
      { id: 'gh', group: 'Actions', label: 'Open GitHub', hint: site.githubHandle, keywords: 'code repos', run: () => window.open(site.github, '_blank', 'noopener') },
      { id: 'li', group: 'Actions', label: 'Open LinkedIn', keywords: 'linkedin profile', run: () => window.open(site.linkedin, '_blank', 'noopener') },
      { id: 'term', group: 'Actions', label: 'Open terminal', hint: '`', keywords: 'shell console cli', run: () => openOverlay('terminal') },
      // Claims search: every sourced result, findable by its words; nothing invented when there's no match.
      ...caseStudies.flatMap((c) =>
        (c.caseStudy?.results ?? []).map((r, i) => ({
          id: `claim-${c.slug}-${i}`,
          group: 'On record' as const,
          label: `${c.title}: ${r.value}`,
          hint: r.source.label.split(' · ')[0],
          keywords: `${r.label} ${r.context ?? ''} ${c.title}`,
          searchOnly: true,
          run: () => navigate(`/work/${c.slug}/#results`),
        })),
      ),
    ];
  }, [route.name, navigate]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands.filter((c) => !c.searchOnly);
    const terms = s.split(/\s+/);
    return commands.filter((c) => {
      const hay = `${c.label} ${c.hint ?? ''} ${c.keywords ?? ''} ${c.group}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [q, commands]);

  useEffect(() => {
    returnFocus.current = document.activeElement;
    input.current?.focus();
    sfx('open');
    return () => {
      sfx('close');
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const run = (c: Cmd | undefined) => {
    if (!c) return;
    closeOverlay();
    sfx('tick');
    window.setTimeout(c.run, 10);
  };

  let lastGroup = '';
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && closeOverlay()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <input
          ref={input}
          className="palette__input"
          placeholder="Type a command or search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={filtered[sel] ? `cmd-${filtered[sel]!.id}` : undefined}
          aria-autocomplete="list"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSel((s) => Math.min(filtered.length - 1, s + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSel((s) => Math.max(0, s - 1));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              run(filtered[sel]);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              closeOverlay();
            } else if (e.key === 'Tab') {
              e.preventDefault();
            }
          }}
        />
        <ul className="palette__list" id="palette-list" role="listbox" aria-label="Commands" ref={listRef}>
          {filtered.length === 0 && (
            <li className="palette__empty" role="option" aria-selected="false" aria-disabled="true">
              Nothing on record for that.
            </li>
          )}
          {filtered.map((c, i) => {
            const head = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            return [
              head && (
                <li key={`g-${head}`} className="palette__group" role="presentation">
                  {head}
                </li>
              ),
              <li
                key={c.id}
                id={`cmd-${c.id}`}
                role="option"
                aria-selected={i === sel}
                className="palette__item"
                onMouseMove={() => setSel(i)}
                onClick={() => run(c)}
              >
                <span>{c.label}</span>
                {c.hint && <span className="palette__hint">{c.hint}</span>}
              </li>,
            ];
          })}
        </ul>
        <div className="palette__foot" aria-hidden="true">
          <span>↑↓ move</span>
          <span>↵ run</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
