// Calm, warm background bed (~30s): soft e-piano arpeggios + pad + gentle bass. 76 BPM, Dm9 – Bbmaj7 – Fmaj7 – C6.
import { writeFileSync, mkdirSync } from "node:fs";
const SR = 44100, DUR = 30.5, N = Math.round(DUR * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const beat = 60 / 76, bar = beat * 4;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const chords = [ // [bass, pad notes, arp notes] midi
  [38, [50, 53, 57, 60, 64], [62, 65, 69, 72, 76, 72, 69, 65]],
  [34, [50, 53, 57, 58, 62], [62, 65, 69, 70, 74, 70, 69, 65]],
  [41, [53, 57, 60, 64, 67], [65, 69, 72, 76, 79, 76, 72, 69]],
  [36, [52, 55, 57, 60, 64], [64, 67, 69, 72, 76, 72, 69, 67]],
];
const add = (t0, dur, f, amp, kind, pan = 0) => {
  const i0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  let p1 = Math.random() * 6, p2 = 0, p3 = 0;
  for (let i = 0; i < n && i0 + i < N; i++) {
    const t = i / SR; let env, v;
    if (kind === "ep") { env = Math.min(1, t * 300) * Math.exp(-t * 2.2); p1 += 2 * Math.PI * f / SR; p2 += 4 * Math.PI * f / SR; p3 += 6 * Math.PI * f / SR;
      v = (Math.sin(p1) + 0.25 * Math.sin(p2) * Math.exp(-t * 6) + 0.08 * Math.sin(p3) * Math.exp(-t * 10)) * (1 + 0.08 * Math.sin(t * 2 * Math.PI * 5)); }
    else if (kind === "pad") { env = Math.min(1, t / 1.2) * Math.min(1, (dur - t) / 1.2); p1 += 2 * Math.PI * f * 0.998 / SR; p2 += 2 * Math.PI * f * 1.002 / SR;
      v = (Math.sin(p1) + Math.sin(p2)) * 0.5; }
    else { env = Math.min(1, t * 80) * Math.exp(-t * 1.4); p1 += 2 * Math.PI * f / SR; v = Math.sin(p1) + 0.2 * Math.sin(2 * p1); }
    const s = v * env * amp; L[i0 + i] += s * (1 - pan) ; R[i0 + i] += s * (1 + pan);
  }
};
for (let b = 0; b * bar < DUR; b++) {
  const [bass, pad, arp] = chords[b % 4], t0 = b * bar;
  add(t0, bar * 1.3, hz(bass), 0.35, "bass");
  for (const m of pad) add(t0, bar + 0.6, hz(m), 0.05, "pad", (m % 5) / 10 - 0.2);
  arp.forEach((m, k) => add(t0 + k * beat / 2, 2.2, hz(m), 0.12 * (k % 2 ? 0.75 : 1), "ep", k % 2 ? 0.3 : -0.3));
}
// simple feedback delay for space
const d = Math.round(beat * 0.75 * SR);
for (let i = d; i < N; i++) { L[i] += R[i - d] * 0.25; R[i] += L[i - d] * 0.25; }
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const b = Buffer.alloc(44 + N * 4);
b.write("RIFF", 0); b.writeUInt32LE(36 + N * 4, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { const t = i / SR, fade = Math.min(1, t / 1.0, (DUR - t) / 1.8);
  b.writeInt16LE(Math.round(L[i] / pk * 0.9 * fade * 32767), 44 + i * 4); b.writeInt16LE(Math.round(R[i] / pk * 0.9 * fade * 32767), 46 + i * 4); }
mkdirSync(new URL("../public/music/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/music/bed.wav", import.meta.url), b);
console.log("music ok");
