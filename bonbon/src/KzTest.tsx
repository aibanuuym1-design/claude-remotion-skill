import React from "react";
import { AbsoluteFill } from "remotion";
import { PaperBg } from "./Layers";
import { fonts, palettes } from "./theme";
const p = palettes.champagne;
const lines = ["Кейбір сәттер жүректе мәңгі сақталады…", "Той. Құдалық. Қыз ұзату…", "Әрбір бөлшек — ерекше мәнге ие.",
  "Сізге және қонақтарыңызға арналған әсем бонбоньерка.", "Әр тапсырысқа — ерекше ықылас.", "Мерекеңіз ерекше болуға лайық!",
  "Тапсырыс қабылдаймыз. Бізге жазыңыз!"];
export const KzTest: React.FC = () => (
  <AbsoluteFill><PaperBg p={p} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40, padding: 70, textAlign: "center", color: p.ink }}>
      {lines.map((l, i) => <div key={i} style={{ fontFamily: fonts.cormorant, fontStyle: i % 2 ? "italic" : "normal", fontSize: 64, fontWeight: 500 }}>{l}</div>)}
      <div style={{ fontFamily: fonts.sans, fontSize: 26, letterSpacing: "0.3em", color: p.inkDim }}>ӘҒҚҢӨҰҮҺІ әғқңөұүһі</div>
    </AbsoluteFill></AbsoluteFill>
);
