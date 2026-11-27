// ARAIDAN SYI — Kazakh target ad, v5 (20s, 9:16): 1s bright product hook, faster envelope, text inside Reels safe zone.
// Opening: an envelope on a plain blush background opens and a letter with phrase 1 slides out.
// Then full-screen footage with motion transitions; every phrase sits in an ivory card with a gold frame that draws itself.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Confetti, Flash, OVER, Shot, ShotDef, Sparkles, Sweep } from "./TargetAd";
import { Grain } from "./Layers";
import { clamp, ease } from "./theme";
import "./FontSystems"; // registers Montserrat

const INK = "#3A2C25";
const ACC = "#7B4E3C";
const GOLD = "#C29B55";
const CARD = "rgba(255,251,246,0.94)";
// Font system E: Asylbek (script, emotional lines) + Montserrat Light (quiet lines). Asylbek lacks — and …, Cormorant fills in.
const SCRIPT = "'Asylbek Shelley', 'Cormorant Garamond', serif";
const BODY = "Montserrat, sans-serif";
const BLUSH = "#F1DFD6";

// ───────────────────────── text pieces ─────────────────────────
// Words rise in one by one (blur → sharp).
const Words: React.FC<{ lines: string[]; size: number; delay?: number; per?: number; italic?: boolean; color?: string;
  weight?: number }> = ({ lines, size, delay = 0, per = 3, italic, color = INK, weight = 300 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let k = 0;
  return (
    <div style={{ fontFamily: italic ? SCRIPT : BODY, fontWeight: italic ? 400 : weight, fontSize: size,
      lineHeight: italic ? 1.3 : 1.35, letterSpacing: italic ? 0 : "0.04em", color, textAlign: "center" }}>
      {lines.map((l, li) => (
        <div key={li} style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.25 }}>
          {l.split(" ").map((w, wi) => {
            const s = spring({ frame: f - delay - (k++) * per, fps, config: { damping: 18, stiffness: 140, mass: 0.7 } });
            return <span key={wi} style={{ display: "inline-block", opacity: Math.min(1, s * 1.4),
              transform: `translateY(${(1 - s) * size * 0.45}px)`, filter: `blur(${Math.max(0, 1 - s) * 8}px)` }}>{w}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

// Letters appear one after another like handwriting.
const Handwrite: React.FC<{ lines: string[]; size: number; delay?: number; speed?: number; color?: string }> =
({ lines, size, delay = 0, speed = 1.1, color = INK }) => {
  const f = useCurrentFrame();
  let k = 0;
  return (
    <div style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: size, lineHeight: 1.35, color, textAlign: "center" }}>
      {lines.map((l, li) => (
        <div key={li} style={{ whiteSpace: "pre" }}>
          {l.split("").map((c, ci) => {
            const t = interpolate(f, [delay + (k++) * speed, delay + k * speed + 8], [0, 1], { ...clamp, easing: ease.out });
            return <span key={ci} style={{ display: "inline-block", opacity: t, filter: `blur(${(1 - t) * 6}px)`,
              transform: `translateY(${(1 - t) * 10}px) scale(${0.85 + 0.15 * t})` }}>{c}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

// Gold frame that draws itself from the centres of each edge.
const GoldFrame: React.FC<{ delay: number; inset?: number }> = ({ delay, inset = 14 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 26], [0, 1], { ...clamp, easing: ease.out });
  const edge = (st: React.CSSProperties) => <div style={{ position: "absolute", background: GOLD, ...st }} />;
  return (
    <div style={{ position: "absolute", inset, pointerEvents: "none" }}>
      {edge({ top: 0, left: `${50 - p * 50}%`, width: `${p * 100}%`, height: 1.6 })}
      {edge({ bottom: 0, left: `${50 - p * 50}%`, width: `${p * 100}%`, height: 1.6 })}
      {edge({ left: 0, top: `${50 - p * 50}%`, height: `${p * 100}%`, width: 1.6 })}
      {edge({ right: 0, top: `${50 - p * 50}%`, height: `${p * 100}%`, width: 1.6 })}
      <div style={{ position: "absolute", top: -15, left: "50%", transform: `translateX(-50%) scale(${p}) rotate(${(1 - p) * 90}deg)`,
        background: CARD, padding: "0 12px", color: GOLD, fontSize: 26, lineHeight: "30px" }}>✦</div>
    </div>
  );
};

type CardIn = "rise" | "flip" | "unfold" | "slide";
// Ivory card with gold frame; several entrance styles; soft exit.
// Compact card kept to the top (or bottom) band so the bonbonnieres stay visible.
const Card: React.FC<{ enter: CardIn; len: number; children: React.ReactNode; width?: number; pos?: "top" | "bottom" }> =
({ enter, len, children, width, pos = "bottom" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 17, stiffness: 120, mass: 0.8 } });
  const out = interpolate(f, [len - 12, len], [0, 1], { ...clamp, easing: ease.in });
  const tr: Record<CardIn, string> = {
    rise: `translateY(${(1 - s) * 160}px) scale(${0.9 + 0.1 * s})`,
    flip: `perspective(1400px) rotateY(${(1 - s) * -80}deg)`,
    unfold: `perspective(1400px) rotateX(${(1 - s) * 85}deg)`,
    slide: `translateX(${(1 - s) * -1100}px) rotate(${(1 - s) * -6}deg)`,
  };
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: pos === "top" ? "flex-start" : "flex-end",
      paddingTop: pos === "top" ? 290 : 0, paddingBottom: pos === "bottom" ? 690 : 0 }}>
      <div style={{ position: "relative", width, maxWidth: 880, background: CARD, borderRadius: 12, padding: "40px 50px 34px",
        boxShadow: "0 24px 60px rgba(120,80,60,0.18)", opacity: Math.min(1, s * 2) * (1 - out),
        transform: `${tr[enter]} translateY(${-out * 40}px) scale(${1 - out * 0.05})`, transformOrigin: enter === "unfold" ? "50% 0%" : "50% 50%" }}>
        <GoldFrame delay={8} inset={10} />
        {children}
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── opening: envelope → letter ─────────────────────────
const EW = 820, EH = 540;
const K = 2.6; // envelope plays 2.6x faster than in v2 (~2.5s in total)
const Envelope: React.FC = () => {
  const raw = useCurrentFrame();
  const f = raw * K;
  const { fps } = useVideoConfig();
  const inS = spring({ frame: f, fps, config: { damping: 16, stiffness: 90, mass: 0.9 } });
  const seal = interpolate(f, [30, 42], [1, 0], { ...clamp, easing: ease.in });
  const sealPulse = 1 + Math.sin(interpolate(f, [18, 32], [0, Math.PI], clamp)) * 0.12;
  const flap = interpolate(f, [38, 60], [0, 180], { ...clamp, easing: ease.inOut });
  const rise = interpolate(f, [54, 84], [0, 1], { ...clamp, easing: ease.out });
  const drop = interpolate(f, [80, 104], [0, 1], { ...clamp, easing: ease.in });
  const center = interpolate(f, [82, 108], [0, 1], { ...clamp, easing: ease.inOut });
  const zoom = interpolate(f, [172, 192], [0, 1], { ...clamp, easing: ease.in });
  const ex = (1080 - EW) / 2, ey = 1000;
  // letter: starts inside envelope, rises out, then moves to screen centre and grows
  const LW = 740, LH = 560;
  const lx = ex + (EW - LW) / 2, ly0 = ey + 40;
  const ly = ly0 - rise * 380;
  const scale = 1 + center * 0.36;
  const cy = interpolate(center, [0, 1], [ly, (1920 - LH) / 2 - 80]);
  const envOff = (1 - inS) * 1100 + drop * 1300;
  const clipB = Math.max(0, cy + LH - (ey + envOff + EH - 8));
  const letter = (
    <div style={{ position: "absolute", left: lx, top: cy, width: LW, height: LH, background: "#FFFCF7", borderRadius: 10,
      clipPath: `inset(0 0 ${clipB}px 0)`,
      boxShadow: `0 ${10 + center * 30}px ${30 + center * 50}px rgba(120,80,60,${0.12 + center * 0.1})`,
      transform: `scale(${scale}) rotate(${(1 - center) * -2}deg)`, transformOrigin: "50% 50%", zIndex: 3 }}>
      <GoldFrame delay={86 / K} inset={18} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 40 }}>
        <Handwrite lines={["Тойыңызға ерекше", "бір сән қосқыңыз", "келе ме?"]} size={88} delay={28} speed={0.28} />
      </AbsoluteFill>
    </div>
  );
  const env: React.CSSProperties = { position: "absolute", left: ex, top: ey, width: EW, height: EH };
  const envMove = `translateY(${envOff}px) rotate(${(1 - inS) * -5}deg)`;
  return (
    <AbsoluteFill style={{ background: BLUSH, transform: `scale(${1 + zoom * 1.6})`, opacity: (1 - zoom) * interpolate(raw, [0, 6], [0, 1], clamp), filter: `blur(${zoom * 10}px)` }}>
      {/* soft drifting light on the plain background */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${40 + Math.sin(f / 25) * 12}% ${30 + Math.cos(f / 30) * 8}%, rgba(255,246,236,0.9), transparent 55%)` }} />
      <Sparkles n={22} />
      {/* back + flap (when open the flap sits behind the letter) */}
      <div style={{ ...env, transform: envMove }}>
        <div style={{ position: "absolute", inset: 0, background: "#EADBCB", borderRadius: 12 }} />
      </div>
      {flap > 90 && <div style={{ ...env, transform: envMove, perspective: 1600 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: EW, height: EH * 0.62, background: "#F3E8DC",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)", transformOrigin: "50% 0%", transform: `rotateX(${flap}deg)` }} />
      </div>}
      {drop < 1 && f > 50 && letter}
      {/* front pocket with V-notch */}
      <div style={{ ...env, transform: envMove, zIndex: 4 }}>
        <div style={{ position: "absolute", inset: 0, background: "#F7EEE4", borderRadius: 12,
          clipPath: "polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)", boxShadow: "inset 0 0 0 1px #E6D5C3" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: SCRIPT,
          fontSize: 54, color: "#A58564" }}>Araidan Syi</div>
      </div>
      {flap <= 90 && <div style={{ ...env, transform: envMove, perspective: 1600, zIndex: 5 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: EW, height: EH * 0.62, background: "#F3E8DC",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)", transformOrigin: "50% 0%", transform: `rotateX(${flap}deg)`,
          filter: "drop-shadow(0 4px 6px rgba(120,80,60,0.15))" }} />
        {/* wax seal */}
        <div style={{ position: "absolute", left: EW / 2 - 62, top: EH * 0.62 - 70, width: 124, height: 124, borderRadius: "50%",
          background: "radial-gradient(circle at 38% 34%, #F4B7C2, #DC7F93 60%, #C4687D)", opacity: seal,
          transform: `scale(${sealPulse * (1 + (1 - seal) * 0.4)})`, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 10px rgba(150,70,90,0.25)", color: "#F9DDE3", fontSize: 60 }}>♥</div>
      </div>}
      {drop >= 1 && letter}
      <Sequence from={48} durationInFrames={90}><Confetti x={540} y={720} n={80} /></Sequence>
    </AbsoluteFill>
  );
};

// ───────────────────────── beat tags for «Түсі, пішіні, безендірілуі —» ─────────────────────────
const Tag: React.FC<{ text: string; rot: number; x: number; y: number; delay: number }> = ({ text, rot, x, y, delay }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 9, stiffness: 140, mass: 0.6 } });
  const swing = Math.sin((f - delay) / 7) * 3 * Math.exp(-(f - delay) / 40);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${s}) rotate(${rot + swing}deg)`,
      opacity: Math.min(1, s * 2), background: CARD, borderRadius: 12, padding: "16px 36px", boxShadow: "0 18px 40px rgba(120,80,60,0.18)" }}>
      <div style={{ position: "absolute", inset: 7, border: `1.5px solid ${GOLD}`, borderRadius: 7 }} />
      <div style={{ fontFamily: SCRIPT, fontSize: 70, color: INK, whiteSpace: "nowrap", lineHeight: 1.3 }}>{text}</div>
    </div>
  );
};
const BeatTags: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const merge = interpolate(f, [54, 66], [0, 1], { ...clamp, easing: ease.in });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - merge, transform: `scale(${1 - merge * 0.2})` }}>
        <Tag text="Түсі," rot={-6} x={300} y={940} delay={0} />
        <Tag text="пішіні," rot={5} x={770} y={1050} delay={20} />
        <Tag text="безендірілуі —" rot={-3} x={450} y={1165} delay={40} />
      </AbsoluteFill>
      <Sequence from={60}>
        <Card enter="rise" len={len - 60}>
          <Words lines={["Түсі, пішіні, безендірілуі —"]} size={34} per={2} />
          <div style={{ height: 14 }} />
          <Words lines={["барлығы сіздің", "таңдауыңыз бойынша!"]} size={72} italic delay={6} per={2} />
        </Card>
      </Sequence>
    </AbsoluteFill>
  );
};

// ───────────────────────── finale ─────────────────────────
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f - 6, fps, config: { damping: 12, stiffness: 110, mass: 0.8 } });
  const pill = spring({ frame: f - 40, fps, config: { damping: 12, stiffness: 120 } });
  const pulse = 1 + Math.max(0, Math.sin((f - 48) / 7)) * 0.04 * (f > 48 ? 1 : 0);
  const ring = ((f - 48) % 30) / 30;
  return (
    <Card enter="unfold" len={9999} width={800}>
      <div style={{ display: "flex", justifyContent: "center", opacity: Math.min(1, logo * 1.4),
        transform: `scale(${0.6 + 0.4 * logo})` }}>
        <Img src={staticFile("real/logo.png")} style={{ width: 380 }} />
      </div>
      <div style={{ height: 16 }} />
      <Words lines={["Қонақтарыңызға ерекше", "естелік сыйлағыңыз келсе,"]} size={34} delay={12} per={2} />
      <div style={{ height: 6 }} />
      <Handwrite lines={["маған жазыңыз"]} size={80} delay={24} speed={0.9} />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
        <div style={{ position: "relative", transform: `scale(${pill * pulse})`, opacity: Math.min(1, pill * 2) }}>
          {f > 48 && <div style={{ position: "absolute", inset: -ring * 22, borderRadius: 60, border: `2px solid ${GOLD}`, opacity: 1 - ring }} />}
          <div style={{ background: GOLD, color: "#FFFCF7", borderRadius: 60, padding: "12px 38px", fontFamily: BODY,
            fontWeight: 500, fontSize: 30, letterSpacing: "0.12em" }}>@araidan_syi</div>
        </div>
      </div>
    </Card>
  );
};

