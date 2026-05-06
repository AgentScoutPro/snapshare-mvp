import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import myCard from "../../marketing-assets/screens/06-my-card-screen.png";
import qrFull from "../../marketing-assets/screens/07-qr-full-screen-mode.png";
import contacts from "../../marketing-assets/screens/08-contacts-screen.png";
import followUp from "../../marketing-assets/screens/10-ai-follow-up-generator.png";
import events from "../../marketing-assets/screens/11-events-screen.png";
import scan from "../../marketing-assets/screens/14-scan-screen.png";
import scannedResult from "../../marketing-assets/screens/15-scanned-card-result.png";
import meetingScan from "../../marketing-assets/lifestyle/01-meeting-scan.png";
import crmEvent from "../../marketing-assets/lifestyle/02-crm-event.png";
import fieldLunch from "../../marketing-assets/lifestyle/03-field-lunch.png";
import openHouse from "../../marketing-assets/lifestyle/04-open-house.png";

type Variant = "leads" | "crm" | "upgrade";
type Mode = "full" | "loop";
type LifestyleVariant = "meetings" | "field" | "openHouse";

type Scene = {
  text: string;
  screen?: string;
  duration: number;
  tag?: string;
  effect?: "scan" | "fields" | "saved" | "typing" | "qr";
};

const fps = 30;
const fullDuration = 480;
const loopDuration = 150;
const lifestyleDuration = 360;
const url = "getthesnapshareapp.com";
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const screenMap = {
  scan,
  scannedResult,
  contacts,
  followUp,
  myCard,
  qrFull,
  events,
};

const variants: Record<Variant, { final: string; cta?: string; scenes: Scene[]; loop: Scene[] }> = {
  leads: {
    final: "Scan. Sync. Follow up.",
    scenes: [
      { text: "Still losing business cards?", duration: 60 },
      { text: "Scan it in seconds", screen: screenMap.scan, duration: 90, effect: "scan" },
      { text: "Clean it up instantly", screen: screenMap.scannedResult, duration: 90, effect: "fields" },
      { text: "Synced to your CRM", screen: screenMap.contacts, duration: 90, tag: "GoHighLevel ready", effect: "saved" },
      { text: "Follow up before they forget you", screen: screenMap.followUp, duration: 90, effect: "typing" },
      { text: "Scan. Sync. Follow up.", duration: 60 },
    ],
    loop: [
      { text: "Still losing business cards?", duration: 42 },
      { text: "Scan it in seconds", screen: screenMap.scan, duration: 54, effect: "scan" },
      { text: "Lead saved", screen: screenMap.contacts, duration: 54, tag: "GoHighLevel ready", effect: "saved" },
    ],
  },
  crm: {
    final: "From handshake to CRM in seconds",
    scenes: [
      { text: "Met someone important?", duration: 60 },
      { text: "Snap the card", screen: screenMap.scan, duration: 72, effect: "scan" },
      { text: "Confirm the details", screen: screenMap.scannedResult, duration: 78, effect: "fields" },
      { text: "Send to GoHighLevel", screen: screenMap.contacts, duration: 78, tag: "CRM sync", effect: "saved" },
      { text: "No lost leads", screen: screenMap.contacts, duration: 72 },
      { text: "Message them instantly", screen: screenMap.followUp, duration: 78, effect: "typing" },
      { text: "From handshake to CRM in seconds", duration: 42 },
    ],
    loop: [
      { text: "Met someone important?", duration: 42 },
      { text: "Snap the card", screen: screenMap.scan, duration: 48, effect: "scan" },
      { text: "Send to GoHighLevel", screen: screenMap.contacts, duration: 60, tag: "CRM sync", effect: "saved" },
    ],
  },
  upgrade: {
    final: "Download ScanShare",
    cta: "Download ScanShare",
    scenes: [
      { text: "Networking... but smarter", duration: 60 },
      { text: "Share your card instantly", screen: screenMap.myCard, duration: 78, effect: "qr" },
      { text: "Capture every lead", screen: screenMap.scan, duration: 78, effect: "scan" },
      { text: "Organize by event", screen: screenMap.events, duration: 78 },
      { text: "Never forget to follow up", screen: screenMap.followUp, duration: 84, effect: "typing" },
      { text: "Turn conversations into clients", screen: screenMap.contacts, duration: 72, effect: "saved" },
      { text: "Download ScanShare", duration: 30 },
    ],
    loop: [
      { text: "Networking... but smarter", duration: 42 },
      { text: "Capture every lead", screen: screenMap.scan, duration: 54, effect: "scan" },
      { text: "Follow up fast", screen: screenMap.followUp, duration: 54, effect: "typing" },
    ],
  },
};

