import { describe, expect, it } from "vitest";
import { normalizeBusinessCard } from "../normalization/normalizeBusinessCard";
import { OcrError } from "../errors";
import {
  incompleteBusinessCardFixture,
  internationalBusinessCardFixture,
  multilineBusinessCardFixture,
  veryfiBusinessCardFixture,
} from "./veryfi.fixture";

describe("normalizeBusinessCard", () => {
  it("maps a Veryfi-like business card response into the SnapShare contact schema", () => {
    const result = normalizeBusinessCard(veryfiBusinessCardFixture, {
      provider: "veryfi",
      lowConfidenceThreshold: 0.9,
    });

    expect(result.contact).toMatchObject({
      fullName: "Maya Chen",
      firstName: "Maya",
      lastName: "Chen",
      company: "Brightline Studio",
      jobTitle: "Partnerships Lead",
      email: "maya@brightline.studio",
      mobilePhone: "+16025550184",
      officePhone: "+16025550185",
      website: "https://brightline.studio",
      address1: "44 E Monroe St",
      city: "Phoenix",
      state: "AZ",
      postalCode: "85004",
      country: "US",
      source: "SnapShare",
    });
    expect(result.contact.confidence.email).toBe(0.98);
    expect(result.contact.lowConfidenceFields).toEqual([
      "mobilePhone",
      "address1",
    ]);
    expect(result.review.requiredFieldsMissing).toEqual([]);
    expect(result.review.needsManualReview).toBe(true);
  });

  it("throws a typed missing required field error when OCR does not find a name or company", () => {
    expect(() =>
      normalizeBusinessCard(
        { ...veryfiBusinessCardFixture, name: "", company: "" },
        { provider: "veryfi" },
      ),
    ).toThrow(OcrError);
  });

  it("normalizes multiline address and alternate phone fields from a second card response", () => {
    const result = normalizeBusinessCard(multilineBusinessCardFixture, {
      provider: "veryfi",
      lowConfidenceThreshold: 0.8,
    });

    expect(result.contact).toMatchObject({
      fullName: "Jordan Patel",
      firstName: "Jordan",
      lastName: "Patel",
      company: "Northstar Events",
      jobTitle: "Founder",
      email: "jordan@northstar.events",
      mobilePhone: "+14155550144",
      officePhone: "+14155550145",
      website: "https://www.northstar.events",
      address1: "201 Spear St",
      address2: "Suite 1100",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "US",
    });
    expect(result.review.lowConfidenceFields).toEqual(["jobTitle"]);
  });

  it("keeps review metadata useful when fields are invalid or missing", () => {
    const result = normalizeBusinessCard(incompleteBusinessCardFixture, {
      provider: "veryfi",
      lowConfidenceThreshold: 0.9,
    });

    expect(result.contact).toMatchObject({
      fullName: "Avery Brooks",
      company: "Civic Signal",
      email: "",
      mobilePhone: "",
      website: "",
    });
    expect(result.review.requiredFieldsMissing).toEqual(["email", "phone"]);
    expect(result.review.lowConfidenceFields).toEqual([
      "company",
      "email",
      "mobilePhone",
      "website",
    ]);
    expect(result.review.needsManualReview).toBe(true);
  });

  it("normalizes international phone and country values without assuming US only", () => {
    const result = normalizeBusinessCard(internationalBusinessCardFixture, {
      provider: "veryfi",
      lowConfidenceThreshold: 0.9,
    });

    expect(result.contact).toMatchObject({
      fullName: "Sofia Laurent",
      company: "Atelier Nova",
      email: "sofia@ateliernova.fr",
      mobilePhone: "+33142680000",
      website: "https://ateliernova.fr",
      city: "Paris",
      postalCode: "75002",
      country: "FR",
    });
    expect(result.review.requiredFieldsMissing).toEqual([]);
  });
});
