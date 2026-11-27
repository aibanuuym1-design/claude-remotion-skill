import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, ease, springs, variants, Variant } from "./theme";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);

// ================= timeline (seconds, matched to the burned-in subtitles) =================
type FX = "strike" | "laser" | "end";
type Beat = { from: number; to: number; lines: string[]; accent?: number; label?: string; fx?: FX; size?: number };
const BEATS: Beat[] = [
  { from: 0.1, to: 1.95, lines: ["Возбуждение", "бар,"], accent: 1 },
  { from: 2.0, to: 3.35, lines: ["оргазм", "жоқ?"], accent: 1, fx: "strike" },
  { from: 6.2, to: 7.2, lines: ["оятатын"], accent: 0 },
  { from: 10.2, to: 13.15, lines: ["ғарышқа", "ұшыратын"], accent: 0 },
  { from: 13.25, to: 15.3, lines: ["CO2 лазер"], accent: 0, fx: "laser" },
  { from: 19.0, to: 20.45, lines: ["точка G"], accent: 0 },
  { from: 21.0, to: 22.45, lines: ["плазма"], accent: 0 },
  { from: 24.0, to: 25.6, lines: ["от түндер"], accent: 0 },
  { from: 26.2, to: 28.15, lines: ["шоқ түндер", "сізді күтеді"], accent: 0 },
  { from: 28.25, to: 29.63, lines: ["CO2", "кейін"], accent: 0, fx: "end" },
];

// [time, file, volume] — only on the main hooks
const SFX: [number, string, number][] = [
  [0.05, "boom", 0.4], [2.0, "whoosh", 0.3], [5.0, "heart", 0.45], [10.2, "whoosh", 0.35], [23.95, "fire", 0.35], [13.2, "laser", 0.25], [28.2, "boom", 0.35],
];
const MUSIC_VOL = 0.075;

// hits → flash + shake (seconds, strength)
const HITS: [number, number][] = [[0.1, 0.7], [10.2, 0.6], [28.25, 0.7]];

