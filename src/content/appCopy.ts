export const appCopy = {
  brand: {
    productName: "ScanShare",
    headline: "From business card to CRM in seconds.",
    tagline: "Scan it. Sync it. Follow up.",
    supporting:
      "Capture business cards, review OCR flags, and send CRM-ready leads directly into GoHighLevel.",
    trustTitle: "No more CSV chaos",
    trustDetail: "ScanShare saves to phone contacts and GoHighLevel.",
  },
  header: {
    eyebrow: "Lead capture",
  },
  flow: ["Scan", "Review", "Tag", "Sync", "Follow"],
  scan: {
    headline: "Scan a Business Card",
    capturedHeadline: "Card captured",
    subheadline:
      "Capture the card, confirm the details, and send it straight to your CRM.",
    capturedSubheadline:
      "Pixel found the card. Review the OCR before it reaches GoHighLevel.",
    primaryCta: "Start Scan",
    reviewCta: "Review OCR",
  },
  review: {
    headline: "Confirm the Details",
    subheadline: "Review anything ScanShare flagged before saving the lead.",
    duplicateTitle: "Pixel found a possible duplicate.",
    duplicateDetail: "Similar email found in phone contacts.",
    cta: "Save & Sync",
  },
  sync: {
    headline: "Save & Sync Lead",
    subheadline:
      "Save to contacts, sync to GoHighLevel, and add the right source and tags.",
    sourceLabel: "Event or Source",
    tagsLabel: "Tags",
    ownerLabel: "Lead Owner",
    pipelineLabel: "Pipeline",
    stageLabel: "Stage",
    followUpDateLabel: "Follow Up Date",
    phoneStatusLabel: "Phone contacts",
    phoneStatusValue: "Saved to phone contacts",
    ghlStatusLabel: "GoHighLevel",
    ghlStatusValue: "This lead is ready for GoHighLevel.",
    cta: "Sync to GoHighLevel",
  },
  opportunity: {
    headline: "Lead Details",
    subheadline:
      "Keep pipeline, stage, value, status, and next follow up ready for GoHighLevel.",
    skipCta: "Skip Details",
    cta: "Add Lead Details",
  },
  follow: {
    headline: "Send a Smart Follow Up",
    subheadline:
      "Use the moment you met to write a message that feels personal.",
    consentDetail: "Follow up while they still remember you.",
    prompt: "What should Pixel remember?",
    placeholder:
      "Example: Met at BNI. Asked about Google reviews and video testimonials.",
    cta: "Generate Message",
    secondaryCta: "Save for Later",
    generatedTitle: "Your Follow Up is Ready",
    generatedSubheadline:
      "Review, tweak, and send while the conversation is still fresh.",
    copyCta: "Copy Message",
    textCta: "Send Text",
    emailCta: "Send Email",
  },
  success: {
    headline: "Lead Captured",
    subheadline: "Saved, synced, and ready for follow up.",
    primaryCta: "Create Follow Up",
    secondaryCta: "Scan Another Card",
  },
  leads: {
    headline: "Leads",
    subheadline: "Search leads, events, or companies.",
    empty: "No more cards lost in your glovebox.",
    exportCta: "Export Contacts",
    backupCta: "Backup",
    retryCta: "Try Again",
  },
  events: {
    headline: "Events",
    subheadline: "Organize leads by where you met them.",
    emptyTitle: "No events yet",
    emptyDetail: "Create an event to keep every new lead tied to the right source.",
    cta: "Start Batch Scan",
  },
  settings: {
    headline: "Settings",
    subheadline:
      "Control GoHighLevel sync, field mapping, templates, privacy, and backup.",
    sections: {
      goHighLevel: "GoHighLevel Connection",
      fieldMapping: "Field Mapping",
      defaultTags: "Default Tags",
      followUpTemplates: "Follow Up Templates",
      exportContacts: "Export Contacts",
      backupPrivacy: "Backup & Privacy",
    },
  },
  mascot: {
    sidekick: "Pixel is your lead capture sidekick.",
    prep: "Pixel helps scan, clean up, and prepare every lead for follow up.",
    review: "Pixel caught a detail that may need review.",
    draft: "Pixel can draft a follow up from your notes.",
  },
  microcopy: {
    noTyping: "No more typing leads by hand.",
    readyForGhl: "This lead is ready for GoHighLevel.",
    syncedToGhl: "Synced to GoHighLevel.",
    syncFailed: "Sync failed. Try again.",
    savedToPhone: "Saved to phone contacts.",
  },
} as const;
