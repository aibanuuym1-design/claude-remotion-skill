// Synthesized SFX kit (16-bit mono WAV), deterministic. Tasteful, low-key sounds.
import { writeFileSync, mkdirSync } from "node:fs";
const SR = 44100, OUT = new URL("../public/sfx/", import.meta.url);
mkdirSync(OUT, { recursive: true });
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const wav = (x) => { const n = x.length, b = Buffer.alloc(44 + n * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  let pk = 0; for (const v of x) pk = Math.max(pk, Math.abs(v)); const g = pk > 0 ? 0.9 / pk : 1;
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i] * g)) * 32767), 44 + i * 2); return b; };
const make = (name, dur, fn) => { const N = Math.round(dur * SR), x = new Float32Array(N); fn(x, N); writeFileSync(new URL(name, OUT), wav(x)); };

// cinematic boom: sub sine drop + short noise transient + tail
make("boom.wav", 1.4, (x, N) => { let ph = 0, lp = 0; for (let i = 0; i < N; i++) { const t = i / SR;
  ph += 2 * Math.PI * (70 * Math.exp(-t * 2.2) + 32) / SR; lp += 0.08 * (rnd() - lp);
  x[i] = Math.sin(ph) * Math.exp(-t * 2.6) + lp * 2.5 * Math.exp(-t * 18); } });
// whoosh: filtered noise swell
make("whoosh.wav", 0.6, (x, N) => { let lp = 0, lp2 = 0; for (let i = 0; i < N; i++) { const p = i / N;
  const env = Math.sin(Math.PI * Math.pow(p, 0.6)) ** 2, c = 0.03 + 0.3 * Math.sin(Math.PI * p);
  lp += c * (rnd() - lp); lp2 += c * (lp - lp2); x[i] = lp2 * env; } });
// riser: noise + rising tone, 1.1s, ends abruptly into the hit
make("riser.wav", 1.1, (x, N) => { let lp = 0, ph = 0; for (let i = 0; i < N; i++) { const p = i / N;
  lp += (0.02 + 0.4 * p * p) * (rnd() - lp); ph += 2 * Math.PI * (180 + 900 * p * p) / SR;
  x[i] = (lp * 0.8 + Math.sin(ph) * 0.25) * Math.pow(p, 1.8); } });
// heartbeat: two soft thumps
make("heart.wav", 0.8, (x, N) => { for (const [o, a] of [[0, 1], [0.24, 0.7]]) { let ph = 0;
  for (let i = Math.round(o * SR); i < N; i++) { const t = i / SR - o; ph += 2 * Math.PI * (60 - 20 * Math.min(1, t * 5)) / SR; x[i] += a * Math.sin(ph) * Math.exp(-t * 11); } } });
// laser: soft downward sweep with shimmer
make("laser.wav", 0.7, (x, N) => { let ph = 0, ph2 = 0; for (let i = 0; i < N; i++) { const t = i / SR, p = i / N;
  ph += 2 * Math.PI * (2400 * Math.exp(-p * 3) + 260) / SR; ph2 += 2 * Math.PI * 4200 / SR;
  x[i] = (Math.sin(ph) * 0.7 + Math.sin(ph2) * 0.08 * Math.sin(t * 90)) * Math.exp(-p * 4) * Math.min(1, t * 200); } });
// tick
make("tick.wav", 0.06, (x, N) => { let ph = 0; for (let i = 0; i < N; i++) { ph += 2 * Math.PI * 2100 / SR; x[i] = Math.sin(ph) * Math.exp(-i / N * 12); } });
// ding: soft bell
make("ding.wav", 1.6, (x, N) => { for (const [f, a, d] of [[1046.5, 1, 3], [1568, 0.5, 4], [2093, 0.25, 6], [2637, 0.12, 8]]) { let ph = 0;
  for (let i = 0; i < N; i++) { const t = i / SR; ph += 2 * Math.PI * f / SR; x[i] += a * Math.sin(ph) * Math.exp(-t * d) * Math.min(1, t * 400); } } });
// lock: click + short metallic ring
make("lock.wav", 0.5, (x, N) => { for (let i = 0; i < N; i++) { const t = i / SR;
  x[i] = rnd() * Math.exp(-t * 300) * 0.9 + Math.sin(2 * Math.PI * 1760 * t) * 0.35 * Math.exp(-t * 14) + Math.sin(2 * Math.PI * 2640 * t) * 0.2 * Math.exp(-t * 20); } });
// shimmer: airy high sparkle
make("shimmer.wav", 1.5, (x, N) => { const fs = [2349, 2793, 3136, 3520, 4186]; for (let k = 0; k < fs.length; k++) { let ph = 0; const o = k * 0.06;
  for (let i = Math.round(o * SR); i < N; i++) { const t = i / SR - o; ph += 2 * Math.PI * fs[k] / SR;
    x[i] += Math.sin(ph) * 0.3 * Math.exp(-t * 2.4) * (0.6 + 0.4 * Math.sin(t * 40 + k)) * Math.min(1, t * 80); } } });
// night swell: low warm pad 2.5s
make("swell.wav", 2.6, (x, N) => { for (const f of [110, 164.8, 220, 277.2, 329.6]) for (const d of [0.998, 1.002]) { let ph = rnd() * 3;
  for (let i = 0; i < N; i++) { const t = i / SR; ph += 2 * Math.PI * f * d / SR; x[i] += Math.sin(ph) * Math.min(1, t / 0.8) * Math.min(1, (2.6 - t) / 1.2); } } });
console.log("sfx ok");
