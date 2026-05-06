import crypto from "node:crypto";
import { OcrError } from "../errors";
import type {
  BusinessCardImageInput,
  OcrProvider,
  OcrProviderResult,
} from "../types";

export type VeryfiConfig = {
  clientId: string;
  username: string;
  apiKey: string;
  clientSecret?: string;
  baseUrl?: string;
};

type FetchLike = typeof fetch;

export class VeryfiBusinessCardProvider implements OcrProvider {
  name = "veryfi" as const;
  private config: Required<Omit<VeryfiConfig, "clientSecret">> & {
    clientSecret?: string;
  };
  private fetchFn: FetchLike;

  constructor(config: VeryfiConfig, fetchFn: FetchLike = fetch) {
    this.config = {
      baseUrl: "https://api.veryfi.com",
      ...config,
    };
    this.fetchFn = fetchFn;
  }

  async processBusinessCard(input: BusinessCardImageInput): Promise<OcrProviderResult> {
    assertImageInput(input);
    const request = buildVeryfiRequest(input);
    const response = await this.fetchFn(
      `${this.config.baseUrl}/api/v8/partner/business-cards`,
      {
        method: "POST",
        headers: this.createHeaders(request.signaturePayload, request.contentType),
        body: request.body,
      },
    );

    const body = await safeJson(response);

    if (!response.ok) {
      throw mapVeryfiError(response.status, body);
    }

    return {
      provider: this.name,
      raw: body,
      requestId: response.headers.get("x-request-id") ?? undefined,
    };
  }

  private createHeaders(
    payload: Record<string, unknown>,
    contentType: "json" | "multipart",
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "CLIENT-ID": this.config.clientId,
      "AUTHORIZATION": `apikey ${this.config.username}:${this.config.apiKey}`,
    };

    if (contentType === "json") {
      headers["Content-Type"] = "application/json";
    }

    if (this.config.clientSecret) {
      const timestamp = Math.floor(Date.now() / 1000) * 1000;
      headers["X-Veryfi-Request-Timestamp"] = String(timestamp);
      headers["X-Veryfi-Request-Signature"] = createVeryfiSignature(
        this.config.clientSecret,
        payload,
        timestamp,
      );
    }

    return headers;
  }
}

export function createVeryfiProviderFromEnv(): VeryfiBusinessCardProvider {
  const clientId = process.env.VERYFI_CLIENT_ID;
  const username = process.env.VERYFI_USERNAME;
  const apiKey = process.env.VERYFI_API_KEY;

  if (!clientId || !username || !apiKey) {
    throw new OcrError(
      "PROVIDER_NOT_CONFIGURED",
      "Veryfi OCR is not configured. Set VERYFI_CLIENT_ID, VERYFI_USERNAME, and VERYFI_API_KEY on the server.",
      500,
    );
  }

  return new VeryfiBusinessCardProvider({
    clientId,
    username,
    apiKey,
    clientSecret: process.env.VERYFI_CLIENT_SECRET,
    baseUrl: process.env.VERYFI_BASE_URL,
  });
}

export function buildVeryfiPayload(input: BusinessCardImageInput): Record<string, unknown> {
  return buildVeryfiJsonPayload(input);
}

export function buildVeryfiJsonPayload(input: BusinessCardImageInput): Record<string, unknown> {
  const imageBase64 = stripDataUrl(input.imageDataUrl ?? input.imageBase64 ?? "");
  return {
    confidence_details: true,
    auto_delete: true,
    boost_mode: true,
    external_id: input.externalId,
    file_name: input.fileName ?? "business-card.jpg",
    ...(input.imageUrl ? { file_url: input.imageUrl } : { file_data: imageBase64 }),
    meta: {
      tags: ["snapshare", "business-card"],
    },
  };
}

export function buildVeryfiMultipartBody(input: BusinessCardImageInput): {
  formData: FormData;
  signaturePayload: Record<string, unknown>;
} {
  if (!input.imageBuffer) {
    throw new OcrError("INVALID_IMAGE", "imageBuffer is required for multipart upload.", 400);
  }

  const fileName = input.fileName ?? "business-card.jpg";
  const mimeType = input.mimeType ?? "image/jpeg";
  const formData = new FormData();
  const blob = new Blob([toArrayBuffer(input.imageBuffer)], { type: mimeType });

  formData.set("file", blob, fileName);
  formData.set("file_name", fileName);
  formData.set("confidence_details", "true");
  formData.set("auto_delete", "true");
  formData.set("boost_mode", "true");
  formData.set("meta", JSON.stringify({ tags: ["snapshare", "business-card"] }));
  if (input.externalId) formData.set("external_id", input.externalId);

  return {
    formData,
    signaturePayload: {
      confidence_details: true,
      auto_delete: true,
      boost_mode: true,
      external_id: input.externalId,
      file_name: fileName,
      meta: { tags: ["snapshare", "business-card"] },
    },
  };
}

