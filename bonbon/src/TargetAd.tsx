// ARAIDAN SYI — Kazakh target (paid ads) video, ~27s, 9:16.
// Full-screen real work footage only: no frames, no beige veils/masks.
// Motion: iris / slice / whip / spin / flash transitions, beat-cut montage, kinetic type, gold confetti, light sweeps.
// Text: the client's 5 Kazakh phrases, spelled exactly (sentence-initial capital on phrase 2).
import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, random, spring, staticFile, useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Grain } from "./Layers";
import { clamp, ease, fonts, springs } from "./theme";

const INK = "#3A2E27";
const ACCENT = "#5E3F30";
// light cream halo behind letters — readable on busy footage, no dark shadow, no mask
const HALO = "0 0 6px rgba(255,251,245,1), 0 0 16px rgba(255,251,245,0.95), 0 0 34px rgba(255,251,245,0.9), 0 0 70px rgba(255,251,245,0.75), 0 0 120px rgba(255,251,245,0.5)";
const GRADE = "saturate(0.92) sepia(0.05) brightness(1.04) contrast(0.98)";
const FORUM = "'Prata', 'Forum', serif";

// ───────────────────────── footage ─────────────────────────
type Enter = "open" | "cut" | "iris" | "slice" | "flash" | "whip" | "spin";
type ShotDef = { at: number; len: number; enter: Enter; video?: string; image?: string; start?: number; rate?: number;
  from?: number; to?: number; origin?: string; iris?: [number, number] };
const OVER = 16; // frames an animated entrance overlaps the previous shot

const SHOTS: ShotDef[] = [
  { at: 0, len: 128, enter: "open", video: "w9088", start: 1.0, rate: 0.5, from: 1.12, to: 1.02, origin: "35% 55%" },
  { at: 128, len: 72, enter: "iris", video: "w9253", start: 0.4, rate: 0.6, from: 1.1, to: 1.03, origin: "50% 40%", iris: [55, 48] },
  { at: 200, len: 70, enter: "slice", video: "w9620", start: 0.3, rate: 0.6, from: 1.12, to: 1.04 },
  { at: 270, len: 102, enter: "flash", video: "w9529", start: 0.3, rate: 0.6, from: 1.04, to: 1.14, origin: "45% 45%" },
  // beat montage: one cut per word «Түсі, / пішіні, / безендірілуі —»
  { at: 372, len: 22, enter: "cut", video: "w9688", start: 5.2, rate: 0.6, from: 1.14, to: 1.08 },
  { at: 394, len: 22, enter: "cut", video: "w9173", start: 1.2, rate: 0.6, from: 1.14, to: 1.08 },
  { at: 416, len: 22, enter: "cut", video: "w9253", start: 3.0, rate: 0.6, from: 1.14, to: 1.08 },
  { at: 438, len: 64, enter: "cut", image: "work/kemel.jpg", from: 1.16, to: 1.04, origin: "45% 55%" },
  { at: 502, len: 76, enter: "whip", video: "w9688", start: 0.2, rate: 0.6, from: 1.04, to: 1.12, origin: "40% 40%" },
  { at: 578, len: 74, enter: "spin", video: "w9620", start: 2.5, rate: 0.6, from: 1.55, to: 1.3, origin: "38% 62%" },
  { at: 652, len: 158, enter: "flash", image: "work/mirrors-sun.jpg", from: 1.03, to: 1.14, origin: "60% 40%" },
];
export const TARGET_DURATION = 810;

const Media: React.FC<{ s: ShotDef }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const k = interpolate(f, [0, durationInFrames], [0, 1], { ...clamp, easing: ease.inOut });
  const scale = (s.from ?? 1.05) + ((s.to ?? 1.1) - (s.from ?? 1.05)) * k;
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", filter: GRADE,
    transformOrigin: s.origin ?? "50% 50%", transform: `scale(${scale})` };
  return s.video
    ? <OffthreadVideo src={staticFile(`work/${s.video}.mp4`)} startFrom={Math.round((s.start ?? 0) * fps)}
        playbackRate={s.rate ?? 0.6} muted style={style} />
    : <Img src={staticFile(s.image!)} style={style} />;
};

