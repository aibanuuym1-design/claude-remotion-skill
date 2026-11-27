// Single source of truth: palettes, fonts, easings, springs.
import { Easing } from "remotion";
import { continueRender, delayRender, staticFile } from "remotion";
import fontCss from "./fonts-css";

// Fonts are bundled locally (public/fonts) so renders work offline.
if (typeof document !== "undefined" && !document.getElementById("bonbon-fonts")) {
  const style = document.createElement("style");
  style.id = "bonbon-fonts";
  style.textContent = fontCss.split("FONTDIR/").join(staticFile("fonts/"));
  document.head.appendChild(style);
  const h = delayRender("local fonts");
  const faces = ["400 20px 'Cormorant Garamond'", "500 20px 'Cormorant Garamond'", "italic 400 20px 'Cormorant Garamond'",
    "italic 500 20px 'Cormorant Garamond'", "400 20px 'Playfair Display'", "italic 400 20px 'Playfair Display'",
    "400 20px 'Manrope'", "500 20px 'Manrope'", "400 20px 'Bad Script'"];
  Promise.all(faces.map((f) => document.fonts.load(f, "Бб Aa әғқңөұүі"))).then(() => continueRender(h), () => continueRender(h));
}

export const fonts = {
  cormorant: "'Cormorant Garamond', serif",
  playfair: "'Playfair Display', serif",
  sans: "'Manrope', sans-serif",
  // handwritten face — the only Google script font with full Kazakh glyphs (ә ғ қ ң ө ұ ү і)
  script: "'Bad Script', cursive",
};

// Three calm palettes — one per style sample.
export const palettes = {
  champagne: { bg: "#F5EFE6", bgAlt: "#EDE3D4", ink: "#3B3128", inkDim: "#8A7B6B", hero: "#B8955A", tint: "#D9C3A0" },
  powder:    { bg: "#F6ECEA", bgAlt: "#EEDDD9", ink: "#4A3A3A", inkDim: "#9A8582", hero: "#C08B86", tint: "#E3C4BF" },
  rose:      { bg: "#F7F0EA", bgAlt: "#EFE2DA", ink: "#3E2F2C", inkDim: "#8E7A74", hero: "#C7768F", tint: "#E8C9CF" },
  sage:      { bg: "#EEF0EA", bgAlt: "#E0E5DB", ink: "#2F3A33", inkDim: "#7D887F", hero: "#8A9A86", tint: "#C9D2C4" },
} as const;
export type Palette = (typeof palettes)[keyof typeof palettes];

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
};
export const springs = {
  soft: { damping: 26, stiffness: 70, mass: 1 }, // calm, no overshoot
  gentle: { damping: 22, stiffness: 110, mass: 0.8 },
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
