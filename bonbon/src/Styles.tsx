import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Grade, Grain, Hairline, KenBurns, PaperBg, Rise, usePhotoReveal } from "./Layers";
import { BizCardMock, CardMock, CertificateMock } from "./Paper";
import { clamp, ease, fonts, palettes, springs } from "./theme";

const caps = (size: number, color: string): React.CSSProperties => ({
  fontFamily: fonts.sans, fontSize: size, letterSpacing: "0.34em", color, fontWeight: 500, textAlign: "center",
});

// ── A. «Шампань / Арка» ── photo in an arched window, classic serif.
export const StyleArch: React.FC = () => {
  const p = palettes.champagne;
  const f = useCurrentFrame();
  const r = usePhotoReveal(6);
  const breathe = Math.sin(f / 30) * 3;
  return (
    <AbsoluteFill>
      <PaperBg p={p} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
        <Rise delay={0}><div style={caps(26, p.inkDim)}>РУЧНАЯ РАБОТА</div></Rise>
        <div style={{ marginTop: 44, position: "relative", transform: `translateY(${breathe}px)` }}>
          {/* gold arch frame draws in with the photo */}
          <div style={{ position: "absolute", inset: -16, borderRadius: "366px 366px 14px 14px",
            border: `1.5px solid ${p.hero}`, opacity: r.opacity * 0.9 }} />
          <div style={{ width: 700, height: 860, borderRadius: "350px 350px 10px 10px", overflow: "hidden",
            opacity: r.opacity, clipPath: r.clip, transform: `scale(${r.scale})`,
            boxShadow: "0 40px 80px -40px rgba(90,70,50,0.45)" }}>
            <KenBurns src="stock/dragee-rose.jpg" from={1.15} to={1.28} pan={-30} />
          </div>
        </div>
        <div style={{ marginTop: 72, textAlign: "center", color: p.ink }}>
          <Rise delay={20}><div style={{ fontFamily: fonts.cormorant, fontSize: 104, fontWeight: 500, lineHeight: 1.02 }}>Бонбоньерки</div></Rise>
          <Rise delay={26}><div style={{ fontFamily: fonts.cormorant, fontStyle: "italic", fontSize: 76, lineHeight: 1.1, color: p.inkDim }}>для ваших гостей</div></Rise>
          <div style={{ marginTop: 36 }}><Hairline color={p.hero} delay={36} width={200} /></div>
          <Rise delay={42}><div style={{ ...caps(24, p.inkDim), marginTop: 30 }}>СВАДЬБА · КРЕСТИНЫ · ЮБИЛЕЙ</div></Rise>
        </div>
      </AbsoluteFill>
      <Grade p={p} />
      <Grain />
    </AbsoluteFill>
  );
};

// ── B. «Пудра / Журнал» ── full-bleed photo melting into paper, editorial italic.
export const StyleEditorial: React.FC = () => {
  const p = palettes.powder;
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = spring({ frame: f, fps, config: springs.soft });
  return (
    <AbsoluteFill>
      <PaperBg p={p} />
      <AbsoluteFill style={{ height: 1180, opacity: op, overflow: "hidden" }}>
        <KenBurns src="stock/pink-box.jpg" from={1.32} to={1.22} pan={24} pos="50% 60%" />
        {/* soft fade of the photo into the paper colour — light, never dark */}
        <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 55%, ${p.bg} 98%)` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1080, alignItems: "center", color: p.ink, textAlign: "center" }}>
        <Rise delay={14}><div style={{ fontFamily: fonts.playfair, fontStyle: "italic", fontSize: 86, lineHeight: 1.12 }}>Маленький подарок —</div></Rise>
        <Rise delay={20}><div style={{ fontFamily: fonts.playfair, fontSize: 86, lineHeight: 1.12 }}>большое впечатление</div></Rise>
        <div style={{ marginTop: 44 }}><Hairline color={p.hero} delay={30} width={160} /></div>
        <Rise delay={36}><div style={{ ...caps(25, p.inkDim), marginTop: 34, lineHeight: 1.9 }}>БОНБОНЬЕРКИ · ОТКРЫТКИ<br />СЕРТИФИКАТЫ · ВИЗИТКИ</div></Rise>
      </AbsoluteFill>
      <Grade p={p} />
      <Grain />
    </AbsoluteFill>
  );
};

// ── C. «Шалфей / Каталог» ── three products as a calm staggered collage + CTA.
export const StyleCatalog: React.FC = () => {
  const p = palettes.sage;
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const item = (i: number) => {
    const s = spring({ frame: f - 10 - i * 6, fps, config: springs.soft });
    const fl = Math.sin((f + i * 20) / 32) * 4;
    return { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [50, 0]) + fl}px) scale(${interpolate(s, [0, 1], [0.95, 1])})` };
  };
  const ctaP = spring({ frame: f - 60, fps, config: springs.gentle });
  const lbl = (t: string) => <div style={{ ...caps(22, p.inkDim), marginTop: 22 }}>{t}</div>;
  return (
    <AbsoluteFill>
      <PaperBg p={p} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 270, color: p.ink }}>
        <Rise delay={0}><div style={{ fontFamily: fonts.cormorant, fontSize: 92, fontWeight: 500, textAlign: "center", lineHeight: 1.05 }}>
          Всё для красивого<br /><span style={{ fontStyle: "italic", color: p.inkDim }}>праздника</span></div></Rise>
        <div style={{ position: "relative", width: 1080, height: 980, marginTop: 40 }}>
          <div style={{ position: "absolute", left: 90, top: 30, ...item(0) }}>
            <div style={{ width: 470, height: 560, overflow: "hidden", borderRadius: 4, boxShadow: "0 30px 60px -28px rgba(50,60,50,0.4)" }}>
              <KenBurns src="stock/linen-bag.jpg" from={1.05} to={1.12} pan={-12} />
            </div>
            {lbl("БОНБОНЬЕРКИ")}
          </div>
          <div style={{ position: "absolute", right: 100, top: 110, transform: "rotate(3deg)" }}>
            <div style={item(1)}><CardMock p={p} w={330} />{lbl("ОТКРЫТКИ")}</div>
          </div>
          <div style={{ position: "absolute", left: 300, top: 650, transform: "rotate(-2deg)" }}>
            <div style={item(2)}><CertificateMock p={p} w={520} /></div>
          </div>
        </div>
        <div style={{ opacity: ctaP, transform: `translateY(${interpolate(ctaP, [0, 1], [20, 0])}px)`, marginTop: 10,
          border: `1.5px solid ${p.ink}`, padding: "22px 54px", borderRadius: 999 }}>
          <div style={{ ...caps(26, p.ink) }}>ЗАКАЗ В DIRECT</div>
        </div>
      </AbsoluteFill>
      <Grade p={p} />
      <Grain />
    </AbsoluteFill>
  );
};
export { BizCardMock };
