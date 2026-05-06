import { describe, expect, it } from "vitest";
import { handleBusinessCardOcrRequest } from "../businessCardEndpoint";
import type { OcrProvider } from "../../ocr/providers/OcrProvider";
import { veryfiBusinessCardFixture } from "../../ocr/__tests__/veryfi.fixture";

const provider: OcrProvider = {
  name: "veryfi",
  async processBusinessCard(input) {
    if (!input.imageBase64 && !input.imageDataUrl && !input.imageUrl) {
      throw new Error("missing image");
    }
    return {
      provider: "veryfi",
      raw: veryfiBusinessCardFixture,
    };
  },
};

describe("POST /ocr/business-card", () => {
  it("returns review-ready normalized contact JSON from a business card image payload", async () => {
    const result = await handleBusinessCardOcrRequest(
      {
        imageBase64: "ZmFrZS1pbWFnZQ==",
        mimeType: "image/png",
        source: "Phoenix Mixer",
      },
      { provider },
    );

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      state: "review_required",
      contact: {
        fullName: "Maya Chen",
        email: "maya@brightline.studio",
        mobilePhone: "+16025550184",
        website: "https://brightline.studio",
      },
      review: {
        needsManualReview: true,
        lowConfidenceFields: ["mobilePhone", "address1"],
        requiredFieldsMissing: [],
      },
      source: {
        provider: "veryfi",
        input: "business-card-image",
      },
    });
    expect(JSON.stringify(result.body)).not.toContain("upsert");
    expect(JSON.stringify(result.body)).not.toContain("workflowEnrolled");
  });

  it("accepts file URL and data URL inputs without requiring base64", async () => {
    const fileUrlResult = await handleBusinessCardOcrRequest(
      { imageUrl: "https://example.com/card.jpg" },
      { provider },
    );
    const dataUrlResult = await handleBusinessCardOcrRequest(
      { imageDataUrl: "data:image/jpeg;base64,ZmFrZQ==" },
      { provider },
    );

    expect(fileUrlResult.status).toBe(200);
    expect(dataUrlResult.status).toBe(200);
    expect(fileUrlResult.body).toMatchObject({ state: "review_required" });
    expect(dataUrlResult.body).toMatchObject({ state: "review_required" });
  });

  it("rejects requests that do not include an image", async () => {
    const result = await handleBusinessCardOcrRequest({}, { provider });

    expect(result.status).toBe(400);
    expect(result.body).toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: "imageBase64, imageDataUrl, or imageUrl is required",
      },
    });
  });
});
