import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, ease, springs, variants, Variant } from "./theme";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);

// ================= timeline (seconds, matched to the burned-in subtitles) =================
type FX = "strike" | "ecg" | "heat" | "warp" | "laser" | "progress" | "reticle" | "rings" | "night" | "end";
type Beat = { from: number; to: number; lines: string[]; accent?: number; label?: string; fx?: FX; size?: number };
const BEATS: Beat[] = [
  { from: 0.1, to: 1.95, lines: ["Возбуждение", "бар,"], accent: 1 },
  { from: 2.0, to: 3.35, lines: ["оргазм", "жоқ?"], accent: 1, fx: "strike" },
  { from: 6.2, to: 7.2, lines: ["оятатын"], accent: 0 },
  { from: 7.25, to: 9.7, lines: ["сезімдерді", "лапылдататын"], accent: 1 },
  { from: 10.2, to: 13.15, lines: ["ғарышқа", "ұшыратын"], accent: 0 },
  { from: 13.25, to: 15.3, lines: ["CO2 лазер"], accent: 0, fx: "laser" },
  { from: 16.7, to: 18.7, lines: ["қалыпқа", "келтіріп"], accent: 1, fx: "progress" },
  { from: 19.0, to: 20.45, lines: ["точка G"], accent: 0, fx: "reticle", size: 150 },
  { from: 21.0, to: 22.45, lines: ["плазма"], accent: 0, fx: "rings", size: 150 },
  { from: 22.5, to: 23.75, lines: ["от боп", "лапылдайсыз"], accent: 0 },
  { from: 24.0, to: 25.4, lines: ["от түндер"], accent: 0 },
  { from: 26.2, to: 28.15, lines: ["шоқ түндер", "сізді күтеді"], accent: 0 },
  { from: 28.25, to: 29.63, lines: ["CO2", "кейін"], accent: 0, fx: "end", size: 170 },
];

// [time, file, volume]
const SFX: [number, string, number][] = [
  [0.05, "boom", 0.55], [1.9, "whoosh", 0.35], [2.0, "boom", 0.5], [2.55, "tick", 0.35],
  [5.0, "heart", 0.6], [6.15, "heart", 0.6], [7.2, "whoosh", 0.35],
  [9.1, "riser", 0.35], [10.2, "boom", 0.45], [10.2, "whoosh", 0.4],
  [13.2, "laser", 0.35], [13.75, "tick", 0.3], [14.05, "tick", 0.3],
  [16.85, "tick", 0.22], [17.15, "tick", 0.22], [17.45, "tick", 0.22], [17.75, "tick", 0.22], [18.05, "ding", 0.3],
  [19.0, "lock", 0.45], [21.0, "shimmer", 0.4], [22.5, "boom", 0.4],
  [23.9, "swell", 0.35], [26.15, "shimmer", 0.3], [28.2, "boom", 0.55], [28.3, "ding", 0.25],
];

// hits → flash + shake (seconds, strength)
const HITS: [number, number][] = [[0.1, 1], [2.0, 1], [10.2, 0.9], [19.0, 0.5], [22.5, 0.8], [28.25, 1]];

// camera: [t, scale, originX%, originY%]
const CAM: [number, number, number, number][] = [
  [0, 1.12, 50, 38], [1.9, 1.04, 50, 38], [2.0, 1.04, 50, 38], [2.15, 1.16, 50, 36],
  [3.3, 1.16, 50, 36], [3.55, 1.0, 50, 38], [5.0, 1.02, 50, 38], [6.2, 1.05, 50, 37], [6.35, 1.1, 50, 36],
  [7.2, 1.1, 50, 36], [9.6, 1.02, 50, 40], [10.2, 1.0, 50, 40], [10.4, 1.08, 60, 30], [13.1, 1.03, 55, 36],
  [13.2, 1.03, 50, 40], [13.45, 1.14, 22, 46], [15.4, 1.16, 22, 46], [15.7, 1.03, 50, 40],
  [18.9, 1.04, 50, 38], [19.05, 1.13, 45, 36], [20.5, 1.14, 45, 36], [20.8, 1.02, 50, 40],
  [22.4, 1.03, 50, 40], [22.55, 1.12, 48, 36], [23.8, 1.1, 48, 36], [24.05, 1.02, 50, 40], [28.1, 1.09, 50, 38],
  [28.25, 1.15, 50, 38], [29.7, 1.05, 50, 40],
];

