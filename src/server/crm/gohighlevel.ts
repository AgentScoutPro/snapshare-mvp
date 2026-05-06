import type { SnapShareContact } from "../ocr/types";

const DEFAULT_GHL_BASE_URL = "https://services.leadconnectorhq.com";
const DEFAULT_GHL_VERSION = "2021-07-28";
const SNAPSHARE_SOURCE = "SnapShare";
const DEFAULT_TAGS = ["business-card-scan", "snapshare"];

type FetchLike = typeof fetch;

export type GhlUpsertOptions = {
  locationId: string;
  tags?: string[];
  sourceName?: string;
  assignedTo?: string;
};

export type GhlContactUpsertPayload = {
  locationId: string;
  firstName: string;
  lastName: string;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  website?: string;
  source: "SnapShare";
  tags: string[];
  assignedTo?: string;
  customFields: Array<{ key: string; field_value: string }>;
};

export type WorkflowEnrollmentPayload = {
  contactId: string;
  workflowId: string;
  eventStartTime?: string;
};

export type PreparedGhlSyncPayload = {
  upsertPayload: GhlContactUpsertPayload;
  workflow?: {
    workflowId: string;
    enrollAfterUpsert: true;
  };
};

export type GhlMobileSyncResult =
  | {
      ok: true;
      status: "synced";
      contactId: string;
      duplicateMatched: boolean;
      workflowEnrolled: boolean;
      message: string;
    }
  | {
      ok: false;
      status: "failed";
      code: string;
      message: string;
      retryable: boolean;
    };

export type GhlClientConfig = {
  token: string;
  locationId: string;
  workflowId?: string;
  baseUrl?: string;
  apiVersion?: string;
};

export type GhlSyncOptions = {
  tags?: string[];
  sourceName?: string;
  assignedTo?: string;
  workflowId?: string;
  enrollWorkflow?: boolean;
};

export function mapContactToGhlUpsert(
  contact: SnapShareContact,
  options: GhlUpsertOptions,
): GhlContactUpsertPayload {
  return {
    locationId: options.locationId,
    firstName: contact.firstName,
    lastName: contact.lastName,
    name: contact.fullName,
    email: contact.email || undefined,
    phone: contact.mobilePhone || contact.officePhone || undefined,
    companyName: contact.company || undefined,
    address1: contact.address1 || undefined,
    city: contact.city || undefined,
    state: contact.state || undefined,
    postalCode: contact.postalCode || undefined,
    country: contact.country || undefined,
    website: contact.website || undefined,
    source: SNAPSHARE_SOURCE,
    tags: mergeTags(options.tags),
    assignedTo: options.assignedTo,
    customFields: buildSnapShareCustomFields(contact, options.sourceName),
  };
}

export function mapWorkflowEnrollment(
  payload: WorkflowEnrollmentPayload,
): WorkflowEnrollmentPayload {
  return {
    contactId: payload.contactId,
    workflowId: payload.workflowId,
    eventStartTime: payload.eventStartTime,
  };
}

export function prepareGoHighLevelSyncPayload(
  contact: SnapShareContact,
  options: GhlUpsertOptions & {
    workflowId?: string;
    enrollWorkflow?: boolean;
  },
): PreparedGhlSyncPayload {
  return {
    upsertPayload: mapContactToGhlUpsert(contact, options),
    workflow:
      options.enrollWorkflow && options.workflowId
        ? {
            workflowId: options.workflowId,
            enrollAfterUpsert: true,
          }
        : undefined,
  };
}

export function createGhlMobileSuccess(input: {
  contactId: string;
  duplicateMatched: boolean;
  workflowEnrolled: boolean;
  message: string;
}): GhlMobileSyncResult {
  return {
    ok: true,
    status: "synced",
    contactId: input.contactId,
    duplicateMatched: input.duplicateMatched,
    workflowEnrolled: input.workflowEnrolled,
    message: input.message,
  };
}

export function createGhlMobileFailure(input: {
  code: string;
  message: string;
  retryable: boolean;
}): GhlMobileSyncResult {
  return {
    ok: false,
    status: "failed",
    code: input.code,
    message: input.message,
    retryable: input.retryable,
  };
}

export class GoHighLevelClient {
  private config: Required<Omit<GhlClientConfig, "workflowId">> & {
    workflowId?: string;
  };
  private fetchFn: FetchLike;

  constructor(config: GhlClientConfig, fetchFn: FetchLike = fetch) {
    this.config = {
      baseUrl: DEFAULT_GHL_BASE_URL,
      apiVersion: DEFAULT_GHL_VERSION,
      ...config,
    };
    this.fetchFn = fetchFn;
  }

