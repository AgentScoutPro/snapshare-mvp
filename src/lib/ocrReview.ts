import type { CapturedContact, ContactConfidenceField } from "./types";

type OcrConfidenceMap = {
  fullName?: number;
  company?: number;
  jobTitle?: number;
  email?: number;
  mobilePhone?: number;
  officePhone?: number;
  website?: number;
  address1?: number;
};

type OcrReviewPayload = {
  state: "review_required";
  contact: {
    fullName: string;
    firstName?: string;
    lastName?: string;
    company: string;
    jobTitle: string;
    email: string;
    mobilePhone: string;
    officePhone: string;
    website: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    notes: string;
    source: "SnapShare";
    confidence: OcrConfidenceMap;
    lowConfidenceFields: string[];
  };
  review: {
    provider: string;
    needsManualReview: boolean;
    lowConfidenceFields: string[];
    requiredFieldsMissing: string[];
    warnings: string[];
  };
  source?: {
    provider: string;
    input: "business-card-image";
  };
};

const ocrToCapturedField: Record<string, ContactConfidenceField> = {
  fullName: "name",
  jobTitle: "title",
  company: "company",
  email: "email",
  mobilePhone: "phone",
  officePhone: "phone",
  website: "website",
  address1: "address",
};

export function mapOcrReviewPayloadToCapturedContact(
  payload: OcrReviewPayload,
): CapturedContact {
  const contact = payload.contact;
  const notes = [contact.notes, formatAddress(contact)]
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n");

  return {
    name: contact.fullName,
    title: contact.jobTitle,
    company: contact.company,
    email: contact.email,
    phone: contact.mobilePhone || contact.officePhone,
    website: contact.website,
    source: contact.source,
    tags: "business-card-scan",
    owner: "Avery Stone",
    notes,
    crmStage: "Event Lead",
    pipeline: "Sales Pipeline",
    opportunityStage: "New Lead",
    opportunityValue: "",
    leadStatus: "Warm",
    followUpDate: "Tomorrow 10:00 AM",
    consentStatus: "Needs consent",
    followUpChannel: contact.email && !contact.mobilePhone ? "Email" : "Text",
    followUpMessage: buildFollowUpMessage(contact.fullName),
    syncStatus: "queued",
    confidence: mapConfidence(contact.confidence),
    lowConfidenceFields: mapLowConfidenceFields([
      ...contact.lowConfidenceFields,
      ...payload.review.lowConfidenceFields,
      ...payload.review.requiredFieldsMissing,
    ]),
    ocrWarnings: payload.review.warnings,
  };
}

function mapConfidence(
  confidence: OcrConfidenceMap,
): Partial<Record<ContactConfidenceField, number>> {
  return Object.entries(confidence).reduce<
    Partial<Record<ContactConfidenceField, number>>
  >((mapped, [key, value]) => {
    const field = ocrToCapturedField[key];
    if (field && typeof value === "number") {
      mapped[field] =
        mapped[field] === undefined ? value : Math.min(mapped[field], value);
    }
    return mapped;
  }, {});
}

function mapLowConfidenceFields(fields: string[]): ContactConfidenceField[] {
  return Array.from(
    new Set(
      fields
        .map((field) => ocrToCapturedField[field] ?? field)
        .filter(isContactConfidenceField),
    ),
  );
}

function isContactConfidenceField(
  field: string,
): field is ContactConfidenceField {
  return [
    "name",
    "title",
    "company",
    "email",
    "phone",
    "website",
    "address",
    "notes",
  ].includes(field);
}

function formatAddress(contact: OcrReviewPayload["contact"]): string {
  const region = [contact.state, contact.postalCode].filter(Boolean).join(" ");
  const locality = [contact.city, region].filter(Boolean).join(", ");

  return [contact.address1, locality, contact.country]
    .filter(Boolean)
    .join(", ");
}

function buildFollowUpMessage(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  return `Hi ${firstName}, great meeting you. I wanted to follow up while our conversation is fresh.`;
}
