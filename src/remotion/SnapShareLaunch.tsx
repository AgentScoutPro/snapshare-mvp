import {
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Check,
  Cloud,
  ContactRound,
  History,
  MessageSquare,
  ScanLine,
  Send,
  Settings,
  ShieldCheck,
  Tags,
  UsersRound,
  Workflow,
} from "lucide-react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const screens = [
  {
    id: "scan",
    nav: "Scan",
    eyebrow: "Camera-first capture",
    title: "Scan the card",
    copy: "Capture front and back, detect edges, or upload from the camera roll.",
    icon: <Camera size={34} />,
    accent: "#47e7ff",
  },
  {
    id: "review",
    nav: "Flow",
    eyebrow: "OCR confidence",
    title: "Confirm details",
    copy: "Fix name, title, email, and phone before anything touches the CRM.",
    icon: <BadgeCheck size={34} />,
    accent: "#8dffb3",
  },
  {
    id: "sync",
    nav: "Flow",
    eyebrow: "Phone + GoHighLevel",
    title: "Save and sync",
    copy: "Add source, owner, tags, and stage with connected sync status visible.",
    icon: <Cloud size={34} />,
    accent: "#b54cff",
  },
  {
    id: "opportunity",
    nav: "Flow",
    eyebrow: "Sales context",
    title: "Create opportunity",
    copy: "Attach pipeline, stage, value, lead status, and follow-up date.",
    icon: <BriefcaseBusiness size={34} />,
    accent: "#ffd166",
  },
  {
    id: "follow",
    nav: "Flow",
    eyebrow: "Consent-aware",
    title: "Queue follow-up",
    copy: "Use SMS or email templates while consent stays front and center.",
    icon: <Send size={34} />,
    accent: "#e037d3",
  },
  {
    id: "success",
    nav: "Flow",
    eyebrow: "All set",
    title: "Done",
    copy: "Saved to contacts, synced to GoHighLevel, and ready for follow-up.",
    icon: <Check size={34} />,
    accent: "#8dffb3",
  },
  {
    id: "history",
    nav: "History",
    eyebrow: "Reliable operations",
    title: "Scan history",
    copy: "Review recent scans, retry failures, export CSVs, and restore backups.",
    icon: <History size={34} />,
    accent: "#47e7ff",
  },
  {
    id: "team",
    nav: "Team",
    eyebrow: "Event mode",
    title: "Batch with your team",
    copy: "Apply event source, assign reps, and track scan progress in the field.",
    icon: <UsersRound size={34} />,
    accent: "#ffd166",
  },
  {
    id: "settings",
    nav: "Settings",
    eyebrow: "Admin controls",
    title: "Configure everything",
    copy: "Manage field mapping, templates, tags, privacy controls, and backups.",
    icon: <Settings size={34} />,
    accent: "#b54cff",
  },
] as const;

const fps = 30;
const sceneStarts = screens.map((_, index) => 165 + index * 78);

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
};