const Shot: React.FC<{ s: ShotDef }> = ({ s }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, OVER], [0, 1], { ...clamp, easing: ease.inOut });
  const full: React.CSSProperties = { overflow: "hidden" };
  switch (s.enter) {
    case "open": { // opening: fast zoom-out from a blurred close-up
      const o = interpolate(f, [0, 22], [0, 1], { ...clamp, easing: ease.out });
      return <AbsoluteFill style={{ ...full, transform: `scale(${1.45 - 0.45 * o})`, filter: `blur(${(1 - o) * 14}px)` }}>
        <Media s={s} /></AbsoluteFill>;
    }
    case "iris": { // circle opens from a point
      const [x, y] = s.iris ?? [50, 50];
      return <AbsoluteFill style={{ ...full, clipPath: `circle(${t * 120}% at ${x}% ${y}%)` }}><Media s={s} /></AbsoluteFill>;
    }
    case "slice": { // three vertical strips slide in, alternating directions
      return <AbsoluteFill>{[0, 1, 2].map((i) => {
        const p = interpolate(f, [i * 3, OVER + i * 3 - 4], [0, 1], { ...clamp, easing: ease.inOut });
        return <AbsoluteFill key={i} style={{ ...full, clipPath: `inset(0 ${100 - (i + 1) * 33.34}% 0 ${i * 33.33}%)`,
          transform: `translateY(${(1 - p) * (i % 2 ? -100 : 100)}%)` }}><Media s={s} /></AbsoluteFill>;
      })}</AbsoluteFill>;
    }
    case "whip": {
      const w = interpolate(f, [0, OVER - 4], [0, 1], { ...clamp, easing: ease.inOut });
      return <AbsoluteFill style={{ ...full, transform: `translateX(${(1 - w) * 100}%)`,
        filter: `blur(${Math.sin(w * Math.PI) * 22}px)` }}><Media s={s} /></AbsoluteFill>;
    }
    case "spin": { // zoom + slight rotation + blur
      return <AbsoluteFill style={{ ...full, opacity: Math.min(1, t * 1.6),
        transform: `rotate(${(1 - t) * -9}deg) scale(${1.35 - 0.35 * t})`, filter: `blur(${(1 - t) * 18}px)` }}>
        <Media s={s} /></AbsoluteFill>;
    }
    case "flash":
      return <AbsoluteFill style={{ ...full, opacity: interpolate(f, [OVER - 10, OVER - 6], [0, 1], clamp) }}><Media s={s} /></AbsoluteFill>;
    default: // hard cut with a scale punch on the beat
      return <AbsoluteFill style={{ ...full, transform: `scale(${interpolate(f, [0, 7], [1.08, 1], { ...clamp, easing: ease.out })})` }}>
        <Media s={s} /></AbsoluteFill>;
  }
};

// Soft white bloom (for "flash" entrances).
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#FFFBF5", pointerEvents: "none",
    opacity: interpolate(f, [0, 6, 22], [0, 0.95, 0], { ...clamp, easing: ease.out }) }} />;
};

// Diagonal band of light sweeping across the whole frame.
const Sweep: React.FC<{ dur?: number }> = ({ dur = 30 }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, dur], [-60, 160], { ...clamp, easing: ease.inOut });
  return <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "soft-light",
    background: `linear-gradient(115deg, transparent ${x - 22}%, rgba(255,255,255,0.95) ${x}%, transparent ${x + 22}%)` }} />;
};

// Elegant gold / blush confetti burst (the 🎉 of phrase 1, done calmly).
const COLORS = ["#C9A55C", "#E3C78A", "#E8B7B5", "#F4E6CF", "#B8955A"];
const Confetti: React.FC<{ x: number; y: number; n?: number }> = ({ x, y, n = 70 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const a = random(`a${i}`) * Math.PI * 2, v = 9 + random(`v${i}`) * 16;
        const t = Math.max(0, f);
        const px = x + Math.cos(a) * v * t * Math.exp(-t / 40) * 2.2 + Math.sin(t / 9 + i) * 10;
        const py = y + Math.sin(a) * v * t * Math.exp(-t / 40) * 2.2 + 0.09 * t * t;
        const size = 8 + random(`s${i}`) * 12;
        const o = interpolate(f, [0, 3, 70, 100], [0, 1, 1, 0], clamp);
        const round = random(`r${i}`) > 0.5;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: size, height: round ? size : size * 0.45,
          borderRadius: round ? "50%" : 2, background: COLORS[i % COLORS.length], opacity: o,
          transform: `rotate(${t * (6 + random(`w${i}`) * 10) + i * 40}deg)` }} />;
      })}
    </AbsoluteFill>
  );
};

