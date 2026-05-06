import { Composition } from "remotion";
import {
  FULL_DURATION,
  FieldFollowUp,
  HandshakeToCrm,
  HandshakeToCrmLoop,
  LIFESTYLE_DURATION,
  MeetingMoment,
  LOOP_DURATION,
  NetworkingUpgrade,
  NetworkingUpgradeLoop,
  OpenHouseLeads,
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
      <Composition
        id="MeetingMoment"
        component={MeetingMoment}
        durationInFrames={LIFESTYLE_DURATION}
        {...shared}
      />
      <Composition
        id="FieldFollowUp"
        component={FieldFollowUp}
        durationInFrames={LIFESTYLE_DURATION}
        {...shared}
      />
      <Composition
        id="OpenHouseLeads"
        component={OpenHouseLeads}
        durationInFrames={LIFESTYLE_DURATION}
        {...shared}
      />
    </>
  );
};
