import { normalizeBusinessCard } from "./normalization/normalizeBusinessCard";
import { createVeryfiProviderFromEnv } from "./providers/veryfi";
import type {
  BusinessCardOcrRequest,
  OcrProvider,
  OcrProviderName,
  ReviewReadyContactPayload,
} from "./types";

export type OcrPipelineOptions = {
  providers?: Partial<Record<OcrProviderName, OcrProvider>>;
  includeRawProviderResponse?: boolean;
  lowConfidenceThreshold?: number;
};

export async function processBusinessCardOcr(
  request: BusinessCardOcrRequest,
  options: OcrPipelineOptions = {},
): Promise<ReviewReadyContactPayload> {
  const providerName = request.provider ?? "veryfi";
  const provider = options.providers?.[providerName] ?? getDefaultProvider(providerName);
  const providerResult = await provider.processBusinessCard(request);

  return normalizeBusinessCard(providerResult.raw, {
    provider: providerResult.provider,
    lowConfidenceThreshold: options.lowConfidenceThreshold,
    includeRawProviderResponse: options.includeRawProviderResponse,
  });
}

function getDefaultProvider(providerName: OcrProviderName): OcrProvider {
  if (providerName === "veryfi") return createVeryfiProviderFromEnv();
  throw new Error(`OCR provider ${providerName} is not implemented yet.`);
}
