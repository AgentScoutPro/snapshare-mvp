export type ConfidenceMap = {
  fullName?: number;
  company?: number;
  jobTitle?: number;
  email?: number;
  mobilePhone?: number;
  officePhone?: number;
  website?: number;
  address1?: number;
};

export type SnapShareContact = {
  fullName: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  email: string;
  mobilePhone: string;
  officePhone: string;
  website: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
  source: "SnapShare";
  confidence: ConfidenceMap;
  lowConfidenceFields: string[];
};

export type OcrProviderName = "veryfi" | "mindee" | "azure" | string;

export type BusinessCardImageInput = {
  imageBase64?: string;
  imageDataUrl?: string;
  imageUrl?: string;
  imageBuffer?: Buffer | Uint8Array | ArrayBuffer;
  fileName?: string;
  mimeType?: string;
  externalId?: string;
};

export type BusinessCardOcrRequest = BusinessCardImageInput & {
  provider?: OcrProviderName;
};

export type OcrProviderResult = {
  provider: OcrProviderName;
  raw: unknown;
  requestId?: string;
};

export type OcrProvider = {
  name: OcrProviderName;
  processBusinessCard(input: BusinessCardImageInput): Promise<OcrProviderResult>;
};

export type ReviewReadyContactPayload = {
  contact: SnapShareContact;
  review: {
    provider: OcrProviderName;
    needsManualReview: boolean;
    lowConfidenceFields: string[];
    requiredFieldsMissing: string[];
    warnings: string[];
  };
  source: {
    provider: string;
    input: "business-card-image";
  };
  rawProviderResponse?: unknown;
};

export type VeryfiBusinessCardResponse = {
  id?: number | string;
  person?: string;
  name?: string;
  parsed_name?: {
    first?: string;
    first_name?: string;
    given_name?: string;
    last?: string;
    last_name?: string;
    family_name?: string;
  };
  first_name?: string;
  last_name?: string;
  organization?: string;
  company?: string;
  title?: string;
  email?: string;
  emails?: string[];
  phone?: string;
  phone_number?: string;
  phone_numbers?: Array<
    | string
    | {
        value?: string;
        type?: string;
        confidence?: number;
      }
  >;
  mobile?: string;
  mobile_number?: string;
  fax?: string;
  fax_number?: string;
  web?: string;
  website?: string;
  address?: string;
  parsed_address?: {
    street_address?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    postalCode?: string;
    country?: string;
  };
  confidence_details?: Record<string, { score?: number; ocr_score?: number }>;
  pages?: Array<{ ocr_score?: number | null }>;
};
