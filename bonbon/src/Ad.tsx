// 30s Instagram Reels ad — «Ваше мероприятие заслуживает особенного».
// Built only from the client's real product photos/videos (no generated products).
import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Grain, PaperBg } from "./Layers";
import { clamp, ease, fonts, palettes, springs } from "./theme";

const p = palettes.champagne; // ivory / champagne / soft gold
const soft = "#6F604F"; // italic accent line — readable over photos
const T = 20; // transition length (frames)
const TR = () => springTiming({ config: { damping: 200 }, durationInFrames: T });

// Scene lengths (sum - 5*T = 900 frames = 30s)
export const SCENES = [170, 200, 170, 200, 150, 110] as const;
export const AD_DURATION = SCENES.reduce((a, b) => a + b, 0) - (SCENES.length - 1) * T;

// ───────────────────────── typography ─────────────────────────
// Word-by-word reveal: opacity + rise + blur-to-sharp, staggered; faster exit.
const Words: React.FC<{ text: string; delay?: number; exitAt?: number; size: number; italic?: boolean;
  color?: string; per?: number }> = ({ text, delay = 0, exitAt, size, italic, color = p.ink, per = 4 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = exitAt ? interpolate(f, [exitAt, exitAt + 12], [0, 1], { ...clamp, easing: ease.in }) : 0;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.26,
      fontFamily: fonts.cormorant, fontStyle: italic ? "italic" : "normal", fontWeight: italic ? 400 : 500,
      fontSize: size, lineHeight: 1.08, color, opacity: 1 - out, transform: `translateY(${-out * 16}px)` }}>
      {text.split(" ").map((w, i) => {
        const s = spring({ frame: f - delay - i * per, fps, config: springs.soft });
        return (
          <span key={i} style={{ display: "inline-block", opacity: s,
            transform: `translateY(${interpolate(s, [0, 1], [size * 0.35, 0])}px)`,
            filter: `blur(${interpolate(s, [0, 1], [8, 0])}px)` }}>{w}</span>
        );
      })}
    </div>
  );
};

// Small caps line whose tracking slowly opens up.
const Caps: React.FC<{ text: string; delay?: number; exitAt?: number; size?: number; color?: string }> =
({ text, delay = 0, exitAt, size = 24, color = p.inkDim }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: springs.soft });
  const out = exitAt ? interpolate(f, [exitAt, exitAt + 10], [0, 1], { ...clamp, easing: ease.in }) : 0;
  const track = interpolate(f - delay, [0, 90], [0.22, 0.4], clamp);
  return (
    <div style={{ fontFamily: fonts.sans, fontWeight: 500, fontSize: size, color, textAlign: "center",
      letterSpacing: `${track}em`, opacity: s * (1 - out), transform: `translateY(${interpolate(s, [0, 1], [12, 0])}px)` }}>
      {text}
    </div>
  );
};

const Line: React.FC<{ delay?: number; width?: number; exitAt?: number }> = ({ delay = 0, width = 180, exitAt }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [delay, delay + 30], [0, width], { ...clamp, easing: ease.out });
  const out = exitAt ? interpolate(f, [exitAt, exitAt + 10], [1, 0], clamp) : 1;
  return <div style={{ height: 1.5, width: w, background: p.hero, margin: "0 auto", opacity: out }} />;
};

// ───────────────────────── camera ─────────────────────────
// Still photo with a slow "macro" camera move: scale + drift around a focal point.
const Shot: React.FC<{ src: string; from: number; to: number; origin: string; dx?: number; dy?: number }> =
({ src, from, to, origin, dx = 0, dy = 0 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const k = interpolate(f, [0, durationInFrames], [0, 1], { ...clamp, easing: ease.inOut });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: p.bg }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover",
        transformOrigin: origin, filter: "saturate(0.9) contrast(0.98) brightness(1.03)",
        transform: `translate(${dx * k}px, ${dy * k}px) scale(${from + (to - from) * k})` }} />
    </AbsoluteFill>
  );
};

