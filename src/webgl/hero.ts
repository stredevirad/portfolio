// WebGL hero: a particle field that drifts as noise and snaps into the evidence graph as you scroll,
// and locally wherever the pointer is. Lazy-loaded; mounted only after the capability gate in Hero.tsx.
// DPR capped at 1.5; the loop pauses when the hero is offscreen or the tab is hidden.
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LineSegments,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { evidenceGraph, rng } from './layout';

const VERT = /* glsl */ `
attribute vec3 aNoise;
attribute vec2 aGraph;
attribute float aKind;
uniform float uTime;
uniform float uProgress;
uniform float uAspect;
uniform float uDpr;
uniform float uSize;
uniform vec2 uPointer;
uniform float uPointerOn;
varying float vT;
varying float vKind;
void main() {
  float seed = aNoise.z;
  vec2 n = vec2(aNoise.x * uAspect, aNoise.y);
  n += 0.07 * vec2(sin(uTime * 0.23 + seed * 6.2831 + n.y * 2.0), cos(uTime * 0.19 + seed * 12.0 + n.x * 1.7));
  float d = distance(aGraph, uPointer);
  float local = uPointerOn * (1.0 - smoothstep(0.0, 0.5, d));
  float t = clamp(uProgress * 1.5 - seed * 0.5, 0.0, 1.0);
  t = max(t, local);
  t = t * t * (3.0 - 2.0 * t);
  vec2 g = aGraph + 0.004 * vec2(sin(uTime * 1.3 + seed * 40.0), cos(uTime * 1.1 + seed * 30.0));
  vec2 p = mix(n, g, t);
  vec2 toP = p - uPointer;
  float pd = length(toP) + 1e-4;
  p += (1.0 - t) * uPointerOn * (toP / pd) * 0.07 * (1.0 - smoothstep(0.0, 0.3, pd));
  gl_Position = vec4(p.x / uAspect, p.y, 0.0, 1.0);
  float size = mix(2.0, aKind > 0.5 ? 3.2 : 2.1, t) + (aKind > 1.5 ? 4.0 * t : 0.0);
  gl_PointSize = size * uDpr * uSize;
  vT = t;
  vKind = aKind;
}`;

const FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uColC;
uniform float uAlpha;
varying float vT;
varying float vKind;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.15, r);
  vec3 col = mix(uColA, vKind > 1.5 ? uColB : uColC, vT);
  gl_FragColor = vec4(col, a * mix(0.6, 0.95, vT) * uAlpha);
}`;

const LINE_VERT = /* glsl */ `
uniform float uAspect;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform float uProgress;
varying float vA;
void main() {
  float local = uPointerOn * (1.0 - smoothstep(0.0, 0.45, distance(position.xy, uPointer)));
  vA = max(clamp(uProgress * 1.4 - 0.2, 0.0, 1.0), local);
  gl_Position = vec4(position.x / uAspect, position.y, 0.0, 1.0);
}`;

const LINE_FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
uniform float uAlpha;
varying float vA;
void main() {
  gl_FragColor = vec4(uColor, vA * 0.5 * uAlpha);
}`;

function cssColor(varName: string): Color {
  const probe = document.createElement('span');
  probe.style.color = `var(${varName})`;
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  const col = new Color();
  try {
    col.setStyle(c.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, 'rgb($1,$2,$3)'));
  } catch {
    col.set('#888888');
  }
  return col;
}

export interface HeroHandle {
  dispose(): void;
}