// camera: [t, scale, originX%, originY%]
const CAM: [number, number, number, number][] = [
  [0, 1.12, 50, 38], [1.9, 1.04, 50, 38], [2.0, 1.04, 50, 38], [2.15, 1.16, 50, 36],
  [3.3, 1.16, 50, 36], [3.55, 1.0, 50, 38], [5.0, 1.02, 50, 38], [6.2, 1.04, 50, 37], [7.2, 1.06, 50, 36], [9.6, 1.02, 50, 40], [10.2, 1.0, 50, 40], [10.4, 1.08, 60, 30], [13.1, 1.03, 55, 36],
  [13.2, 1.03, 50, 40], [13.45, 1.14, 22, 46], [15.4, 1.16, 22, 46], [15.7, 1.03, 50, 40],
  [18.9, 1.04, 50, 38], [20.5, 1.08, 45, 36], [20.8, 1.02, 50, 40],
  [22.4, 1.03, 50, 40], [24.05, 1.05, 50, 40], [28.1, 1.09, 50, 38],
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
  const base = size ?? 92;
  const fs = Math.min(base, 760 / (longest * st.k));
  const cardIn = spring({ frame: f, fps, config: springs.smooth });
  // in night section, dark-text variants switch to light text for contrast
  
  const rendered = lines.map((line, li) => {
    const words = line.split(" ");
    const boxP = interpolate(f - li * 3, [0, 7], [0, 1], { ...C, easing: ease.out });
    const isAccent = li === accent;
    const color = night > 0.5 ? colors.ivory : isAccent ? st.accent : st.text;
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
    <AbsoluteFill style={{ alignItems: "center", paddingTop: fx === "end" ? 300 : 220, opacity: exit, transform: `translateY(${exitY}px)` }}>
      {st.card ? (
        <div style={{ padding: "34px 56px 42px", background: st.card, borderRadius: 8, border: `2px solid ${colors.wine}`,
          clipPath: `inset(0 ${(1 - cardIn) * 50}% 0 ${(1 - cardIn) * 50}% round 8px)` }}>{block}</div>
      ) : block}
            {fx === "laser" && <Checks v={v} />}
    </AbsoluteFill>
  );
};

// ---------- CO2: two checked rows
const Checks: React.FC<{ v: Variant }> = ({ v }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const st = variants[v];
  return (
    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
      {["сужение", "омоложение"].map((w, i) => {
        const s = spring({ frame: f - 14 - i * 9, fps, config: springs.slam });
        const d = interpolate(f, [18 + i * 9, 28 + i * 9], [1, 0], { ...C, easing: ease.out });
        return (
          <div key={w} style={{ display: "flex", alignItems: "center", gap: 18,             opacity: s, transform: `translateX(${(1 - s) * -60}px)` }}>
            <svg width={38} height={38} viewBox="0 0 44 44">
              <circle cx={22} cy={22} r={20} fill={colors.wine} />
              <path d="M12 23 L19 30 L32 15" fill="none" stroke={colors.ivory} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={d} />
            </svg>
            <span style={{ fontFamily: st.font, fontWeight: st.weight, fontSize: 42, color: colors.wineDeep, textTransform: st.upper ? "uppercase" : "none" }}>{w}</span>
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
  const W = 1080, y = 560;
  const beat = (x0: number) => `L${x0} ${y} L${x0 + 20} ${y - 30} L${x0 + 40} ${y + 10} L${x0 + 60} ${y - 120} L${x0 + 85} ${y + 70} L${x0 + 105} ${y} `;
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

// fire: flames rising along both side edges + embers ("от түндер" → "шоқ түндер")
const Fire: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 10, dur - 12, dur], [0, 1, 1, 0], C);
  const flame = interpolate(f, [0, 8, fr(1.5), fr(2.4)], [0, 1, 1, 0.35], C); // flames calm down into embers
  const tongues: React.ReactNode[] = [];
  for (const side of [0, 1]) {
    for (let i = 0; i < 120; i++) {
      const L = 16 + random(`L${side}${i}`) * 16;
      const age = (f + random(`o${side}${i}`) * L) % L, k = age / L;
      const d = random(`bx${side}${i}`); // 0 = at the edge, 1 = inward
      const bx = side === 0 ? -40 + d * 300 : 1120 - d * 300;
      const h = (700 + (1 - d) * 600 + random(`h${side}${i}`) * 300) * flame;
      const y = 1960 - k * h;
      const x = bx + Math.sin(f / 4 + i * 1.7) * 22 * k + (side === 0 ? 1 : -1) * k * 30;
      const r = (70 + random(`r${side}${i}`) * 90) * (1 - k * 0.8);
      const col = k < 0.18 ? "255,245,215" : k < 0.45 ? "255,180,80" : k < 0.75 ? "245,110,45" : "190,50,30";
      tongues.push(<div key={`${side}-${i}`} style={{ position: "absolute", left: x - r / 2, top: y - r, width: r, height: r * 2, borderRadius: "50% 50% 45% 45%",
        background: `radial-gradient(ellipse at 50% 60%, rgba(${col},${0.9 * Math.pow(1 - k, 0.6)}), transparent 68%)` }} />);
    }
  }
  return (
    <AbsoluteFill style={{ opacity: a, mixBlendMode: "screen" }}>
      <AbsoluteFill style={{ filter: "blur(9px)" }}>{tongues}</AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 0% 100%, rgba(255,120,50,${0.45 * flame}), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(255,120,50,${0.45 * flame}), transparent 55%)` }} />
      {new Array(50).fill(0).map((_, i) => {
        const sp = 4 + random(`es${i}`) * 7, x0 = random(`ex${i}`) * 1080;
        const y = 1950 - ((f * sp + random(`ey${i}`) * 1950) % 1950);
        const r = 3 + random(`er${i}`) * 4, tw = 0.5 + 0.5 * Math.sin(f / 3 + i);
        return <div key={i} style={{ position: "absolute", left: x0 + Math.sin(f / 12 + i) * 30, top: y, width: r, height: r, borderRadius: r,
          background: "rgb(255,190,110)", opacity: tw }} />;
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
export const Reel: React.FC<{ variant: Variant; music?: boolean }> = ({ variant, music = true }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const night = interpolate(t, [23.9, 24.4, 28.1, 28.3], [0, 1, 1, 0], C);
  const heat = 0;
  const seq = (from: number, to: number, el: React.ReactNode, key?: string | number) =>
    <Sequence key={key} from={fr(from)} durationInFrames={fr(to - from)}>{el}</Sequence>;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Footage night={night} heat={heat} />
      <Grade night={night} />
      <Night a={night} />
      {seq(10.2, 13.15, <Warp dur={fr(2.95)} />)}
      {seq(5.0, 7.3, <ECG />)}
      {seq(13.2, 14.1, <Laser />)}
      {seq(23.95, 28.2, <Fire dur={fr(4.25)} />)}
      {BEATS.map((b, i) => seq(b.from, b.to, <Keyword {...b} v={variant} night={night} />, i))}
      <Flash />
      {music && <Audio src={staticFile("music/bed.wav")} volume={(fq) => MUSIC_VOL * interpolate(fq, [0, 3, 870, 889], [0, 1, 1, 0], C)} />}
      <Grain />
      {SFX.map(([s, file, vol], i) => (
        <Sequence key={`a${i}`} from={fr(s)}><Audio src={staticFile(`sfx/${file}.wav`)} volume={vol} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
