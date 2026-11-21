// Scroll-animation kit, loaded lazily (see ./gsap.ts → loadScrollKit): ScrollTrigger, SplitText, Flip and Lenis.
// Kept out of the initial bundle so hydration stays short (Total Blocking Time). Client only.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
ScrollTrigger.config({ ignoreMobileResize: true });

export { ScrollTrigger, SplitText, Flip, Lenis };