// ================= helpers =================
const co2 = (w: string) =>
  w.includes("CO2") ? <>{w.split("CO2")[0]}CO<span style={{ fontSize: "0.58em", verticalAlign: "-0.1em" }}>2</span>{w.split("CO2")[1]}</> : w;

const hitEnv = (t: number) => HITS.reduce((a, [h, s]) => a + (t >= h ? s * Math.exp(-(t - h) * 9) : 0), 0);

// ================= footage with punch-ins + shake =================
const Footage: React.FC<{ night: number; heat: number }> = ({ night, heat }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let i = 0;
  while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const [t0, s0, x0, y0] = CAM[i];
  const [t1, s1, x1, y1] = CAM[i + 1];
  const p = interpolate(t, [t0, t1], [0, 1], { ...C, easing: ease.inOut });
  const s = s0 + (s1 - s0) * p, ox = x0 + (x1 - x0) * p, oy = y0 + (y1 - y0) * p;
  const k = hitEnv(t);
  const sx = Math.sin(f * 2.1) * 14 * k, sy = Math.cos(f * 1.7) * 10 * k;
  const blur = interpolate(t, [10.15, 10.25, 10.5], [0, 6, 0], C);
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${s + k * 0.02})`, transformOrigin: `${ox}% ${oy}%` }}>
      <OffthreadVideo src={staticFile("clip.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover",
        filter: `saturate(${0.95 + heat * 0.25}) contrast(${1.04 + night * 0.08}) blur(${blur}px)` }} />
    </AbsoluteFill>
  );
};

// ================= keyword typography =================
const Keyword: React.FC<Beat & { v: Variant; night: number }> = ({ from, to, lines, accent, fx, size, v, night }) => {
  const st = variants[v];
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = (to - from) * fps;
  const exit = interpolate(f, [dur - 8, dur], [1, 0], { ...C, easing: ease.in });
  const exitY = interpolate(f, [dur - 8, dur], [0, -40], { ...C, easing: ease.in });
  const longest = Math.max(...lines.map((l) => l.length));
  const base = size ?? 128;
  const fs = Math.min(base, 880 / (longest * st.k));
  const cardIn = spring({ frame: f, fps, config: springs.smooth });
  // in night section, dark-text variants switch to light text for contrast
  const nightText = night > 0.5 && !st.box && !st.marker && !st.card;

  const rendered = lines.map((line, li) => {
    const words = line.split(" ");
    const boxP = interpolate(f - li * 3, [0, 7], [0, 1], { ...C, easing: ease.out });
    const isAccent = li === accent;
    const color = st.box ? (isAccent ? st.accent : st.text) : nightText ? colors.ivory : isAccent ? st.accent : st.text;
    const strike = fx === "strike" && li === 0 ? interpolate(f, [16, 24], [0, 1], { ...C, easing: ease.out }) : 0;
    return (
      <div key={li} style={{ position: "relative", display: "inline-flex", gap: fs * 0.25, padding: st.box ? `${fs * 0.06}px ${fs * 0.22}px ${fs * 0.1}px` : `0 ${fs * 0.12}px` }}>
        {st.box && <div style={{ position: "absolute", inset: 0, background: st.box, borderRadius: 4, transform: `scaleX(${boxP})`, transformOrigin: "left" }} />}
        {st.marker && <div style={{ position: "absolute", left: 0, right: 0, bottom: fs * 0.08, height: fs * 0.42, background: st.marker, transform: `scaleX(${boxP})`, transformOrigin: "left", borderRadius: 2 }} />}
        {words.map((w, wi) => {
          const s = spring({ frame: f - 4 - li * 5 - wi * 3, fps, config: springs.slam });
          return (
            <span key={wi} style={{ position: "relative", fontFamily: st.font, fontWeight: st.weight, fontSize: fs, lineHeight: 1.08, letterSpacing: st.track,
              textTransform: st.upper ? "uppercase" : "none", color, display: "inline-block", opacity: Math.min(1, s * 1.4),
              filter: `blur(${Math.max(0, 1 - s) * 10}px)`, transform: `scale(${1.35 - 0.35 * s})` }}>{co2(w)}</span>
          );
        })}
        {strike > 0 && <div style={{ position: "absolute", left: "4%", top: "52%", height: fs * 0.07, width: `${92 * strike}%`, background: st.box ? st.accent : st.accent, borderRadius: 3, transform: "rotate(-4deg)" }} />}
      </div>
    );
  });

  const block = <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: st.box ? 10 : 0 }}>{rendered}</div>;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: fx === "end" ? 330 : 200, opacity: exit, transform: `translateY(${exitY}px)` }}>
      {st.card ? (
        <div style={{ padding: "34px 56px 42px", background: st.card, borderRadius: 8, border: `2px solid ${colors.wine}`,
          clipPath: `inset(0 ${(1 - cardIn) * 50}% 0 ${(1 - cardIn) * 50}% round 8px)` }}>{block}</div>
      ) : block}
      {fx === "progress" && <Progress v={v} />}
      {fx === "laser" && <Checks v={v} />}
    </AbsoluteFill>
  );
};

// ---------- progress bar: "қалыпқа келтіріп" 0 → 100%
const Progress: React.FC<{ v: Variant }> = ({ v }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [6, 42], [0, 1], { ...C, easing: ease.inOut });
  const st = variants[v];
  return (
    <div style={{ marginTop: 34, width: 620, display: "flex", flexDirection: "column", gap: 12, opacity: interpolate(f, [2, 10], [0, 1], C) }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: st.font, fontWeight: 700, fontSize: 30, color: colors.wineDeep }}>
        <span style={{ background: colors.ivory, padding: "2px 10px", borderRadius: 3 }}>шырышты қабат</span>
        <span style={{ background: colors.ivory, padding: "2px 10px", borderRadius: 3 }}>{Math.round(p * 100)}%</span>
      </div>
      <div style={{ height: 14, background: "rgba(255,248,242,0.75)", borderRadius: 7, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${p * 100}%`, background: colors.wine, borderRadius: 7 }} />
      </div>
    </div>
  );
};

