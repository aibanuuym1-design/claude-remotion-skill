// Dynamic, elegant deep-house bed (~30s). Bar length 2.04s so the drop lands on 10.2s ("ғарышқа").
// Bars 0–4 groove, bar 4 end: snare build, bar 5–11 full drop, bars 12–13 night (filtered, no kick), bar 14 final hit.
import { writeFileSync, mkdirSync } from "node:fs";
const SR = 44100, DUR = 30.4, N = Math.round(DUR * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const bar = 2.04, beat = bar / 4;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const put = (i, s, pan = 0) => { if (i >= 0 && i < N) { L[i] += s * (1 - pan); R[i] += s * (1 + pan); } };
const kick = (t0, a = 1) => { let ph = 0; const i0 = Math.round(t0 * SR); for (let i = 0; i < 0.35 * SR; i++) { const t = i / SR;
  ph += 2 * Math.PI * (48 + 110 * Math.exp(-t * 28)) / SR; put(i0 + i, Math.sin(ph) * Math.exp(-t * 7) * 0.9 * a); } };
const clap = (t0, a = 1) => { const i0 = Math.round(t0 * SR); let hp = 0, prev = 0; for (let i = 0; i < 0.22 * SR; i++) { const t = i / SR;
  const n = rnd(); hp = 0.85 * (hp + n - prev); prev = n; const env = (t < 0.03 ? (Math.floor(t / 0.01) % 2 ? 0.6 : 1) : 1) * Math.exp(-t * 18);
  put(i0 + i, hp * env * 0.35 * a, 0.05); } };
const hat = (t0, a = 1, open = false) => { const i0 = Math.round(t0 * SR); let prev = 0, hp = 0; for (let i = 0; i < (open ? 0.18 : 0.05) * SR; i++) { const t = i / SR;
  const n = rnd(); hp = 0.6 * (hp + n - prev); prev = n; put(i0 + i, hp * Math.exp(-t * (open ? 16 : 70)) * 0.16 * a, 0.25); } };
const bass = (t0, m, len, a = 1) => { const i0 = Math.round(t0 * SR), f = hz(m); let ph = 0, lp = 0; for (let i = 0; i < len * SR; i++) { const t = i / SR;
  ph += f / SR; const saw = 2 * (ph % 1) - 1; lp += 0.06 * (saw - lp); put(i0 + i, (lp * 0.9 + Math.sin(2 * Math.PI * ph) * 0.5) * Math.min(1, t * 200) * Math.min(1, (len - t) * 40) * 0.42 * a); } };
const stab = (t0, notes, len, a = 1, cut = 0.08) => { const i0 = Math.round(t0 * SR); for (const m of notes) { const f = hz(m); let p1 = Math.random(), p2 = Math.random(), lp = 0;
  for (let i = 0; i < len * SR; i++) { const t = i / SR; p1 += f * 0.997 / SR; p2 += f * 1.003 / SR;
    const s = (2 * (p1 % 1) - 1) + (2 * (p2 % 1) - 1); lp += cut * (s - lp);
    put(i0 + i, lp * Math.min(1, t * 150) * Math.exp(-t * 5) * 0.07 * a, (m % 3 - 1) * 0.3); } } };
const pluck = (t0, m, a = 1) => { const i0 = Math.round(t0 * SR), f = hz(m); let ph = 0; for (let i = 0; i < 0.4 * SR; i++) { const t = i / SR; ph += 2 * Math.PI * f / SR;
  put(i0 + i, (Math.sin(ph) + 0.3 * Math.sin(2 * ph)) * Math.exp(-t * 9) * 0.09 * a, (m % 2 ? 0.4 : -0.4)); } };

const prog = [[38, [62, 65, 69, 72]], [34, [62, 65, 70, 74]], [41, [60, 65, 69, 72]], [36, [60, 64, 67, 72]]];
const arp = [0, 2, 1, 3, 2, 1, 3, 2];
for (let b = 0; b * bar < DUR - 0.5; b++) {
  const t0 = b * bar, [root, ch] = prog[b % 4];
  const night = b === 12 || b === 13, intro = b < 5, end = b >= 14;
  if (end) { kick(t0, 1.1); stab(t0, ch, 1.6, 1.4, 0.12); bass(t0, root, 1.2); clap(t0, 0.8); break; }
  for (let k = 0; k < 4; k++) {
    const tb = t0 + k * beat;
    if (!night) kick(tb, k === 0 ? 1 : 0.9);
    if (!night && (k === 1 || k === 3)) clap(tb, intro ? 0.7 : 1);
    hat(tb + beat / 2, night ? 0.5 : 1, !intro && !night);
    if (!intro && !night) { hat(tb + beat / 4, 0.45); hat(tb + 3 * beat / 4, 0.45); }
    if (!night) bass(tb + beat / 2, root + (k === 3 ? 12 : 0), beat * 0.42, intro ? 0.85 : 1);
    stab(tb + beat / 2 + (k % 2 ? beat / 4 : 0), ch, 0.35, night ? 0.7 : 1, night ? 0.03 : intro ? 0.05 : 0.09);
  }
  if (!intro) for (let s = 0; s < 8; s++) pluck(t0 + s * beat / 2, ch[arp[s]] + 12, night ? 0.6 : 1);
  if (night) bass(t0, root, bar * 0.95, 0.6);
  if (b === 4) for (let s = 0; s < 8; s++) clap(t0 + 2 * beat + s * beat / 4, 0.25 + s * 0.1); // build into the drop
}
const d = Math.round(beat * 0.75 * SR); // ping-pong delay
for (let i = d; i < N; i++) { L[i] += R[i - d] * 0.18; R[i] += L[i - d] * 0.18; }
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { const t = i / SR, fade = Math.min(1, t / 0.05, (DUR - t) / 1.0);
  buf.writeInt16LE(Math.round(Math.tanh(L[i] / pk * 1.4) * 0.85 * fade * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(R[i] / pk * 1.4) * 0.85 * fade * 32767), 46 + i * 4); }
mkdirSync(new URL("../public/music/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/music/bed.wav", import.meta.url), buf);
console.log("music ok");
