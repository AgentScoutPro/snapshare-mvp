import {
  ArrowUpRight,
  BadgeCheck,
  Camera,
  ContactRound,
  Crown,
  QrCode,
  Sparkles,
  UsersRound,
} from "lucide-react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import splash from "../../marketing-assets/screens/01-splash-screen.png";
import welcome from "../../marketing-assets/screens/02-welcome-auth.png";
import profileOne from "../../marketing-assets/screens/03-profile-setup-step-1.png";
import profileTwo from "../../marketing-assets/screens/04-profile-setup-step-2.png";
import cardReady from "../../marketing-assets/screens/05-profile-complete-card-ready.png";
import myCard from "../../marketing-assets/screens/06-my-card-screen.png";
import qrFull from "../../marketing-assets/screens/07-qr-full-screen-mode.png";
import contacts from "../../marketing-assets/screens/08-contacts-screen.png";
import contactDetail from "../../marketing-assets/screens/09-contact-detail-screen.png";
import followUp from "../../marketing-assets/screens/10-ai-follow-up-generator.png";
import events from "../../marketing-assets/screens/11-events-screen.png";
import eventDetail from "../../marketing-assets/screens/12-event-detail-screen.png";
import createEvent from "../../marketing-assets/screens/13-create-event-screen.png";
import scan from "../../marketing-assets/screens/14-scan-screen.png";
import scannedResult from "../../marketing-assets/screens/15-scanned-card-result.png";
import settings from "../../marketing-assets/screens/16-profile-settings-screen.png";
import emptyContacts from "../../marketing-assets/screens/17-empty-contacts-state.png";
import permissionDenied from "../../marketing-assets/screens/18-camera-permission-denied.png";
import paywall from "../../marketing-assets/screens/19-upgrade-prompt-paywall.png";

type LaunchScreen = {
  name: string;
  src: string;
  chapter: string;
  headline: string;
  detail: string;
  accent: string;
  icon: React.ReactNode;
};