// ---------- CO2: two checked rows
const Checks: React.FC<{ v: Variant }> = ({ v }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const st = variants[v];
  return (
    <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 16 }}>
      {["сужение", "омоложение"].map((w, i) => {
        const s = spring({ frame: f - 14 - i * 9, fps, config: springs.slam });
        const d = interpolate(f, [18 + i * 9, 28 + i * 9], [1, 0], { ...C, easing: ease.out });
        return (
          <div key={w} style={{ display: "flex", alignItems: "center", gap: 18, background: colors.ivory, padding: "10px 28px 12px 18px", borderRadius: 6,
            opacity: s, transform: `translateX(${(1 - s) * -60}px)` }}>
            <svg width={44} height={44} viewBox="0 0 44 44">
              <circle cx={22} cy={22} r={20} fill={colors.wine} />
              <path d="M12 23 L19 30 L32 15" fill="none" stroke={colors.ivory} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={d} />
            </svg>
            <span style={{ fontFamily: st.font, fontWeight: st.weight, fontSize: 50, color: colors.wineDeep, textTransform: st.upper ? "uppercase" : "none" }}>{w}</span>
          </div>
        );
      })}
    </div>
  );
};

// ================= FX layers =================
const Flash: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const a = HITS.reduce((m, [h, s]) => Math.max(m, t >= h ? s * Math.exp(-(t - h) * 14) : 0), 0);
  return <AbsoluteFill style={{ background: colors.ivory, opacity: a * 0.55, mixBlendMode: "screen" }} />;
};

