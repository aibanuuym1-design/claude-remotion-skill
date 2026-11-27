import React from "react";
import { Palette, fonts } from "./theme";

// Code-drawn stationery mockups (stand-ins until real product photos arrive).
export const CertificateMock: React.FC<{ p: Palette; w: number }> = ({ p, w }) => {
  const h = w * 0.62;
  return (
    <div style={{ width: w, height: h, background: "#FBF8F2", borderRadius: 6, position: "relative",
      boxShadow: `0 30px 60px -28px rgba(90,70,50,0.35)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: w * 0.035, border: `1.5px solid ${p.hero}` }} />
      <div style={{ position: "absolute", inset: w * 0.05, border: `0.75px solid ${p.hero}88` }} />
      <div style={{ textAlign: "center", color: p.ink }}>
        <div style={{ fontFamily: fonts.sans, fontSize: w * 0.032, letterSpacing: "0.32em", color: p.inkDim }}>ПОДАРОЧНЫЙ</div>
        <div style={{ fontFamily: fonts.cormorant, fontStyle: "italic", fontSize: w * 0.13, lineHeight: 1.05, marginTop: w * 0.01 }}>Сертификат</div>
        <div style={{ height: 1, width: w * 0.22, background: p.hero, margin: `${w * 0.03}px auto` }} />
        <div style={{ fontFamily: fonts.cormorant, fontSize: w * 0.05 }}>на сумму 3 000 ₽</div>
      </div>
    </div>
  );
};

export const CardMock: React.FC<{ p: Palette; w: number }> = ({ p, w }) => {
  const h = w * 1.4;
  return (
    <div style={{ width: w, height: h, background: "#FBF8F2", borderRadius: 4, position: "relative",
      boxShadow: `0 30px 60px -28px rgba(90,70,50,0.35)`, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", color: p.ink }}>
      {/* simple botanical sprig in theme color */}
      <svg width={w * 0.34} height={w * 0.34} viewBox="0 0 100 100" style={{ marginBottom: w * 0.06 }}>
        <path d="M50 92 C50 60 52 35 60 10" stroke={p.hero} strokeWidth="1.6" fill="none" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <ellipse cx={44 - i} cy={78 - i * 15} rx="9" ry="4" fill={p.tint} transform={`rotate(-35 ${44 - i} ${78 - i * 15})`} />
            <ellipse cx={58 + i * 0.6} cy={72 - i * 15} rx="9" ry="4" fill={p.hero} opacity="0.55" transform={`rotate(35 ${58 + i * 0.6} ${72 - i * 15})`} />
          </g>
        ))}
      </svg>
      <div style={{ fontFamily: fonts.cormorant, fontStyle: "italic", fontSize: w * 0.15, lineHeight: 1 }}>С любовью</div>
      <div style={{ fontFamily: fonts.sans, fontSize: w * 0.045, letterSpacing: "0.3em", color: p.inkDim, marginTop: w * 0.06 }}>ДЛЯ ВАС</div>
    </div>
  );
};

export const BizCardMock: React.FC<{ p: Palette; w: number }> = ({ p, w }) => (
  <div style={{ width: w, height: w * 0.58, background: p.ink, borderRadius: 6, color: "#F3EBDD",
    boxShadow: `0 30px 60px -28px rgba(60,40,30,0.45)`, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: fonts.cormorant, fontSize: w * 0.11, letterSpacing: "0.04em" }}>Анна Белова</div>
    <div style={{ height: 1, width: w * 0.16, background: p.tint, margin: `${w * 0.035}px 0` }} />
    <div style={{ fontFamily: fonts.sans, fontSize: w * 0.034, letterSpacing: "0.32em", color: p.tint }}>ФЛОРИСТ · ДЕКОРАТОР</div>
  </div>
);