  async syncContact(
    contact: SnapShareContact,
    options: GhlSyncOptions = {},
  ): Promise<GhlMobileSyncResult> {
    try {
      const upsertPayload = mapContactToGhlUpsert(contact, {
        locationId: this.config.locationId,
        tags: options.tags,
        sourceName: options.sourceName,
        assignedTo: options.assignedTo,
      });
      const upsertResponse = await this.request("/contacts/upsert", {
        method: "POST",
        body: JSON.stringify(upsertPayload),
      });

      if (!upsertResponse.ok) {
        return mapGhlFailure(upsertResponse.status);
      }

      const upsertJson = await upsertResponse.json();
      const contactId = extractContactId(upsertJson);

      if (!contactId) {
        return createGhlMobileFailure({
          code: "GHL_MISSING_CONTACT_ID",
          message: "GoHighLevel synced but did not return a contact id.",
          retryable: true,
        });
      }

      const workflowId = options.workflowId ?? this.config.workflowId;
      let workflowEnrolled = false;

      if (options.enrollWorkflow && workflowId) {
        const workflowResponse = await this.request(
          `/contacts/${contactId}/workflow/${workflowId}`,
          {
            method: "POST",
            body: JSON.stringify(mapWorkflowEnrollment({ contactId, workflowId })),
          },
        );

        if (!workflowResponse.ok) {
          return mapGhlFailure(workflowResponse.status, "Contact synced, but workflow enrollment failed.");
        }

        workflowEnrolled = true;
      }

      return createGhlMobileSuccess({
        contactId,
        duplicateMatched: isDuplicateMatch(upsertJson),
        workflowEnrolled,
        message: "Contact synced to GoHighLevel.",
      });
    } catch {
      return createGhlMobileFailure({
        code: "GHL_NETWORK_ERROR",
        message: "Could not reach GoHighLevel. Try again.",
        retryable: true,
      });
    }
  }

  private request(path: string, init: RequestInit): Promise<Response> {
    return this.fetchFn(`${this.config.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.token}`,
        Version: this.config.apiVersion,
        ...(init.headers ?? {}),
      },
    });
  }
}

export function createGoHighLevelClientFromEnv(): GoHighLevelClient {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN ?? process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!token || !locationId) {
    throw new Error("GHL_PRIVATE_INTEGRATION_TOKEN/GHL_API_KEY and GHL_LOCATION_ID are required.");
  }

  return new GoHighLevelClient({
    token,
    locationId,
    workflowId: process.env.GHL_WORKFLOW_ID,
    baseUrl: process.env.GHL_BASE_URL,
  });
}

function mergeTags(tags: string[] = []): string[] {
  return Array.from(new Set([...DEFAULT_TAGS, ...tags].filter(Boolean)));
}

function buildSnapShareCustomFields(
  contact: SnapShareContact,
  sourceName?: string,
): Array<{ key: string; field_value: string }> {
  const confidenceFields = Object.entries(contact.confidence).map(([key, value]) => ({
    key: `snapshare_confidence_${key}`,
    field_value: String(value),
  }));

  return [
    { key: "snapshare_source", field_value: sourceName ?? contact.source },
    { key: "snapshare_low_confidence_fields", field_value: contact.lowConfidenceFields.join(",") },
    { key: "snapshare_notes", field_value: contact.notes },
    ...confidenceFields,
  ];
}

function extractContactId(value: unknown): string {
  if (!isRecord(value)) return "";
  const contact = isRecord(value.contact) ? value.contact : undefined;
  const id = value.id ?? value.contactId ?? contact?.id;
  return typeof id === "string" ? id : "";
}

function isDuplicateMatch(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (value.new === false) return true;
  if (value.isNew === false) return true;
  if (value.duplicate === true) return true;
  return false;
}

function mapGhlFailure(status: number, fallbackMessage?: string): GhlMobileSyncResult {
  if (status === 401 || status === 403) {
    return createGhlMobileFailure({
      code: "GHL_AUTH_FAILED",
      message: "GoHighLevel authorization failed.",
      retryable: false,
    });
  }
  if (status === 409 || status === 422) {
    return createGhlMobileFailure({
      code: "GHL_VALIDATION_FAILED",
      message: fallbackMessage ?? "GoHighLevel rejected this contact. Review required fields.",
      retryable: false,
    });
  }
  return createGhlMobileFailure({
    code: "GHL_SYNC_FAILED",
    message: fallbackMessage ?? "GoHighLevel sync failed. Try again.",
    retryable: true,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
