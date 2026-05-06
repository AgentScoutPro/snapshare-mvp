import { describe, expect, it } from "vitest";
import {
  normalizeAddress,
  normalizeEmail,
  normalizePhone,
  normalizeUrl,
} from "../normalization/validators";

describe("OCR validators", () => {
  it("normalizes email, URL, and US phone values for CRM/contact sync", () => {
    expect(normalizeEmail("  MAYA@Brightline.Studio ")).toBe(
      "maya@brightline.studio",
    );
    expect(normalizeUrl("brightline.studio")).toBe("https://brightline.studio");
    expect(normalizePhone("(602) 555-0184")).toBe("+16025550184");
  });

  it("returns an empty string for invalid values instead of leaking bad data downstream", () => {
    expect(normalizeEmail("maya at brightline")).toBe("");
    expect(normalizeUrl("not a website")).toBe("");
    expect(normalizePhone("call me")).toBe("");
  });

  it("normalizes parsed and free-form address values for review", () => {
    expect(
      normalizeAddress({
        street_address: "201 Spear St\nSuite 1100",
        city: "San Francisco",
        state: "ca",
        postal_code: "94105",
        country: "United States",
      }),
    ).toEqual({
      address1: "201 Spear St",
      address2: "Suite 1100",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "US",
    });

    expect(normalizeAddress("44 E Monroe St, Phoenix, AZ 85004")).toEqual({
      address1: "44 E Monroe St",
      city: "Phoenix",
      state: "AZ",
      postalCode: "85004",
      country: "US",
    });
  });
});
