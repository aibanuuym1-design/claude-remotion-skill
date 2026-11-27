// Target (paid ads) video for ARAIDAN SYI — built from the client's real work videos (public/work).
// Kazakh only; on-screen text reuses the client-approved phrases, spelled exactly.
// Step 1: three style samples of the opening (~4.5s each) for the client to choose from.
import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish, LightLeak, Veil } from "./Ad";
import { PaperBg } from "./Layers";
import { clamp, ease, kzType, palettes, springs } from "./theme";

const p = palettes.champagne;
const soft = "#6F604F";
const grade = "saturate(0.86) sepia(0.08) brightness(1.04) contrast(0.97)";

// Real footage (60fps source → smooth slow motion), with an optional camera push.
const Vid: React.FC<{ src: string; start?: number; rate?: number; from?: number; to?: number; origin?: string;
  style?: React.CSSProperties }> = ({ src, start = 0, rate = 0.6, from = 1.05, to = 1.15, origin = "50% 50%", style }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = interpolate(f, [0, durationInFrames], [from, to], { ...clamp, easing: ease.inOut });
  return (
    <OffthreadVideo src={staticFile(`work/${src}.mp4`)} startFrom={Math.round(start * fps)} playbackRate={rate} muted
      style={{ width: "100%", height: "100%", objectFit: "cover", transformOrigin: origin, transform: `scale(${s})`,
        filter: grade, ...style }} />
  );
};

