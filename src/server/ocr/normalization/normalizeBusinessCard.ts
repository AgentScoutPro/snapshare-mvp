import { OcrError } from "../errors";
import type {
  ConfidenceMap,
  OcrProviderName,
  ReviewReadyContactPayload,
  VeryfiBusinessCardResponse,
} from "../types";
import { applyLowConfidenceFields } from "./confidence";
import { selectBestPhoneNumber } from "../providers/veryfi";
import {
  normalizeAddress,
  normalizeEmail,
  normalizeUrl,
  splitFullName,
} from "./validators";

type NormalizeOptions = {
  provider: OcrProviderName;
  lowConfidenceThreshold?: number;
  includeRawProviderResponse?: boolean;
};

const PROVIDER_FIELD_TO_INTERNAL: Record<string, keyof ConfidenceMap> = {
  person: "fullName",
  name: "fullName",
  company: "company",
  organization: "company",
  title: "jobTitle",
  email: "email",
  mobile: "mobilePhone",
  mobile_number: "mobilePhone",
  phone: "mobilePhone",
  phone_number: "mobilePhone",
  fax: "officePhone",
  fax_number: "officePhone",
  web: "website",
  website: "website",
  address: "address1",
};

export function normalizeBusinessCard(
  raw: unknown,
  options: NormalizeOptions,
): ReviewReadyContactPayload {
  const providerRaw = raw as VeryfiBusinessCardResponse;
  const fullName = compact(providerRaw.person ?? providerRaw.name);
  const parsed = splitFullName(fullName);
  const firstName = compact(
    providerRaw.parsed_name?.first_name ??
      providerRaw.parsed_name?.first ??
      providerRaw.parsed_name?.given_name ??
      providerRaw.first_name ??
      parsed.firstName,
  );
  const lastName = compact(
    providerRaw.parsed_name?.last_name ??
      providerRaw.parsed_name?.last ??
      providerRaw.parsed_name?.family_name ??
      providerRaw.last_name ??
      parsed.lastName,
  );
  const company = compact(providerRaw.organization ?? providerRaw.company);
  const email = normalizeEmail(providerRaw.email ?? providerRaw.emails?.[0]);
  const { mobilePhone, officePhone } = selectBestPhoneNumber(providerRaw);
  const website = normalizeUrl(providerRaw.web ?? providerRaw.website);
  const address = normalizeAddress(providerRaw.parsed_address ?? providerRaw.address);
  const confidence = extractConfidence(providerRaw);
  const warnings = getImageQualityWarnings(providerRaw);
  const requiredFieldsMissing = getMissingRequiredFields({
    fullName,
    company,
    email,
    mobilePhone,
  });

  if (requiredFieldsMissing.includes("fullName") && requiredFieldsMissing.includes("company")) {
    throw new OcrError(
      "MISSING_REQUIRED_FIELDS",
      "OCR did not find enough contact identity information for review.",
      422,
      { requiredFieldsMissing },
    );
  }

  const contact = applyLowConfidenceFields(
    {
      fullName,
      firstName,
      lastName,
      company,
      jobTitle: compact(providerRaw.title),
      email,
      mobilePhone,
      officePhone,
      website,
      address1: address.address1 ?? "",
      address2: address.address2,
      city: address.city ?? "",
      state: address.state ?? "",
      postalCode: address.postalCode ?? "",
      country: address.country ?? "",
      notes: "",
      source: "SnapShare",
      confidence,
    },
    options.lowConfidenceThreshold,
    hasNoConfidenceDetails(providerRaw),
  );

  return {
    contact,
    review: {
      provider: options.provider,
      needsManualReview:
        contact.lowConfidenceFields.length > 0 ||
        requiredFieldsMissing.length > 0 ||
        warnings.length > 0,
      lowConfidenceFields: contact.lowConfidenceFields,
      requiredFieldsMissing,
      warnings,
    },
    source: {
      provider: options.provider,
      input: "business-card-image",
    },
    rawProviderResponse: options.includeRawProviderResponse ? raw : undefined,
  };
}

function hasNoConfidenceDetails(raw: VeryfiBusinessCardResponse): boolean {
  return Object.keys(raw.confidence_details ?? {}).length === 0;
}

function compact(value?: string | null): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function extractConfidence(raw: VeryfiBusinessCardResponse): ConfidenceMap {
  const details = raw.confidence_details ?? {};
  const confidence: ConfidenceMap = {};

  for (const [providerField, internalField] of Object.entries(PROVIDER_FIELD_TO_INTERNAL)) {
    const score = details[providerField]?.score ?? details[providerField]?.ocr_score;
    if (typeof score === "number") confidence[internalField] = roundScore(score);
  }

  return confidence;
}

function roundScore(score: number): number {
  return Math.round(score * 100) / 100;
}

function getMissingRequiredFields(contact: {
  fullName: string;
  company: string;
  email: string;
  mobilePhone: string;
}): string[] {
  const missing: string[] = [];
  if (!contact.fullName) missing.push("fullName");
  if (!contact.company) missing.push("company");
  if (!contact.email) missing.push("email");
  if (!contact.mobilePhone) missing.push("phone");
  return missing;
}

function getImageQualityWarnings(raw: VeryfiBusinessCardResponse): string[] {
  const warnings: string[] = [];
  const pageScores = raw.pages
    ?.map((page) => page.ocr_score)
    .filter((score): score is number => typeof score === "number");

  if (pageScores?.some((score) => score < 0.65)) {
    warnings.push("Image may be blurry. Retake if key fields look wrong.");
  }

  if (!raw.email && !raw.phone && !raw.phone_number && !raw.mobile && !raw.mobile_number) {
    warnings.push("Card may be partial. Email or phone was not detected.");
  }

  return warnings;
}
