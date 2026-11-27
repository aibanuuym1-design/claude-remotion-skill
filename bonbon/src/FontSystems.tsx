// Harmonious font systems for the target ad: one display serif + one quiet sans, applied the same way everywhere.
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, continueRender, delayRender, staticFile } from "remotion";

if (typeof document !== "undefined" && !document.getElementById("kz-sys-fonts")) {
  const st = document.createElement("style");
  st.id = "kz-sys-fonts";
  const ff = (fam: string, file: string, w: number) =>
    `@font-face{font-family:'${fam}';src:url('${staticFile(`fonts/kz/${file}`)}') format('truetype');font-weight:${w};}`;
  st.textContent = ff("Montserrat", "Montserrat-300.ttf", 300) + ff("Montserrat", "Montserrat-500.ttf", 500)
    + ff("RalewayKz", "Raleway-300.ttf", 300) + ff("RalewayKz", "Raleway-500.ttf", 500);
  document.head.appendChild(st);
  const h = delayRender("kz system fonts");
  Promise.all(["300 20px Montserrat", "500 20px Montserrat", "300 20px RalewayKz", "500 20px RalewayKz"]
    .map((f) => document.fonts.load(f, "әғқңөұүі"))).then(() => continueRender(h), () => continueRender(h));
}

export const SYSTEMS = {
  // display: big emotional line · body: small quiet lines, handle, button
  a: { display: "'Cormorant Garamond', serif", dW: 500, dItalic: false, dSize: 86, body: "Montserrat, sans-serif", bW: 300, bSize: 40 },
  b: { display: "'Playfair Display', serif", dW: 400, dItalic: false, dSize: 74, body: "RalewayKz, sans-serif", bW: 300, bSize: 42 },
  c: { display: "'Forum', serif", dW: 400, dItalic: false, dSize: 80, body: "RalewayKz, sans-serif", bW: 300, bSize: 42 },
  e: { display: "'Asylbek Shelley', 'Cormorant Garamond', serif", dW: 400, dItalic: false, dSize: 92, body: "Montserrat, sans-serif", bW: 300, bSize: 38 },
  f: { display: "'Asylbek Shelley', 'Cormorant Garamond', serif", dW: 400, dItalic: false, dSize: 92, body: "'Forum', serif", bW: 400, bSize: 44 },
  g: { display: "'Asylbek Shelley', 'Cormorant Garamond', serif", dW: 400, dItalic: false, dSize: 92, body: "'Cormorant Garamond', serif", bW: 500, bSize: 46 },
  d: { display: "Montserrat, sans-serif", dW: 300, dItalic: false, dSize: 66, body: "Montserrat, sans-serif", bW: 300, bSize: 38 },
} as const;
export type SysKey = keyof typeof SYSTEMS;

const INK = "#3A2C25", GOLD = "#C29B55", CARD = "rgba(255,251,246,0.95)";

const Frame: React.FC<{ children: React.ReactNode; w?: number }> = ({ children, w = 900 }) => (
  <div style={{ position: "relative", width: w, background: CARD, borderRadius: 14, padding: "60px 54px 54px",
    boxShadow: "0 24px 60px rgba(120,80,60,0.18)" }}>
    <div style={{ position: "absolute", inset: 14, border: `1.6px solid ${GOLD}` }} />
    <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: CARD, padding: "0 12px",
      color: GOLD, fontSize: 26 }}>✦</div>
    {children}
  </div>
);

export const FontSystem: React.FC<{ sys: SysKey }> = ({ sys }) => {
  const s = SYSTEMS[sys];
  const body: React.CSSProperties = { fontFamily: s.body, fontWeight: s.bW, fontSize: s.bSize, color: INK, textAlign: "center",
    letterSpacing: "0.04em", lineHeight: 1.35 };
  const disp: React.CSSProperties = { fontFamily: s.display, fontWeight: s.dW, fontSize: s.dSize, color: INK, textAlign: "center",
    lineHeight: 1.12, letterSpacing: sys === "d" ? "0.02em" : 0 };
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile("work/w9529.mp4")} startFrom={30} muted
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.92) brightness(1.04)" }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 220, gap: 70 }}>
        <Frame>
          <div style={body}>Сіздің мерекеңіздің<br />сәнін келтіретін</div>
          <div style={{ height: 18 }} />
          <div style={disp}>ерекше бонбоньерки<br />ұсынамыз!</div>
        </Frame>
        <Frame w={820}>
          <div style={{ display: "flex", justifyContent: "center" }}><Img src={staticFile("real/logo.png")} style={{ width: 400 }} /></div>
          <div style={{ height: 24 }} />
          <div style={body}>Қонақтарыңызға ерекше<br />естелік сыйлағыңыз келсе,</div>
          <div style={{ height: 10 }} />
          <div style={{ ...disp, fontSize: s.dSize * 1.05 }}>маған жазыңыз</div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <div style={{ border: `1.6px solid ${GOLD}`, borderRadius: 60, padding: "14px 44px", fontFamily: s.body, fontWeight: 500,
              fontSize: 34, letterSpacing: "0.14em", color: INK }}>@araidan_syi</div>
          </div>
        </Frame>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center", fontFamily: "Montserrat", fontWeight: 500,
        fontSize: 64, color: INK }}><span style={{ background: CARD, borderRadius: 20, padding: "6px 40px" }}>{sys.toUpperCase()}</span></div>
    </AbsoluteFill>
  );
};
