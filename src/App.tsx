import {
  AlertTriangle,
  ArchiveRestore,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  Camera,
  Check,
  ChevronRight,
  ClipboardCheck,
  Cloud,
  ContactRound,
  Download,
  FileImage,
  History,
  Mail,
  MapPin,
  MessageSquare,
  QrCode,
  RefreshCw,
  Save,
  ScanLine,
  Send,
  Share2,
  Settings,
  ShieldCheck,
  Tags,
  Upload,
  UserRoundCheck,
  UsersRound,
  Workflow,
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { PixelOwl } from "./components/PixelOwl";
import { appCopy } from "./content/appCopy";
import { mapOcrReviewPayloadToCapturedContact } from "./lib/ocrReview";
import {
  buildVCard,
  contactToVCardProfile,
  createVCardFileName,
} from "./lib/vcard";
import type {
  CapturedContact,
  ContactConfidenceField,
  FollowUpChannel,
  SyncStep,
  UserProfile,
} from "./lib/types";

type Screen =
  | "scan"
  | "review"
  | "sync"
  | "opportunity"
  | "follow"
  | "success"
  | "history"
  | "settings"
  | "team";

const crmStages = ["Event Lead", "VIP Follow Up", "Partner", "Newsletter"];
const owners = ["Avery Stone", "Jordan Lee", "Morgan Patel"];
const opportunityStages = ["New Lead", "Qualified", "Booked", "Nurture"];
const leadStatuses = ["Warm", "Hot", "Cold"];
const defaultProfile: UserProfile = {
  name: "Avery Stone",
  title: "Founder",
  company: "SnapShare",
  email: "avery@snapshare.app",
  phone: "(602) 555-0199",
  website: "https://snapshare.app/avery",
  notes: "SnapShare digital card",
};
const emptyContact: CapturedContact = {
  name: "",
  title: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  source: "SnapShare",
  tags: "business-card-scan",
  owner: "Avery Stone",
  notes: "",
  crmStage: "Event Lead",
  pipeline: "Sales Pipeline",
  opportunityStage: "New Lead",
  opportunityValue: "",
  leadStatus: "Warm",
  followUpDate: "Tomorrow 10:00 AM",
  consentStatus: "Needs consent",
  followUpChannel: "Text",
  followUpMessage: "",
  syncStatus: "queued",
  confidence: {},
  lowConfidenceFields: [],
  ocrWarnings: [],
};

function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("scan");
  const [scanState, setScanState] = useState<
    "idle" | "scanning" | "captured" | "saved" | "error"
  >("idle");
  const [ocrError, setOcrError] = useState("");
  const [contact, setContact] = useState<CapturedContact>(emptyContact);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = window.localStorage.getItem("snapshare.profile");
    return saved ? (JSON.parse(saved) as UserProfile) : defaultProfile;
  });
  const [savedContacts, setSavedContacts] = useState<CapturedContact[]>(() => {
    const saved = window.localStorage.getItem("snapshare.contacts");
    return saved ? (JSON.parse(saved) as CapturedContact[]) : [];
  });

  const syncSteps = useMemo<SyncStep[]>(
    () => [
      {
        label: "Phone contact",
        detail:
          scanState === "saved"
            ? appCopy.microcopy.savedToPhone
            : "Ready to save",
        status: scanState === "saved" ? "done" : "queued",
      },
      {
        label: "GoHighLevel",
        detail: `${contact.crmStage} - ${contact.owner}`,
        status: scanState === "saved" ? "done" : "queued",
      },
      {
        label: "Follow-up",
        detail:
          contact.consentStatus === "Confirmed"
            ? `${contact.followUpChannel} ready to send`
            : "Waiting for consent",
        status: activeScreen === "success" ? "done" : "current",
      },
    ],
    [
      activeScreen,
      contact.consentStatus,
      contact.crmStage,
      contact.followUpChannel,
      contact.owner,
      scanState,
    ],
  );

  const updateContact = (key: keyof CapturedContact, value: string) => {
    setContact((current) => ({ ...current, [key]: value }));
  };

  const updateProfile = (key: keyof UserProfile, value: string) => {
    setProfile((current) => {
      const next = { ...current, [key]: value };
      window.localStorage.setItem("snapshare.profile", JSON.stringify(next));
      return next;
    });
  };

  const scanBusinessCard = async (file: File) => {
    setScanState("scanning");
    setOcrError("");

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      const response = await fetch("/ocr/business-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl,
          mimeType: file.type || "image/jpeg",
          source: file.name,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ?? "SnapShare could not read this card.",
        );
      }

      setContact(mapOcrReviewPayloadToCapturedContact(payload));
      setScanState("captured");
      setActiveScreen("review");
    } catch (error) {
      setOcrError(
        error instanceof Error
          ? error.message
          : "SnapShare could not read this card.",
      );
      setScanState("error");
    }
  };

  const saveContact = () => {
    const syncedContact = { ...contact, syncStatus: "synced" as const };
    const next = [syncedContact, ...savedContacts].slice(0, 12);
    setContact(syncedContact);
    setSavedContacts(next);
    window.localStorage.setItem("snapshare.contacts", JSON.stringify(next));
    setScanState("saved");
    setActiveScreen("success");
  };

  return (
    <main className="app-shell">
      <section className="brand-panel">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <img
          className="brand-logo"
          src="/brand/snapshare-logo.png"
          alt={appCopy.brand.productName}
        />
        <div className="hero-copy">
          <h1>{appCopy.brand.headline}</h1>
          <p>{appCopy.brand.supporting}</p>
        </div>
        <PixelOwl className="brand-mascot" pose="Neutral" size={200} />
        <div className="mini-card trust-card">
          <ShieldCheck size={24} />
          <div>
            <strong>{appCopy.brand.trustTitle}</strong>
            <span>{appCopy.brand.trustDetail}</span>
          </div>
        </div>
      </section>

      <section className="phone-stage" aria-label="ScanShare app preview">
        <div className="phone">
          <div className="status-bar">
            <span>9:41</span>
            <span>{appCopy.brand.productName}</span>
            <span>5G</span>
          </div>
          <AppHeader savedCount={savedContacts.length} />

          <div className="screen-stack">
            {activeScreen === "scan" && (
              <ScanScreen
                scanState={scanState}
                ocrError={ocrError}
                onCapture={scanBusinessCard}
              />
            )}
            {activeScreen === "review" && (
              <ReviewScreen
                contact={contact}
                updateContact={updateContact}
                onContinue={() => setActiveScreen("sync")}
              />
            )}
            {activeScreen === "sync" && (
              <SyncScreen
                contact={contact}
                updateContact={updateContact}
                onContinue={() => setActiveScreen("opportunity")}
              />
            )}
            {activeScreen === "opportunity" && (
              <OpportunityScreen
                contact={contact}
                updateContact={updateContact}
                onContinue={() => setActiveScreen("follow")}
              />
            )}
            {activeScreen === "follow" && (
              <FollowUpScreen
                contact={contact}
                updateContact={updateContact}
                onChannel={(channel) => updateContact("followUpChannel", channel)}
                onSave={saveContact}
              />
            )}
            {activeScreen === "success" && (
              <SuccessScreen
                contact={contact}
                steps={syncSteps}
                onSaveToDevice={() =>
                  downloadVCard(contactToVCardProfile(contact))
                }
                onCreateFollowUp={() => setActiveScreen("follow")}
                onNewScan={() => {
                  setScanState("idle");
                  setActiveScreen("scan");
                }}
              />
            )}
            {activeScreen === "history" && (
              <HistoryScreen
                contacts={savedContacts}
                onRetry={() => setActiveScreen("sync")}
                onSaveToDevice={(item) =>
                  downloadVCard(contactToVCardProfile(item))
                }
              />
            )}
            {activeScreen === "settings" && (
              <ProfileScreen profile={profile} updateProfile={updateProfile} />
            )}
            {activeScreen === "team" && <TeamScreen updateContact={updateContact} />}
          </div>
          <div className="powered-by">Powered by C0D3AI</div>

          <nav className="bottom-nav" aria-label="Main app navigation">
            <NavButton
              label="Scan"
              icon={<ScanLine size={20} />}
              active={activeScreen === "scan"}
              onClick={() => setActiveScreen("scan")}
            />
            <NavButton
              label="Flow"
              icon={<Workflow size={20} />}
              active={[
                "review",
                "sync",
                "opportunity",
                "follow",
                "success",
              ].includes(activeScreen)}
              onClick={() => setActiveScreen("review")}
            />
            <NavButton
              label="History"
              icon={<History size={20} />}
              active={activeScreen === "history"}
              onClick={() => setActiveScreen("history")}
            />
            <NavButton
              label="Events"
              icon={<UsersRound size={20} />}
              active={activeScreen === "team"}
              onClick={() => setActiveScreen("team")}
            />
            <NavButton
              label="Settings"
              icon={<Settings size={20} />}
              active={activeScreen === "settings"}
              onClick={() => setActiveScreen("settings")}
            />
          </nav>
        </div>
      </section>
    </main>
  );
}