export const SnapShareMarketing = ({ variant, mode }: { variant: Variant; mode: Mode }) => {
  const frame = useCurrentFrame();
  const config = variants[variant];
  const scenes = mode === "loop" ? config.loop : config.scenes;
  const timeline = buildTimeline(scenes);
  const active = timeline.find((item) => frame >= item.start && frame < item.end) ?? timeline[timeline.length - 1];
  const local = frame - active.start;
  const isFinal = mode === "full" && active.index === scenes.length - 1;

  return (
    <AbsoluteFill style={styles.root}>
      <Background frame={frame} />
      {!isFinal && active.scene.screen ? <Phone scene={active.scene} local={local} sceneIndex={active.index} /> : null}
      {!isFinal && !active.scene.screen ? <HookFlash local={local} /> : null}
      {!isFinal ? <Headline text={active.scene.text} local={local} align={active.scene.screen ? "top" : "center"} /> : null}
      {!isFinal && active.scene.tag ? <Tag text={active.scene.tag} local={local} /> : null}
      {isFinal ? <FinalCard text={config.final} /> : null}
      {mode === "full" && !isFinal && frame > fullDuration - 105 ? <UrlFooter /> : null}
    </AbsoluteFill>
  );
};

export const StopLosingLeads = () => <SnapShareMarketing variant="leads" mode="full" />;
export const HandshakeToCrm = () => <SnapShareMarketing variant="crm" mode="full" />;
export const NetworkingUpgrade = () => <SnapShareMarketing variant="upgrade" mode="full" />;
export const StopLosingLeadsLoop = () => <SnapShareMarketing variant="leads" mode="loop" />;
export const HandshakeToCrmLoop = () => <SnapShareMarketing variant="crm" mode="loop" />;
export const NetworkingUpgradeLoop = () => <SnapShareMarketing variant="upgrade" mode="loop" />;

type LifestyleScene = {
  text: string;
  asset: string;
  duration: number;
  align?: "top" | "bottom";
  tag?: string;
};

const lifestyleVariants: Record<LifestyleVariant, { final: string; scenes: LifestyleScene[] }> = {
  meetings: {
    final: "Every card becomes a follow-up.",
    scenes: [
      { text: "Meet them in the moment", asset: meetingScan, duration: 90, align: "top" },
      { text: "Scan before the conversation moves on", asset: crmEvent, duration: 90, align: "bottom", tag: "No lost names" },
      { text: "Send clean leads to GoHighLevel", asset: meetingScan, duration: 90, align: "top", tag: "CRM ready" },
      { text: "Scan. Sync. Follow up.", asset: crmEvent, duration: 90, align: "bottom" },
    ],
  },
  field: {
    final: "Built for work that happens anywhere.",
    scenes: [
      { text: "Leads do not only happen at conferences", asset: fieldLunch, duration: 90, align: "top" },
      { text: "Capture the card at lunch", asset: meetingScan, duration: 90, align: "bottom" },
      { text: "Follow up while it is still fresh", asset: fieldLunch, duration: 90, align: "top", tag: "Lead saved" },
      { text: "Turn quick chats into clients", asset: contacts, duration: 90, align: "bottom" },
    ],
  },
  openHouse: {
    final: "Download ScanShare.",
    scenes: [
      { text: "Open house. Real leads.", asset: openHouse, duration: 90, align: "top" },
      { text: "Capture every guest card", asset: openHouse, duration: 90, align: "bottom", tag: "Scan ready" },
      { text: "Organize by event", asset: events, duration: 90, align: "top" },
      { text: "Follow up before they tour the next place", asset: followUp, duration: 90, align: "bottom" },
    ],
  },
};

