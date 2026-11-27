import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { theme } from "./theme";
import { Icon, IconName } from "./Icons";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- camera: punch-ins on the beats (seconds, scale, originX%, originY%)
const CAM: [number, number, number, number][] = [
  [0, 1.0, 50, 38], [0.7, 1.05, 50, 38], [2.0, 1.05, 50, 38], [2.2, 1.14, 50, 36],
  [3.3, 1.14, 50, 36], [3.55, 1.0, 50, 38], [6.2, 1.02, 50, 38], [6.4, 1.08, 50, 36],
  [9.5, 1.09, 50, 36], [9.9, 1.0, 50, 40], [13.2, 1.01, 50, 40], [13.45, 1.13, 22, 46],
  [15.4, 1.15, 22, 46], [15.7, 1.03, 50, 40], [18.9, 1.04, 50, 38], [19.1, 1.11, 45, 36],
  [20.5, 1.12, 45, 36], [20.8, 1.02, 50, 40], [22.4, 1.03, 50, 40], [22.6, 1.1, 48, 36],
  [23.8, 1.1, 48, 36], [24.05, 1.02, 50, 40], [28.1, 1.08, 50, 38], [28.4, 1.03, 50, 40], [29.7, 1.05, 50, 40],
];
const Footage: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  let i = 0;
  while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const [t0, s0, x0, y0] = CAM[i];
  const [t1, s1, x1, y1] = CAM[i + 1];
  const p = interpolate(t, [t0, t1], [0, 1], { ...C, easing: theme.ease.inOut });
  const s = s0 + (s1 - s0) * p, ox = x0 + (x1 - x0) * p, oy = y0 + (y1 - y0) * p;
  return (
    <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${ox}% ${oy}%` }}>
      <OffthreadVideo src={staticFile("clip.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.92) contrast(1.04)" }} />
    </AbsoluteFill>
  );
};

const co2 = (w: string) => w.includes("CO2")
  ? <>{w.split("CO2")[0]}CO<span style={{ fontSize: "0.6em", verticalAlign: "-0.12em" }}>2</span>{w.split("CO2")[1]}</>
  : w;

// ---------- keyword block (top zone, over the clean wall)
type KW = { from: number; to: number; words: string; label?: string; icon?: IconName; card?: boolean; size?: number };
const Keyword: React.FC<KW> = ({ from, to, words, label, icon, card, size = 116 }) => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const dur = (to - from) * fps;
  const exit = interpolate(f, [dur - 9, dur], [1, 0], { ...C, easing: theme.ease.in });
  const breathe = 1 + Math.sin(f / 14) * 0.006;
  const enter = spring({ frame: f, fps, config: theme.spring.smooth });
  const line = interpolate(f, [6, 30], [0, 1], { ...C, easing: theme.ease.out });
  const parts = words.split(" ");
  const body = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      {icon && <div style={{ marginBottom: 6 }}><Icon name={icon} start={0} size={110} /></div>}
      {label && (
        <div style={{ fontFamily: theme.fonts.sans, fontWeight: 500, fontSize: 30, letterSpacing: "0.32em", textTransform: "uppercase", color: theme.colors.gold,
          opacity: interpolate(f, [2, 16], [0, 1], C), transform: `translateY(${interpolate(f, [2, 18], [14, 0], { ...C, easing: theme.ease.out })}px)` }}>{co2(label)}</div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 26, maxWidth: 900 }}>
        {parts.map((w, i) => {
          const s = spring({ frame: f - 4 - i * 5, fps, config: theme.spring.snappy });
          return (
            <span key={i} style={{ fontFamily: theme.fonts.serif, fontStyle: "italic", fontWeight: 600, fontSize: size, lineHeight: 1.02, color: theme.colors.navy,
              display: "inline-block", opacity: s, filter: `blur(${(1 - s) * 8}px)`, transform: `translateY(${(1 - s) * 40}px) scale(${0.94 + s * 0.06})` }}>{co2(w)}</span>
          );
        })}
      </div>
      <div style={{ height: 2, width: 420 * line, background: `linear-gradient(90deg, transparent, ${theme.colors.gold}, transparent)`, marginTop: 4 }} />
    </div>
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 210, opacity: exit, transform: `translateY(${(1 - enter) * 30 - (1 - exit) * 24}px) scale(${breathe})` }}>
      {card ? (
        <div style={{ padding: "44px 70px 50px", background: theme.colors.card, backdropFilter: "blur(14px)", border: `1.5px solid ${theme.colors.goldSoft}`, borderRadius: 6,
          clipPath: `inset(0 ${(1 - enter) * 50}% 0 ${(1 - enter) * 50}%)` }}>{body}</div>
      ) : body}
    </AbsoluteFill>
  );
};

// ---------- gold dust (rising) for "ғарышқа"
const Dust: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 12, dur - 12, dur], [0, 1, 1, 0], C);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      {new Array(46).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 1080, sp = 2 + random(`s${i}`) * 5, r = 2 + random(`r${i}`) * 4;
        const y = 1900 - ((f * sp + random(`y${i}`) * 1900) % 1900);
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 9 + i));
        return <div key={i} style={{ position: "absolute", left: x + Math.sin(f / 20 + i) * 14, top: y, width: r, height: r, borderRadius: r,
          background: theme.colors.warm, boxShadow: `0 0 ${r * 3}px ${theme.colors.warm}`, opacity: tw }} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- soft warm light sweep on section changes
const Sweep: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 16], [-120, 120], { ...C, easing: theme.ease.inOut });
  const a = interpolate(f, [0, 6, 16], [0, 0.55, 0], C);
  return <AbsoluteFill style={{ mixBlendMode: "screen", opacity: a,
    background: `linear-gradient(115deg, transparent ${30 + x / 3}%, rgba(255,225,180,0.9) ${50 + x / 3}%, transparent ${70 + x / 3}%)` }} />;
};

const Grade: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const night = interpolate(t, [23.9, 24.6, 28.0, 28.4], [0, 1, 1, 0], C); // warmer, deeper "nights"
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "#E8D2B0", mixBlendMode: "soft-light", opacity: 0.22 }} />
      <AbsoluteFill style={{ background: "#7A4A2A", mixBlendMode: "soft-light", opacity: 0.35 * night }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 55%, rgba(30,24,20,0.28) 100%)" }} />
    </AbsoluteFill>
  );
};
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return <AbsoluteFill style={{ backgroundImage: noise, backgroundSize: "220px", backgroundPosition: `${(f * 7) % 220}px ${(f * 13) % 220}px`, opacity: 0.06, mixBlendMode: "multiply" }} />;
};

// ---------- timeline (seconds, matched to the burned-in subtitles)
export const BEATS: KW[] = [
  { from: 0.15, to: 1.95, words: "Возбуждение бар,", size: 104 },
  { from: 2.0, to: 3.35, words: "оргазм жоқ?", label: "мәселе", size: 132 },
  { from: 6.2, to: 7.2, words: "оятатын", icon: "rings" },
  { from: 7.25, to: 9.7, words: "сезімдерді лапылдататын", icon: "flame", size: 104 },
  { from: 10.2, to: 13.15, words: "ғарышқа ұшыратын", icon: "orbit" },
  { from: 13.25, to: 15.3, words: "сужение · омоложение", label: "CO2 лазер", card: true, size: 84 },
  { from: 16.7, to: 18.7, words: "қалыпқа келтіріп", label: "шырышты қабат", icon: "check", size: 104 },
  { from: 19.0, to: 20.45, words: "точка G", icon: "target", size: 140 },
  { from: 21.0, to: 22.45, words: "плазма", label: "келесі қадам", icon: "drop", size: 140 },
  { from: 22.5, to: 23.75, words: "от боп лапылдайсыз", icon: "flame", size: 104 },
  { from: 24.0, to: 25.4, words: "от түндер", icon: "moon", size: 132 },
  { from: 26.2, to: 28.15, words: "шоқ түндер сізді күтеді", icon: "moon", size: 100 },
  { from: 28.25, to: 29.63, words: "CO2 кейін", label: "нәтиже", card: true, size: 120 },
];
const SWEEPS = [10.15, 13.2, 21.0, 28.2];

export const Reel: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Footage />
      <Grade />
      <Sequence from={Math.round(10.2 * fps)} durationInFrames={Math.round(2.95 * fps)}><Dust dur={Math.round(2.95 * fps)} /></Sequence>
      {BEATS.map((b, i) => (
        <Sequence key={i} from={Math.round(b.from * fps)} durationInFrames={Math.round((b.to - b.from) * fps)}><Keyword {...b} /></Sequence>
      ))}
      {SWEEPS.map((s, i) => <Sequence key={i} from={Math.round(s * fps)} durationInFrames={18}><Sweep /></Sequence>)}
      <Grain />
    </AbsoluteFill>
  );
};