function AppHeader({ savedCount }: { savedCount: number }) {
  return (
    <header className="app-header">
      <div>
        <span className="eyeline">{appCopy.header.eyebrow}</span>
        <strong>{appCopy.brand.productName}</strong>
      </div>
      <div className="header-badge">
        <UserRoundCheck size={16} />
        {savedCount}
      </div>
    </header>
  );
}

function ScanScreen({
  scanState,
  ocrError,
  onCapture,
}: {
  scanState: "idle" | "scanning" | "captured" | "saved" | "error";
  ocrError: string;
  onCapture: (file: File) => void;
}) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const isScanning = scanState === "scanning";
  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCapture(file);
    }
    event.target.value = "";
  };

  return (
    <section className="screen scan-screen">
      <input
        className="visually-hidden"
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
      />
      <input
        className="visually-hidden"
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
      />
      <div className="flow-strip" aria-label="Primary workflow">
        {appCopy.flow.map((step, index) => (
          <span className={index === 0 ? "active" : ""} key={step}>
            {step}
          </span>
        ))}
      </div>

      <div className="capture-toolbar">
        <button className="mode-pill active">Front</button>
        <button className="mode-pill">Back</button>
        <button
          className="icon-pill"
          disabled={isScanning}
          onClick={() => uploadInputRef.current?.click()}
        >
          <Upload size={16} />
          Upload
        </button>
      </div>

      <div className={`camera-card professional ${isScanning ? "scanning" : ""}`}>
        <div className="edge edge-top" />
        <div className="edge edge-right" />
        <div className="edge edge-bottom" />
        <div className="edge edge-left" />
        {isScanning ? (
          <div className="scan-loading">
            <RefreshCw size={28} />
            <strong>Reading card</strong>
            <span>OCR is extracting contact fields...</span>
          </div>
        ) : (
          <div className="business-card empty-card">
            <ScanLine size={26} />
            <strong>Place a business card in frame</strong>
            <small>Snap or upload a clear card image.</small>
          </div>
        )}
      </div>

      {scanState === "error" && (
        <div className="ocr-error" role="alert">
          <AlertTriangle size={17} />
          <span>{ocrError}</span>
        </div>
      )}

      <div className="scan-copy">
        <PixelOwl className="screen-mascot" pose="Neutral" size={120} />
        <h2>
          {scanState === "idle" || scanState === "error"
            ? appCopy.scan.headline
            : scanState === "scanning"
              ? "Scanning card"
            : appCopy.scan.capturedHeadline}
        </h2>
        <p>
          {scanState === "idle" || scanState === "error"
            ? appCopy.scan.subheadline
            : scanState === "scanning"
              ? "Keep this screen open while SnapShare prepares the review."
            : appCopy.scan.capturedSubheadline}
        </p>
      </div>

      <div className="quick-row">
        <InfoPill icon={<FileImage size={15} />} label="Fast OCR review" />
        <InfoPill icon={<ShieldCheck size={15} />} label="Direct GHL sync" />
      </div>

      <button
        className="primary-action"
        disabled={isScanning}
        onClick={() => cameraInputRef.current?.click()}
      >
        <Camera size={20} />
        {isScanning ? "Scanning..." : appCopy.scan.primaryCta}
      </button>
    </section>
  );
}

