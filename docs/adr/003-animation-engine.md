# ADR-003: GSAP 3.15 (ScrollTrigger, SplitText, Flip) + Lenis

- Status: accepted · 2026-11-21

## License check
`npm view gsap license` → "Standard 'no charge' license: https://gsap.com/standard-license" (gsap 3.15.1).
Since GSAP 3.13 (2025, after the Webflow acquisition) all plugins, including SplitText and Flip, ship in the
public `gsap` package at no charge, including commercial use. The license forbids using GSAP in a tool that
competes with Webflow's visual builder — not applicable to a personal portfolio.
Lenis: MIT.

## Decision
GSAP for all timeline/scroll/Flip work, one `gsap.context()` per section, reverted on unmount. Lenis for smooth
scroll on fine-pointer devices with full motion only; native scroll everywhere else.

## Alternatives
Motion (Framer Motion): great for React state transitions, weaker for scroll choreography and Flip across routes.
CSS scroll-driven animations: not yet reliable in every evergreen browser for pinning; used where trivial.