// ───────────────────────── timeline (20s) ─────────────────────────
const ENV_AT = 30;          // envelope starts after the 1s hook
const ENV_LEN = 76;         // letter readable ~1s, then zooms away
const SHOTS: ShotDef[] = [
  // 0–1s hook: bright, colourful bonbonnieres, sharp from frame 0
  { at: 0, len: 36, enter: "cut", video: "w9688", start: 5.2, rate: 0.6, from: 1.22, to: 1.04, origin: "50% 45%" },
  { at: 96, len: 74, enter: "open", video: "w9088", start: 1.0, rate: 0.5, from: 1.12, to: 1.02, origin: "35% 55%" },
  { at: 170, len: 60, enter: "slice", video: "w9253", start: 0.4, rate: 0.6, from: 1.1, to: 1.03, origin: "50% 40%" },
  { at: 230, len: 70, enter: "flash", video: "w9529", start: 0.3, rate: 0.6, from: 1.04, to: 1.14, origin: "45% 45%" },
  { at: 300, len: 20, enter: "cut", video: "w9173", start: 1.2, rate: 0.6, from: 1.14, to: 1.08 },
  { at: 320, len: 20, enter: "cut", video: "w9088", start: 7.0, rate: 0.6, from: 1.14, to: 1.08 },
  { at: 340, len: 20, enter: "cut", video: "w9620", start: 0.3, rate: 0.6, from: 1.14, to: 1.06 },
  { at: 360, len: 70, enter: "cut", image: "work/kemel.jpg", from: 1.16, to: 1.04, origin: "45% 55%" },
  { at: 430, len: 50, enter: "whip", video: "w9688", start: 0.2, rate: 0.6, from: 1.04, to: 1.12, origin: "40% 40%" },
  { at: 480, len: 36, enter: "spin", video: "w9620", start: 2.5, rate: 0.6, from: 1.55, to: 1.3, origin: "38% 62%" },
  { at: 516, len: 84, enter: "flash", image: "work/mirrors-sun.jpg", from: 1.03, to: 1.12, origin: "60% 40%" },
];
export const TARGET3_DURATION = 600;

