import React from "react";
import { Composition, Series } from "remotion";
import { KzPair } from "./KzTest";
import { TgStyleArch, TgStyleCinema, TgStyleRhythm } from "./Target";
import { AdKz, KZ_DURATION } from "./AdKz";
import { AD_DURATION, Ad } from "./Ad";
import { RealArch, RealEnd, RealHook } from "./Real";
import { StyleArch, StyleCatalog, StyleEditorial } from "./Styles";

const v = { fps: 30, width: 1080, height: 1920, durationInFrames: 150 };
export const Root: React.FC = () => (
  <>
    <Composition id="StyleA-Arch" component={StyleArch} {...v} />
    <Composition id="StyleB-Editorial" component={StyleEditorial} {...v} />
    <Composition id="StyleC-Catalog" component={StyleCatalog} {...v} />
    <Composition id="KzPair-Forum" component={KzPair} {...v} durationInFrames={1} defaultProps={{ pair: "forum" as const }} />
    <Composition id="KzPair-Prata" component={KzPair} {...v} durationInFrames={1} defaultProps={{ pair: "prata" as const }} />
    <Composition id="KzPair-Raleway" component={KzPair} {...v} durationInFrames={1} defaultProps={{ pair: "raleway" as const }} />
    <Composition id="BonbonAdKz30" component={AdKz} {...v} durationInFrames={KZ_DURATION} />
    <Composition id="BonbonAd30" component={Ad} {...v} durationInFrames={AD_DURATION} />
    <Composition id="Real-Hook" component={RealHook} {...v} />
    <Composition id="Real-Mirror" component={RealArch} {...v} defaultProps={{ src: "real/mirror-1.jpg", title: "Бонбоньерки", sub: "на свадьбу и қыз ұзату", tag: "ИМЕННЫЕ ЗЕРКАЛЬЦА", pos: "50% 40%" }} />
    <Composition id="Real-End" component={RealEnd} {...v} />
    <Composition id="Tg-StyleA-Cinema" component={TgStyleCinema} {...v} durationInFrames={140} />
    <Composition id="Tg-StyleB-Arch" component={TgStyleArch} {...v} durationInFrames={140} />
    <Composition id="Tg-StyleC-Rhythm" component={TgStyleRhythm} {...v} durationInFrames={140} />
    <Composition id="StylesPreview" component={Preview} {...v} durationInFrames={450} />
  </>
);

const Preview: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={150}><StyleArch /></Series.Sequence>
    <Series.Sequence durationInFrames={150}><StyleEditorial /></Series.Sequence>
    <Series.Sequence durationInFrames={150}><StyleCatalog /></Series.Sequence>
  </Series>
);