function ReviewScreen({
  contact,
  updateContact,
  onContinue,
}: {
  contact: CapturedContact;
  updateContact: (key: keyof CapturedContact, value: string) => void;
  onContinue: () => void;
}) {
  return (
    <section className="screen review-screen">
      <ScreenTitle
        icon={<BadgeCheck size={20} />}
        title={appCopy.review.headline}
        subtitle={appCopy.review.subheadline}
      />
      <div className="warning-card">
        <AlertTriangle size={18} />
        <div>
          <strong>{appCopy.review.duplicateTitle}</strong>
          <span>{appCopy.review.duplicateDetail}</span>
        </div>
      </div>
      <div className="confidence-grid">
        <ConfidenceMetric contact={contact} field="name" label="Name" />
        <ConfidenceMetric contact={contact} field="email" label="Email" />
        <ConfidenceMetric contact={contact} field="phone" label="Phone" />
      </div>
      {!!contact.ocrWarnings?.length && (
        <div className="ocr-warning-list">
          {contact.ocrWarnings.map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
        </div>
      )}
      <EditableField label="Name" value={contact.name} lowConfidence={isLowConfidence(contact, "name")} onChange={(v) => updateContact("name", v)} />
      <EditableField label="Title" value={contact.title} lowConfidence={isLowConfidence(contact, "title")} onChange={(v) => updateContact("title", v)} />
      <EditableField label="Company" value={contact.company} lowConfidence={isLowConfidence(contact, "company")} onChange={(v) => updateContact("company", v)} />
      <EditableField label="Email" value={contact.email} lowConfidence={isLowConfidence(contact, "email")} onChange={(v) => updateContact("email", v)} />
      <EditableField label="Phone" value={contact.phone} lowConfidence={isLowConfidence(contact, "phone")} onChange={(v) => updateContact("phone", v)} />
      <EditableField label="Website" value={contact.website} lowConfidence={isLowConfidence(contact, "website")} onChange={(v) => updateContact("website", v)} />
      <EditableField label="Notes" value={contact.notes} lowConfidence={isLowConfidence(contact, "address")} onChange={(v) => updateContact("notes", v)} />
      <button className="primary-action sticky-action" onClick={onContinue}>
        {appCopy.review.cta}
        <ChevronRight size={20} />
      </button>
    </section>
  );
}

function SyncScreen({
  contact,
  updateContact,
  onContinue,
}: {
  contact: CapturedContact;
  updateContact: (key: keyof CapturedContact, value: string) => void;
  onContinue: () => void;
}) {
  return (
    <section className="screen sync-screen">
      <ScreenTitle
        icon={<Save size={20} />}
        title={appCopy.sync.headline}
        subtitle={appCopy.sync.subheadline}
      />
      <div className="profile-chip">
        <div className="avatar">{contact.name.charAt(0)}</div>
        <div>
          <strong>{contact.name}</strong>
          <span>{contact.company}</span>
        </div>
      </div>
      <EditableField label={appCopy.sync.sourceLabel} value={contact.source} onChange={(v) => updateContact("source", v)} />
      <EditableField label={appCopy.sync.tagsLabel} value={contact.tags} onChange={(v) => updateContact("tags", v)} />
      <SelectField label={appCopy.sync.ownerLabel} value={contact.owner} options={owners} onChange={(v) => updateContact("owner", v)} />
      <div className="stage-grid">
        {crmStages.map((stage) => (
          <button
            className={stage === contact.crmStage ? "stage active" : "stage"}
            key={stage}
            onClick={() => updateContact("crmStage", stage)}
          >
            {stage}
          </button>
        ))}
      </div>
      <div className="sync-status">
        <PixelOwl className="screen-mascot compact" pose="Flying" size={120} />
        <StatusLine icon={<ContactRound size={16} />} label={appCopy.sync.phoneStatusLabel} value={appCopy.sync.phoneStatusValue} />
        <StatusLine icon={<Cloud size={16} />} label={appCopy.sync.ghlStatusLabel} value={appCopy.sync.ghlStatusValue} />
      </div>
      <button className="primary-action sticky-action" onClick={onContinue}>
        {appCopy.sync.cta}
        <ChevronRight size={20} />
      </button>
    </section>
  );
}

function OpportunityScreen({
  contact,
  updateContact,
  onContinue,
}: {
  contact: CapturedContact;
  updateContact: (key: keyof CapturedContact, value: string) => void;
  onContinue: () => void;
}) {
  return (
    <section className="screen opportunity-screen">
      <ScreenTitle
        icon={<BriefcaseBusiness size={20} />}
        title={appCopy.opportunity.headline}
        subtitle={appCopy.opportunity.subheadline}
      />
      <EditableField label={appCopy.sync.pipelineLabel} value={contact.pipeline} onChange={(v) => updateContact("pipeline", v)} />
      <SelectField
        label={appCopy.sync.stageLabel}
        value={contact.opportunityStage}
        options={opportunityStages}
        onChange={(v) => updateContact("opportunityStage", v)}
      />
      <EditableField
        label="Value"
        value={contact.opportunityValue}
        onChange={(v) => updateContact("opportunityValue", v)}
      />
      <SelectField
        label="Lead status"
        value={contact.leadStatus}
        options={leadStatuses}
        onChange={(v) => updateContact("leadStatus", v)}
      />
      <EditableField
        label={appCopy.sync.followUpDateLabel}
        value={contact.followUpDate}
        onChange={(v) => updateContact("followUpDate", v)}
      />
      <button className="secondary-action" onClick={onContinue}>
        {appCopy.opportunity.skipCta}
      </button>
      <button className="primary-action" onClick={onContinue}>
        {appCopy.opportunity.cta}
        <ChevronRight size={20} />
      </button>
    </section>
  );
}

function FollowUpScreen({
  contact,
  updateContact,
  onChannel,
  onSave,
}: {
  contact: CapturedContact;
  updateContact: (key: keyof CapturedContact, value: string) => void;
  onChannel: (channel: FollowUpChannel) => void;
  onSave: () => void;
}) {
  return (
    <section className="screen follow-screen">
      <ScreenTitle
        icon={<Send size={20} />}
        title={appCopy.follow.headline}
        subtitle={appCopy.follow.subheadline}
      />
      <div className="consent-card">
        <ShieldCheck size={18} />
        <div>
          <strong>{contact.consentStatus}</strong>
          <span>{appCopy.follow.consentDetail}</span>
        </div>
      </div>
      <div className="channel-toggle">
        <button
          className={contact.followUpChannel === "Text" ? "active" : ""}
          onClick={() => onChannel("Text")}
        >
          <MessageSquare size={16} />
          Text
        </button>
        <button
          className={contact.followUpChannel === "Email" ? "active" : ""}
          onClick={() => onChannel("Email")}
        >
          <Mail size={16} />
          Email
        </button>
      </div>
      <PixelOwl className="screen-mascot compact" pose="Sparkle" size={120} />
      <div className="template-row">
        <button className="mode-pill active">Warm intro</button>
        <button className="mode-pill">Realtor</button>
        <button className="mode-pill">Event</button>
      </div>
      <label className="message-box">
        <span>{appCopy.follow.prompt}</span>
        <textarea
          value={contact.followUpMessage}
          placeholder={appCopy.follow.placeholder}
          onChange={(event) =>
            updateContact("followUpMessage", event.target.value)
          }
        />
      </label>
      <div className="action-split">
        <button className="secondary-action" onClick={onSave}>
          {appCopy.follow.secondaryCta}
        </button>
        <button className="primary-action" onClick={onSave}>
          {appCopy.follow.cta}
        </button>
      </div>
    </section>
  );
}

function SuccessScreen({
  contact,
  steps,
  onSaveToDevice,
  onCreateFollowUp,
  onNewScan,
}: {
  contact: CapturedContact;
  steps: SyncStep[];
  onSaveToDevice: () => void;
  onCreateFollowUp: () => void;
  onNewScan: () => void;
}) {
  return (
    <section className="screen success-screen">
      <PixelOwl className="success-mascot" pose="Celebrate" size={160} />
      <h2>{appCopy.success.headline}</h2>
      <p>{appCopy.success.subheadline}</p>
      <div className="timeline">
        {steps.map((step) => (
          <div className={`timeline-step ${step.status}`} key={step.label}>
            <span>
              <Check size={14} />
            </span>
            <div>
              <strong>{step.label}</strong>
              <p>{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="secondary-action" onClick={onSaveToDevice}>
        <ContactRound size={16} />
        Save vCard to Contacts
      </button>
      <button className="primary-action" onClick={onCreateFollowUp}>
        {appCopy.success.primaryCta}
      </button>
      <button className="primary-action" onClick={onNewScan}>
        {appCopy.success.secondaryCta}
      </button>
    </section>
  );
}

function HistoryScreen({
  contacts,
  onRetry,
  onSaveToDevice,
}: {
  contacts: CapturedContact[];
  onRetry: () => void;
  onSaveToDevice: (contact: CapturedContact) => void;
}) {
  const history = contacts.length
    ? contacts
    : [];

  return (
    <section className="screen history-screen">
      {!contacts.length && (
        <PixelOwl className="screen-mascot" pose="Curious" size={120} />
      )}
      <ScreenTitle
        icon={<History size={20} />}
        title={appCopy.leads.headline}
        subtitle={appCopy.leads.subheadline}
      />
      <div className="history-actions">
        <button className="secondary-action">
          <Download size={16} />
          {appCopy.leads.exportCta}
        </button>
        <button className="secondary-action">
          <ArchiveRestore size={16} />
          {appCopy.leads.backupCta}
        </button>
      </div>
      <div className="history-list">
        {history.length ? history.map((item) => (
          <div className="history-item" key={`${item.name}-${item.source}`}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.company} - {item.source}</span>
            </div>
            {item.syncStatus === "failed" ? (
              <button className="retry-button" onClick={onRetry}>
                <RefreshCw size={14} />
                {appCopy.leads.retryCta}
              </button>
            ) : (
              <button className="retry-button" onClick={() => onSaveToDevice(item)}>
                <ContactRound size={14} />
                vCard
              </button>
            )}
          </div>
        )) : (
          <div className="empty-history">
            <strong>No scanned contacts yet</strong>
            <span>Saved OCR reviews will appear here after sync.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function ProfileScreen({
  profile,
  updateProfile,
}: {
  profile: UserProfile;
  updateProfile: (key: keyof UserProfile, value: string) => void;
}) {
  const [qrCode, setQrCode] = useState("");
  const vcard = useMemo(() => buildVCard(profile), [profile]);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(vcard, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
      color: {
        dark: "#05020c",
        light: "#ffffff",
      },
    }).then((dataUrl) => {
      if (!cancelled) {
        setQrCode(dataUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [vcard]);

  return (
    <section className="screen settings-screen">
      <PixelOwl className="screen-mascot" pose="Perched" size={120} />
      <ScreenTitle
        icon={<QrCode size={20} />}
        title="My SnapShare Card"
        subtitle="Build your profile, show the QR, or share a vCard people can save."
      />
      <div className="digital-card">
        {qrCode && <img src={qrCode} alt="SnapShare vCard QR code" />}
        <strong>{profile.name}</strong>
        <span>{profile.title} · {profile.company}</span>
        <small>Scan to save this SnapShare vCard.</small>
      </div>
      <div className="action-split">
        <button className="secondary-action" onClick={() => downloadVCard(profile)}>
          <Download size={16} />
          Save vCard
        </button>
        <button className="primary-action" onClick={() => shareVCard(profile)}>
          <Share2 size={16} />
          Share Card
        </button>
      </div>
      <EditableField label="Name" value={profile.name} onChange={(value) => updateProfile("name", value)} />
      <EditableField label="Title" value={profile.title} onChange={(value) => updateProfile("title", value)} />
      <EditableField label="Company" value={profile.company} onChange={(value) => updateProfile("company", value)} />
      <EditableField label="Email" value={profile.email} onChange={(value) => updateProfile("email", value)} />
      <EditableField label="Phone" value={profile.phone} onChange={(value) => updateProfile("phone", value)} />
      <EditableField label="Website" value={profile.website} onChange={(value) => updateProfile("website", value)} />
    </section>
  );
}

function TeamScreen({
  updateContact,
}: {
  updateContact: (key: keyof CapturedContact, value: string) => void;
}) {
  return (
    <section className="screen team-screen">
      <PixelOwl className="screen-mascot" pose="Wings" size={120} />
      <ScreenTitle
        icon={<UsersRound size={20} />}
        title={appCopy.events.headline}
        subtitle={appCopy.events.subheadline}
      />
      <div className="event-card">
        <MapPin size={18} />
        <div>
          <strong>Phoenix SMB Expo</strong>
          <span>Create an event to keep every new lead tied to the right source.</span>
        </div>
      </div>
      <div className="rep-grid">
        {owners.map((owner) => (
          <button key={owner} onClick={() => updateContact("owner", owner)}>
            <span>{owner.charAt(0)}</span>
            {owner}
          </button>
        ))}
      </div>
      <div className="team-stats">
        <Metric label="Batch scans" value="42" />
        <Metric label="Synced to GHL" value="39" />
        <Metric label="Needs retry" value="3" tone="warn" />
      </div>
      <button className="primary-action">
        {appCopy.events.cta}
      </button>
    </section>
  );
}

function ScreenTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="screen-title">
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function EditableField({
  label,
  value,
  lowConfidence = false,
  onChange,
}: {
  label: string;
  value: string;
  lowConfidence?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={lowConfidence ? "field low-confidence" : "field"}>
      <span>
        {label}
        {lowConfidence && <em>Review</em>}
      </span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className={tone === "warn" ? "metric warn" : "metric"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ConfidenceMetric({
  contact,
  field,
  label,
}: {
  contact: CapturedContact;
  field: ContactConfidenceField;
  label: string;
}) {
  const value = contact.confidence?.[field];
  const percent = value === undefined ? "--" : `${Math.round(value * 100)}%`;
  return (
    <Metric
      label={label}
      value={percent}
      tone={isLowConfidence(contact, field) ? "warn" : undefined}
    />
  );
}

function isLowConfidence(
  contact: CapturedContact,
  field: ContactConfidenceField,
): boolean {
  return contact.lowConfidenceFields?.includes(field) ?? false;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

function downloadVCard(profile: UserProfile) {
  const blob = new Blob([buildVCard(profile)], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = createVCardFileName(profile);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function shareVCard(profile: UserProfile) {
  const vcard = buildVCard(profile);
  const file = new File([vcard], createVCardFileName(profile), {
    type: "text/vcard",
  });

  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    await navigator.share({
      title: `${profile.name} SnapShare card`,
      text: "Save my SnapShare vCard.",
      files: [file],
    });
    return;
  }

  downloadVCard(profile);
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="info-pill">
      {icon}
      {label}
    </span>
  );
}

function StatusLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="status-line">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SettingsRow({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="settings-row">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
      <ChevronRight size={16} />
    </div>
  );
}

function NavButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? "nav-button active" : "nav-button"}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default App;
