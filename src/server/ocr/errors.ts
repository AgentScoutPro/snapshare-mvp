export type OcrErrorCode =
  | "BLURRY_IMAGE"
  | "PARTIAL_CARD"
  | "FAILED_OCR"
  | "MISSING_REQUIRED_FIELDS"
  | "INVALID_IMAGE"
  | "PROVIDER_NOT_CONFIGURED";

export class OcrError extends Error {
  code: OcrErrorCode;
  status: number;
  details?: unknown;

  constructor(code: OcrErrorCode, message: string, status = 422, details?: unknown) {
    super(message);
    this.name = "OcrError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function toOcrError(error: unknown): OcrError {
  if (error instanceof OcrError) return error;
  if (error instanceof Error) {
    return new OcrError("FAILED_OCR", error.message, 502);
  }
  return new OcrError("FAILED_OCR", "OCR processing failed.", 502, error);
}
