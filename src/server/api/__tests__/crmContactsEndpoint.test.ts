import { describe, expect, it } from "vitest";
import { handleCrmContactUpsertRequest } from "../crmContactsEndpoint";
import { normalizedContactFixture } from "../../ocr/__tests__/veryfi.fixture";
import { createGhlMobileSuccess } from "../../crm/gohighlevel";

describe("POST /crm/contacts/upsert", () => {
  it("returns mobile-displayable sync results from the GHL client", async () => {
    const result = await handleCrmContactUpsertRequest(
      {
        contact: normalizedContactFixture,
        tags: ["event"],
        enrollWorkflow: true,
      },
      {
        client: {
          async syncContact() {
            return createGhlMobileSuccess({
              contactId: "contact_123",
              duplicateMatched: true,
              workflowEnrolled: true,
              message: "Contact synced to GoHighLevel.",
            });
          },
        } as never,
      },
    );

    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        status: "synced",
        contactId: "contact_123",
        duplicateMatched: true,
        workflowEnrolled: true,
        message: "Contact synced to GoHighLevel.",
      },
    });
  });

  it("rejects missing contact payloads", async () => {
    const result = await handleCrmContactUpsertRequest({});

    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({
      ok: false,
      code: "INVALID_REQUEST",
      retryable: false,
    });
  });
});