// Real footage, slowed down, with a gentle push-in.
const Clip: React.FC<{ src: string; start: number; rate: number; from?: number; to?: number; origin?: string }> =
({ src, start, rate, from = 1.12, to = 1.2, origin = "50% 50%" }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = interpolate(f, [0, durationInFrames], [from, to], { ...clamp, easing: ease.inOut });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: p.bg }}>
      <OffthreadVideo src={staticFile(src)} startFrom={Math.round(start * fps)} playbackRate={rate} muted
        style={{ width: "100%", height: "100%", objectFit: "cover", transformOrigin: origin, transform: `scale(${s})`,
          filter: "saturate(0.78) sepia(0.12) brightness(1.05) contrast(0.96)" }} />
    </AbsoluteFill>
  );
};

// Warm sunlight leak drifting across the frame.
const LightLeak: React.FC<{ strength?: number }> = ({ strength = 0.35 }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 200], [-20, 70], clamp);
  return <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: strength,
    background: `radial-gradient(circle at ${x}% 22%, rgba(255,226,180,0.9), rgba(255,210,160,0.25) 30%, transparent 58%)` }} />;
};

// Ivory veil behind text — light, never a dark shadow.
const Veil: React.FC<{ side: "top" | "bottom"; reach?: number }> = ({ side, reach = 46 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: side === "bottom"
    ? `linear-gradient(0deg, ${p.bg}F7 0%, ${p.bg}EE ${reach * 0.62}%, ${p.bg}99 ${reach * 0.82}%, transparent ${reach}%)`
    : `linear-gradient(180deg, ${p.bg}F7 0%, ${p.bg}EE ${reach * 0.62}%, ${p.bg}99 ${reach * 0.82}%, transparent ${reach}%)` }} />
);

const Finish: React.FC = () => (
  <>
    <AbsoluteFill style={{ pointerEvents: "none", backgroundColor: p.tint, mixBlendMode: "soft-light", opacity: 0.25 }} />
    <Grain />
  </>
);

// Inner cross-dissolve between shots of one scene.
const Shots: React.FC<{ items: [number, React.ReactNode][] }> = ({ items }) => (
  <TransitionSeries>
    {items.flatMap(([d, node], i) => {
      const seq = <TransitionSeries.Sequence key={`s${i}`} durationInFrames={d}>{node}</TransitionSeries.Sequence>;
      return i === 0 ? [seq] : [<TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={TR()} />, seq];
    })}
  </TransitionSeries>
);

