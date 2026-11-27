import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Palette, clamp, ease, springs } from "./theme";

// Layer 1 — soft paper background with slow drifting light (never flat).
export const PaperBg: React.FC<{ p: Palette }> = ({ p }) => {
  const f = useCurrentFrame();
  const d1 = Math.sin(f / 60) * 40, d2 = Math.cos(f / 75) * 30;
  return (
    <AbsoluteFill style={{ background: p.bg }}>
      <div style={{ position: "absolute", width: 1300, height: 1300, borderRadius: "50%", top: -500, left: -350 + d1,
        filter: "blur(60px)", background: `radial-gradient(circle, ${p.tint}66, transparent 62%)` }} />
      <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: "50%", bottom: -420, right: -300 - d2,
        filter: "blur(70px)", background: `radial-gradient(circle, ${p.bgAlt}, transparent 65%)` }} />
    </AbsoluteFill>
  );
};

// Layer 4 — warm, light grade that unifies photos from different sources.
export const Grade: React.FC<{ p: Palette }> = ({ p }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: p.tint, mixBlendMode: "soft-light", opacity: 0.22 }} />
  </AbsoluteFill>
);

// Layer 5 — fine film grain + a very light warm vignette (no black edges).
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundImage: noise, backgroundSize: "220px",
        backgroundPosition: `${(f * 7) % 220}px ${(f * 13) % 220}px`, opacity: 0.06, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(90,70,50,0.12) 100%)" }} />
    </AbsoluteFill>
  );
};

// Every still gets a slow Ken Burns.
export const KenBurns: React.FC<{ src: string; from?: number; to?: number; pan?: number; pos?: string }> =
({ src, from = 1, to = 1.08, pan = -20, pos = "center" }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(f, [0, durationInFrames], [from, to], { ...clamp, easing: ease.inOut });
  const x = interpolate(f, [0, durationInFrames], [0, pan], { ...clamp, easing: ease.inOut });
  return <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos,
    transform: `scale(${s}) translateX(${x}px)` }} />;
};

// Calm entrance: opacity + rise + slight blur-to-sharp; with a faster exit.
export const Rise: React.FC<{ delay?: number; y?: number; exitAt?: number; children: React.ReactNode; style?: React.CSSProperties }> =
({ delay = 0, y = 30, exitAt, children, style }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: springs.soft });
  const end = exitAt ?? durationInFrames;
  const out = interpolate(f, [end - 12, end - 2], [0, 1], { ...clamp, easing: ease.in });
  return (
    <div style={{ ...style, opacity: p * (1 - out),
      transform: `translateY(${interpolate(p, [0, 1], [y, 0]) - out * 18}px)`,
      filter: `blur(${interpolate(p, [0, 1], [6, 0])}px)` }}>{children}</div>
  );
};

// A thin line that draws itself from the centre.
export const Hairline: React.FC<{ color: string; delay?: number; width?: number }> = ({ color, delay = 0, width = 220 }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [delay, delay + 28], [0, width], { ...clamp, easing: ease.out });
  return <div style={{ height: 1.5, width: w, background: color, margin: "0 auto" }} />;
};

// Photo reveal: mask opens upward + subtle scale-down.
export const usePhotoReveal = (delay = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: springs.soft });
  return { opacity: Math.min(1, p * 1.4), clip: `inset(${(1 - p) * 100}% 0 0 0)`, scale: interpolate(p, [0, 1], [1.06, 1]) };
};