export const MeetingMoment = () => <LifestyleMarketing variant="meetings" />;
export const FieldFollowUp = () => <LifestyleMarketing variant="field" />;
export const OpenHouseLeads = () => <LifestyleMarketing variant="openHouse" />;

const LifestyleMarketing = ({ variant }: { variant: LifestyleVariant }) => {
  const frame = useCurrentFrame();
  const config = lifestyleVariants[variant];
  const timeline = buildTimeline(config.scenes);
  const active = timeline.find((item) => frame >= item.start && frame < item.end) ?? timeline[timeline.length - 1];
  const local = frame - active.start;
  const finalShowing = frame >= lifestyleDuration - 54;
  const finalIn = interpolate(frame, [lifestyleDuration - 54, lifestyleDuration - 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <AbsoluteFill style={styles.root}>
      <LifestyleImage scene={active.scene} local={local} sceneIndex={active.index} />
      <div style={styles.photoShade} />
      {!finalShowing ? <LifestyleHeadline scene={active.scene} local={local} /> : null}
      {!finalShowing && active.scene.tag ? <LifestyleTag text={active.scene.tag} local={local} /> : null}
      {!finalShowing ? <div style={styles.lifestyleFooter}>{url}</div> : null}
      <div
        style={{
          ...styles.lifestyleFinal,
          opacity: finalIn,
          transform: `translateY(${interpolate(finalIn, [0, 1], [22, 0])}px)`,
        }}
      >
        <div style={styles.logo}>ScanShare</div>
        <div style={styles.lifestyleFinalText}>{config.final}</div>
        <div style={styles.finalUrl}>{url}</div>
      </div>
    </AbsoluteFill>
  );
};

const buildTimeline = <T extends { duration: number }>(scenes: T[]) => {
  let start = 0;
  return scenes.map((scene, index) => {
    const item = { scene, index, start, end: start + scene.duration };
    start += scene.duration;
    return item;
  });
};

const Phone = ({ scene, local, sceneIndex }: { scene: Scene; local: number; sceneIndex: number }) => {
  const { fps: videoFps } = useVideoConfig();
  const screen = scene.screen;
  if (!screen) {
    return null;
  }
  const entry = spring({ frame: local, fps: videoFps, config: { damping: 18, stiffness: 120 } });
  const swipe = interpolate(entry, [0, 1], [sceneIndex % 2 === 0 ? 150 : -150, 0]);
  const zoom = interpolate(local, [0, scene.duration], [1, 1.045], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ ...styles.phoneWrap, transform: `translateX(${swipe}px) scale(${zoom})` }}>
      <div style={styles.phone}>
        <Img src={screen} style={styles.screen} />
        <Effect kind={scene.effect} local={local} />
      </div>
    </div>
  );
};

const LifestyleImage = ({
  scene,
  local,
  sceneIndex,
}: {
  scene: LifestyleScene;
  local: number;
  sceneIndex: number;
}) => {
  const { fps: videoFps } = useVideoConfig();
  const entry = spring({ frame: local, fps: videoFps, config: { damping: 22, stiffness: 96 } });
  const swipe = interpolate(entry, [0, 1], [sceneIndex % 2 === 0 ? 120 : -120, 0]);
  const zoom = interpolate(local, [0, scene.duration], [1.02, 1.09], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Img
      src={scene.asset}
      style={{
        ...styles.lifestyleImage,
        transform: `translateX(${swipe}px) scale(${zoom})`,
      }}
    />
  );
};