const TextBlock: React.FC<{ top?: number; bottom?: number; children: React.ReactNode }> = ({ top, bottom, children }) => (
  <AbsoluteFill style={{ justifyContent: top !== undefined ? "flex-start" : "flex-end", alignItems: "center",
    paddingTop: top, paddingBottom: bottom, paddingLeft: 70, paddingRight: 70 }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>{children}</div>
  </AbsoluteFill>
);

// ───────────────────────── scenes ─────────────────────────
const exitOf = (i: number) => SCENES[i] - T - 6;

// 1 · Intro — the invitation, macro on the monogram pulling back.
const S1: React.FC = () => (
  <AbsoluteFill>
    <Shot src="real/invite-2.jpg" from={1.9} to={1.12} origin="31% 36%" dy={-20} />
    <LightLeak strength={0.28} />
    <Veil side="bottom" reach={52} />
    <TextBlock bottom={360}>
      <Caps text="ДЛЯ ВАШЕГО ТОРЖЕСТВА" delay={22} exitAt={exitOf(0)} />
      <Words text="Ваше мероприятие" size={98} delay={34} exitAt={exitOf(0)} />
      <Words text="заслуживает особенного" size={80} italic color={soft} delay={48} exitAt={exitOf(0)} />
      <div style={{ marginTop: 14 }}><Line delay={66} exitAt={exitOf(0)} /></div>
    </TextBlock>
    <Finish />
  </AbsoluteFill>
);

// 2 · Bonbonnieres — wax seal macro, then the hot-air-balloon favours.
const S2: React.FC = () => (
  <AbsoluteFill>
    <Shots items={[
      [105, <Shot src="real/mirror-1.jpg" from={2.0} to={1.45} origin="38% 63%" dx={10} />],
      [115, <Shot src="real/baby-1.jpg" from={1.18} to={1.32} origin="50% 55%" dx={-30} dy={-10} />],
    ]} />
    <Veil side="top" reach={36} />
    <TextBlock top={280}>
      <Caps text="БОНБОНЬЕРКИ РУЧНОЙ РАБОТЫ" delay={10} exitAt={exitOf(1)} />
      <Words text="для свадьбы, құдалық" size={84} delay={20} exitAt={exitOf(1)} />
      <Words text="и қыз ұзату" size={84} italic color={soft} delay={34} exitAt={exitOf(1)} />
    </TextBlock>
    <Finish />
  </AbsoluteFill>
);

// 3 · Atmosphere — sunlight, peonies, pampas and pearls.
const S3: React.FC = () => (
  <AbsoluteFill>
    <Shots items={[
      [100, <Shot src="real/mirror-2.jpg" from={1.08} to={1.22} origin="35% 30%" dx={-24} />],
      [90, <Shot src="real/baby-2.jpg" from={1.25} to={1.1} origin="60% 30%" dy={18} />],
    ]} />
    <LightLeak strength={0.4} />
    <Veil side="bottom" reach={40} />
    <TextBlock bottom={380}>
      <Words text="Каждая деталь —" size={92} delay={14} exitAt={exitOf(2)} />
      <Words text="часть вашего праздника" size={76} italic color={soft} delay={28} exitAt={exitOf(2)} />
    </TextBlock>
    <Finish />
  </AbsoluteFill>
);

// 4 · Process — printing name ribbons and finishing by hand, in slow motion.
const S4: React.FC = () => (
  <AbsoluteFill>
    <Shots items={[
      [90, <Clip src="real/ribbon.mp4" start={13.2} rate={0.55} from={1.45} to={1.55} origin="28% 30%" />],
      [70, <Clip src="real/ribbon.mp4" start={21.6} rate={0.6} from={1.15} to={1.25} origin="50% 45%" />],
      [80, <Clip src="real/clips-flower.mp4" start={4.0} rate={0.6} from={1.08} to={1.16} origin="50% 40%" />],
    ]} />
    <Veil side="top" reach={36} />
    <TextBlock top={280}>
      <Caps text="СОЗДАЁМ ВРУЧНУЮ" delay={10} exitAt={exitOf(3)} />
      <Words text="Именные ленты и бирки" size={84} delay={20} exitAt={exitOf(3)} />
      <Words text="для каждого гостя" size={76} italic color={soft} delay={34} exitAt={exitOf(3)} />
    </TextBlock>
    <Finish />
  </AbsoluteFill>
);

// 5 · Presentation — finished pieces laid out like a lookbook.
const Frame: React.FC<{ src: string; w: number; h: number; x: number; y: number; delay: number; rot?: number;
  arch?: boolean; origin?: string }> = ({ src, w, h, x, y, delay, rot = 0, arch, origin = "50% 50%" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: springs.soft });
  const fl = Math.sin((f + delay * 3) / 34) * 4;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: s,
      transform: `translateY(${interpolate(s, [0, 1], [60, 0]) + fl}px) rotate(${rot}deg) scale(${interpolate(s, [0, 1], [0.96, 1])})`,
      borderRadius: arch ? `${w / 2}px ${w / 2}px 6px 6px` : 4, overflow: "hidden",
      boxShadow: "0 36px 70px -34px rgba(90,70,50,0.45)", outline: `10px solid #FBF8F2` }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: origin,
        transform: `scale(${1.04 + f * 0.0006})`, filter: "saturate(0.92)" }} />
    </div>
  );
};
const S5: React.FC = () => (
  <AbsoluteFill>
    <PaperBg p={p} />
    <Frame src="real/mirror-1.jpg" w={430} h={600} x={80} y={560} delay={4} rot={-2} origin="50% 55%" />
    <Frame src="real/invite-1.jpg" w={400} h={540} x={590} y={470} delay={10} rot={2.5} />
    <Frame src="real/baby-1.jpg" w={440} h={560} x={330} y={1010} delay={16} arch origin="50% 40%" />
    <TextBlock top={250}>
      <Caps text="ГОТОВО К ВАШЕМУ ДНЮ" delay={18} exitAt={exitOf(4)} />
      <Words text="С любовью к деталям" size={88} italic delay={28} exitAt={exitOf(4)} />
    </TextBlock>
    <LightLeak strength={0.25} />
    <Finish />
  </AbsoluteFill>
);

