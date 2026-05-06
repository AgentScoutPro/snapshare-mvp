import { Composition } from "remotion";
import {
  FULL_DURATION,
  HandshakeToCrm,
  HandshakeToCrmLoop,
  LOOP_DURATION,
  NetworkingUpgrade,
  NetworkingUpgradeLoop,
  StopLosingLeads,
  StopLosingLeadsLoop,
  VIDEO_FPS,
} from "./SnapShareLaunch";

const shared = {
  fps: VIDEO_FPS,
  width: 1080,
  height: 1920,
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="StopLosingLeads"
        component={StopLosingLeads}
        durationInFrames={FULL_DURATION}
        {...shared}
      />
      <Composition
        id="HandshakeToCrm"
        component={HandshakeToCrm}
        durationInFrames={FULL_DURATION}
        {...shared}
      />
      <Composition
        id="NetworkingUpgrade"
        component={NetworkingUpgrade}
        durationInFrames={FULL_DURATION}
        {...shared}
      />
      <Composition
        id="StopLosingLeadsLoop"
        component={StopLosingLeadsLoop}
        durationInFrames={LOOP_DURATION}
        {...shared}
      />
      <Composition
        id="HandshakeToCrmLoop"
        component={HandshakeToCrmLoop}
        durationInFrames={LOOP_DURATION}
        {...shared}
      />
      <Composition
        id="NetworkingUpgradeLoop"
        component={NetworkingUpgradeLoop}
        durationInFrames={LOOP_DURATION}
        {...shared}
      />
    </>
  );
};