const screens: LaunchScreen[] = [
  {
    name: "Splash",
    src: splash,
    chapter: "Brand",
    headline: "Your card. Always ready.",
    detail: "Open with a crisp brand moment and Pixel front and center.",
    accent: "#9b6cff",
    icon: <Sparkles size={30} />,
  },
  {
    name: "Welcome",
    src: welcome,
    chapter: "Onboarding",
    headline: "Get reps signed in fast.",
    detail: "A clean welcome/auth flow introduces the product without friction.",
    accent: "#47e7ff",
    icon: <ArrowUpRight size={30} />,
  },
  {
    name: "Profile step 1",
    src: profileOne,
    chapter: "Setup",
    headline: "Build the shareable profile.",
    detail: "Capture the basics that become a polished digital business card.",
    accent: "#8dffb3",
    icon: <ContactRound size={30} />,
  },
  {
    name: "Profile step 2",
    src: profileTwo,
    chapter: "Setup",
    headline: "Choose what to share.",
    detail: "Photo, socials, links, and visibility controls stay simple.",
    accent: "#8dffb3",
    icon: <ContactRound size={30} />,
  },
  {
    name: "Card ready",
    src: cardReady,
    chapter: "Activation",
    headline: "The card is ready.",
    detail: "Pixel celebrates the moment a user can start sharing.",
    accent: "#ffd166",
    icon: <BadgeCheck size={30} />,
  },
  {
    name: "My card",
    src: myCard,
    chapter: "Share",
    headline: "Show the digital card.",
    detail: "A polished card, QR preview, and share actions are ready at hand.",
    accent: "#b54cff",
    icon: <QrCode size={30} />,
  },
  {
    name: "QR mode",
    src: qrFull,
    chapter: "Share",
    headline: "Go full-screen for sharing.",
    detail: "The QR screen turns any in-person moment into an instant exchange.",
    accent: "#47e7ff",
    icon: <QrCode size={30} />,
  },
  {
    name: "Contacts",
    src: contacts,
    chapter: "Leads",
    headline: "Keep every lead organized.",
    detail: "Contacts become a scannable lead list with status and actions.",
    accent: "#8dffb3",
    icon: <UsersRound size={30} />,
  },
  {
    name: "Contact detail",
    src: contactDetail,
    chapter: "Leads",
    headline: "Open the full lead record.",
    detail: "Details, source, status, and reminders stay connected.",
    accent: "#8dffb3",
    icon: <ContactRound size={30} />,
  },
  {
    name: "AI follow-up",
    src: followUp,
    chapter: "Follow up",
    headline: "Draft smarter follow-ups.",
    detail: "AI-generated options turn a meeting into a timely message.",
    accent: "#e037d3",
    icon: <Sparkles size={30} />,
  },
  {
    name: "Events",
    src: events,
    chapter: "Events",
    headline: "Organize by where you met.",
    detail: "Events make it easy to group leads by source and campaign.",
    accent: "#ffd166",
    icon: <UsersRound size={30} />,
  },
  {
    name: "Event detail",
    src: eventDetail,
    chapter: "Events",
    headline: "Track the event pipeline.",
    detail: "Event pages give teams a shared view of activity and sponsors.",
    accent: "#ffd166",
    icon: <UsersRound size={30} />,
  },
  {
    name: "Create event",
    src: createEvent,
    chapter: "Events",
    headline: "Create event mode.",
    detail: "Set source, sponsor options, and message sequences before the rush.",
    accent: "#ffd166",
    icon: <UsersRound size={30} />,
  },
  {
    name: "Scan",
    src: scan,
    chapter: "Capture",
    headline: "Camera-first card scanning.",
    detail: "Scan card or QR, with Pixel guiding the capture moment.",
    accent: "#47e7ff",
    icon: <Camera size={30} />,
  },
  {
    name: "Scanned result",
    src: scannedResult,
    chapter: "Capture",
    headline: "Review OCR before saving.",
    detail: "Editable fields keep every captured lead clean before it moves on.",
    accent: "#47e7ff",
    icon: <BadgeCheck size={30} />,
  },
  {
    name: "Settings",
    src: settings,
    chapter: "Account",
    headline: "Control profile and integrations.",
    detail: "Settings support account data, subscription, privacy, and sync.",
    accent: "#b54cff",
    icon: <ContactRound size={30} />,
  },
  {
    name: "Empty state",
    src: emptyContacts,
    chapter: "First use",
    headline: "Make first use feel inviting.",
    detail: "Empty contacts still gives users a clear next move.",
    accent: "#9b6cff",
    icon: <Sparkles size={30} />,
  },
  {
    name: "Permission",
    src: permissionDenied,
    chapter: "Recovery",
    headline: "Recover from blocked camera access.",
    detail: "Permission screens explain the fix and keep the flow alive.",
    accent: "#ff7a7a",
    icon: <Camera size={30} />,
  },
  {
    name: "Upgrade",
    src: paywall,
    chapter: "Growth",
    headline: "Upgrade when value is clear.",
    detail: "The paywall frames premium AI, CRM, and event workflows.",
    accent: "#ffd166",
    icon: <Crown size={30} />,
  },
];

const introFrames = 132;
const sceneFrames = 54;
const outroStart = introFrames + screens.length * sceneFrames + 42;
const duration = 1320;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: ease,
};

