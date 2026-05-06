import { Composition } from "remotion";
import { SnapShareLaunch } from "./SnapShareLaunch";

export const RemotionRoot = () => {
  return (
    <Composition
      id="SnapShareLaunch"
      component={SnapShareLaunch}
      durationInFrames={1320}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
