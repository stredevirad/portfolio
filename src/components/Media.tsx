// <Picture/> for optimized project screenshots and <Cover/> for generative SVG covers.
import type { ReactNode } from 'react';
import { images } from '../content/images.generated';
import type { ImageName } from '../content/images.generated';
import type { CoverSpec } from '../content/types';
import { asset } from '../lib/base';

interface PictureProps {
  name: ImageName;
  alt: string;
  sizes?: string;
  eager?: boolean;
  className?: string;
}

export function Picture({ name, alt, sizes = '(min-width: 1024px) 60vw, 100vw', eager = false, className }: PictureProps) {
  const img = images[name];
  const src = (w: number, ext: 'avif' | 'webp') => asset(`images/${name}-${w}.${ext}`);
  const set = (ext: 'avif' | 'webp') => img.widths.map((w) => `${src(w, ext)} ${w}w`).join(', ');
  const largest = img.widths[img.widths.length - 1] ?? img.width;
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={src(largest, 'webp')}
        alt={alt}
        width={img.width}
        height={img.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        {...(eager ? { fetchPriority: 'high' as const } : {})}
      />
    </picture>
  );
}

/** Deterministic PRNG so server and client render identical covers. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function Cover({ spec, title, className }: { spec: CoverSpec; title: string; className?: string }) {
  const W = 800;
  const H = 500;
  const rand = rng(spec.seed);
  const els: ReactNode[] = [];
  // Noise layer common to all motifs: drifting dots.
  for (let i = 0; i < 90; i++) {
    els.push(<circle key={`n${i}`} cx={r1(rand() * W)} cy={r1(rand() * H)} r={r1(0.8 + rand() * 1.6)} fill="currentColor" opacity={r1(0.08 + rand() * 0.25)} />);
  }
  switch (spec.motif) {
    case 'graph': {
      const pts = Array.from({ length: 11 }, () => [r1(140 + rand() * 520), r1(80 + rand() * 340)] as const);
      pts.forEach((a, i) => {
        const b = pts[(i * 3 + 1) % pts.length]!;
        const c = pts[(i + 2) % pts.length]!;
        els.push(<line key={`e${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="currentColor" strokeOpacity={0.35} />);
        if (i % 2 === 0) els.push(<line key={`f${i}`} x1={a[0]} y1={a[1]} x2={c[0]} y2={c[1]} stroke="currentColor" strokeOpacity={0.18} />);
      });
      pts.forEach((p, i) =>
        els.push(<circle key={`p${i}`} cx={p[0]} cy={p[1]} r={i === 0 ? 11 : 5} className={i === 0 ? 'cv-accent' : undefined} fill="currentColor" />),
      );
      break;
    }
    case 'radar': {
      const cx = 400;
      const cy = 250;
      for (let i = 1; i <= 6; i++) els.push(<circle key={`r${i}`} cx={cx} cy={cy} r={i * 42} fill="none" stroke="currentColor" strokeOpacity={0.22} />);
      const a = rand() * Math.PI * 2;
      els.push(<path key="sweep" d={`M${cx} ${cy} L${r1(cx + Math.cos(a) * 252)} ${r1(cy + Math.sin(a) * 252)} A252 252 0 0 1 ${r1(cx + Math.cos(a + 0.6) * 252)} ${r1(cy + Math.sin(a + 0.6) * 252)} Z`} className="cv-accent" opacity={0.22} />);
      for (let i = 0; i < 9; i++) {
        const t = rand() * Math.PI * 2;
        const d = 40 + rand() * 200;
        els.push(<circle key={`b${i}`} cx={r1(cx + Math.cos(t) * d)} cy={r1(cy + Math.sin(t) * d)} r={4} fill="currentColor" />);
      }
      break;
    }
    case 'chain': {
      for (let i = 0; i < 7; i++) {
        const x = 90 + i * 100;
        const y = 250 + Math.sin(i * 0.9 + spec.seed) * 60;
        els.push(<rect key={`c${i}`} x={r1(x - 34)} y={r1(y - 24)} width={68} height={48} rx={14} fill="none" stroke="currentColor" strokeOpacity={0.6} strokeWidth={2} className={i === 3 ? 'cv-accent' : undefined} fillOpacity={0} />);
        if (i < 6) els.push(<line key={`l${i}`} x1={r1(x + 34)} y1={r1(y)} x2={r1(x + 66)} y2={r1(250 + Math.sin((i + 1) * 0.9 + spec.seed) * 60)} stroke="currentColor" strokeOpacity={0.4} strokeDasharray="4 4" />);
      }
      break;
    }
    case 'grid': {
      for (let x = 0; x < 16; x++)
        for (let y = 0; y < 10; y++) {
          const v = rand();
          els.push(<rect key={`g${x}-${y}`} x={160 + x * 30} y={100 + y * 30} width={24} height={24} rx={3} fill="currentColor" opacity={r1(v * v * 0.6)} className={v > 0.93 ? 'cv-accent' : undefined} />);
        }
      break;
    }
    case 'wave': {
      for (let k = 0; k < 7; k++) {
        let d = '';
        for (let x = 0; x <= W; x += 20) {
          const y = 250 + Math.sin(x / (60 + k * 9) + k) * (30 + k * 12) * Math.exp(-((x - 400) ** 2) / 90000);
          d += `${x === 0 ? 'M' : 'L'}${x} ${r1(y + (k - 3) * 22)} `;
        }
        els.push(<path key={`w${k}`} d={d} fill="none" stroke="currentColor" strokeOpacity={k === 3 ? 1 : 0.28} strokeWidth={k === 3 ? 3 : 1.4} className={k === 3 ? 'cv-accent' : undefined} fillOpacity={0} />);
      }
      break;
    }
    case 'rings': {
      for (let i = 0; i < 9; i++) {
        const r = 30 + i * 26;
        els.push(<circle key={`o${i}`} cx={400} cy={250} r={r} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeDasharray={`${r1(4 + rand() * 30)} ${r1(6 + rand() * 20)}`} strokeWidth={i === 4 ? 3 : 1.2} className={i === 4 ? 'cv-accent' : undefined} fillOpacity={0} />);
      }
      break;
    }
  }
  return (
    <svg className={`cover ${className ?? ''}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Abstract cover for ${title}`}>
      {els}
    </svg>
  );
}
