import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grade, Grain, Hairline, KenBurns, PaperBg, Rise, usePhotoReveal } from "./Layers";
import { fonts, palettes, springs } from "./theme";

const p = palettes.rose;
const caps = (size: number, color: string = p.inkDim): React.CSSProperties => ({
  fontFamily: fonts.sans, fontSize: size, letterSpacing: "0.34em", color, fontWeight: 500, textAlign: "center",
});

// 1. HOOK — process footage (hands printing a name ribbon) + a light paper title card.
export const RealHook: React.FC<{ startSec?: number }> = ({ startSec = 4.5 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(f, [0, 90], [1.08, 1.02], { extrapolateRight: "clamp" });
  const card = spring({ frame: f - 4, fps, config: springs.soft });
  return (
    <AbsoluteFill style={{ background: p.bg }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <OffthreadVideo src={staticFile("real/ribbon.mp4")} startFrom={Math.round(startSec * fps)} muted
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.85) brightness(1.04)" }} />
      </AbsoluteFill>
      {/* light paper card, not a dark shadow */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 300, padding: "54px 40px 50px",
        background: "rgba(247,240,234,0.9)", borderRadius: 6, opacity: card,
        transform: `translateY(${interpolate(card, [0, 1], [30, 0])}px)`, textAlign: "center", color: p.ink }}>
        <Rise delay={8}><div style={caps(24)}>РУЧНАЯ РАБОТА</div></Rise>
        <Rise delay={14}><div style={{ fontFamily: fonts.cormorant, fontSize: 92, fontWeight: 500, lineHeight: 1.04, marginTop: 18 }}>Подарки для гостей</div></Rise>
        <Rise delay={20}><div style={{ fontFamily: fonts.cormorant, fontStyle: "italic", fontSize: 70, color: p.inkDim, lineHeight: 1.1 }}>с вашими именами</div></Rise>
      </div>
      <Grade p={p} />
      <Grain />
    </AbsoluteFill>
  );
};

// 2. PRODUCT — photo in an arch (style A) with occasion line.
export const RealArch: React.FC<{ src: string; title: string; sub: string; tag: string; pos?: string }> =
({ src, title, sub, tag, pos = "center" }) => {
  const f = useCurrentFrame();
  const r = usePhotoReveal(4);
  const breathe = Math.sin(f / 30) * 3;
  return (
    <AbsoluteFill>
      <PaperBg p={p} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 270 }}>
        <Rise delay={0}><div style={caps(24)}>{tag}</div></Rise>
        <div style={{ marginTop: 44, position: "relative", transform: `translateY(${breathe}px)` }}>
          <div style={{ position: "absolute", inset: -16, borderRadius: "376px 376px 14px 14px",
            border: `1.5px solid ${p.hero}`, opacity: r.opacity * 0.8 }} />
          <div style={{ width: 720, height: 920, borderRadius: "360px 360px 10px 10px", overflow: "hidden",
            opacity: r.opacity, clipPath: r.clip, transform: `scale(${r.scale})`, boxShadow: "0 40px 80px -40px rgba(90,60,50,0.4)" }}>
            <KenBurns src={src} from={1.04} to={1.12} pan={-16} pos={pos} />
          </div>
        </div>
        <div style={{ marginTop: 64, textAlign: "center", color: p.ink }}>
          <Rise delay={16}><div style={{ fontFamily: fonts.cormorant, fontSize: 96, fontWeight: 500, lineHeight: 1.02 }}>{title}</div></Rise>
          <Rise delay={22}><div style={{ fontFamily: fonts.cormorant, fontStyle: "italic", fontSize: 68, lineHeight: 1.12, color: p.inkDim }}>{sub}</div></Rise>
          <div style={{ marginTop: 32 }}><Hairline color={p.hero} delay={30} width={180} /></div>
        </div>
      </AbsoluteFill>
      <Grade p={p} />
      <Grain />
    </AbsoluteFill>
  );
};

// 3. END CARD — logo, assortment, CTA, small photo strip.
export const RealEnd: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const thumbs = ["real/mirror-2.jpg", "real/baby-1.jpg", "real/invite-1.jpg"];
  const cta = spring({ frame: f - 40, fps, config: springs.gentle });
  return (
    <AbsoluteFill>
      <PaperBg p={p} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 330, color: p.ink }}>
        <div style={{ display: "flex", gap: 22 }}>
          {thumbs.map((t, i) => {
            const s = spring({ frame: f - i * 5, fps, config: springs.soft });
            return (
              <div key={t} style={{ width: 270, height: 380, overflow: "hidden", borderRadius: 135 * (i === 1 ? 1 : 0) + 4,
                opacity: s, transform: `translateY(${interpolate(s, [0, 1], [40, 0]) + Math.sin((f + i * 25) / 30) * 3}px)`,
                boxShadow: "0 30px 60px -30px rgba(90,60,50,0.4)" }}>
                <KenBurns src={t} from={1.05} to={1.12} pan={-8} />
              </div>
            );
          })}
        </div>
        <Rise delay={18} style={{ marginTop: 90 }}><Img src={staticFile("real/logo.png")} style={{ width: 640 }} /></Rise>
        <div style={{ marginTop: 50 }}><Hairline color={p.hero} delay={26} width={180} /></div>
        <Rise delay={30}><div style={{ ...caps(24), marginTop: 40, lineHeight: 2 }}>БОНБОНЬЕРКИ · ПРИГЛАШЕНИЯ<br />ОТКРЫТКИ · СЕРТИФИКАТЫ</div></Rise>
        <div style={{ marginTop: 56, opacity: cta, transform: `translateY(${interpolate(cta, [0, 1], [20, 0])}px)`,
          border: `1.5px solid ${p.ink}`, padding: "24px 60px", borderRadius: 999 }}>
          <div style={caps(27, p.ink)}>ЗАКАЗ В DIRECT</div>
        </div>
      </AbsoluteFill>
      <Grade p={p} />
      <Grain />
    </AbsoluteFill>
  );
};
