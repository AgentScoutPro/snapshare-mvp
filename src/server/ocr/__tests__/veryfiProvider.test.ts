import { describe, expect, it, vi } from "vitest";
import {
  buildVeryfiJsonPayload,
  buildVeryfiMultipartBody,
  selectBestPhoneNumber,
  VeryfiBusinessCardProvider,
} from "../providers/veryfi";
import { normalizeBusinessCard } from "../normalization/normalizeBusinessCard";
import {
  missingConfidenceBusinessCardFixture,
  veryfiBusinessCardFixture,
} from "./veryfi.fixture";

describe("VeryfiBusinessCardProvider", () => {
  it("builds a JSON file URL payload for Veryfi business card OCR", () => {
    expect(
      buildVeryfiJsonPayload({
        imageUrl: "https://example.com/card.jpg",
        externalId: "scan_123",
      }),
    ).toMatchObject({
      file_url: "https://example.com/card.jpg",
      external_id: "scan_123",
      confidence_details: true,
      auto_delete: true,
      boost_mode: true,
    });
  });

  it("builds multipart form data for direct image uploads", () => {
    const body = buildVeryfiMultipartBody({
      imageBuffer: Buffer.from("fake-image"),
      mimeType: "image/png",
      fileName: "maya-card.png",
      externalId: "scan_456",
    });

    expect(body.formData.get("file_name")).toBe("maya-card.png");
    expect(body.formData.get("confidence_details")).toBe("true");
    expect(body.formData.get("auto_delete")).toBe("true");
    expect(body.formData.get("external_id")).toBe("scan_456");
    expect(body.formData.get("file")).toBeInstanceOf(File);
  });

  it("posts file URLs as JSON to the Veryfi business-card endpoint", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
      return new Response(JSON.stringify(veryfiBusinessCardFixture), {
        status: 200,
        headers: { "x-request-id": "req_123" },
      });
    });
    const provider = new VeryfiBusinessCardProvider(
      {
        clientId: "client",
        username: "user",
        apiKey: "key",
        baseUrl: "https://veryfi.test",
      },
      fetchMock,
    );

    const result = await provider.processBusinessCard({
      imageUrl: "https://example.com/card.jpg",
    });

    expect(result.requestId).toBe("req_123");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://veryfi.test/api/v8/partner/business-cards",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "CLIENT-ID": "client",
          AUTHORIZATION: "apikey user:key",
        }),
        body: expect.stringContaining("file_url"),
      }),
    );
  });

  it("posts multipart image uploads without exposing credentials to clients", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
      return new Response(JSON.stringify(veryfiBusinessCardFixture), {
        status: 200,
      });
    });
    const provider = new VeryfiBusinessCardProvider(
      {
        clientId: "client",
        username: "user",
        apiKey: "key",
        baseUrl: "https://veryfi.test",
      },
      fetchMock,
    );

    await provider.processBusinessCard({
      imageBuffer: Buffer.from("fake-image"),
      mimeType: "image/jpeg",
      fileName: "card.jpg",
    });

    const init = fetchMock.mock.calls[0]![1]!;
    expect(init.headers).toMatchObject({
      "CLIENT-ID": "client",
      AUTHORIZATION: "apikey user:key",
    });
    expect(init.headers).not.toHaveProperty("Content-Type");
    expect(init.body).toBeInstanceOf(FormData);
  });
});

describe("Veryfi normalization helpers", () => {
  it("selects the best phone number by explicit type and confidence score", () => {
    expect(
      selectBestPhoneNumber({
        mobile_number: "",
        phone_numbers: [
          { value: "415 555 0101", type: "office", confidence: 0.97 },
          { value: "(602) 555-0184", type: "mobile", confidence: 0.88 },
        ],
      }),
    ).toEqual({
      mobilePhone: "+16025550184",
      officePhone: "+14155550101",
    });
  });

  it("marks missing confidence as low confidence for populated review fields", () => {
    const result = normalizeBusinessCard(missingConfidenceBusinessCardFixture, {
      provider: "veryfi",
      lowConfidenceThreshold: 0.9,
    });

    expect(result.contact.email).toBe("no-confidence@example.com");
    expect(result.contact.lowConfidenceFields).toEqual([
      "fullName",
      "company",
      "jobTitle",
      "email",
      "mobilePhone",
      "website",
    ]);
  });
});