// heartbeat ECG line across the frame (5.0 – 7.2s)
const ECG: React.FC = () => {
  const f = useCurrentFrame();
  const W = 1080, y = 470;
  const beat = (x0: number) => `L${x0} ${y} L${x0 + 20} ${y - 30} L${x0 + 40} ${y + 10} L${x0 + 60} ${y - 170} L${x0 + 85} ${y + 90} L${x0 + 105} ${y} `;
  const d = `M0 ${y} L200 ${y} ${beat(200)} L520 ${y} ${beat(520)} L840 ${y} L${W} ${y}`;
  const p = interpolate(f, [0, 58], [0, 1], { ...C, easing: ease.inOut });
  const a = interpolate(f, [0, 6, 58, 66], [0, 1, 1, 0], C);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <svg width={1080} height={1920}>
        <defs><filter id="g"><feGaussianBlur stdDeviation="6" /></filter></defs>
        <path d={d} fill="none" stroke={colors.blush} strokeWidth={12} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} filter="url(#g)" opacity={0.8} />
        <path d={d} fill="none" stroke={colors.wine} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </svg>
    </AbsoluteFill>
  );
};

// warm light leaks drifting up ("лапылдататын", "от боп")
const Heat: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 10, dur - 10, dur], [0, 1, 1, 0], C);
  const blobs = [[200, 1500, 520, "rgba(255,120,80,0.55)"], [850, 1300, 460, "rgba(255,170,120,0.5)"], [500, 1750, 600, "rgba(230,80,100,0.45)"]] as const;
  return (
    <AbsoluteFill style={{ opacity: a, mixBlendMode: "screen" }}>
      {blobs.map(([x, y, r, c], i) => (
        <div key={i} style={{ position: "absolute", left: x - r / 2 + Math.sin(f / 18 + i) * 60, top: y - r / 2 - f * (3 + i), width: r, height: r, borderRadius: "50%",
          background: `radial-gradient(circle, ${c}, transparent 70%)`, filter: "blur(20px)" }} />
      ))}
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(255,120,80,0.35), transparent 55%)" }} />
    </AbsoluteFill>
  );
};

// speed lines burst + rising sparks ("ғарышқа")
const Warp: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const burst = interpolate(f, [0, 4, 20], [0, 1, 0], C);
  const a = interpolate(f, [0, 8, dur - 10, dur], [0, 1, 1, 0], C);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: burst }}>
        {new Array(42).fill(0).map((_, i) => {
          const ang = (i / 42) * Math.PI * 2 + random(`a${i}`) * 0.1;
          const r0 = 260 + f * 40 + random(`r${i}`) * 200, r1 = r0 + 200 + random(`l${i}`) * 300;
          const cx = 540, cy = 760;
          return <line key={i} x1={cx + Math.cos(ang) * r0} y1={cy + Math.sin(ang) * r0} x2={cx + Math.cos(ang) * r1} y2={cy + Math.sin(ang) * r1}
            stroke={colors.ivory} strokeWidth={2 + random(`w${i}`) * 3} strokeLinecap="round" opacity={0.8} />;
        })}
      </svg>
      <AbsoluteFill style={{ opacity: a }}>
        {new Array(40).fill(0).map((_, i) => {
          const x = random(`x${i}`) * 1080, sp = 5 + random(`s${i}`) * 9, r = 3 + random(`q${i}`) * 5;
          const y = 1950 - ((f * sp + random(`y${i}`) * 1950) % 1950);
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r * 5, borderRadius: r,
            background: `linear-gradient(0deg, transparent, ${colors.glow})`, opacity: 0.85 }} />;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// laser scan line sweeping the frame (CO2)
const Laser: React.FC = () => {
  const f = useCurrentFrame();
  const y = interpolate(f, [0, 22], [-40, 1960], { ...C, easing: ease.inOut });
  const a = interpolate(f, [0, 3, 20, 24], [0, 1, 1, 0], C);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 160, height: 160, background: "linear-gradient(180deg, transparent, rgba(244,207,210,0.35))", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 3, height: 6, background: colors.ivory, boxShadow: `0 0 30px 10px ${colors.glow}` }} />
    </AbsoluteFill>
  );
};

