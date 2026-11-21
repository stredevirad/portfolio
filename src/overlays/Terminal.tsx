// Backtick terminal. Lazy-loaded on first open. Tasteful, short answers drawn from the same content data.
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { site } from '../content/site';
import { projects, caseStudies } from '../content/projects';
import { skillGroups } from '../content/skills';
import { useRouter } from '../lib/router';
import { closeOverlay, triggerUnlock } from '../lib/ui';
import { getPrefs, setPref } from '../lib/prefs';
import { isHiddenWord } from '../lib/keys';
import { sfx } from '../lib/audio';
import { setSound, switchTheme } from '../components/Toggles';
import { copyText } from '../lib/clipboard';

interface Line {
  id: number;
  node: ReactNode;
}

const HELP = `commands:
  whoami            who is this
  ls projects       list projects
  cat <project>     one project, e.g. cat aegis
  open <target>     github · linkedin · <project>
  skills            grouped skills
  contact           how to reach me
  theme <dark|light>   motion <full|reduced>   sound <on|off>
  sudo hire-me
  clear · exit`;

export default function Terminal() {
  const { navigate } = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const out = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const returnFocus = useRef<Element | null>(null);

  const print = (node: ReactNode) => {
    idRef.current += 1;
    const id = idRef.current;
    setLines((l) => [...l, { id, node }]);
  };

  useEffect(() => {
    returnFocus.current = document.activeElement;
    input.current?.focus();
    sfx('open');
    print(<span className="dim">jhj-shell — type “help”. Esc closes.</span>);
    return () => {
      sfx('close');
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    out.current?.scrollTo({ top: out.current.scrollHeight });
  }, [lines]);

  const exec = (raw: string) => {
    const cmd = raw.trim();
    print(
      <span>
        <span className="ok">joshua@kochi</span>:<span className="dim">~</span>$ <span className="cmd">{cmd}</span>
      </span>,
    );
    if (!cmd) return;
    setHistory((h) => [cmd, ...h].slice(0, 30));
    setHIdx(-1);
    const [head = '', ...rest] = cmd.split(/\s+/);
    const arg = rest.join(' ').toLowerCase();
    const h = head.toLowerCase();
    sfx('tick');

    if (isHiddenWord(cmd)) {
      if (getPrefs().recruiter) {
        print('command not found');
        return;
      }
      print(<span className="ok">…</span>);
      closeOverlay();
      window.setTimeout(triggerUnlock, 120);
      return;
    }
    switch (h) {
      case 'help':
      case '?':
        print(HELP);
        break;
      case 'whoami':
        print(`${site.name} — ${site.role}, ${site.locationShort}.\n${site.intro}\n${site.availability}`);
        break;
      case 'ls':
        if (arg && arg !== 'projects') {
          print(`ls: ${arg}: no such directory (try: ls projects)`);
          break;
        }
        print(projects.map((p) => `${p.slug.padEnd(24)}${p.kicker}`).join('\n'));
        break;
      case 'cat': {
        const p = projects.find((x) => x.slug === arg || x.title.toLowerCase() === arg || x.slug.startsWith(arg || '§'));
        if (!p) {
          print(`cat: ${arg || '(nothing)'}: no such project — try “ls projects”`);
          break;
        }
        print(
          [
            `# ${p.title} — ${p.kicker}`,
            p.oneLiner,
            p.headline ? `→ ${p.headline.value} ${p.headline.label}${p.headline.context ? ` (${p.headline.context})` : ''}` : '',
            `role: ${p.role}`,
            p.stack.length ? `stack: ${p.stack.join(', ')}` : '',
            p.caseStudy ? `open ${p.slug}  → read the case study` : p.repo ? `repo: ${p.repo}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
        );
        break;
      }
      case 'open': {
        if (arg === 'github') {
          window.open(site.github, '_blank', 'noopener');
          print('opening github…');
        } else if (arg === 'linkedin') {
          window.open(site.linkedin, '_blank', 'noopener');
          print('opening linkedin…');
        } else {
          const p = caseStudies.find((x) => x.slug === arg || x.slug.startsWith(arg || '§'));
          if (p) {
            closeOverlay();
            navigate(`/work/${p.slug}/`);
          } else print(`open: ${arg || '(nothing)'}: unknown target`);
        }
        break;
      }
      case 'skills':
        print(skillGroups.map((g) => `${g.label.padEnd(16)}${g.skills.map((s) => s.label).join(', ')}`).join('\n'));
        break;
      case 'contact':
      case 'email':
        void copyText(site.email, 'Email copied');
        print(`${site.email}  (copied)\n${site.github}\n${site.linkedin}`);
        break;
      case 'theme':
        if (arg === 'dark' || arg === 'light') {
          switchTheme(arg);
          print(`theme → ${arg}`);
        } else print('usage: theme <dark|light>');
        break;
      case 'motion':
        if (arg === 'full' || arg === 'reduced') {
          setPref('motion', arg);
          print(`motion → ${arg}`);
        } else print('usage: motion <full|reduced>');
        break;
      case 'sound':
        if (arg === 'on' || arg === 'off') {
          setSound(arg === 'on');
          print(`sound → ${arg}`);
        } else print('usage: sound <on|off>');
        break;
      case 'sudo':
        if (arg === 'hire-me' || arg === 'hire me') {
          print(
            <span>
              <span className="ok">[sudo]</span> permission granted.{'\n'}Checking evidence… 5 case studies, sources attached. Verdict: worth an interview.{'\n'}Next step: {site.email} (copied).
            </span>,
          );
          void copyText(site.email, 'Email copied');
        } else print(`sudo: ${arg || '(nothing)'}: not permitted. Try “sudo hire-me”.`);
        break;
      case 'rm':
        print('rm: refusing to delete evidence.');
        break;
      case 'clear':
        setLines([]);
        break;
      case 'exit':
      case 'quit':
        closeOverlay();
        break;
      default:
        print(`${h}: command not found — try “help”`);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && closeOverlay()}>
      <div className="terminal" role="dialog" aria-modal="true" aria-label="Terminal">
        <div className="terminal__bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>jhj-shell</span>
        </div>
        <div className="terminal__out" ref={out} role="log" aria-live="polite">
          {lines.map((l) => (
            <div key={l.id}>{l.node}</div>
          ))}
        </div>
        <form
          className="terminal__form"
          onSubmit={(e) => {
            e.preventDefault();
            exec(value);
            setValue('');
          }}
        >
          <label className="terminal__prompt" htmlFor="term-input">
            $
          </label>
          <input
            id="term-input"
            ref={input}
            className="terminal__input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                closeOverlay();
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const n = Math.min(history.length - 1, hIdx + 1);
                if (history[n] !== undefined) {
                  setHIdx(n);
                  setValue(history[n]!);
                }
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const n = hIdx - 1;
                setHIdx(Math.max(-1, n));
                setValue(n >= 0 ? (history[n] ?? '') : '');
              } else if (e.key === 'Tab') {
                e.preventDefault();
              }
            }}
          />
        </form>
      </div>
    </div>
  );
}