// Slow drifting golden sparkles for the finale.
const Sparkles: React.FC<{ n?: number }> = ({ n = 26 }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{Array.from({ length: n }).map((_, i) => {
    const x = random(`sx${i}`) * 1080, y0 = random(`sy${i}`) * 1920, sz = 4 + random(`ss${i}`) * 8;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / (8 + random(`st${i}`) * 10) + i));
    return <div key={i} style={{ position: "absolute", left: x + Math.sin(f / 30 + i) * 20, top: y0 - f * (0.6 + random(`sv${i}`)),
      width: sz, height: sz, borderRadius: "50%", background: "#FFF3D6", opacity: tw * interpolate(f, [0, 20], [0, 0.9], clamp),
      boxShadow: "0 0 12px 4px rgba(233,200,130,0.7)" }} />;
  })}</AbsoluteFill>;
};

// ───────────────────────── kinetic type ─────────────────────────
const exitOf = (f: number, len: number) => interpolate(f, [len - 12, len], [0, 1], { ...clamp, easing: ease.in });

// Words pop in one by one: big scale-down + blur → sharp.
const PopWords: React.FC<{ lines: string[]; size: number; len: number; per?: number; delay?: number; italic?: boolean;
  color?: string }> = ({ lines, size, len, per = 5, delay = 0, italic, color = INK }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = exitOf(f, len);
  let k = 0;
  return (
    <div style={{ textAlign: "center", color, opacity: 1 - out, transform: `scale(${1 + out * 0.08})`, filter: `blur(${out * 8}px)`,
      fontFamily: italic ? fonts.cormorant : FORUM, fontStyle: italic ? "italic" : "normal", fontWeight: italic ? 500 : 400,
      fontSize: size, lineHeight: 1.16, textShadow: HALO }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.26 }}>
          {line.split(" ").map((w, wi) => {
            const s = spring({ frame: f - delay - (k++) * per, fps, config: { damping: 15, stiffness: 160, mass: 0.7 } });
            return <span key={wi} style={{ display: "inline-block", opacity: Math.min(1, s * 1.5),
              transform: `scale(${interpolate(s, [0, 1], [1.8, 1])})`, filter: `blur(${interpolate(s, [0, 1], [10, 0], clamp)}px)` }}>{w}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

// Each line rises out of its own invisible slot (masked line reveal), alternating a small horizontal drift.
const LineRise: React.FC<{ lines: string[]; size: number; len: number; per?: number; delay?: number; italic?: boolean;
  color?: string }> = ({ lines, size, len, per = 9, delay = 0, italic, color = INK }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = exitOf(f, len);
  return (
    <div style={{ textAlign: "center", color, fontFamily: italic ? fonts.cormorant : FORUM, fontStyle: italic ? "italic" : "normal",
      fontWeight: italic ? 500 : 400, fontSize: size, lineHeight: 1.18 }}>
      {lines.map((line, i) => {
        const s = spring({ frame: f - delay - i * per, fps, config: springs.gentle });
        const o = interpolate(f, [len - 14 + i * 2, len - 4 + i * 2], [0, 1], { ...clamp, easing: ease.in });
        return (
          <div key={i} style={{ overflow: "hidden", padding: `${size * 0.12}px ${size * 0.2}px`, margin: `${-size * 0.12}px 0` }}>
            <div style={{ textShadow: HALO, transform: `translateY(${(1 - s) * 110 - o * 110}%) translateX(${(1 - s) * (i % 2 ? 40 : -40)}px)`,
              opacity: 1 - out * 0.2 }}>{line}</div>
          </div>
        );
      })}
    </div>
  );
};

// Letters cascade in with blur (used for short accent lines).
const Letters: React.FC<{ text: string; size: number; delay?: number; italic?: boolean; color?: string }> =
({ text, size, delay = 0, italic, color = ACCENT }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ color, fontFamily: italic ? fonts.cormorant : FORUM, fontStyle: italic ? "italic" : "normal", fontWeight: italic ? 500 : 400,
      fontSize: size, textShadow: HALO, whiteSpace: "pre", textAlign: "center" }}>
      {text.split("").map((c, i) => {
        const s = spring({ frame: f - delay - i * 1.6, fps, config: springs.gentle });
        return <span key={i} style={{ display: "inline-block", opacity: s, filter: `blur(${(1 - s) * 8}px)`,
          transform: `translateY(${(1 - s) * -size * 0.5}px) rotate(${(1 - s) * -12}deg)` }}>{c}</span>;
      })}
    </div>
  );
};

// Phrase 3b: one huge word per beat-cut, then the line settles together.
const BeatWords: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["Түсі,", "пішіні,", "безендірілуі —"];
  const settle = spring({ frame: f - 66, fps, config: springs.gentle }); // after the 3 beats, words shrink into one line
  const out = exitOf(f, len);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {words.map((w, i) => {
        const s = spring({ frame: f - i * 22, fps, config: { damping: 14, stiffness: 180, mass: 0.6 } });
        const solo = i === 2 ? 1 : interpolate(f, [(i + 1) * 22 - 2, (i + 1) * 22 + 4], [1, 0], clamp);
        const big = (1 - settle) * (i === 2 ? 1 : solo);
        if (big <= 0.001 && settle < 0.01) return null;
        return <AbsoluteFill key={i} style={{ justifyContent: "center", alignItems: "center", opacity: (1 - settle) * (i === 2 ? 1 : solo) }}>
          <div style={{ fontFamily: FORUM, fontSize: i === 2 ? 118 : 150, color: INK, textShadow: HALO,
            transform: `scale(${interpolate(s, [0, 1], [2.2, 1])})`, filter: `blur(${(1 - s) * 12}px)`, opacity: Math.min(1, s * 1.4) }}>{w}</div>
        </AbsoluteFill>;
      })}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 260, opacity: settle }}>
        <div style={{ fontFamily: FORUM, fontSize: 70, color: INK, textShadow: HALO, textAlign: "center",
          transform: `scale(${interpolate(settle, [0, 1], [1.25, 1])})` }}>Түсі, пішіні, безендірілуі —</div>
        <div style={{ height: 18 }} />
        <LineRise len={len} size={70} italic color={ACCENT} delay={72} lines={["барлығы сіздің", "таңдауыңыз бойынша!"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Place: React.FC<{ y: "top" | "mid" | "low"; children: React.ReactNode }> = ({ y, children }) => (
  <AbsoluteFill style={{ alignItems: "center", paddingLeft: 60, paddingRight: 60,
    justifyContent: y === "top" ? "flex-start" : y === "mid" ? "center" : "flex-end",
    paddingTop: y === "top" ? 250 : 0, paddingBottom: y === "low" ? 420 : 0 }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>{children}</div>
  </AbsoluteFill>
);

// ───────────────────────── finale ─────────────────────────
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f - 62, fps, config: { damping: 13, stiffness: 120, mass: 0.8 } });
  const h = spring({ frame: f - 80, fps, config: springs.soft });
  const line = interpolate(f, [86, 112], [0, 380], { ...clamp, easing: ease.out });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 230, paddingLeft: 30, paddingRight: 30 }}>
      <LineRise len={9999} size={64} delay={6} lines={["Қонақтарыңызға ерекше", "естелік сыйлағыңыз келсе,"]} />
      <div style={{ height: 8 }} />
      <Letters text="маған жазыңыз" size={110} italic delay={30} />
      <div style={{ marginTop: 50, opacity: Math.min(1, logo * 1.3), transform: `scale(${interpolate(logo, [0, 1], [0.6, 1])})`,
        filter: `blur(${interpolate(logo, [0, 1], [10, 0], clamp)}px) drop-shadow(0 0 16px rgba(255,251,245,0.95)) drop-shadow(0 0 30px rgba(255,251,245,0.8))` }}>
        <Img src={staticFile("real/logo.png")} style={{ width: 640 }} />
      </div>
      <div style={{ marginTop: 22, fontFamily: FORUM, fontSize: 44, letterSpacing: "0.14em", color: INK, textShadow: HALO,
        opacity: h, transform: `translateY(${interpolate(h, [0, 1], [14, 0])}px)` }}>@araidan_syi</div>
      <div style={{ marginTop: 10, height: 2, width: line, background: "#C9A55C", boxShadow: "0 0 10px rgba(255,251,245,0.9)" }} />
    </AbsoluteFill>
  );
};

