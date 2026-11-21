// Keyboard sequence detector (used for one hidden sequence).
const SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function listenSequence(onMatch: () => void): () => void {
  let i = 0;
  const onKey = (e: KeyboardEvent) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === SEQ[i]) {
      i += 1;
      if (i === SEQ.length) {
        i = 0;
        onMatch();
      }
    } else {
      i = k === SEQ[0] ? 1 : 0;
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}

/** Matches the hidden terminal word without spelling it in the main bundle. */
export function isHiddenWord(input: string): boolean {
  const w = input.trim().toLowerCase();
  return w.length === 6 && w.split('').reverse().join('') === String.fromCharCode(111, 116, 105, 114, 105, 107);
}