export function mountHero(canvas: HTMLCanvasElement, container: HTMLElement): HeroHandle {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const small = window.innerWidth < 760;
  const N = small ? 1300 : 2600;
  const graph = evidenceGraph(7);
  const rand = rng(99);

  // Assign each particle a graph target: node clusters (kind 1, hot = 2) or points along edges (kind 0).
  const kinds = new Float32Array(N);
  const target01 = new Float32Array(N * 2); // in normalised graph space [0,1]
  const noise = new Float32Array(N * 3);
  const nodeShare = Math.floor(N * 0.38);
  for (let i = 0; i < N; i++) {
    noise[i * 3] = rand() * 2 - 1;
    noise[i * 3 + 1] = rand() * 2 - 1;
    noise[i * 3 + 2] = rand();
    if (i < nodeShare) {
      const node = graph.nodes[i % graph.nodes.length]!;
      const spread = 0.012 * node.r;
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * spread;
      target01[i * 2] = node.x + Math.cos(a) * rr;
      target01[i * 2 + 1] = node.y + Math.sin(a) * rr * 1.6;
      kinds[i] = node.hot ? 2 : 1;
    } else {
      const e = graph.edges[i % graph.edges.length]!;
      const A = graph.nodes[e[0]]!;
      const B = graph.nodes[e[1]]!;
      const t = rand();
      target01[i * 2] = A.x + (B.x - A.x) * t + (rand() - 0.5) * 0.004;
      target01[i * 2 + 1] = A.y + (B.y - A.y) * t + (rand() - 0.5) * 0.006;
      kinds[i] = 0;
    }
  }

  const geo = new BufferGeometry();
  const graphAttr = new Float32BufferAttribute(new Float32Array(N * 2), 2);
  geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute('aNoise', new Float32BufferAttribute(noise, 3));
  geo.setAttribute('aGraph', graphAttr);
  geo.setAttribute('aKind', new Float32BufferAttribute(kinds, 1));

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0.36 },
    uAspect: { value: 1 },
    uDpr: { value: dpr },
    uSize: { value: small ? 1.25 : 1.55 },
    uPointer: { value: [9, 9] as [number, number] },
    uPointerOn: { value: 0 },
    uColA: { value: new Color() },
    uColB: { value: new Color() },
    uColC: { value: new Color() },
    uAlpha: { value: 1 },
  };
  const mat = new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false, depthWrite: false });
  const points = new Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  const lineGeo = new BufferGeometry();
  const linePos = new Float32BufferAttribute(new Float32Array(graph.edges.length * 2 * 3), 3);
  lineGeo.setAttribute('position', linePos);
  const lineUniforms = {
    uAspect: uniforms.uAspect,
    uPointer: uniforms.uPointer,
    uPointerOn: uniforms.uPointerOn,
    uProgress: uniforms.uProgress,
    uAlpha: uniforms.uAlpha,
    uColor: { value: new Color() },
  };
  const lineMat = new ShaderMaterial({ vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, uniforms: lineUniforms, transparent: true, depthTest: false, depthWrite: false });
  const lines = new LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;
  scene.add(lines);

  // Maps normalised graph space into world space ([-aspect, aspect] × [-1, 1]).
  const layout = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    const aspect = w / Math.max(1, h);
    uniforms.uAspect.value = aspect;
    const wide = aspect > 1.1;
    const x0 = wide ? 0.42 : 0.04;
    const x1 = wide ? 0.97 : 0.96;
    const y0 = wide ? 0.1 : 0.06;
    const y1 = wide ? 0.64 : 0.5;
    const toWorld = (x: number, y: number): [number, number] => [(-1 + 2 * (x0 + (x1 - x0) * x)) * aspect, 1 - 2 * (y0 + (y1 - y0) * y)];
    const g = graphAttr.array as Float32Array;
    for (let i = 0; i < N; i++) {
      const [wx, wy] = toWorld(target01[i * 2]!, target01[i * 2 + 1]!);
      g[i * 2] = wx;
      g[i * 2 + 1] = wy;
    }
    graphAttr.needsUpdate = true;
    const lp = linePos.array as Float32Array;
    graph.edges.forEach(([a, b], k) => {
      const A = graph.nodes[a]!;
      const B = graph.nodes[b]!;
      const [ax, ay] = toWorld(A.x, A.y);
      const [bx, by] = toWorld(B.x, B.y);
      lp.set([ax, ay, 0, bx, by, 0], k * 6);
    });
    linePos.needsUpdate = true;
  };

  const colors = () => {
    uniforms.uColA.value.copy(cssColor('--fg-muted'));
    uniforms.uColB.value.copy(cssColor('--accent'));
    uniforms.uColC.value.copy(cssColor('--fg'));
    lineUniforms.uColor.value.copy(cssColor('--fg-muted'));
  };

  layout();
  colors();

  // Inputs
  let progressTarget = 0.36;
  let pointerTarget = 0;
  const onScroll = () => {
    const r = container.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height * 0.55)));
    progressTarget = 0.36 + p * 0.75;
  };
  const onPointer = (e: PointerEvent) => {
    const r = container.getBoundingClientRect();
    const inside = e.clientY >= r.top && e.clientY <= r.bottom;
    pointerTarget = inside ? 1 : 0;
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = 1 - ((e.clientY - r.top) / r.height) * 2;
    uniforms.uPointer.value = [x * uniforms.uAspect.value, y];
  };
  const onLeave = () => (pointerTarget = 0);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  onScroll();

  const ro = new ResizeObserver(() => layout());
  ro.observe(container);
  const mo = new MutationObserver(() => colors());
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-secret'] });

  // Loop with pause when offscreen / hidden
  let visible = true;
  let raf = 0;
  let last = performance.now();
  const io = new IntersectionObserver(([en]) => {
    visible = !!en?.isIntersecting;
    if (visible) kick();
  });
  io.observe(container);
  const onVis = () => {
    if (!document.hidden) kick();
  };
  document.addEventListener('visibilitychange', onVis);

  const frame = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    uniforms.uTime.value += dt;
    // Signature moment, once on load: the noise snaps into the evidence graph, holds, then relaxes.
    const t = uniforms.uTime.value;
    const intro = t < 0.6 ? 0 : t < 1.8 ? (t - 0.6) / 1.2 : t < 3.4 ? 1 : t < 5 ? 1 - (t - 3.4) / 1.6 : 0;
    const target = Math.max(progressTarget, 0.36 + intro * 0.62);
    uniforms.uProgress.value += (target - uniforms.uProgress.value) * Math.min(1, dt * 3);
    uniforms.uPointerOn.value += (pointerTarget - uniforms.uPointerOn.value) * Math.min(1, dt * 4);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  function kick() {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  kick();

  return {
    dispose() {
      cancelAnimationFrame(raf);
      raf = -1;
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
      geo.dispose();
      lineGeo.dispose();
      mat.dispose();
      lineMat.dispose();
      renderer.dispose();
    },
  };
}