const Sound: React.FC = () => {
  const { fps } = useVideoConfig();
  const sw = (at: number, v = 0.25) => <Sequence key={`sw${at}`} from={at} durationInFrames={40}><Audio src={staticFile("audio/swish.wav")} volume={v} /></Sequence>;
  const sh = (at: number, v = 0.24) => <Sequence key={`sh${at}`} from={at} durationInFrames={2 * fps}><Audio src={staticFile("audio/shimmer.wav")} volume={v} /></Sequence>;
  return (
    <>
      <Audio src={staticFile("audio/air.wav")} volume={0.05} />
      {sh(0, 0.18)}{sw(22, 0.2)}
      {[0, 38, 56, 82, 130].map((a) => sw(ENV_AT + Math.round(a / K), 0.2))}
      {sh(ENV_AT + 12, 0.2)}{sh(ENV_AT + 46)}
      {SHOTS.filter((s) => ["slice", "whip", "spin"].includes(s.enter)).map((s) => sw(s.at - OVER + 2))}
      {[300, 320, 340].map((a) => sw(a - 2, 0.12))}
      {sh(516)}{sh(560, 0.18)}
    </>
  );
};

export const TargetAd3: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFFBF5" }}>
    {/* footage lifted ~125px so the products sit above the bottom text band */}
    <AbsoluteFill style={{ transform: "scale(1.14) translateY(-110px)" }}>
      {SHOTS.map((s, i) => i === 0 ? null : (() => {
        const lead = s.enter === "open" || s.enter === "cut" ? 0 : OVER;
        const next = SHOTS[i + 1];
        const tail = next && next.enter !== "cut" ? OVER : 0;
        return <Sequence key={i} from={s.at - lead} durationInFrames={s.len + lead + tail}><Shot s={s} /></Sequence>;
      })())}
    </AbsoluteFill>
    {/* the 1s hook stays unlifted (no text over it) */}
    <Sequence from={0} durationInFrames={SHOTS[0].len}><Shot s={SHOTS[0]} /></Sequence>
    {SHOTS.filter((s) => s.enter === "flash").map((s) => (
      <Sequence key={`fl${s.at}`} from={s.at - OVER + 4} durationInFrames={26}><Flash /></Sequence>
    ))}
    <Sequence from={20} durationInFrames={26}><Flash /></Sequence>
    <Grain />
    {[2, 180, 432, 524].map((at) => <Sequence key={`swp${at}`} from={at} durationInFrames={34}><Sweep /></Sequence>)}
    <Sequence from={96} durationInFrames={504}><Sparkles n={14} /></Sequence>

    {/* phrase cards — at the bottom of the Reels safe zone (bottom edge ≤ y 1230, above caption/CTA UI) */}
    <Sequence from={106} durationInFrames={122}>
      <Card enter="rise" len={122}>
        <Words lines={["Сіздің мерекеңіздің", "сәнін келтіретін"]} size={34} delay={4} per={2} />
        <div style={{ height: 8 }} />
        <Words lines={["ерекше бонбоньерки", "ұсынамыз!"]} size={72} italic delay={12} per={2} />
      </Card>
    </Sequence>
    <Sequence from={232} durationInFrames={70}>
      <Card enter="flip" len={70}>
        <Words lines={["Әр тапсырысты сіздің", "қалауыңызға сай"]} size={34} delay={4} per={2} />
        <div style={{ height: 8 }} />
        <Words lines={["жеке дизайнмен", "дайындаймыз."]} size={72} italic delay={10} per={2} />
      </Card>
    </Sequence>
    <Sequence from={300} durationInFrames={130}><BeatTags len={130} /></Sequence>
    <Sequence from={436} durationInFrames={78}>
      <Card enter="slide" len={78}>
        <Words lines={["Әрбір бұйымды", "үлкен ықыласпен,"]} size={34} delay={4} per={2} />
        <div style={{ height: 8 }} />
        <Words lines={["әрбір бөлшегіне", "мән беріп жасаймыз."]} size={72} italic delay={12} per={2} />
      </Card>
    </Sequence>
    <Sequence from={520}><Cta /></Sequence>

    {/* opening letter on top of the footage until it zooms away */}
    <Sequence from={ENV_AT} durationInFrames={ENV_LEN}><Envelope /></Sequence>
    <Sound />
  </AbsoluteFill>
);
