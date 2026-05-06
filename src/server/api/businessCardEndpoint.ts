import { OcrError } from "../ocr/errors";
import { processBusinessCardOcr } from "../ocr/service";
import type { OcrProvider } from "../ocr/providers/OcrProvider";
import type { ReviewReadyContactPayload } from "../ocr/types";

type BusinessCardRequest = {
  imageBase64?: unknown;
  imageDataUrl?: unknown;
  imageUrl?: unknown;
  mimeType?: unknown;
  source?: unknown;
};

type BusinessCardEndpointOptions = {
  provider?: OcrProvider;
  lowConfidenceThreshold?: number;
};

type EndpointResult =
  | {
      status: 200;
      body: ReviewReadyContactPayload & { state: "review_required" };
    }
  | {
      status: number;
      body: {
        error: {
          code: string;
          message: string;
        };
      };
    };

export async function handleBusinessCardOcrRequest(
  request: BusinessCardRequest,
  options: BusinessCardEndpointOptions = {},
): Promise<EndpointResult> {
  const imageBase64 = stringOrEmpty(request.imageBase64);
  const imageDataUrl = stringOrEmpty(request.imageDataUrl);
  const imageUrl = stringOrEmpty(request.imageUrl);

  if (!imageBase64 && !imageDataUrl && !imageUrl) {
    return errorResult(
      400,
      "INVALID_REQUEST",
      "imageBase64, imageDataUrl, or imageUrl is required",
    );
  }

  try {
    const providers = options.provider ? { [options.provider.name]: options.provider } : undefined;
    const payload = await processBusinessCardOcr(
      {
        imageBase64: imageBase64 || undefined,
        imageDataUrl: imageDataUrl || undefined,
        imageUrl: imageUrl || undefined,
        mimeType: stringOrUndefined(request.mimeType),
      },
      {
        providers,
        lowConfidenceThreshold: options.lowConfidenceThreshold ?? 0.9,
      },
    );

    return {
      status: 200,
      body: {
        state: "review_required",
        ...payload,
        source: {
          provider: options.provider?.name ?? payload.source.provider,
          input: "business-card-image",
        },
      },
    };
  } catch (error) {
    if (error instanceof OcrError) {
      return errorResult(error.status, error.code, error.message);
    }

    return errorResult(500, "OCR_FAILED", "Business card OCR failed");
  }
}

function errorResult(
  status: number,
  code: string,
  message: string,
): EndpointResult {
  return {
    status,
    body: {
      error: {
        code,
        message,
      },
    },
  };
}

function stringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function stringOrUndefined(value: unknown): string | undefined {
  const result = stringOrEmpty(value);
  return result || undefined;
}
