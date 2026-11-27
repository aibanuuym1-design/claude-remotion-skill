// 30s Kazakh Reels ad — «Сіздің қуанышты күніңіз ерекше болуға лайық».
// No voice. Only the 7 client-approved Kazakh phrases (spelled exactly). Real product photos only.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Clip, Finish, Frame, LightLeak, Shot, Shots, Veil } from "./Ad";
import { PaperBg } from "./Layers";
import { clamp, ease, kzType, palettes, springs } from "./theme";

const p = palettes.champagne;
const soft = "#6F604F";
const T = 20;
const TR = () => springTiming({ config: { damping: 200 }, durationInFrames: T });

// 7 scenes, one phrase each. sum - 6*T = 900 frames (30s @30fps)
const SC = [150, 140, 150, 150, 160, 130, 140] as const;
export const KZ_DURATION = SC.reduce((a, b) => a + b, 0) - (SC.length - 1) * T;
const exitOf = (i: number) => SC[i] - T - 8;

// Phrase rendered as given lines (line breaks only — characters unchanged), word-by-word reveal.
const Phrase: React.FC<{ lines: string[]; font: "script" | "serif"; size: number; delay?: number; exitAt: number;
  color?: string }> = ({ lines, font, size, delay = 8, exitAt, color = p.ink }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(f, [exitAt, exitAt + 12], [0, 1], { ...clamp, easing: ease.in });
  let k = 0;
  return (
    <div style={{ textAlign: "center", color, opacity: 1 - out, transform: `translateY(${-out * 16}px)`,
      fontFamily: kzType[font], fontSize: size, lineHeight: font === "script" ? 1.3 : 1.18,
      letterSpacing: font === "serif" ? "0.02em" : 0 }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.28 }}>
          {line.split(" ").map((w, wi) => {
            const s = spring({ frame: f - delay - (k++) * 4, fps, config: springs.soft });
            return <span key={wi} style={{ display: "inline-block", opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [size * 0.3, 0])}px)`,
              filter: `blur(${interpolate(s, [0, 1], [8, 0])}px)` }}>{w}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

const GoldLine: React.FC<{ delay: number; exitAt: number }> = ({ delay, exitAt }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [delay, delay + 30], [0, 170], { ...clamp, easing: ease.out });
  return <div style={{ height: 1.5, width: w, background: p.hero, margin: "0 auto",
    opacity: interpolate(f, [exitAt, exitAt + 10], [1, 0], clamp) }} />;
};

const Text: React.FC<{ at: "top" | "bottom"; pad: number; children: React.ReactNode }> = ({ at, pad, children }) => (
  <AbsoluteFill style={{ justifyContent: at === "top" ? "flex-start" : "flex-end", alignItems: "center",
    paddingTop: at === "top" ? pad : 0, paddingBottom: at === "bottom" ? pad : 0, paddingLeft: 60, paddingRight: 60 }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>{children}</div>
  </AbsoluteFill>
);

// 1 · «Кейбір сәттер жүректе мәңгі сақталады…» — invitation, macro pull-back.
const K1: React.FC = () => (
  <AbsoluteFill>
    <Shot src="real/invite-2.jpg" from={1.9} to={1.15} origin="31% 36%" dy={-20} />
    <LightLeak strength={0.3} />
    <Veil side="bottom" reach={54} />
    <Text at="bottom" pad={380}>
      <Phrase lines={["Кейбір сәттер жүректе", "мәңгі сақталады…"]} font="script" size={88} delay={26} exitAt={exitOf(0)} />
      <GoldLine delay={60} exitAt={exitOf(0)} />
    </Text>
    <Finish />
  </AbsoluteFill>
);

// 2 · «Той. Құдалық. Қыз ұзату…» — sunlight, peonies, mirrors.
const K2: React.FC = () => (
  <AbsoluteFill>
    <Shot src="real/mirror-2.jpg" from={1.06} to={1.2} origin="40% 35%" dx={-24} />
    <LightLeak strength={0.45} />
    <Veil side="top" reach={34} />
    <Text at="top" pad={300}>
      <Phrase lines={["Той. Құдалық. Қыз ұзату…"]} font="serif" size={80} delay={10} exitAt={exitOf(1)} />
    </Text>
    <Finish />
  </AbsoluteFill>
);

// 3 · «Әрбір бөлшек — ерекше мәнге ие.» — wax seal macro → pampas & pearls.
const K3: React.FC = () => (
  <AbsoluteFill>
    <Shots items={[
      [85, <Shot src="real/mirror-1.jpg" from={2.1} to={1.6} origin="38% 63%" dx={10} />],
      [85, <Shot src="real/baby-2.jpg" from={1.3} to={1.12} origin="62% 28%" dy={16} />],
    ]} />
    <Veil side="bottom" reach={40} />
    <Text at="bottom" pad={400}>
      <Phrase lines={["Әрбір бөлшек —", "ерекше мәнге ие."]} font="script" size={90} delay={12} exitAt={exitOf(2)} />
    </Text>
    <Finish />
  </AbsoluteFill>
);

// 4 · «Сізге және қонақтарыңызға арналған әсем бонбоньерка.» — the favours themselves.
const K4: React.FC = () => (
  <AbsoluteFill>
    <Shots items={[
      [90, <Shot src="real/baby-1.jpg" from={1.15} to={1.3} origin="50% 55%" dx={-30} dy={-10} />],
      [80, <Shot src="real/mirror-1.jpg" from={1.08} to={1.18} origin="50% 50%" dy={-14} />],
    ]} />
    <Veil side="top" reach={40} />
    <Text at="top" pad={270}>
      <Phrase lines={["Сізге және қонақтарыңызға", "арналған әсем бонбоньерка."]} font="script" size={84} delay={10} exitAt={exitOf(3)} />
    </Text>
    <Finish />
  </AbsoluteFill>
);

// 5 · «Әр тапсырысқа — ерекше ықылас.» — hands at work, slow motion.
const K5: React.FC = () => (
  <AbsoluteFill>
    <Shots items={[
      [95, <Clip src="real/ribbon.mp4" start={13.2} rate={0.55} from={1.45} to={1.55} origin="28% 30%" />],
      [85, <Clip src="real/clips-flower.mp4" start={4.0} rate={0.6} from={1.08} to={1.16} origin="50% 40%" />],
    ]} />
    <Veil side="top" reach={44} />
    <Text at="top" pad={290}>
      <Phrase lines={["Әр тапсырысқа —", "ерекше ықылас."]} font="script" size={90} delay={10} exitAt={exitOf(4)} />
    </Text>
    <Finish />
  </AbsoluteFill>
);

// 6 · «Мерекеңіз ерекше болуға лайық!» — lookbook of finished pieces.
const K6: React.FC = () => (
  <AbsoluteFill>
    <PaperBg p={p} />
    <Frame src="real/mirror-2.jpg" w={430} h={580} x={80} y={700} delay={4} rot={-2} origin="60% 40%" />
    <Frame src="real/invite-1.jpg" w={400} h={540} x={590} y={620} delay={10} rot={2.5} />
    <Frame src="real/baby-1.jpg" w={420} h={540} x={330} y={1150} delay={16} arch origin="50% 40%" />
    <Text at="top" pad={290}>
      <Phrase lines={["Мерекеңіз ерекше", "болуға лайық!"]} font="script" size={92} delay={20} exitAt={exitOf(5)} />
    </Text>
    <LightLeak strength={0.22} />
    <Finish />
  </AbsoluteFill>
);

// 7 · «Тапсырыс қабылдаймыз. Бізге жазыңыз!» — real logo, CTA.
const K7: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f - 4, fps, config: springs.soft });
  return (
    <AbsoluteFill>
      <PaperBg p={p} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 40 }}>
        <div style={{ opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.94, 1])})`,
          filter: `blur(${interpolate(logo, [0, 1], [10, 0])}px)` }}>
          <Img src={staticFile("real/logo.png")} style={{ width: 620 }} />
        </div>
        <div style={{ margin: "60px 0 50px" }}><GoldLine delay={16} exitAt={9999} /></div>
        <Phrase lines={["Тапсырыс қабылдаймыз."]} font="serif" size={66} delay={22} exitAt={9999} />
        <div style={{ height: 14 }} />
        <Phrase lines={["Бізге жазыңыз!"]} font="script" size={92} delay={34} exitAt={9999} color={soft} />
      </AbsoluteFill>
      <Finish />
    </AbsoluteFill>
  );
};

