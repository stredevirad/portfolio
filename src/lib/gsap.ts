// Single registration point for GSAP plugins (client only).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';

let registered = false;

export function ensureGsap() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
    ScrollTrigger.config({ ignoreMobileResize: true });
    gsap.defaults({ ease: 'expo.out', duration: 0.7 });
    registered = true;
  }
  return { gsap, ScrollTrigger, SplitText, Flip };
}

export { gsap, ScrollTrigger, SplitText, Flip };
