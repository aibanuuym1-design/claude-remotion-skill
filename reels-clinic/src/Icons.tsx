// Thin line-art icons, drawn with stroke-dashoffset. Gold, 2.5px, no fills.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "./theme";

export type IconName = "rings" | "flame" | "orbit" | "check" | "target" | "moon" | "drop";

const PATHS: Record<IconName, string[]> = {
  rings: ["M50 50 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0", "M50 50 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0", "M50 50 m-38 0 a38 38 0 1 0 76 0 a38 38 0 1 0 -76 0"],
  flame: ["M50 90 C26 88 22 64 34 48 C40 40 42 30 40 16 C56 26 66 42 64 56 C70 52 72 46 72 40 C82 56 80 86 50 90 Z", "M50 88 C40 86 38 74 44 66 C48 60 50 54 50 48 C58 56 62 66 60 74 C58 82 56 87 50 88 Z"],
  orbit: ["M50 50 m-30 0 a30 12 -25 1 0 60 0 a30 12 -25 1 0 -60 0", "M50 26 L53 46 L72 50 L53 54 L50 74 L47 54 L28 50 L47 46 Z"],
  check: ["M50 50 m-38 0 a38 38 0 1 0 76 0 a38 38 0 1 0 -76 0", "M32 51 L45 64 L69 38"],
  target: ["M50 50 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0", "M50 50 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0", "M50 4 L50 18 M50 82 L50 96 M4 50 L18 50 M82 50 L96 50"],
  moon: ["M62 14 C38 18 24 40 28 62 C32 82 52 94 72 88 C54 84 42 68 44 50 C46 34 54 22 62 14 Z", "M74 30 L76 36 L82 38 L76 40 L74 46 L72 40 L66 38 L72 36 Z"],
  drop: ["M50 12 C62 32 74 46 74 62 C74 76 63 88 50 88 C37 88 26 76 26 62 C26 46 38 32 50 12 Z"],
};

export const Icon: React.FC<{ name: IconName; size?: number; start: number; color?: string }> = ({ name, size = 120, start, color = theme.colors.gold }) => {
  const f = useCurrentFrame() - start;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      {PATHS[name].map((d, i) => {
        const p = interpolate(f, [i * 5, i * 5 + 22], [1, 0], { easing: theme.ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <path key={i} d={d} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={p} />;
      })}
    </svg>
  );
};
