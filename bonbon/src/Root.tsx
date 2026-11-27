import React from "react";
import { Composition, Series } from "remotion";
import { StyleArch, StyleCatalog, StyleEditorial } from "./Styles";

const v = { fps: 30, width: 1080, height: 1920, durationInFrames: 150 };
export const Root: React.FC = () => (
  <>
    <Composition id="StyleA-Arch" component={StyleArch} {...v} />
    <Composition id="StyleB-Editorial" component={StyleEditorial} {...v} />
    <Composition id="StyleC-Catalog" component={StyleCatalog} {...v} />
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
