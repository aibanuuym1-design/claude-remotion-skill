import { Easing } from "remotion";
import { FONT_FACES } from "./fontData";

if (typeof document !== "undefined" && !document.getElementById("reel-fonts")) {
  const el = document.createElement("style");
  el.id = "reel-fonts";
  el.textContent = FONT_FACES.map(([fam, range, b64]) =>
    `@font-face{font-family:'${fam}';src:url(data:font/woff2;base64,${b64}) format('woff2');font-weight:100 900;font-display:block;unicode-range:${range};}`).join(" ");
  document.head.appendChild(el);
}

export const colors = {
  wine: "#6B1E3A",
  wineDeep: "#4A1228",
  blush: "#F4CFD2",
  ivory: "#FFF8F2",
  glow: "rgba(255,214,214,0.9)",
  warm: "rgba(255,150,110,0.55)",
};

// three typography/colour systems to choose from
export type Variant = "A" | "B" | "C";
export const variants = {
  A: { font: "Montserrat", weight: 800, upper: true, text: colors.wineDeep, accent: colors.wine, box: null, marker: null, card: null, track: "0.02em", k: 0.76 },
  B: { font: "Onest", weight: 800, upper: false, text: colors.wineDeep, accent: colors.wine, box: null, marker: null, card: null, track: "-0.01em", k: 0.62 },
  C: { font: "Lora", weight: 700, upper: false, text: colors.wineDeep, accent: colors.wine, box: null, marker: null, card: null, track: "0", k: 0.6 },
} as const;

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
};
export const springs = {
  slam: { damping: 13, stiffness: 220, mass: 0.6 },
  smooth: { damping: 22, stiffness: 110, mass: 1 },
};