// 6 · Final card — real logo + call to action (no invented contacts).
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f - 6, fps, config: springs.soft });
  const cta = spring({ frame: f - 44, fps, config: springs.gentle });
  const glow = 0.5 + Math.sin(f / 12) * 0.5;
  return (
    <AbsoluteFill>
      <PaperBg p={p} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 60 }}>
        <div style={{ opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.94, 1])})`,
          filter: `blur(${interpolate(logo, [0, 1], [10, 0])}px)` }}>
          <Img src={staticFile("real/logo.png")} style={{ width: 620 }} />
        </div>
        <div style={{ marginTop: 56 }}><Line delay={18} width={200} /></div>
        <div style={{ marginTop: 44 }}><Words text="Индивидуальные бонбоньерки" size={70} delay={22} /></div>
        <div style={{ marginTop: 22 }}><Caps text="ПРИГЛАШЕНИЯ · ОТКРЫТКИ · СЕРТИФИКАТЫ" size={22} delay={34} /></div>
        <div style={{ marginTop: 70, opacity: cta, transform: `translateY(${interpolate(cta, [0, 1], [18, 0])}px)`,
          padding: "26px 66px", borderRadius: 999, border: `1.5px solid ${p.hero}`,
          background: `rgba(184,149,90,${0.06 + glow * 0.06})` }}>
          <div style={{ fontFamily: fonts.sans, fontWeight: 500, fontSize: 27, letterSpacing: "0.34em", color: p.ink }}>
            ЗАКАЗАТЬ В DIRECT
          </div>
        </div>
      </AbsoluteFill>
      <Finish />
    </AbsoluteFill>
  );
};

// ───────────────────────── sound ─────────────────────────
const Sound: React.FC = () => {
  const { fps } = useVideoConfig();
  const starts = SCENES.slice(0, -1).reduce<number[]>((acc, d, i) => [...acc, (acc[i - 1] ?? 0) + d - T], []);
  const fadeOut = (f: number) => interpolate(f, [AD_DURATION - 2 * fps, AD_DURATION], [0.85, 0], clamp);
  return (
    <>
      <Audio src={staticFile("audio/music.wav")} volume={(f) => Math.min(interpolate(f, [0, 12], [0, 0.85], clamp), fadeOut(f))} />
      <Audio src={staticFile("audio/air.wav")} volume={0.07} />
      {starts.map((s) => (
        <Sequence key={s} from={s - 3} durationInFrames={40}><Audio src={staticFile("audio/swish.wav")} volume={0.22} /></Sequence>
      ))}
      <Sequence from={starts[4] + 4} durationInFrames={3 * fps}><Audio src={staticFile("audio/shimmer.wav")} volume={0.28} /></Sequence>
    </>
  );
};

export const Ad: React.FC = () => {
  const scenes = [S1, S2, S3, S4, S5, S6];
  return (
    <AbsoluteFill style={{ background: p.bg }}>
      <TransitionSeries>
        {scenes.flatMap((Sc, i) => {
          const seq = <TransitionSeries.Sequence key={`s${i}`} durationInFrames={SCENES[i]}><Sc /></TransitionSeries.Sequence>;
          return i === 0 ? [seq] : [<TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={TR()} />, seq];
        })}
      </TransitionSeries>
      <Sound />
    </AbsoluteFill>
  );
};
