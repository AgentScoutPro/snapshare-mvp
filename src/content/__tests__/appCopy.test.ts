import { describe, expect, it } from "vitest";
import { appCopy } from "../appCopy";

describe("appCopy", () => {
  it("positions ScanShare as camera-first CRM lead capture", () => {
    expect(appCopy.brand.headline).toBe("From business card to CRM in seconds.");
    expect(appCopy.brand.tagline).toBe("Scan it. Sync it. Follow up.");
    expect(appCopy.brand.supporting).toContain("GoHighLevel");
  });

  it("uses lead-focused scan, review, sync, and success copy", () => {
    expect(appCopy.scan.headline).toBe("Scan a Business Card");
    expect(appCopy.review.headline).toBe("Confirm the Details");
    expect(appCopy.sync.headline).toBe("Save & Sync Lead");
    expect(appCopy.success.headline).toBe("Lead Captured");
  });

  it("keeps the GoHighLevel integration visible in core microcopy", () => {
    expect(appCopy.sync.cta).toBe("Sync to GoHighLevel");
    expect(appCopy.microcopy.readyForGhl).toBe("This lead is ready for GoHighLevel.");
    expect(appCopy.microcopy.syncedToGhl).toBe("Synced to GoHighLevel.");
  });
});
