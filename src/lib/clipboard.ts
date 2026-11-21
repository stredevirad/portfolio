import { showToast } from './ui';
import { sfx } from './audio';

export async function copyText(text: string, message = 'Copied'): Promise<boolean> {
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand('copy');
      ta.remove();
    } catch {
      ok = false;
    }
  }
  showToast(ok ? message : `Couldn’t copy — it’s ${text}`);
  if (ok) sfx('copy');
  return ok;
}