// ───────────────────────── timeline ─────────────────────────
type TextDef = { at: number; len: number; node: (len: number) => React.ReactNode };
const TEXTS: TextDef[] = [
  { at: 14, len: 112, node: (len) => <Place y="top">
    <PopWords len={len} size={90} per={6} lines={["Тойыңызға ерекше", "бір сән қосқыңыз", "келе ме?"]} />
  </Place> },
  { at: 140, len: 126, node: (len) => <Place y="top">
    <LineRise len={len} size={74} delay={4} lines={["Сіздің мерекеңіздің", "сәнін келтіретін", "ерекше бонбоньерки", "ұсынамыз!"]} />
  </Place> },
  { at: 280, len: 90, node: (len) => <Place y="top">
    <PopWords len={len} size={68} per={4} delay={4} lines={["Әр тапсырысты сіздің", "қалауыңызға сай жеке", "дизайнмен дайындаймыз."]} />
  </Place> },
  { at: 372, len: 130, node: (len) => <BeatWords len={len} /> },
  { at: 510, len: 138, node: (len) => <Place y="top">
    <LineRise len={len} size={70} delay={4} lines={["Әрбір бұйымды", "үлкен ықыласпен,", "әрбір бөлшегіне", "мән беріп жасаймыз."]} />
  </Place> },
];