// target reticle closing in ("точка G")
const Reticle: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: springs.slam });
  const half = interpolate(s, [0, 1], [700, 230]);
  const cx = 540, cy = 300, L = 70;
  const a = interpolate(f, [0, 3, 38, 43], [0, 1, 1, 0], C);
  const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <svg width={1080} height={1920}>
        {corners.map(([dx, dy], i) => {
          const x = cx + dx * half, y = cy + dy * half * 0.62;
          return <path key={i} d={`M${x} ${y - dy * L} L${x} ${y} L${x - dx * L} ${y}`} fill="none" stroke={colors.wine} strokeWidth={7} strokeLinecap="round" />;
        })}
        <circle cx={cx} cy={cy} r={half * 0.75} fill="none" stroke={colors.ivory} strokeWidth={3} opacity={0.7 * s} strokeDasharray="10 14" transform={`rotate(${f * 3} ${cx} ${cy})`} />
      </svg>
    </AbsoluteFill>
  );
};

// expanding glow rings ("плазма")
const Rings: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      {[0, 8, 16].map((o, i) => {
        const p = interpolate(f - o, [0, 34], [0, 1], { ...C, easing: ease.out });
        const r = 80 + p * 900;
        return <div key={i} style={{ position: "absolute", left: 540 - r / 2, top: 320 - r / 2, width: r, height: r, borderRadius: "50%",
          border: `${10 - p * 8}px solid ${colors.blush}`, boxShadow: `0 0 50px ${colors.glow}, inset 0 0 50px ${colors.glow}`, opacity: (1 - p) * (f >= o ? 1 : 0) }} />;
      })}
    </AbsoluteFill>
  );
};

// night: stars + moon glow
const Night: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  if (a <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <div style={{ position: "absolute", right: -140, top: -160, width: 640, height: 640, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,228,200,0.55), transparent 65%)" }} />
      {new Array(36).fill(0).map((_, i) => {
        const x = random(`sx${i}`) * 1080, y = random(`sy${i}`) * 900, r = 2 + random(`sr${i}`) * 3;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(f / (6 + random(`st${i}`) * 8) + i));
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: r, background: colors.ivory, boxShadow: `0 0 ${r * 4}px ${colors.ivory}`, opacity: tw }} />;
      })}
    </AbsoluteFill>
  );
};

const Grade: React.FC<{ night: number }> = ({ night }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ background: "#F2D4C8", mixBlendMode: "soft-light", opacity: 0.25 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(30,12,28,0.78) 0%, rgba(30,12,28,0.55) 45%, rgba(30,12,28,0.0) 72%)", opacity: night }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, transparent 50%, rgba(40,15,25,${0.3 + night * 0.3}) 100%)` }} />
  </AbsoluteFill>
);
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return <AbsoluteFill style={{ backgroundImage: noise, backgroundSize: "220px", backgroundPosition: `${(f * 7) % 220}px ${(f * 13) % 220}px`, opacity: 0.06, mixBlendMode: "multiply" }} />;
};

// ================= composition =================
export const Reel: React.FC<{ variant: Variant }> = ({ variant }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const night = interpolate(t, [23.9, 24.4, 28.1, 28.3], [0, 1, 1, 0], C);
  const heat = Math.max(interpolate(t, [7.25, 7.6, 9.4, 9.7], [0, 1, 1, 0], C), interpolate(t, [22.5, 22.7, 23.6, 23.8], [0, 1, 1, 0], C));
  const seq = (from: number, to: number, el: React.ReactNode, key?: string | number) =>
    <Sequence key={key} from={fr(from)} durationInFrames={fr(to - from)}>{el}</Sequence>;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Footage night={night} heat={heat} />
      <Grade night={night} />
      <Night a={night} />
      {seq(7.25, 9.7, <Heat dur={fr(2.45)} />)}
      {seq(22.5, 23.8, <Heat dur={fr(1.3)} />, "h2")}
      {seq(10.2, 13.15, <Warp dur={fr(2.95)} />)}
      {seq(5.0, 7.3, <ECG />)}
      {seq(13.2, 14.1, <Laser />)}
      {seq(19.0, 20.45, <Reticle />)}
      {seq(21.0, 22.45, <Rings />)}
      {BEATS.map((b, i) => seq(b.from, b.to, <Keyword {...b} v={variant} night={night} />, i))}
      <Flash />
      <Grain />
      {SFX.map(([s, file, vol], i) => (
        <Sequence key={`a${i}`} from={fr(s)}><Audio src={staticFile(`sfx/${file}.wav`)} volume={vol} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
