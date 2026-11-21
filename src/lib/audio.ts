// UI sound, synthesised in the browser with the Web Audio API — no samples, nothing to license.
// Off by default; only plays when the Sound toggle is on.
import { getPrefs } from './prefs';

type Sfx = 'tick' | 'hover' | 'open' | 'close' | 'copy' | 'toggle' | 'chime' | 'slash';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let hum: { stop: () => void } | null = null;
let lastHover = 0;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function blip(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.06, glideTo?: number, delay = 0) {
  const ac = audio();
  if (!ac || !master) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noiseBurst(dur: number, gain = 0.05, from = 4000, to = 400) {
  const ac = audio();
  if (!ac || !master) return;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 2;
  const t = ac.currentTime;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(master);
  src.start();
}

export function sfx(kind: Sfx): void {
  if (!getPrefs().sound) return;
  switch (kind) {
    case 'tick':
      blip(1800, 0.04, 'square', 0.015);
      break;
    case 'hover': {
      const now = performance.now();
      if (now - lastHover < 70) return;
      lastHover = now;
      blip(2400, 0.03, 'sine', 0.012);
      break;
    }
    case 'open':
      blip(420, 0.12, 'triangle', 0.05, 840);
      break;
    case 'close':
      blip(840, 0.1, 'triangle', 0.04, 420);
      break;
    case 'copy':
      blip(880, 0.08, 'sine', 0.05);
      blip(1320, 0.12, 'sine', 0.04, undefined, 0.07);
      break;
    case 'toggle':
      blip(660, 0.06, 'square', 0.02);
      break;
    case 'slash':
      noiseBurst(0.28, 0.12, 6000, 300);
      break;
    case 'chime':
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(f, 0.5, 'triangle', 0.05, undefined, i * 0.09));
      break;
  }
}

/** Low ambient hum: two detuned oscillators through a low-pass filter. */
export function setHum(on: boolean): void {
  if (!on) {
    hum?.stop();
    hum = null;
    return;
  }
  if (hum) return;
  const ac = audio();
  if (!ac || !master) return;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.018, ac.currentTime + 1.5);
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 220;
  const a = ac.createOscillator();
  const b = ac.createOscillator();
  a.type = 'sawtooth';
  b.type = 'sine';
  a.frequency.value = 55;
  b.frequency.value = 55.4;
  a.connect(lp);
  b.connect(lp);
  lp.connect(g).connect(master);
  a.start();
  b.start();
  hum = {
    stop() {
      const t = ac.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      a.stop(t + 0.7);
      b.stop(t + 0.7);
    },
  };
}
