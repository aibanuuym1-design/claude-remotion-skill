import React from "react";
import { AbsoluteFill } from "remotion";
import { PaperBg } from "./Layers";
import { fonts, palettes } from "./theme";
const p = palettes.champagne;
const lines = ["Кейбір сәттер жүректе мәңгі сақталады…", "Той. Құдалық. Қыз ұзату…", "Әрбір бөлшек — ерекше мәнге ие.",
  "Сізге және қонақтарыңызға арналған әсем бонбоньерка.", "Әр тапсырысқа — ерекше ықылас.", "Мерекеңіз ерекше болуға лайық!",
  "Тапсырыс қабылдаймыз. Бізге жазыңыз!"];
// Typography sample: client's Asylbek script for all 7 Kazakh lines.
export const KzTest: React.FC = () => (
  <AbsoluteFill><PaperBg p={p} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 46, padding: 70, textAlign: "center", color: p.ink }}>
      {lines.map((l, i) => <div key={i} style={{ fontFamily: fonts.asylbek, fontSize: 70, lineHeight: 1.2 }}>{l}</div>)}
    </AbsoluteFill></AbsoluteFill>
);
