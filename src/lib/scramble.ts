// "Noise resolving into signal": characters cycle through glyphs, then lock in left to right.
const GLYPHS = '!<>-_\\/[]{}=+*^?#01';
const running = new WeakMap<HTMLElement, number>();

export function scramble(el: HTMLElement, finalText?: string, duration = 420): void {
  const text = finalText ?? el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = text;
  const prev = running.get(el);
  if (prev) cancelAnimationFrame(prev);
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const locked = Math.floor(p * text.length);
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i] ?? '';
      if (i < locked || ch === ' ') out += ch;
      else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? ch;
    }
    el.textContent = out;
    if (p < 1) running.set(el, requestAnimationFrame(step));
    else {
      el.textContent = text;
      running.delete(el);
    }
  };
  running.set(el, requestAnimationFrame(step));
}
