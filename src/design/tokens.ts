// JS mirror of the motion and layout tokens in styles/tokens.css.
export const motion = {
  dur: { xs: 0.2, s: 0.4, m: 0.7, l: 1.1, xl: 1.6 },
  ease: {
    out: 'expo.out',
    inOut: 'power3.inOut',
    soft: 'power2.out',
    snap: 'back.out(1.4)',
  },
  stagger: { chars: 0.018, words: 0.04, lines: 0.08, cards: 0.12 },
  /** Preloader: never shorter (avoids a flash) and never longer (protects LCP / Speed Index). */
  preloader: { min: 0.75, max: 1.2 },
} as const;

export const breakpoints = { sm: 480, md: 768, lg: 1024, xl: 1440 } as const;

/** Media query for layouts that pin the work reel horizontally. */
export const reelQuery = `(min-width: ${breakpoints.lg}px) and (min-height: 620px)`;