export function buildVeryfiRequest(input: BusinessCardImageInput): {
  body: BodyInit;
  contentType: "json" | "multipart";
  signaturePayload: Record<string, unknown>;
} {
  if (input.imageBuffer) {
    const multipart = buildVeryfiMultipartBody(input);
    return {
      body: multipart.formData,
      contentType: "multipart",
      signaturePayload: multipart.signaturePayload,
    };
  }

  const payload = buildVeryfiJsonPayload(input);
  return {
    body: JSON.stringify(payload),
    contentType: "json",
    signaturePayload: payload,
  };
}

export function selectBestPhoneNumber(raw: {
  mobile_number?: unknown;
  mobile?: unknown;
  phone_number?: unknown;
  phone?: unknown;
  phone_numbers?: Array<string | { value?: string; number?: string; type?: string; confidence?: number }>;
  fax_number?: unknown;
  fax?: unknown;
}): { mobilePhone: string; officePhone: string } {
  const typed = (raw.phone_numbers ?? [])
    .map((entry) =>
      typeof entry === "string"
        ? { value: entry, type: "", confidence: 0 }
        : {
            value: entry.value ?? entry.number ?? "",
            type: String(entry.type ?? "").toLowerCase(),
            confidence: entry.confidence ?? 0,
          },
    )
    .filter((entry) => entry.value);

  const explicitMobile = normalizePhoneLocal(raw.mobile_number ?? raw.mobile);
  const explicitPhone = normalizePhoneLocal(raw.phone_number ?? raw.phone);
  const explicitOffice = normalizePhoneLocal(raw.fax_number ?? raw.fax);
  const typedMobile = normalizePhoneLocal(
    typed
      .filter((entry) => /mobile|cell/.test(entry.type))
      .sort((a, b) => b.confidence - a.confidence)[0]?.value,
  );
  const typedOffice = normalizePhoneLocal(
    typed
      .filter((entry) => /office|work|main|phone/.test(entry.type))
      .sort((a, b) => b.confidence - a.confidence)[0]?.value,
  );
  const firstTyped = normalizePhoneLocal(typed[0]?.value);
  const secondTyped = normalizePhoneLocal(typed[1]?.value);

  return {
    mobilePhone: explicitMobile || typedMobile || explicitPhone || firstTyped,
    officePhone: explicitOffice || typedOffice || secondTyped,
  };
}

export function createVeryfiSignature(
  secret: string,
  payload: Record<string, unknown>,
  timestamp: number,
): string {
  const payloadStr = `timestamp:${timestamp},${serializePayload(payload)}`;
  return crypto.createHmac("sha256", secret).update(payloadStr).digest("base64");
}

function serializePayload(payload: Record<string, unknown>): string {
  return Object.entries(payload)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}:${customSerialize(value)}`)
    .join(",");
}

function customSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(customSerialize).join(", ")}]`;
  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, nestedValue]) => nestedValue !== undefined)
      .map(([nestedKey, nestedValue]) => `${nestedKey}: ${customSerialize(nestedValue)}`)
      .join(", ")}}`;
  }
  return JSON.stringify(value);
}

function assertImageInput(input: BusinessCardImageInput) {
  if (!input.imageBase64 && !input.imageDataUrl && !input.imageUrl && !input.imageBuffer) {
    throw new OcrError(
      "INVALID_IMAGE",
      "Send imageBase64, imageDataUrl, imageBuffer, or imageUrl to process a business card.",
      400,
    );
  }
}

function stripDataUrl(value: string): string {
  return value.replace(/^data:[^;]+;base64,/, "");
}

function normalizePhoneLocal(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (hasPlus && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return "";
}

function toArrayBuffer(value: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (value instanceof ArrayBuffer) return value;
  return value.buffer.slice(
    value.byteOffset,
    value.byteOffset + value.byteLength,
  ) as ArrayBuffer;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function mapVeryfiError(status: number, body: unknown): OcrError {
  if (status === 413) {
    return new OcrError("INVALID_IMAGE", "Business card image is too large.", 413, body);
  }
  if (status === 400 || status === 422) {
    return new OcrError("PARTIAL_CARD", "OCR provider could not process this card image.", 422, body);
  }
  if (status === 403) {
    return new OcrError("PROVIDER_NOT_CONFIGURED", "Veryfi credentials were rejected.", 502, body);
  }
  return new OcrError("FAILED_OCR", "Veryfi OCR request failed.", 502, body);
}