const Sound: React.FC = () => {
  const { fps } = useVideoConfig();
  const vol = (f: number) => Math.min(interpolate(f, [0, 6], [0, 0.9], clamp),
    interpolate(f, [TARGET_DURATION - 1.5 * fps, TARGET_DURATION], [0.9, 0], clamp));
  return (
    <>
      <Audio src={staticFile("audio/music.wav")} volume={vol} />
      <Audio src={staticFile("audio/air.wav")} volume={0.05} />
      {SHOTS.filter((s) => ["iris", "slice", "whip", "spin"].includes(s.enter)).map((s) => (
        <Sequence key={s.at} from={s.at - OVER + 2} durationInFrames={40}><Audio src={staticFile("audio/swish.wav")} volume={0.26} /></Sequence>
      ))}
      {SHOTS.filter((s) => s.enter === "cut").map((s) => (
        <Sequence key={`c${s.at}`} from={s.at - 2} durationInFrames={20}><Audio src={staticFile("audio/swish.wav")} volume={0.12} /></Sequence>
      ))}
      {[95, 652, 720].map((at) => (
        <Sequence key={`sh${at}`} from={at} durationInFrames={2 * fps}><Audio src={staticFile("audio/shimmer.wav")} volume={0.24} /></Sequence>
      ))}
    </>
  );
};

export const TargetAd: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFFBF5" }}>
    {SHOTS.map((s, i) => {
      const lead = s.enter === "open" || s.enter === "cut" ? 0 : OVER;
      const next = SHOTS[i + 1];
      const tail = next && next.enter !== "cut" ? OVER : 0;
      return (
        <Sequence key={i} from={s.at - lead} durationInFrames={s.len + lead + tail}>
          <Shot s={s} />
        </Sequence>
      );
    })}
    {SHOTS.filter((s) => s.enter === "flash").map((s) => (
      <Sequence key={`fl${s.at}`} from={s.at - OVER + 4} durationInFrames={26}><Flash /></Sequence>
    ))}
    <Grain />
    {[40, 300, 530, 700].map((at) => <Sequence key={`sw${at}`} from={at} durationInFrames={34}><Sweep /></Sequence>)}
    {TEXTS.map((t, i) => (
      <Sequence key={i} from={t.at} durationInFrames={t.len}>{t.node(t.len)}</Sequence>
    ))}
    <Sequence from={92} durationInFrames={110}><Confetti x={540} y={560} /></Sequence>
    <Sequence from={660}><Sparkles /></Sequence>
    <Sequence from={662}><Cta /></Sequence>
    <Sound />
  </AbsoluteFill>
);
