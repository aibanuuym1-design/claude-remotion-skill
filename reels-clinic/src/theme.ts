import { Easing } from "remotion";
import { FONT_DATA } from "./fontData";

const R = {
  ext: "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
  cyr: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
  lat: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
};
const FACES: [string, string, string, string][] = [
  ["CG", "cg-cyrext.woff2", R.ext, "italic"], ["CG", "cg-cyr.woff2", R.cyr, "italic"], ["CG", "cg-lat.woff2", R.lat, "italic"],
  ["MS", "m-cyrext.woff2", R.ext, "normal"], ["MS", "m-cyr.woff2", R.cyr, "normal"], ["MS", "m-lat.woff2", R.lat, "normal"],
];
if (typeof document !== "undefined" && !document.getElementById("reel-fonts")) {
  const el = document.createElement("style");
  el.id = "reel-fonts";
  el.textContent = FACES.map(([fam, file, range, style]) =>
    `@font-face{font-family:'${fam}';src:url(data:font/woff2;base64,${FONT_DATA[file]}) format('woff2');font-style:${style};font-weight:100 900;font-display:block;unicode-range:${range};}`).join(" ");
  document.head.appendChild(el);
}
const serif = { fontFamily: "CG" };
const sans = { fontFamily: "MS" };

export const theme = {
  colors: {
    navy: "#1D2436",     // main type colour (matches the uniform)
    gold: "#A8874E",     // THE accent — lines, icons, labels
    goldSoft: "rgba(168,135,78,0.35)",
    ivory: "#F7F3EA",
    card: "rgba(247,243,234,0.78)",
    warm: "#E9C9A0",
  },
  fonts: { serif: serif.fontFamily, sans: sans.fontFamily },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 16, stiffness: 150, mass: 0.6 },
    smooth: { damping: 22, stiffness: 90, mass: 1 },
  },
} as const;