const Sound: React.FC = () => {
  const { fps } = useVideoConfig();
  const starts = SC.slice(0, -1).reduce<number[]>((acc, d, i) => [...acc, (acc[i - 1] ?? 0) + d - T], []);
  const vol = (f: number) => Math.min(interpolate(f, [0, 12], [0, 0.85], clamp),
    interpolate(f, [KZ_DURATION - 2 * fps, KZ_DURATION], [0.85, 0], clamp));
  return (
    <>
      <Audio src={staticFile("audio/music.wav")} volume={vol} />
      <Audio src={staticFile("audio/air.wav")} volume={0.07} />
      {starts.map((s) => (
        <Sequence key={s} from={s - 3} durationInFrames={40}><Audio src={staticFile("audio/swish.wav")} volume={0.22} /></Sequence>
      ))}
      <Sequence from={starts[5] + 4} durationInFrames={3 * fps}><Audio src={staticFile("audio/shimmer.wav")} volume={0.28} /></Sequence>
    </>
  );
};

export const AdKz: React.FC = () => {
  const scenes = [K1, K2, K3, K4, K5, K6, K7];
  return (
    <AbsoluteFill style={{ background: p.bg }}>
      <TransitionSeries>
        {scenes.flatMap((Sc, i) => {
          const seq = <TransitionSeries.Sequence key={`s${i}`} durationInFrames={SC[i]}><Sc /></TransitionSeries.Sequence>;
          return i === 0 ? [seq] : [<TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={TR()} />, seq];
        })}
      </TransitionSeries>
      <Sound />
    </AbsoluteFill>
  );
};
