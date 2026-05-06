import { describe, expect, it } from "vitest";
import { buildVCard, contactToVCardProfile, createVCardFileName } from "./vcard";
import type { CapturedContact, UserProfile } from "./types";

describe("buildVCard", () => {
  it("maps a scanned business card into standard vCard fields", () => {
    const contact: CapturedContact = {
      name: "Maya Chen",
      title: "Partnerships Lead",
      company: "Brightline Studio",
      email: "maya@brightline.studio",
      phone: "+16025550184",
      website: "https://brightline.studio",
      source: "SnapShare",
      tags: "business-card-scan",
      owner: "Avery Stone",
      notes: "Met at Phoenix Mixer",
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
    };

    const vcard = buildVCard(contactToVCardProfile(contact));

    expect(vcard).toContain("BEGIN:VCARD");
    expect(vcard).toContain("VERSION:3.0");
    expect(vcard).toContain("FN:Maya Chen");
    expect(vcard).toContain("ORG:Brightline Studio");
    expect(vcard).toContain("TITLE:Partnerships Lead");
    expect(vcard).toContain("TEL;TYPE=CELL:+16025550184");
    expect(vcard).toContain("EMAIL;TYPE=INTERNET:maya@brightline.studio");
    expect(vcard).toContain("URL:https://brightline.studio");
    expect(vcard).toContain("NOTE:Met at Phoenix Mixer");
    expect(vcard).toContain("END:VCARD");
  });

  it("escapes vCard text and creates a safe filename", () => {
    const profile: UserProfile = {
      name: "Avery Stone",
      title: "Owner, Growth",
      company: "C0D3AI; Studio",
      email: "avery@snapshare.app",
      phone: "(602) 555-0199",
      website: "https://snapshare.app/avery",
      notes: "SnapShare profile",
    };

    expect(buildVCard(profile)).toContain("TITLE:Owner\\, Growth");
    expect(buildVCard(profile)).toContain("ORG:C0D3AI\\; Studio");
    expect(createVCardFileName(profile)).toBe("avery-stone.vcf");
  });
});
