# ADR-004: Plain three.js (lazy) instead of React Three Fiber + drei

- Status: accepted · 2026-11-21 · deviates from the brief's recommendation

## Context
The hero is one full-screen `THREE.Points` field driven by a custom GLSL shader (noise → structured graph).
There is no scene graph to manage, no models, no controls.

## Decision
Use `three` directly in a lazily imported module (`src/webgl/hero.ts`), mounted imperatively from a React
effect. Do not add `@react-three/fiber` or `@react-three/drei`.

## Why
- R3F + reconciler add ~45 KB gzip and drei more, for a single draw call.
- Direct control of the render loop: paused when offscreen/hidden, DPR cap 1.5, explicit `dispose()`.
- The lazy chunk stays smaller, so the device-capability gate is cheaper to pass.

## Consequences
− Less idiomatic React; the WebGL module exposes `mount(canvas, opts) → { setProgress, setPointer, dispose }`.
+ The fallback (static SVG graph) and the WebGL field share the same node layout data.
