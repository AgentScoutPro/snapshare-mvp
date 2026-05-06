import type { ConfidenceMap, SnapShareContact } from "../types";

export const DEFAULT_LOW_CONFIDENCE_THRESHOLD = 0.85;

export function getLowConfidenceFields(
  confidence: ConfidenceMap,
  threshold = DEFAULT_LOW_CONFIDENCE_THRESHOLD,
): string[] {
  return Object.entries(confidence)
    .filter(([, score]) => typeof score === "number" && score < threshold)
    .map(([field]) => field);
}

export function applyLowConfidenceFields(
  contact: Omit<SnapShareContact, "lowConfidenceFields">,
  threshold?: number,
  markMissingConfidence = false,
): SnapShareContact {
  const missingConfidenceFields = markMissingConfidence
    ? (
        [
          "fullName",
          "company",
          "jobTitle",
          "email",
          "mobilePhone",
          "website",
        ] as const
      ).filter((field) => contact[field] && contact.confidence[field] === undefined)
    : [];

  return {
    ...contact,
    lowConfidenceFields: Array.from(new Set([
      ...getLowConfidenceFields(contact.confidence, threshold),
      ...missingConfidenceFields,
    ])),
  };
}
