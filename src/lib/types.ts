export type FollowUpChannel = "Text" | "Email";

export type CapturedContact = {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  source: string;
  tags: string;
  owner: string;
  notes: string;
  crmStage: string;
  pipeline: string;
  opportunityStage: string;
  opportunityValue: string;
  leadStatus: string;
  followUpDate: string;
  consentStatus: "Confirmed" | "Needs consent" | "Skip follow-up";
  followUpChannel: FollowUpChannel;
  followUpMessage: string;
  syncStatus?: "synced" | "queued" | "failed";
};

export type SyncStepStatus = "done" | "current" | "queued";

export type SyncStep = {
  label: string;
  detail: string;
  status: SyncStepStatus;
};