const LifestyleHeadline = ({ scene, local }: { scene: LifestyleScene; local: number }) => {
  const opacity = interpolate(local, [0, 12, scene.duration - 18, scene.duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(local, [0, 20], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <h1
      style={{
        ...styles.lifestyleHeadline,
        top: scene.align === "bottom" ? 1220 : 116,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {scene.text}
    </h1>
  );
};

const LifestyleTag = ({ text, local }: { text: string; local: number }) => {
  const opacity = interpolate(local, [16, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return <div style={{ ...styles.lifestyleTag, opacity }}>{text}</div>;
};

const Effect = ({ kind, local }: { kind?: Scene["effect"]; local: number }) => {
  const pulse = interpolate(local % 34, [0, 16, 34], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (kind === "scan") {
    const y = interpolate(local % 48, [0, 48], [170, 610]);
    return <div style={{ ...styles.scanLine, top: y, opacity: 0.25 + pulse * 0.55 }} />;
  }
  if (kind === "fields") {
    return (
      <>
        {[315, 390, 468].map((top, index) => (
          <div key={top} style={{ ...styles.fieldGlow, top, opacity: interpolate(local, [10 + index * 7, 22 + index * 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
        ))}
      </>
    );
  }
  if (kind === "saved") {
    return <div style={{ ...styles.toast, transform: `translateY(${interpolate(local, [0, 18], [-28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })}px)` }}>Lead Saved</div>;
  }
  if (kind === "typing") {
    return <div style={styles.typing}>{["Writing", "the", "follow-up"].slice(0, Math.min(3, Math.floor(local / 12) + 1)).join(" ")}</div>;
  }
  if (kind === "qr") {
    return <div style={{ ...styles.tapRipple, opacity: pulse, transform: `scale(${0.7 + pulse * 1.4})` }} />;
  }
  return null;
};

const HookFlash = ({ local }: { local: number }) => {
  const opacity = interpolate(local, [0, 8, 38, 58], [0, 0.55, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ ...styles.flashStack, opacity }}>
      <Img src={scan} style={{ ...styles.flashImage, transform: "rotate(-8deg) translateX(-64px)" }} />
      <Img src={scannedResult} style={{ ...styles.flashImage, transform: "rotate(7deg) translateX(64px)" }} />
    </div>
  );
};

const Headline = ({ text, local, align }: { text: string; local: number; align: "top" | "center" }) => {
  const opacity = interpolate(local, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(local, [0, 18], [32, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return <h1 style={{ ...styles.headline, top: align === "top" ? 128 : 690, opacity, transform: `translateY(${y}px)` }}>{text}</h1>;
};

const Tag = ({ text, local }: { text: string; local: number }) => (
  <div style={{ ...styles.tag, opacity: interpolate(local, [12, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{text}</div>
);

const FinalCard = ({ text }: { text: string }) => (
  <div style={styles.finalCard}>
    <div style={styles.logo}>ScanShare</div>
    <div style={styles.finalText}>{text}</div>
    <div style={styles.finalUrl}>{url}</div>
  </div>
);

const UrlFooter = () => <div style={styles.urlFooter}>{url}</div>;

const Background = ({ frame }: { frame: number }) => (
  <AbsoluteFill style={styles.background}>
    <div style={{ ...styles.light, transform: `translateY(${interpolate(frame, [0, fullDuration], [0, 90])}px)` }} />
  </AbsoluteFill>
);

const styles: Record<string, React.CSSProperties> = {
  root: {
    background: "#030407",
    color: "#fff",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    overflow: "hidden",
  },
  background: {
    background: "linear-gradient(155deg, #030407 0%, #07131a 44%, #101318 100%)",
  },
  light: {
    position: "absolute",
    left: -130,
    top: 220,
    width: 1340,
    height: 900,
    background: "radial-gradient(circle at 50% 50%, rgba(53, 232, 189, 0.28), rgba(69, 105, 255, 0.12) 45%, transparent 72%)",
    filter: "blur(18px)",
  },
  phoneWrap: {
    position: "absolute",
    left: 230,
    top: 360,
    width: 620,
    height: 1340,
    display: "grid",
    placeItems: "center",
  },
  phone: {
    position: "relative",
    width: 520,
    height: 1124,
    padding: 8,
    borderRadius: 58,
    background: "#050505",
    boxShadow: "0 56px 150px rgba(0, 0, 0, 0.62), 0 0 80px rgba(72, 232, 190, 0.16)",
    overflow: "hidden",
  },
  screen: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 50,
    display: "block",
  },
  headline: {
    position: "absolute",
    left: 82,
    right: 82,
    margin: 0,
    textAlign: "center",
    fontSize: 94,
    lineHeight: 0.93,
    letterSpacing: 0,
    fontWeight: 950,
    textWrap: "balance",
    textShadow: "0 20px 70px rgba(0,0,0,0.75)",
  },
  tag: {
    position: "absolute",
    left: 280,
    right: 280,
    bottom: 246,
    height: 60,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(53, 232, 189, 0.92)",
    color: "#04100d",
    fontSize: 28,
    fontWeight: 950,
  },
  scanLine: {
    position: "absolute",
    left: 56,
    right: 56,
    height: 5,
    borderRadius: 999,
    background: "#35e8bd",
    boxShadow: "0 0 34px #35e8bd",
  },
  fieldGlow: {
    position: "absolute",
    left: 54,
    right: 54,
    height: 58,
    borderRadius: 18,
    border: "3px solid rgba(53, 232, 189, 0.86)",
    boxShadow: "0 0 32px rgba(53, 232, 189, 0.35)",
  },
  toast: {
    position: "absolute",
    left: 92,
    right: 92,
    top: 112,
    height: 72,
    borderRadius: 22,
    display: "grid",
    placeItems: "center",
    background: "rgba(0, 0, 0, 0.78)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: 28,
    fontWeight: 950,
  },
  typing: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 98,
    padding: "20px 22px",
    borderRadius: 24,
    background: "rgba(0, 0, 0, 0.76)",
    fontSize: 25,
    fontWeight: 850,
  },
  tapRipple: {
    position: "absolute",
    left: 215,
    top: 520,
    width: 90,
    height: 90,
    borderRadius: 999,
    border: "6px solid rgba(53, 232, 189, 0.8)",
  },
  flashStack: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    filter: "blur(2px)",
  },
  flashImage: {
    width: 330,
    height: 714,
    objectFit: "cover",
    borderRadius: 42,
    boxShadow: "0 42px 120px rgba(0,0,0,0.6)",
  },
  finalCard: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(3,4,7,0.82)",
    textAlign: "center",
    padding: 80,
  },
  logo: {
    fontSize: 54,
    fontWeight: 950,
    marginBottom: 36,
    color: "#35e8bd",
  },
  finalText: {
    maxWidth: 880,
    fontSize: 92,
    lineHeight: 0.94,
    fontWeight: 950,
    letterSpacing: 0,
  },
  finalUrl: {
    marginTop: 48,
    fontSize: 38,
    fontWeight: 850,
    color: "rgba(255,255,255,0.9)",
  },
  urlFooter: {
    position: "absolute",
    left: 80,
    right: 80,
    bottom: 54,
    textAlign: "center",
    fontSize: 30,
    fontWeight: 850,
    color: "rgba(255,255,255,0.88)",
  },
  lifestyleImage: {
    position: "absolute",
    inset: "-42px -42px",
    width: "calc(100% + 84px)",
    height: "calc(100% + 84px)",
    objectFit: "cover",
    display: "block",
  },
  photoShade: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.18) 38%, rgba(0,0,0,0.24) 58%, rgba(0,0,0,0.72) 100%)",
  },
  lifestyleHeadline: {
    position: "absolute",
    left: 70,
    right: 70,
    margin: 0,
    color: "#ffffff",
    fontSize: 88,
    lineHeight: 0.95,
    letterSpacing: 0,
    fontWeight: 950,
    textShadow: "0 18px 60px rgba(0,0,0,0.72)",
    textWrap: "balance",
  },
  lifestyleTag: {
    position: "absolute",
    left: 72,
    bottom: 226,
    minWidth: 250,
    height: 58,
    padding: "0 26px",
    borderRadius: 999,
    display: "inline-grid",
    placeItems: "center",
    background: "rgba(53, 232, 189, 0.94)",
    color: "#03110d",
    fontSize: 27,
    fontWeight: 950,
    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
  },
  lifestyleFooter: {
    position: "absolute",
    left: 70,
    right: 70,
    bottom: 58,
    textAlign: "center",
    color: "rgba(255,255,255,0.92)",
    fontSize: 30,
    fontWeight: 900,
    textShadow: "0 12px 32px rgba(0,0,0,0.72)",
  },
  lifestyleFinal: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 76,
    textAlign: "center",
    background: "rgba(3,4,7,0.86)",
  },
  lifestyleFinalText: {
    maxWidth: 910,
    fontSize: 82,
    lineHeight: 0.96,
    fontWeight: 950,
    letterSpacing: 0,
  },
};

export const VIDEO_FPS = fps;
export const FULL_DURATION = fullDuration;
export const LOOP_DURATION = loopDuration;
export const LIFESTYLE_DURATION = lifestyleDuration;
