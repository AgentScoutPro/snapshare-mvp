import { describe, expect, it } from "vitest";
import { mapOcrReviewPayloadToCapturedContact } from "./ocrReview";

describe("mapOcrReviewPayloadToCapturedContact", () => {
  it("maps a review-ready OCR payload into an editable captured contact", () => {
    const result = mapOcrReviewPayloadToCapturedContact({
      state: "review_required",
      contact: {
        fullName: "Maya Chen",
        firstName: "Maya",
        lastName: "Chen",
        company: "Brightline Studio",
        jobTitle: "Partnerships Lead",
        email: "maya@brightline.studio",
        mobilePhone: "+16025550184",
        officePhone: "",
        website: "https://brightline.studio",
        address1: "44 E Monroe St",
        city: "Phoenix",
        state: "AZ",
        postalCode: "85004",
        country: "US",
        notes: "",
        source: "SnapShare",
        confidence: {
          fullName: 0.97,
          email: 0.98,
          mobilePhone: 0.86,
          address1: 0.72,
        },
        lowConfidenceFields: ["mobilePhone", "address1"],
      },
      review: {
        provider: "veryfi",
        needsManualReview: true,
        lowConfidenceFields: ["mobilePhone", "address1"],
        requiredFieldsMissing: [],
        warnings: ["Phone confidence is below review threshold"],
      },
      source: {
        provider: "veryfi",
        input: "business-card-image",
      },
    });

    expect(result).toMatchObject({
      name: "Maya Chen",
      title: "Partnerships Lead",
      company: "Brightline Studio",
      email: "maya@brightline.studio",
      phone: "+16025550184",
      website: "https://brightline.studio",
      source: "SnapShare",
      notes: "44 E Monroe St, Phoenix, AZ 85004, US",
      syncStatus: "queued",
      lowConfidenceFields: ["phone", "address"],
      ocrWarnings: ["Phone confidence is below review threshold"],
    });
    expect(result.confidence?.phone).toBe(0.86);
    expect(result.confidence?.address).toBe(0.72);
  });
});