export const SnapShareLaunch = () => {
  const frame = useCurrentFrame();
  const { fps: videoFps } = useVideoConfig();
  const currentIndex = Math.min(
    screens.length - 1,
    Math.max(0, Math.floor((frame - 165) / 78)),
  );
  const current = screens[currentIndex];
  const introOut = interpolate(frame, [125, 160], [1, 0], clamp);
  const phoneIn = spring({
    frame: frame - 118,
    fps: videoFps,
    config: { damping: 16, stiffness: 90 },
  });
  const closeIn = interpolate(frame, [980, 1040], [0, 1], clamp);

  return (
    <AbsoluteFill style={styles.root}>
      <Background />
      <div style={styles.brandRail}>
        <Img src={staticFile("brand/snapshare-logo.png")} style={styles.logo} />
        <div style={styles.railLine} />
        <FeatureStack frame={frame} />
      </div>

      <div
        style={{
          ...styles.intro,
          opacity: introOut,
          transform: `translateY(${interpolate(frame, [0, 85], [24, 0], clamp)}px) scale(${interpolate(frame, [0, 120], [0.96, 1], clamp)})`,
        }}
      >
        <span style={styles.kicker}>Launch walkthrough</span>
        <h1 style={styles.introTitle}>Scan. Confirm. Sync. Follow up.</h1>
        <p style={styles.introCopy}>
          SnapShare turns business cards into trusted contacts, CRM records, and
          consent-aware follow-ups in one fast field workflow.
        </p>
      </div>

      <div
        style={{
          ...styles.stage,
          opacity: interpolate(frame, [118, 160, 950, 1000], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            ...styles.copyPanel,
            transform: `translateX(${interpolate(frame, [118, 170], [-70, 0], clamp)}px)`,
          }}
        >
          <span style={{ ...styles.kicker, color: current.accent }}>
            {current.eyebrow}
          </span>
          <h2 style={styles.sceneTitle}>{current.title}</h2>
          <p style={styles.sceneCopy}>{current.copy}</p>
          <Progress frame={frame} />
        </div>

        <div
          style={{
            ...styles.phoneWrap,
            transform: `translateY(${interpolate(phoneIn, [0, 1], [130, 0])}px) rotate(${interpolate(phoneIn, [0, 1], [5, -2])}deg)`,
          }}
        >
          <Phone frame={frame} currentIndex={currentIndex} />
        </div>

        <Callouts frame={frame} currentIndex={currentIndex} />
      </div>

      <div
        style={{
          ...styles.close,
          opacity: closeIn,
          transform: `scale(${interpolate(closeIn, [0, 1], [0.94, 1])})`,
        }}
      >
        <Img src={staticFile("brand/snapshare-logo.png")} style={styles.closeLogo} />
        <h2 style={styles.closeTitle}>Ready for every card after hello.</h2>
        <p style={styles.closeCopy}>
          Capture cleaner data, move faster at events, and keep follow-up
          accountable from the first scan.
        </p>
      </div>
    </AbsoluteFill>
  );
};

const Background = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 1080], [0, 1]);

  return (
    <AbsoluteFill style={styles.background}>
      <div
        style={{
          ...styles.glowA,
          transform: `translate(${drift * 90}px, ${drift * 30}px) rotate(-13deg)`,
        }}
      />
      <div
        style={{
          ...styles.glowB,
          transform: `translate(${-drift * 70}px, ${drift * 55}px) rotate(18deg)`,
        }}
      />
      <div style={styles.grid} />
    </AbsoluteFill>
  );
};

