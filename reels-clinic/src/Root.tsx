import { Composition } from "remotion";
import { Reel } from "./Reel";
export const Root = () => (
  <Composition id="Reel" component={Reel} durationInFrames={889} fps={30} width={1080} height={1920} defaultProps={{ variant: "A" as const }} />
);
