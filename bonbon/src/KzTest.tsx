import React from "react";
import { AbsoluteFill } from "remotion";
import { PaperBg } from "./Layers";
import { fonts, palettes } from "./theme";
const p = palettes.champagne;
// Typography sample for the Kazakh version: handwritten accent + serif.
export const KzTest: React.FC = () => (
  <AbsoluteFill><PaperBg p={p} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 70, padding: 70, textAlign: "center", color: p.ink }}>
      <div>
        <div style={{ fontFamily: fonts.script, fontSize: 82, lineHeight: 1.2 }}>Кейбір сәттер жүректе<br />мәңгі сақталады…</div>
      </div>
      <div>
        <div style={{ fontFamily: fonts.cormorant, fontSize: 92, fontWeight: 500, lineHeight: 1.05 }}>Той. Құдалық.</div>
        <div style={{ fontFamily: fonts.script, fontSize: 76, color: "#6F604F", marginTop: 8 }}>Қыз ұзату…</div>
      </div>
      <div>
        <div style={{ fontFamily: fonts.script, fontSize: 84 }}>Мерекеңіз ерекше<br />болуға лайық!</div>
        <div style={{ height: 1.5, width: 180, background: p.hero, margin: "40px auto" }} />
        <div style={{ fontFamily: fonts.cormorant, fontSize: 58, fontWeight: 500 }}>Тапсырыс қабылдаймыз.</div>
        <div style={{ fontFamily: fonts.cormorant, fontStyle: "italic", fontSize: 58, color: "#6F604F" }}>Бізге жазыңыз!</div>
      </div>
    </AbsoluteFill></AbsoluteFill>
);
