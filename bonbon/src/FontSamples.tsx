// Font pairing samples for the target ad (all with full Kazakh glyphs), shown over real footage.
import React from "react";
import { AbsoluteFill, OffthreadVideo, continueRender, delayRender, staticFile } from "remotion";

if (typeof document !== "undefined" && !document.getElementById("kz-extra-fonts")) {
  const st = document.createElement("style");
  st.id = "kz-extra-fonts";
  const ff = (fam: string, file: string, style = "normal") =>
    `@font-face{font-family:'${fam}';src:url('${staticFile(`fonts/kz/${file}`)}') format('truetype');font-style:${style};}`;
  st.textContent = ff("Yeseva One", "YesevaOne.ttf") + ff("Lora", "Lora-Regular.ttf") + ff("Lora", "Lora-Italic.ttf", "italic")
    + ff("Old Standard TT", "OldStandard-Regular.ttf") + ff("Old Standard TT", "OldStandard-Italic.ttf", "italic");
  document.head.appendChild(st);
  const h = delayRender("kz extra fonts");
  Promise.all(["20px 'Yeseva One'", "20px 'Old Standard TT'", "italic 20px 'Old Standard TT'", "20px 'Lora'", "italic 20px 'Lora'"]
    .map((f) => document.fonts.load(f, "әғқңөұүі"))).then(() => continueRender(h), () => continueRender(h));
}

export const PAIRS = {
  playfair: { head: "'Playfair Display', serif", headW: 400, acc: "'Playfair Display', serif", label: "1 · Playfair Display" },
  cormorant: { head: "'Cormorant Garamond', serif", headW: 500, acc: "'Cormorant Garamond', serif", label: "2 · Cormorant Garamond" },
  yeseva: { head: "'Yeseva One', serif", headW: 400, acc: "'Cormorant Garamond', serif", label: "3 · Yeseva One + Cormorant" },
  oldstd: { head: "'Old Standard TT', serif", headW: 400, acc: "'Old Standard TT', serif", label: "4 · Old Standard" },
} as const;
export type PairKey = keyof typeof PAIRS;

const HALO = "0 0 6px rgba(255,251,245,1), 0 0 16px rgba(255,251,245,0.95), 0 0 34px rgba(255,251,245,0.9), 0 0 70px rgba(255,251,245,0.75), 0 0 120px rgba(255,251,245,0.5)";

export const FontSample: React.FC<{ pair: PairKey }> = ({ pair }) => {
  const p = PAIRS[pair];
  const big = pair === "cormorant" ? 1.12 : pair === "oldstd" ? 1.0 : 0.95;
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile("work/w9088.mp4")} startFrom={90} muted
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.06)", filter: "saturate(0.92) brightness(1.04)" }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 240, paddingLeft: 50, paddingRight: 50 }}>
        <div style={{ fontFamily: p.head, fontWeight: p.headW, fontSize: 92 * big, lineHeight: 1.15, color: "#3A2E27",
          textAlign: "center", textShadow: HALO }}>Тойыңызға ерекше<br />бір сән қосқыңыз<br />келе ме?</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 420 }}>
        <div style={{ fontFamily: p.acc, fontStyle: "italic", fontWeight: 500, fontSize: 104 * big, color: "#5E3F30", textShadow: HALO }}>маған жазыңыз</div>
        <div style={{ fontFamily: p.head, fontSize: 40, letterSpacing: "0.14em", color: "#3A2E27", textShadow: HALO, marginTop: 10 }}>@araidan_syi</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