// Word-by-word reveal (rise + blur-to-sharp).
export const KzWords: React.FC<{ lines: string[]; font: "script" | "serif"; size: number; delay?: number;
  color?: string; per?: number }> = ({ lines, font, size, delay = 0, color = p.ink, per = 4 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let k = 0;
  return (
    <div style={{ textAlign: "center", color, fontFamily: kzType[font], fontSize: size,
      lineHeight: font === "script" ? 1.25 : 1.15, letterSpacing: font === "serif" ? "0.02em" : 0 }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.28 }}>
          {line.split(" ").map((w, wi) => {
            const s = spring({ frame: f - delay - (k++) * per, fps, config: springs.soft });
            return <span key={wi} style={{ display: "inline-block", opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [size * 0.3, 0])}px)`,
              filter: `blur(${interpolate(s, [0, 1], [8, 0])}px)` }}>{w}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

const Hair: React.FC<{ delay: number; w?: number }> = ({ delay, w = 170 }) => {
  const f = useCurrentFrame();
  return <div style={{ height: 1.5, margin: "0 auto", background: p.hero,
    width: interpolate(f, [delay, delay + 30], [0, w], { ...clamp, easing: ease.out }) }} />;
};

const Handle: React.FC<{ delay: number; color?: string }> = ({ delay, color = p.inkDim }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: springs.soft });
  return <div style={{ fontFamily: kzType.serif, fontSize: 34, letterSpacing: "0.18em", color, opacity: s,
    transform: `translateY(${interpolate(s, [0, 1], [10, 0])}px)` }}>@araidan_syi</div>;
};

// ───────────── Style A · «Кино» — full-screen slow motion, soft blur-zoom cut ─────────────
export const TgStyleCinema: React.FC = () => {
  const f = useCurrentFrame();
  const cut = 66;
  // blur-zoom transition: outgoing pushes in and blurs, incoming settles from a slight zoom
  const outK = interpolate(f, [cut - 8, cut + 4], [0, 1], { ...clamp, easing: ease.in });
  const inK = interpolate(f, [cut - 4, cut + 14], [0, 1], { ...clamp, easing: ease.out });
  return (
    <AbsoluteFill style={{ background: p.bg }}>
      <AbsoluteFill style={{ opacity: 1 - inK, transform: `scale(${1 + outK * 0.12})`, filter: `blur(${outK * 14}px)` }}>
        <Vid src="w9088" start={1.2} rate={0.5} from={1.18} to={1.04} origin="35% 55%" />
      </AbsoluteFill>
      {f > cut - 6 && (
        <AbsoluteFill style={{ opacity: inK, transform: `scale(${1.1 - inK * 0.1})`, filter: `blur(${(1 - inK) * 12}px)` }}>
          <Vid src="w9253" start={0.6} rate={0.6} from={1.04} to={1.1} origin="50% 40%" />
        </AbsoluteFill>
      )}
      <LightLeak strength={0.32} />
      <Veil side="bottom" reach={42} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 330 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <KzWords lines={["Той. Құдалық. Қыз ұзату…"]} font="serif" size={74} delay={10} />
          <Hair delay={36} />
          <KzWords lines={["Әрбір бөлшек —", "ерекше мәнге ие."]} font="script" size={86} delay={cut + 6} color={soft} />
        </div>
      </AbsoluteFill>
      <Finish />
    </AbsoluteFill>
  );
};

// ───────────── Style B · «Арка» — footage inside an arch window on champagne paper ─────────────
const ARCH = { w: 820, h: 1120, x: 130, y: 250 };
export const TgStyleArch: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const open = spring({ frame: f - 2, fps, config: springs.soft });
  const swap = 70;
  // next clip wipes up inside the arch
  const wipe = interpolate(f, [swap, swap + 22], [100, 0], { ...clamp, easing: ease.inOut });
  return (
    <AbsoluteFill>
      <PaperBg p={p} />
      <div style={{ position: "absolute", left: ARCH.x - 18, top: ARCH.y - 18, width: ARCH.w + 36, height: ARCH.h + 36,
        borderRadius: `${(ARCH.w + 36) / 2}px ${(ARCH.w + 36) / 2}px 26px 26px`, border: `1.5px solid ${p.hero}`,
        opacity: interpolate(f, [10, 40], [0, 0.7], clamp) }} />
      <div style={{ position: "absolute", left: ARCH.x, top: ARCH.y, width: ARCH.w, height: ARCH.h, overflow: "hidden",
        borderRadius: `${ARCH.w / 2}px ${ARCH.w / 2}px 18px 18px`, clipPath: `inset(${(1 - open) * 100}% 0 0 0)`,
        boxShadow: "0 30px 60px rgba(150,120,80,0.16)" }}>
        <Vid src="w9620" start={0.5} rate={0.6} from={1.15} to={1.05} origin="50% 45%" />
        <AbsoluteFill style={{ clipPath: `inset(${wipe}% 0 0 0)` }}>
          <Vid src="w9529" start={0.4} rate={0.6} from={1.12} to={1.06} origin="45% 45%" />
        </AbsoluteFill>
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 190 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <KzWords lines={["Сізге және қонақтарыңызға", "арналған әсем бонбоньерка."]} font="script" size={70} delay={20} />
          <Handle delay={50} />
        </div>
      </AbsoluteFill>
      <LightLeak strength={0.18} />
      <Finish />
    </AbsoluteFill>
  );
};

// ───────────── Style C · «Ритм» — three panels in a row, then one opens to full screen ─────────────
const PANELS = [
  { src: "w9688", start: 3.2, origin: "50% 40%" },
  { src: "w9088", start: 2.0, origin: "40% 50%" },
  { src: "w9173", start: 1.0, origin: "50% 50%" },
];
export const TgStyleRhythm: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = interpolate(f, [70, 96], [0, 1], { ...clamp, easing: ease.inOut }); // middle panel opens to full frame
  const gap = 16, pw = (1080 - 4 * gap) / 3, ph = 1240, top = 330;
  return (
    <AbsoluteFill>
      <PaperBg p={p} />
      {PANELS.map((pn, i) => {
        const s = spring({ frame: f - i * 7, fps, config: springs.gentle });
        const isMid = i === 1;
        const x0 = gap + i * (pw + gap), y0 = top + (i === 1 ? -40 : 40);
        const x = isMid ? interpolate(grow, [0, 1], [x0, 0]) : x0;
        const y = isMid ? interpolate(grow, [0, 1], [y0, 0]) : y0;
        const w = isMid ? interpolate(grow, [0, 1], [pw, 1080]) : pw;
        const h = isMid ? interpolate(grow, [0, 1], [ph, 1920]) : ph;
        const r = isMid ? interpolate(grow, [0, 1], [pw / 2, 0]) : pw / 2;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y + (1 - s) * 220, width: w, height: h, overflow: "hidden",
            borderRadius: `${r}px ${r}px ${isMid ? 14 * (1 - grow) : 14}px ${isMid ? 14 * (1 - grow) : 14}px`,
            opacity: isMid ? s : s * (1 - grow), zIndex: isMid ? 2 : 1 }}>
            <Vid src={pn.src} start={pn.start} rate={0.6} from={1.1} to={1.02} origin={pn.origin} />
          </div>
        );
      })}
      <AbsoluteFill style={{ zIndex: 3 }}>
        <Veil side="top" reach={34} />
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 150 }}>
          <KzWords lines={["Той. Құдалық. Қыз ұзату…"]} font="serif" size={64} delay={14} />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
          <div style={{ opacity: grow, background: `${p.bg}E6`, padding: "28px 50px", borderRadius: 8 }}>
            <KzWords lines={["Әр тапсырысқа —", "ерекше ықылас."]} font="script" size={80} delay={88} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <Finish />
    </AbsoluteFill>
  );
};
