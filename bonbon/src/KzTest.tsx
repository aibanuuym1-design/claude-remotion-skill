import React from "react";
import { AbsoluteFill } from "remotion";
import { PaperBg } from "./Layers";
import { fonts, palettes } from "./theme";
const p = palettes.champagne;
const soft = "#6F604F";
// Font pairing sample: Asylbek (script) + a calm partner face. `pair` selects the partner.
export const KzPair: React.FC<{ pair: "forum" | "prata" | "raleway" }> = ({ pair }) => {
  const ff = fonts[pair];
  const caps: React.CSSProperties = { fontFamily: ff, fontWeight: pair === "raleway" ? 300 : 400, textAlign: "center",
    letterSpacing: pair === "raleway" ? "0.32em" : "0.22em", color: soft };
  const name = { forum: "FORUM", prata: "PRATA", raleway: "RALEWAY LIGHT" }[pair];
  return (
    <AbsoluteFill><PaperBg p={p} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 70, textAlign: "center", color: p.ink }}>
        <div style={{ ...caps, fontSize: 22, opacity: 0.6, marginBottom: 90 }}>ASYLBEK + {name}</div>
        <div style={{ ...caps, fontSize: 30 }}>ТОЙ · ҚҰДАЛЫҚ · ҚЫЗ ҰЗАТУ</div>
        <div style={{ fontFamily: fonts.asylbek, fontSize: 96, lineHeight: 1.2, marginTop: 34 }}>Кейбір сәттер<br />жүректе мәңгі<br />сақталады…</div>
        <div style={{ height: 1.5, width: 180, background: p.hero, margin: "60px auto" }} />
        <div style={{ fontFamily: ff, fontWeight: pair === "raleway" ? 300 : 400, fontSize: pair === "raleway" ? 50 : 54,
          lineHeight: 1.3, letterSpacing: pair === "raleway" ? "0.02em" : "0.01em" }}>
          Сізге және қонақтарыңызға<br />арналған әсем бонбоньерка
        </div>
        <div style={{ ...caps, fontSize: 26, marginTop: 70, padding: "24px 50px", border: `1.5px solid ${p.hero}`, borderRadius: 999 }}>
          БІЗГЕ ЖАЗЫҢЫЗ
        </div>
      </AbsoluteFill></AbsoluteFill>
  );
};
