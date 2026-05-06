import { describe, expect, it } from "vitest";
import {
  GoHighLevelClient,
  createGhlMobileFailure,
  createGhlMobileSuccess,
  mapContactToGhlUpsert,
  mapWorkflowEnrollment,
  prepareGoHighLevelSyncPayload,
} from "../gohighlevel";
import { normalizedContactFixture } from "../../ocr/__tests__/veryfi.fixture";

describe("GoHighLevel mapping", () => {
  it("creates a contact upsert payload without raw OCR provider details", () => {
    const payload = mapContactToGhlUpsert(normalizedContactFixture, {
      locationId: "loc_123",
      tags: ["snapshare", "event"],
      sourceName: "Phoenix Mixer",
      assignedTo: "user_456",
    });

    expect(payload).toMatchObject({
      locationId: "loc_123",
      firstName: "Maya",
      lastName: "Chen",
      email: "maya@brightline.studio",
      phone: "+16025550184",
      companyName: "Brightline Studio",
      source: "SnapShare",
      assignedTo: "user_456",
      tags: ["business-card-scan", "snapshare", "event"],
    });
    expect(payload.customFields).toContainEqual({
      key: "snapshare_confidence_email",
      field_value: "0.98",
    });
  });

  it("creates an optional workflow enrollment payload", () => {
    expect(
      mapWorkflowEnrollment({
        contactId: "contact_123",
        workflowId: "workflow_abc",
        eventStartTime: "2026-05-05T16:00:00.000Z",
      }),
    ).toEqual({
      contactId: "contact_123",
      workflowId: "workflow_abc",
      eventStartTime: "2026-05-05T16:00:00.000Z",
    });
  });

  it("prepares a confirmed SnapShare contact for GHL upsert plus optional workflow enrollment", () => {
    const prepared = prepareGoHighLevelSyncPayload(normalizedContactFixture, {
      locationId: "loc_123",
      tags: ["expo"],
      workflowId: "workflow_abc",
      enrollWorkflow: true,
    });

    expect(prepared.upsertPayload).toMatchObject({
      locationId: "loc_123",
      source: "SnapShare",
      tags: ["business-card-scan", "snapshare", "expo"],
    });
    expect(prepared.workflow).toEqual({
      workflowId: "workflow_abc",
      enrollAfterUpsert: true,
    });
  });

  it("uses email and phone for duplicate-safe upsert identity", () => {
    const payload = mapContactToGhlUpsert(normalizedContactFixture, {
      locationId: "loc_123",
    });

    expect(payload).toMatchObject({
      email: "maya@brightline.studio",
      phone: "+16025550184",
      source: "SnapShare",
    });
    expect(payload.tags).toContain("business-card-scan");
  });

  it("upserts then enrolls a contact in a workflow and returns mobile-friendly success", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fetchMock = async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init: init ?? {} });
      if (String(url).endsWith("/contacts/upsert")) {
        return Response.json({ contact: { id: "contact_123" }, new: false });
      }
      return Response.json({ succeeded: true });
    };
    const client = new GoHighLevelClient(
      {
        token: "private-token",
        locationId: "loc_123",
        workflowId: "workflow_abc",
        baseUrl: "https://ghl.test",
      },
      fetchMock,
    );

    const result = await client.syncContact(normalizedContactFixture, {
      tags: ["event"],
      enrollWorkflow: true,
    });

    expect(result).toEqual(
      createGhlMobileSuccess({
        contactId: "contact_123",
        duplicateMatched: true,
        workflowEnrolled: true,
        message: "Contact synced to GoHighLevel.",
      }),
    );
    expect(calls[0]).toMatchObject({
      url: "https://ghl.test/contacts/upsert",
      init: {
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer private-token",
          Version: "2021-07-28",
        }),
      },
    });
    expect(calls[1].url).toBe(
      "https://ghl.test/contacts/contact_123/workflow/workflow_abc",
    );
  });

  it("returns mobile-friendly failure responses without leaking auth details", async () => {
    const client = new GoHighLevelClient(
      {
        token: "secret-token",
        locationId: "loc_123",
        baseUrl: "https://ghl.test",
      },
      async () =>
        Response.json(
          { message: "Invalid token secret-token" },
          { status: 401 },
        ),
    );

    const result = await client.syncContact(normalizedContactFixture);

    expect(result).toEqual(
      createGhlMobileFailure({
        code: "GHL_AUTH_FAILED",
        message: "GoHighLevel authorization failed.",
        retryable: false,
      }),
    );
    expect(JSON.stringify(result)).not.toContain("secret-token");
  });
});
