// Shared "evidence graph" layout for the hero: the WebGL particle field and the static SVG fallback both use it.
// Coordinates are normalised to [0, 1] × [0, 1] (y down). Deterministic, so SSR and client agree.

export interface GraphNode {
  x: number;
  y: number;
  /** Relative size (1 = normal). */
  r: number;
  /** The node the evidence converges on (rendered in the accent colour). */
  hot?: boolean;
}

export interface GraphLayout {
  nodes: GraphNode[];
  edges: [number, number][];
}

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** A layered graph: signals on the left converge, through checks, on one verdict node on the right. */
export function evidenceGraph(seed = 7): GraphLayout {
  const rand = rng(seed);
  const layers = [6, 5, 4, 3, 1];
  const nodes: GraphNode[] = [];
  const layerIdx: number[][] = [];
  layers.forEach((count, li) => {
    const ids: number[] = [];
    for (let i = 0; i < count; i++) {
      const x = 0.06 + (li / (layers.length - 1)) * 0.86 + (rand() - 0.5) * 0.05;
      const spread = count === 1 ? 0 : 0.78;
      const y = count === 1 ? 0.5 : 0.11 + (i / (count - 1)) * spread + (rand() - 0.5) * 0.06;
      ids.push(nodes.length);
      nodes.push({ x, y, r: li === layers.length - 1 ? 2.2 : 0.8 + rand() * 0.7, hot: li === layers.length - 1 });
    }
    layerIdx.push(ids);
  });
  const edges: [number, number][] = [];
  for (let li = 0; li < layerIdx.length - 1; li++) {
    const a = layerIdx[li]!;
    const b = layerIdx[li + 1]!;
    a.forEach((from, i) => {
      const j = Math.min(b.length - 1, Math.round((i / Math.max(1, a.length - 1)) * (b.length - 1)));
      edges.push([from, b[j]!]);
      if (rand() > 0.45 && b.length > 1) {
        const k = (j + (rand() > 0.5 ? 1 : b.length - 1)) % b.length;
        if (k !== j) edges.push([from, b[k]!]);
      }
    });
  }
  return { nodes, edges };
}