export const SnapShareLaunch = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const activeIndex = Math.min(
    screens.length - 1,
    Math.max(0, Math.floor((frame - introFrames) / sceneFrames)),
  );
  const active = screens[activeIndex];
  const local = frame - introFrames - activeIndex * sceneFrames;
  const introOpacity = interpolate(frame, [0, 32, 98, 130], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showWalkthrough = interpolate(frame, [110, 148, outroStart - 30, outroStart], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outro = interpolate(frame, [outroStart, outroStart + 58], [0, 1], clamp);
  const phoneSpring = spring({
    frame: frame - 110,
    fps,
    config: { damping: 16, stiffness: 86 },
  });

  return (
    <AbsoluteFill style={styles.root}>
      <Background frame={frame} accent={active.accent} />

      <div
        style={{
          ...styles.intro,
          opacity: introOpacity,
          transform: `translateY(${interpolate(frame, [0, 70], [24, 0], clamp)}px)`,
        }}
      >
        <span style={styles.kicker}>ScanShare launch video</span>
        <h1 style={styles.introTitle}>From business card to CRM in seconds.</h1>
        <p style={styles.introCopy}>
          A mobile-first walkthrough built from the latest Figma app screens:
          profile, card sharing, AI follow-up, events, scanning, and upgrade.
        </p>
      </div>

      <div style={{ ...styles.walkthrough, opacity: showWalkthrough }}>
        <div style={styles.copyPanel}>
          <div style={{ ...styles.iconBadge, color: active.accent }}>{active.icon}</div>
          <span style={{ ...styles.kicker, color: active.accent }}>{active.chapter}</span>
          <h2 style={styles.sceneTitle}>{active.headline}</h2>
          <p style={styles.sceneCopy}>{active.detail}</p>
          <Progress activeIndex={activeIndex} />
        </div>

        <div
          style={{
            ...styles.heroDevice,
            transform: `translateY(${interpolate(phoneSpring, [0, 1], [130, 0])}px) rotate(${interpolate(phoneSpring, [0, 1], [4, -1.5])}deg)`,
          }}
        >
          <ScreenDevice
            screen={active}
            localFrame={local}
            scale={1}
            focus
          />
        </div>

        <SideStack frame={frame} activeIndex={activeIndex} />
      </div>

      <div
        style={{
          ...styles.outro,
          opacity: outro,
          transform: `scale(${interpolate(outro, [0, 1], [0.94, 1])})`,
        }}
      >
        <div style={styles.outroScreens}>
          {[myCard, followUp, scan, paywall].map((src, index) => (
            <div
              key={src}
              style={{
                ...styles.outroCard,
                transform: `translateY(${index % 2 === 0 ? -24 : 24}px) rotate(${[-7, -2, 3, 8][index]}deg)`,
              }}
            >
              <Img src={src} style={styles.outroImage} />
            </div>
          ))}
        </div>
        <h2 style={styles.outroTitle}>Ready for every card after hello.</h2>
        <p style={styles.outroCopy}>
          ScanShare helps reps share their card, capture leads, organize events,
          and follow up while the conversation is still warm.
        </p>
      </div>
    </AbsoluteFill>
  );
};

const Background = ({ frame, accent }: { frame: number; accent: string }) => {
  const drift = interpolate(frame, [0, duration], [0, 1]);
  return (
    <AbsoluteFill style={styles.background}>
      <div
        style={{
          ...styles.glowA,
          background: accent,
          transform: `translate(${drift * 90}px, ${drift * 24}px) rotate(-14deg)`,
        }}
      />
      <div
        style={{
          ...styles.glowB,
          transform: `translate(${-drift * 80}px, ${drift * 60}px) rotate(18deg)`,
        }}
      />
      <div style={styles.grid} />
    </AbsoluteFill>
  );
};

const SideStack = ({
  frame,
  activeIndex,
}: {
  frame: number;
  activeIndex: number;
}) => {
  const previous = screens[(activeIndex + screens.length - 1) % screens.length];
  const next = screens[(activeIndex + 1) % screens.length];
  const local = frame - introFrames - activeIndex * sceneFrames;
  const slide = interpolate(local, [0, 20], [36, 0], clamp);

  return (
    <div style={styles.sideStack}>
      <ScreenDevice screen={previous} localFrame={local} scale={0.55} offset={-slide} />
      <ScreenDevice screen={next} localFrame={local} scale={0.55} offset={slide} />
    </div>
  );
};

const ScreenDevice = ({
  screen,
  localFrame,
  scale,
  offset = 0,
  focus,
}: {
  screen: LaunchScreen;
  localFrame: number;
  scale: number;
  offset?: number;
  focus?: boolean;
}) => {
  const opacity = interpolate(localFrame, [0, 14, sceneFrames - 12, sceneFrames], [0, 1, 1, 0.86], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift = interpolate(localFrame, [0, 20], [28, 0], clamp);

  return (
    <div
      style={{
        ...styles.device,
        width: 390 * scale,
        height: 844 * scale,
        borderRadius: 46 * scale,
        padding: 6 * scale,
        opacity,
        boxShadow: focus
          ? `0 46px 110px rgba(0, 0, 0, 0.55), 0 0 70px ${screen.accent}55`
          : "0 28px 70px rgba(0, 0, 0, 0.38)",
        transform: `translate(${offset}px, ${lift}px)`,
      }}
    >
      <Img
        src={screen.src}
        style={{
          ...styles.screenImage,
          borderRadius: 40 * scale,
        }}
      />
      {focus ? (
        <div style={{ ...styles.screenTag, borderColor: screen.accent }}>
          {screen.name}
        </div>
      ) : null}
    </div>
  );
};

const Progress = ({ activeIndex }: { activeIndex: number }) => {
  const chapters = ["Brand", "Onboarding", "Setup", "Share", "Leads", "Follow up", "Events", "Capture", "Growth"];
  return (
    <div style={styles.progress}>
      {chapters.map((chapter) => {
        const index = screens.findIndex((screen) => screen.chapter === chapter);
        const active = index <= activeIndex;
        return (
          <div key={chapter} style={styles.progressItem}>
            <span
              style={{
                ...styles.progressDot,
                background: active ? "#ffffff" : "rgba(255,255,255,0.24)",
              }}
            />
            <span style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.48)" }}>
              {chapter}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    background: "#05020c",
    color: "#ffffff",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    overflow: "hidden",
  },
  background: {
    background:
      "linear-gradient(135deg, #05020c 0%, #0b1024 36%, #102e4a 68%, #05020c 100%)",
  },
  glowA: {
    position: "absolute",
    width: 760,
    height: 430,
    left: -150,
    top: -130,
    borderRadius: 999,
    opacity: 0.36,
    filter: "blur(36px)",
  },
  glowB: {
    position: "absolute",
    width: 860,
    height: 520,
    right: -190,
    bottom: -210,
    borderRadius: 999,
    background: "rgba(71,231,255,0.32)",
    filter: "blur(38px)",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
    backgroundSize: "72px 72px",
    maskImage:
      "linear-gradient(90deg, transparent, black 18%, black 82%, transparent)",
  },
  intro: {
    position: "absolute",
    left: 150,
    right: 150,
    top: 230,
    zIndex: 4,
  },
  kicker: {
    display: "block",
    marginBottom: 18,
    color: "#47e7ff",
    fontSize: 24,
    fontWeight: 950,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  introTitle: {
    margin: 0,
    maxWidth: 1280,
    fontSize: 112,
    lineHeight: 0.92,
    fontWeight: 950,
    letterSpacing: 0,
  },
  introCopy: {
    margin: "32px 0 0",
    maxWidth: 1040,
    color: "rgba(255,255,255,0.76)",
    fontSize: 32,
    lineHeight: 1.35,
    fontWeight: 650,
  },
  walkthrough: {
    position: "absolute",
    inset: 0,
    zIndex: 3,
  },
  copyPanel: {
    position: "absolute",
    left: 126,
    top: 214,
    width: 610,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    display: "grid",
    placeItems: "center",
    marginBottom: 24,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.14)",
  },
  sceneTitle: {
    margin: 0,
    fontSize: 76,
    lineHeight: 0.95,
    fontWeight: 950,
    letterSpacing: 0,
  },
  sceneCopy: {
    margin: "26px 0 34px",
    color: "rgba(255,255,255,0.76)",
    fontSize: 28,
    lineHeight: 1.35,
    fontWeight: 650,
  },
  progress: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 13,
  },
  progressItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minHeight: 26,
    fontSize: 17,
    fontWeight: 850,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  heroDevice: {
    position: "absolute",
    top: 74,
    left: 894,
    width: 390,
    height: 844,
  },
  sideStack: {
    position: "absolute",
    right: 120,
    top: 152,
    display: "grid",
    gap: 44,
  },
  device: {
    position: "relative",
    background: "#050505",
    border: "1px solid rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  screenImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  screenTag: {
    position: "absolute",
    left: 22,
    bottom: 22,
    padding: "9px 13px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.58)",
    border: "1px solid",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 900,
    backdropFilter: "blur(12px)",
  },
  outro: {
    position: "absolute",
    inset: 0,
    zIndex: 5,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  outroScreens: {
    height: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    marginBottom: 62,
  },
  outroCard: {
    width: 134,
    height: 290,
    borderRadius: 24,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 22px 70px rgba(0,0,0,0.38)",
    background: "#050505",
  },
  outroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  outroTitle: {
    margin: 0,
    maxWidth: 1080,
    fontSize: 80,
    lineHeight: 0.98,
    fontWeight: 950,
    letterSpacing: 0,
  },
  outroCopy: {
    margin: "28px 0 0",
    maxWidth: 920,
    color: "rgba(255,255,255,0.76)",
    fontSize: 30,
    lineHeight: 1.35,
    fontWeight: 650,
  },
};