const FeatureStack = ({ frame }: { frame: number }) => {
  const items = [
    ["OCR review", BadgeCheck],
    ["GHL sync", Cloud],
    ["Team mode", UsersRound],
  ] as const;

  return (
    <div style={styles.featureStack}>
      {items.map(([label, Icon], index) => {
        const opacity = interpolate(frame, [20 + index * 15, 62 + index * 15], [0, 1], clamp);
        return (
          <div key={label} style={{ ...styles.featurePill, opacity }}>
            <Icon size={21} />
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

const Progress = ({ frame }: { frame: number }) => {
  return (
    <div style={styles.progressList}>
      {screens.map((screen, index) => {
        const active = frame >= sceneStarts[index];
        return (
          <div key={screen.id} style={styles.progressItem}>
            <span
              style={{
                ...styles.progressDot,
                background: active ? screen.accent : "rgba(255,255,255,0.22)",
                boxShadow: active ? `0 0 24px ${screen.accent}` : "none",
              }}
            />
            <span style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.48)" }}>
              {screen.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const Phone = ({
  frame,
  currentIndex,
}: {
  frame: number;
  currentIndex: number;
}) => {
  const current = screens[currentIndex];
  const start = sceneStarts[currentIndex] ?? 165;
  const local = frame - start;
  const slide = interpolate(local, [0, 22], [34, 0], clamp);
  const opacity = interpolate(local, [0, 18], [0, 1], clamp);

  return (
    <div style={styles.phone}>
      <div style={styles.notch} />
      <div style={styles.statusBar}>
        <span>9:41</span>
        <span>SnapShare</span>
        <span>5G</span>
      </div>
      <div style={styles.appHeader}>
        <div>
          <span style={styles.eyeline}>Sales capture</span>
          <strong>SnapShare</strong>
        </div>
        <div style={styles.savedBadge}>
          <ContactRound size={19} />
          12
        </div>
      </div>
      <div style={styles.screen}>
        <div
          style={{
            ...styles.screenInner,
            opacity,
            transform: `translateY(${slide}px)`,
          }}
        >
          <ScreenContent id={current.id} accent={current.accent} />
        </div>
      </div>
      <div style={styles.nav}>
        {[
          ["Scan", ScanLine],
          ["Flow", Workflow],
          ["History", History],
          ["Team", UsersRound],
          ["Settings", Settings],
        ].map(([label, Icon]) => {
          const active = current.nav === label;
          return (
            <div
              key={label as string}
              style={{
                ...styles.navItem,
                color: active ? "#ffffff" : "rgba(255,255,255,0.42)",
                background: active ? "rgba(181,76,255,0.92)" : "transparent",
              }}
            >
              <Icon size={24} />
              <span>{label as string}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ScreenContent = ({
  id,
  accent,
}: {
  id: (typeof screens)[number]["id"];
  accent: string;
}) => {
  if (id === "scan") {
    return (
      <>
        <FlowStrip active={0} />
        <div style={styles.toolbar}>
          <span style={styles.activePill}>Front</span>
          <span style={styles.pill}>Back</span>
          <span style={styles.pill}>Upload</span>
        </div>
        <div style={styles.cameraCard}>
          <div style={styles.scanEdgeTop} />
          <div style={styles.scanEdgeRight} />
          <div style={styles.scanEdgeBottom} />
          <div style={styles.scanEdgeLeft} />
          <div style={styles.businessCard}>
            <span>Brightline Studio</span>
            <strong>Maya Chen</strong>
            <small>Partnerships Lead</small>
            <small>maya@brightline.studio</small>
          </div>
        </div>
        <h3 style={styles.phoneTitle}>Ready to scan</h3>
        <p style={styles.phoneCopy}>Detect card edges and capture clean contact data.</p>
        <button style={styles.primaryButton}>Scan Card</button>
      </>
    );
  }

  if (id === "review") {
    return (
      <>
        <PhoneTitle icon={<BadgeCheck size={24} />} title="Confirm details" />
        <div style={styles.warning}>Possible duplicate found in phone contacts.</div>
        <div style={styles.metricGrid}>
          <Metric label="Name" value="99%" />
          <Metric label="Email" value="98%" />
          <Metric label="Phone" value="88%" warn />
        </div>
        {["Maya Chen", "Partnerships Lead", "Brightline Studio", "maya@brightline.studio"].map((value) => (
          <Field key={value} value={value} />
        ))}
        <button style={styles.primaryButton}>Confirm Contact</button>
      </>
    );
  }

  if (id === "sync") {
    return (
      <>
        <PhoneTitle icon={<Cloud size={24} />} title="Save + sync" />
        <Profile />
        {["Phoenix Mixer", "event, agency-partner, warm-lead", "Avery Stone"].map((value) => (
          <Field key={value} value={value} />
        ))}
        <div style={styles.stageGrid}>
          {["Event Lead", "VIP Follow Up", "Partner", "Newsletter"].map((stage, index) => (
            <span key={stage} style={index === 0 ? styles.stageActive : styles.stageButton}>
              {stage}
            </span>
          ))}
        </div>
        <Status label="Phone contacts" value="Ready" />
        <Status label="GoHighLevel" value="Connected" />
      </>
    );
  }

  if (id === "opportunity") {
    return (
      <>
        <PhoneTitle icon={<BriefcaseBusiness size={24} />} title="Opportunity" />
        {["Sales Pipeline", "New Lead", "$2,500", "Warm", "Tomorrow 10:00 AM"].map((value) => (
          <Field key={value} value={value} />
        ))}
        <button style={styles.primaryButton}>Add Opportunity</button>
      </>
    );
  }

  if (id === "follow") {
    return (
      <>
        <PhoneTitle icon={<Send size={24} />} title="Follow up" />
        <div style={styles.consent}>
          <ShieldCheck size={22} />
          <span>Confirmed consent</span>
        </div>
        <div style={styles.segment}>
          <span style={styles.segmentActive}>Text</span>
          <span>Email</span>
        </div>
        <div style={styles.messageBox}>
          Hi Maya, great meeting you today. You said it was okay for me to send
          this over. Here is my contact card and partner info.
        </div>
        <button style={styles.primaryButton}>Queue Follow-Up</button>
      </>
    );
  }

  if (id === "success") {
    return (
      <div style={styles.success}>
        <div style={styles.successMark}>
          <Check size={44} />
        </div>
        <h3 style={styles.successTitle}>Done</h3>
        <p style={styles.phoneCopy}>Maya was saved, synced, and prepared for follow-up.</p>
        {["Phone contact", "GoHighLevel upsert", "Follow-up queued"].map((label) => (
          <Status key={label} label={label} value="Done" />
        ))}
      </div>
    );
  }

  if (id === "history") {
    return (
      <>
        <PhoneTitle icon={<History size={24} />} title="Scan history" />
        {["Export CSV", "Backup"].map((label) => (
          <button key={label} style={styles.secondaryButton}>{label}</button>
        ))}
        {["Maya Chen - Phoenix Mixer", "Noah Rivera - Open House", "Priya Shah - Expo"].map((name, index) => (
          <HistoryRow key={name} name={name} retry={index === 1} />
        ))}
      </>
    );
  }

  if (id === "team") {
    return (
      <>
        <PhoneTitle icon={<UsersRound size={24} />} title="Team / event" />
        <div style={styles.eventCard}>Phoenix SMB Expo source applied</div>
        {["Avery Stone", "Jordan Lee", "Morgan Patel"].map((rep) => (
          <Field key={rep} value={rep} />
        ))}
        <div style={styles.metricGrid}>
          <Metric label="Batch" value="42" />
          <Metric label="Synced" value="39" />
          <Metric label="Retry" value="3" warn />
        </div>
      </>
    );
  }

  return (
    <>
      <PhoneTitle icon={<Settings size={24} />} title="Settings" />
      {[
        ["GoHighLevel", Cloud],
        ["Field mapping", Workflow],
        ["Default tags", Tags],
        ["Templates", MessageSquare],
        ["Privacy controls", ShieldCheck],
      ].map(([label, Icon]) => (
        <div key={label as string} style={styles.settingsRow}>
          <Icon size={23} color={accent} />
          <span>{label as string}</span>
        </div>
      ))}
    </>
  );
};

const FlowStrip = ({ active }: { active: number }) => (
  <div style={styles.flowStrip}>
    {["Scan", "Confirm", "Save", "Sync", "Follow"].map((step, index) => (
      <span key={step} style={index === active ? styles.flowActive : undefined}>
        {step}
      </span>
    ))}
  </div>
);

const PhoneTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div style={styles.phoneTitleRow}>
    <span>{icon}</span>
    <h3>{title}</h3>
  </div>
);

const Metric = ({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) => (
  <div style={{ ...styles.metric, color: warn ? "#ffd166" : "#8dffb3" }}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const Field = ({ value }: { value: string }) => (
  <div style={styles.field}>
    <span>{value}</span>
  </div>
);

const Profile = () => (
  <div style={styles.profile}>
    <span>M</span>
    <div>
      <strong>Maya Chen</strong>
      <p>Brightline Studio</p>
    </div>
  </div>
);

const Status = ({ label, value }: { label: string; value: string }) => (
  <div style={styles.statusLine}>
    <ContactRound size={20} />
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const HistoryRow = ({ name, retry }: { name: string; retry?: boolean }) => (
  <div style={styles.historyRow}>
    <span>{name}</span>
    <strong style={{ color: retry ? "#ffd166" : "#8dffb3" }}>
      {retry ? "Retry" : "Synced"}
    </strong>
  </div>
);

const Callouts = ({
  frame,
  currentIndex,
}: {
  frame: number;
  currentIndex: number;
}) => {
  const current = screens[currentIndex];
  const start = sceneStarts[currentIndex] ?? 165;
  const local = frame - start;
  const show = interpolate(local, [12, 32, 64, 78], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        ...styles.callout,
        opacity: show,
        borderColor: current.accent,
        transform: `translateY(${interpolate(show, [0, 1], [22, 0])}px)`,
      }}
    >
      <div style={{ ...styles.calloutIcon, color: current.accent }}>
        {current.icon}
      </div>
      <strong>{current.eyebrow}</strong>
      <span>{current.copy}</span>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    background: "#040712",
    color: "#ffffff",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    overflow: "hidden",
  },
  background: {
    background:
      "linear-gradient(135deg, #060816 0%, #0b2444 44%, #063854 70%, #030611 100%)",
  },
  glowA: {
    position: "absolute",
    width: 820,
    height: 390,
    left: -170,
    top: -90,
    borderRadius: 999,
    background: "rgba(205, 62, 221, 0.48)",
    filter: "blur(24px)",
  },
  glowB: {
    position: "absolute",
    width: 900,
    height: 460,
    right: -170,
    bottom: -170,
    borderRadius: 999,
    background: "rgba(38, 151, 217, 0.44)",
    filter: "blur(24px)",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
    backgroundSize: "72px 72px",
    maskImage: "linear-gradient(90deg, transparent, black 16%, black 84%, transparent)",
  },
  brandRail: {
    position: "absolute",
    left: 72,
    top: 64,
    bottom: 64,
    width: 260,
    display: "flex",
    flexDirection: "column",
    gap: 28,
    zIndex: 3,
  },
  logo: {
    width: 230,
    height: "auto",
    filter: "drop-shadow(0 0 26px rgba(181, 76, 255, 0.46))",
  },
  railLine: {
    width: 1,
    flex: 1,
    marginLeft: 16,
    background: "linear-gradient(180deg, rgba(255,255,255,0.35), transparent)",
  },
  featureStack: {
    display: "grid",
    gap: 12,
  },
  featurePill: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    width: "fit-content",
    minHeight: 46,
    padding: "0 16px",
    borderRadius: 999,
    color: "rgba(255,255,255,0.86)",
    background: "rgba(0,0,0,0.28)",
    border: "1px solid rgba(255,255,255,0.16)",
    fontSize: 18,
    fontWeight: 850,
  },
  intro: {
    position: "absolute",
    left: 390,
    top: 250,
    width: 1120,
    zIndex: 4,
  },
  kicker: {
    display: "block",
    color: "#47e7ff",
    fontSize: 24,
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 20,
  },
  introTitle: {
    margin: 0,
    fontSize: 118,
    lineHeight: 0.9,
    fontWeight: 950,
    letterSpacing: 0,
    textTransform: "uppercase",
    maxWidth: 1040,
  },
  introCopy: {
    margin: "34px 0 0",
    maxWidth: 850,
    color: "rgba(255,255,255,0.78)",
    fontSize: 34,
    lineHeight: 1.32,
    fontWeight: 650,
  },
  stage: {
    position: "absolute",
    inset: 0,
    zIndex: 2,
  },
  copyPanel: {
    position: "absolute",
    left: 390,
    top: 262,
    width: 560,
  },
  sceneTitle: {
    margin: 0,
    fontSize: 74,
    lineHeight: 0.95,
    letterSpacing: 0,
    fontWeight: 950,
  },
  sceneCopy: {
    margin: "26px 0 34px",
    color: "rgba(255,255,255,0.76)",
    fontSize: 28,
    lineHeight: 1.34,
    fontWeight: 650,
  },
  progressList: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 13,
    width: 560,
  },
  progressItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 18,
    fontWeight: 850,
  },
  progressDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
  },
  phoneWrap: {
    position: "absolute",
    top: 78,
    right: 390,
    width: 424,
    height: 900,
  },
  phone: {
    width: 424,
    height: 900,
    padding: 15,
    borderRadius: 52,
    background: "#050505",
    boxShadow:
      "0 46px 110px rgba(0,0,0,0.52), 0 0 0 1px rgba(255,255,255,0.16), inset 0 0 0 1px rgba(255,255,255,0.08)",
    position: "relative",
  },
  notch: {
    position: "absolute",
    top: 15,
    left: "50%",
    width: 132,
    height: 32,
    borderRadius: "0 0 18px 18px",
    background: "#000",
    transform: "translateX(-50%)",
    zIndex: 4,
  },
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 20px 8px",
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    fontWeight: 900,
  },
  appHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "7px 4px 13px",
    padding: 17,
    borderRadius: 30,
    background: "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 25,
    fontWeight: 950,
  },
  eyeline: {
    display: "block",
    color: "#47e7ff",
    fontSize: 12,
    fontWeight: 950,
    textTransform: "uppercase",
  },
  savedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 42,
    padding: "0 14px",
    borderRadius: 999,
    background: "rgba(181, 76, 255, 0.18)",
    color: "#e6c1ff",
    fontWeight: 950,
    fontSize: 16,
  },
  screen: {
    height: 667,
    overflow: "hidden",
    borderRadius: 34,
    background:
      "radial-gradient(circle at 50% 2%, rgba(71, 231, 255, 0.16), transparent 18rem), linear-gradient(180deg, #0d1320 0%, #060811 100%)",
  },
  screenInner: {
    height: "100%",
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  flowStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 5,
    padding: 5,
    borderRadius: 999,
    background: "rgba(255,255,255,0.07)",
    fontSize: 11,
    fontWeight: 950,
    color: "rgba(255,255,255,0.42)",
  },
  flowActive: {
    display: "grid",
    placeItems: "center",
    minHeight: 28,
    borderRadius: 999,
    color: "#07101a",
    background: "#47e7ff",
  },
  toolbar: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1.25fr",
    gap: 8,
  },
  pill: {
    display: "grid",
    placeItems: "center",
    minHeight: 40,
    borderRadius: 999,
    background: "rgba(255,255,255,0.11)",
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    fontWeight: 950,
  },
  activePill: {
    display: "grid",
    placeItems: "center",
    minHeight: 40,
    borderRadius: 999,
    background: "#47e7ff",
    color: "#06101a",
    fontSize: 13,
    fontWeight: 950,
  },
  cameraCard: {
    minHeight: 250,
    borderRadius: 31,
    background:
      "linear-gradient(rgba(9,14,26,0.5), rgba(9,14,26,0.5)), linear-gradient(145deg, rgba(32,165,255,0.16), rgba(181,76,255,0.1))",
    border: "1px solid rgba(255,255,255,0.14)",
    display: "grid",
    placeItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  scanEdgeTop: {
    position: "absolute",
    top: 28,
    left: "14%",
    width: "72%",
    height: 2,
    background: "#47e7ff",
    boxShadow: "0 0 16px rgba(71,231,255,0.68)",
  },
  scanEdgeBottom: {
    position: "absolute",
    bottom: 28,
    left: "14%",
    width: "72%",
    height: 2,
    background: "#47e7ff",
    boxShadow: "0 0 16px rgba(71,231,255,0.68)",
  },
  scanEdgeLeft: {
    position: "absolute",
    left: 28,
    top: "21%",
    width: 2,
    height: "58%",
    background: "#47e7ff",
    boxShadow: "0 0 16px rgba(71,231,255,0.68)",
  },
  scanEdgeRight: {
    position: "absolute",
    right: 28,
    top: "21%",
    width: 2,
    height: "58%",
    background: "#47e7ff",
    boxShadow: "0 0 16px rgba(71,231,255,0.68)",
  },
  businessCard: {
    width: 260,
    padding: 23,
    borderRadius: 19,
    background: "rgba(255,255,255,0.96)",
    color: "#111",
    boxShadow: "0 22px 44px rgba(0,0,0,0.3)",
    transform: "rotate(-3deg)",
    zIndex: 1,
  },
  phoneTitle: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 950,
  },
  phoneCopy: {
    margin: 0,
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 1.4,
    fontWeight: 650,
  },
  primaryButton: {
    minHeight: 58,
    border: 0,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontWeight: 950,
    fontSize: 16,
    background: "linear-gradient(90deg, #a63bff 0%, #d12ad4 52%, #2fb8ff 100%)",
    boxShadow: "0 24px 80px rgba(181,76,255,0.28)",
  },
  secondaryButton: {
    minHeight: 48,
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 999,
    color: "#fff",
    background: "rgba(255,255,255,0.08)",
    fontWeight: 950,
    fontSize: 15,
  },
  phoneTitleRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    fontSize: 25,
    fontWeight: 950,
  },
  warning: {
    padding: 14,
    borderRadius: 18,
    color: "#ffd166",
    background: "rgba(255,209,102,0.1)",
    border: "1px solid rgba(255,209,102,0.2)",
    fontSize: 15,
    fontWeight: 850,
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  metric: {
    padding: 12,
    borderRadius: 17,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  field: {
    minHeight: 53,
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    borderRadius: 18,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 850,
  },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: 14,
    borderRadius: 18,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  stageGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  stageButton: {
    minHeight: 52,
    borderRadius: 17,
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,0.68)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 850,
  },
  stageActive: {
    minHeight: 52,
    borderRadius: 17,
    display: "grid",
    placeItems: "center",
    color: "#fff",
    background: "linear-gradient(135deg, rgba(181,76,255,0.62), rgba(71,231,255,0.22))",
    fontWeight: 850,
  },
  statusLine: {
    display: "grid",
    gridTemplateColumns: "24px 1fr auto",
    alignItems: "center",
    gap: 8,
    padding: "12px 14px",
    borderRadius: 16,
    color: "rgba(255,255,255,0.68)",
    background: "rgba(255,255,255,0.055)",
    fontSize: 15,
  },
  consent: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    color: "#8dffb3",
    background: "rgba(141,255,179,0.1)",
    border: "1px solid rgba(141,255,179,0.18)",
    fontWeight: 950,
  },
  segment: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    padding: 6,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    textAlign: "center",
    fontWeight: 950,
  },
  segmentActive: {
    minHeight: 46,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    color: "#080411",
    background: "#fff",
  },
  messageBox: {
    minHeight: 172,
    padding: 16,
    borderRadius: 18,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    fontSize: 17,
    lineHeight: 1.42,
    fontWeight: 750,
  },
  success: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 14,
    textAlign: "center",
  },
  successMark: {
    width: 90,
    height: 90,
    margin: "0 auto",
    borderRadius: 29,
    display: "grid",
    placeItems: "center",
    color: "#06101a",
    background: "linear-gradient(135deg, #8dffb3, #47e7ff)",
  },
  successTitle: {
    margin: 0,
    fontSize: 48,
    fontWeight: 950,
  },
  historyRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: 15,
    fontWeight: 850,
  },
  eventCard: {
    padding: 16,
    borderRadius: 18,
    color: "#47e7ff",
    background: "rgba(71,231,255,0.1)",
    border: "1px solid rgba(71,231,255,0.18)",
    fontSize: 17,
    fontWeight: 950,
  },
  settingsRow: {
    minHeight: 58,
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: "0 14px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: 17,
    fontWeight: 950,
  },
  nav: {
    position: "absolute",
    left: 29,
    right: 29,
    bottom: 25,
    height: 68,
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 6,
    padding: 7,
    borderRadius: 999,
    background: "rgba(0,0,0,0.74)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  navItem: {
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontSize: 10,
    fontWeight: 850,
  },
  callout: {
    position: "absolute",
    right: 150,
    top: 404,
    width: 340,
    padding: 22,
    borderRadius: 26,
    background: "rgba(0,0,0,0.34)",
    border: "1px solid",
    boxShadow: "0 32px 80px rgba(0,0,0,0.34)",
  },
  calloutIcon: {
    marginBottom: 16,
  },
  close: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    zIndex: 5,
  },
  closeLogo: {
    width: 430,
    height: "auto",
    filter: "drop-shadow(0 0 34px rgba(181,76,255,0.55))",
  },
  closeTitle: {
    margin: "54px 0 0",
    fontSize: 76,
    lineHeight: 0.98,
    maxWidth: 980,
    fontWeight: 950,
    letterSpacing: 0,
  },
  closeCopy: {
    margin: "28px 0 0",
    maxWidth: 850,
    color: "rgba(255,255,255,0.76)",
    fontSize: 30,
    lineHeight: 1.35,
    fontWeight: 650,
  },
};
