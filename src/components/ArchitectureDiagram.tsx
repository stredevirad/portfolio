// Animated SVG architecture diagram (draws itself on scroll). On narrow screens it becomes an ordered flow list,
// so no text is ever scaled down to an unreadable size.
import { useRef } from 'react';
import type { Diagram } from '../content/types';
import { useGsap } from '../lib/hooks';
import { ensureGsap } from '../lib/gsap';
import { motionAllowed, usePrefs } from '../lib/prefs';

const NODE_W = 228;
const NODE_H = 84;

type Side = 'l' | 'r' | 't' | 'b';
function anchor(n: { x: number; y: number; w?: number }, side: Side): [number, number] {
  const w = n.w ?? NODE_W;
  switch (side) {
    case 'l':
      return [n.x, n.y + NODE_H / 2];
    case 'r':
      return [n.x + w, n.y + NODE_H / 2];
    case 't':
      return [n.x + w / 2, n.y];
    case 'b':
      return [n.x + w / 2, n.y + NODE_H];
  }
}

function edgePath(a: { x: number; y: number; w?: number }, b: { x: number; y: number; w?: number }): { d: string; mid: [number, number] } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dy) < 10) {
    const [x1, y1] = anchor(a, dx > 0 ? 'r' : 'l');
    const [x2] = anchor(b, dx > 0 ? 'l' : 'r');
    return { d: `M${x1} ${y1} H${x2 + (dx > 0 ? -6 : 6)}`, mid: [(x1 + x2) / 2, y1 - 8] };
  }
  if (Math.abs(dx) < 10) {
    const [x1, y1] = anchor(a, dy > 0 ? 'b' : 't');
    const [, y2] = anchor(b, dy > 0 ? 't' : 'b');
    return { d: `M${x1} ${y1} V${y2 + (dy > 0 ? -6 : 6)}`, mid: [x1 + 8, y1 + (dy > 0 ? 16 : -8)] };
  }
  // Elbow routed through the gutter between rows, so it never crosses another node.
  const [x1, y1] = anchor(a, dy > 0 ? 'b' : 't');
  const [x2, y2] = anchor(b, dy > 0 ? 't' : 'b');
  const gy = dy > 0 ? y1 + 30 : y1 - 30;
  return { d: `M${x1} ${y1} V${gy} H${x2} V${y2 + (dy > 0 ? -6 : 6)}`, mid: [(x1 + x2) / 2, gy - 6] };
}

export function ArchitectureDiagram({ diagram, title }: { diagram: Diagram; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefs = usePrefs();
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  const maxY = Math.max(...diagram.nodes.map((n) => n.y)) + NODE_H + 20;
  const hasOwned = diagram.nodes.some((n) => n.owned);
  const id = `diagram-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  useGsap(
    ref,
    () => {
      if (!motionAllowed() || !ref.current) return;
      const { gsap } = ensureGsap();
      const svg = ref.current.querySelector('svg');
      if (!svg) return;
      const edges = svg.querySelectorAll<SVGPathElement>('.diagram__edge');
      edges.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = p.dataset.dashed === '1' ? '5 6' : `${len}`;
        if (p.dataset.dashed !== '1') p.style.strokeDashoffset = `${len}`;
      });
      const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 80%', once: true } });
      tl.from(svg.querySelectorAll('.diagram__node'), { autoAlpha: 0, y: 14, duration: 0.6, ease: 'expo.out', stagger: 0.07 })
        .to(edges, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', stagger: 0.06 }, 0.3)
        .from(svg.querySelectorAll('.diagram__arrow, .diagram__edge-label'), { autoAlpha: 0, duration: 0.4, stagger: 0.04 }, 0.8);
    },
    [prefs.motion],
  );

  return (
    <figure className="diagram" ref={ref}>
      <svg className="diagram__svg" viewBox={`0 0 1000 ${maxY}`} role="img" aria-labelledby={`${id}-cap`}>
        <defs>
          <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="diagram__arrow" />
          </marker>
        </defs>
        {diagram.edges.map((e, i) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const { d, mid } = edgePath(a, b);
          return (
            <g key={i}>
              <path className="diagram__edge" d={d} data-dashed={e.dashed ? '1' : '0'} markerEnd={`url(#${id}-arrow)`} />
              {e.label && (
                <text className="diagram__edge-label" x={mid[0]} y={mid[1]}>
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {diagram.nodes.map((n) => (
          <g className="diagram__node" key={n.id} data-kind={n.kind ?? 'step'} data-owned={n.owned ? '1' : '0'} transform={`translate(${n.x} ${n.y})`}>
            <rect width={n.w ?? NODE_W} height={NODE_H} rx={10} />
            <text className="diagram__label" x={14} y={36}>
              {n.label}
            </text>
            {n.sub && (
              <text className="diagram__sub" x={14} y={60}>
                {n.sub}
              </text>
            )}
          </g>
        ))}
      </svg>
      <ol className="diagram__flow" role="list" aria-hidden="true">
        {diagram.nodes.map((n) => (
          <li key={n.id} data-owned={n.owned ? '1' : '0'}>
            <strong>{n.label}</strong>
            {n.sub && <span>{n.sub}</span>}
            {n.owned && <small>My part</small>}
          </li>
        ))}
      </ol>
      <div className="diagram__legend" aria-hidden="true">
        <span>
          <i /> step
        </span>
        <span>
          <i className="out" /> output
        </span>
        <span>
          <i className="model" /> model
        </span>
        {hasOwned && (
          <span>
            <i className="owned" /> my part
          </span>
        )}
      </div>
      <figcaption id={`${id}-cap`} className="cs-figcap">
        {diagram.summary}
      </figcaption>
    </figure>
  );
}
