# DESIGN_RESEARCH.md

Research date: 2026-11-21. Sources: the Awwwards portfolio category (`awwwards.com/websites/portfolio/`) and the
Sites-of-the-Day listing, plus each winner's Awwwards page (jury description + technology tags).
**Inspiration only.** No layout, copy, asset or code from any of these sites is reused; the concept for this
site (Signal vs. Noise) is original and comes from Aegis's abstain-don't-guess idea.

## The reference set: 10 recent Site-of-the-Day portfolio winners

| Site (SOTD date) | What the jury page highlights | Tags |
|---|---|---|
| Carter Ogunsola (Nov 19 2026) | Portfolio "built like a print shop": a two-wheel press for projects, a lanyard badge, a typed letter, a lab | — |
| G. Colombel — Portfolio 2026 (Oct 28 2026) | Freelance interactive developer; immersive, creative web | — |
| Brandon Yasin (Oct 24 2026) | Palette shifts with the time of day; drag the clock to time-travel; nav unfolds like magazine covers | editorial |
| Huy Phan Vol.2 (Oct 14 2026) | Designer / AD portfolio | GSAP, Three.js, Framer, Typography, Filters & Effects |
| Nick Ho (Oct 11 2026) | Scroll-driven 360° helmet viewer, precise GSAP motion "capturing speed" | GSAP, Three.js, 3D, Webflow |
| Maria Vasilyeva (Oct 9 2026) | Music-inspired: rhythm, typography, layout and interaction move together | WebGL, Sanity, Navigation Menu, Typography |
| Jesper Landberg (Sep 29 2026) | Design engineer; visually rich, motion-driven | GSAP, Three.js, Nuxt, Infinite Scroll |
| Meer Mohsin (Sep 26 2026) | "Cinematic journey", immersive storytelling | GSAP, Three.js, 3D, Storytelling |
| Gil Huybrecht (Sep 21 2026) | Work + availability front and centre | WebGL, Next.js, Infinite Scroll, Microinteractions |
| Léo Parpeix — 2026 (Sep 14 2026) | Art director / interactive designer, experimental | WebGL, Blender, Transitions, Microinteractions |
| Gionatan Nese '26 (Sep 5 2026) | Multi-disciplinary designer, minimal | GSAP, Three.js, WebGL, **Sound-Audio**, Infinite Scroll |

Recent nominees worth noting for engineer portfolios specifically: *Lionel Quellery* (a Solutions Engineer whose
"data pipelines play out like a film"), *Inacio Nakiti* ("one swarm of particles that draws the work … a switch that
shows the code"), *SHVGVN* (boots like a terminal), *Kamal's Folio* ("press Z for Zen mode").

## What makes them work — techniques, by category

### 1. Preloaders
- Short (≤ 2 s), meaningful: a count or a mark that **becomes** the first frame of the hero instead of fading to
  white. The handoff (shared element) is what reads as "crafted".
- They gate fonts + critical textures, not the whole page. Repeat visits skip them.
- **Our take:** counter 000→100 tied to real readiness (fonts + hero chunk), then the name letters FLIP into the
  hero headline. First visit only (sessionStorage). Max ~1.6 s; never blocks LCP text (the hero text is in the
  HTML underneath).

### 2. Kinetic type
- Oversized display type as the primary visual (Huy Phan, Maria Vasilyeva, Brandon Yasin's editorial covers).
- Split-character / line-mask reveals, variable-font axis animation, type that reacts to scroll speed.
- **Our take:** a variable display face whose weight follows scroll velocity; per-character reveals with a mask;
  a text-scramble on nav hover that resolves from "noise" glyphs into the word (the Signal-vs-Noise metaphor).

### 3. WebGL heroes
- Particles/swarm forming meaning (Inacio Nakiti), 3D objects tied to scroll (Nick Ho).
- They degrade: the good ones show a designed still on low-power devices.
- **Our take:** a GPU particle field: noise-driven drift ("noise") that snaps into a structured evidence graph
  ("signal") as you scroll/hover. Cursor = a local "evidence probe" that organises nearby particles. Lazy chunk,
  DPR cap 1.5, paused offscreen/hidden, static SVG fallback.

### 4. Scroll choreography
- One idea per viewport; pinned sections with horizontal travel; consistent easing language.
- Smooth scroll (Lenis-style) + ScrollTrigger, but content still reachable without JS-driven scroll.
- **Our take:** pinned horizontal Work reel on desktop, vertical stack on mobile; a self-drawing timeline; counters
  that only animate to real values.

### 5. Cursor work
- Contextual labels ("view", "drag"), magnetic CTAs, blend modes. Always disabled on touch.
- **Our take:** a ring + dot with labels view / drag / open / copy; magnetic buttons; off on `(pointer: coarse)` and
  reduced motion.

### 6. Transitions
- Shared-element (FLIP) from card to case study; curtain/clip-path wipes; View Transitions where supported.
- **Our take:** GSAP Flip card → case-study hero; circular clip-path theme reveal from the toggle (View Transitions
  API with a fallback).

### 7. Layout rhythm
- A strict grid with deliberate breaks; big numerals; mono labels as metadata ("01 / Work"); generous whitespace;
  one accent colour used sparingly.
- **Our take:** 12-col grid, mono index labels, ink/paper palette with one electric accent ("signal").

### 8. Sound design
- Only one of the ten (Gionatan Nese) tags Sound-Audio; it is **opt-in**, quiet, and tied to interaction.
- **Our take:** sound off by default; Web Audio synthesis only (no samples to license): soft ticks on hover,
  a low ambient hum, a chime for the hidden unlock.

### 9. Personality toggles / modes
- "Zen mode" (Kamal), "switch that shows the code" (Inacio), time-of-day palettes (Brandon Yasin): a mode switch is
  a memorable, low-cost signature.
- **Our take:** Recruiter mode (plain, fast, printable + PDF), motion, sound, theme, command palette, terminal.

## Pitfalls seen across the category (to avoid)
- Preloaders that hide content for 4–6 s; hero text rendered only in WebGL (bad LCP + SEO + a11y).
- Scroll-jacking that breaks keyboard and anchor navigation.
- Low-contrast grey-on-black body copy; tiny mono text.
- Work hidden behind spectacle — a recruiter needs name, role, 3 projects and contact in ≤ 10 s.
- No reduced-motion path.

## Implications for this build
1. Real HTML text for name, role and hero line (LCP element), WebGL decorates behind it.
2. A 10-second path: hero line → "AI that knows when to say I don't know" → three flagship cards → contact, all
   above or one scroll below the fold, plus the Recruiter-mode switch visible in the header.
3. Spectacle is progressive enhancement: everything works with JS-driven motion off.
