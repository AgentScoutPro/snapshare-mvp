import {
  createGhlMobileFailure,
  createGoHighLevelClientFromEnv,
  type GhlMobileSyncResult,
  type GoHighLevelClient,
} from "../crm/gohighlevel";
import type { SnapShareContact } from "../ocr/types";

type CrmContactUpsertRequest = {
  contact?: SnapShareContact;
  tags?: string[];
  sourceName?: string;
  assignedTo?: string;
  workflowId?: string;
  enrollWorkflow?: boolean;
};

type CrmContactUpsertOptions = {
  client?: GoHighLevelClient;
};

export async function handleCrmContactUpsertRequest(
  request: CrmContactUpsertRequest,
  options: CrmContactUpsertOptions = {},
): Promise<{ status: number; body: GhlMobileSyncResult }> {
  if (!request.contact) {
    return {
      status: 400,
      body: createGhlMobileFailure({
        code: "INVALID_REQUEST",
        message: "contact is required",
        retryable: false,
      }),
    };
  }

  try {
    const client = options.client ?? createGoHighLevelClientFromEnv();
    const result = await client.syncContact(request.contact, {
      tags: request.tags,
      sourceName: request.sourceName,
      assignedTo: request.assignedTo,
      workflowId: request.workflowId,
      enrollWorkflow: request.enrollWorkflow,
    });

    return {
      status: result.ok ? 200 : result.retryable ? 502 : 400,
      body: result,
    };
  } catch {
    return {
      status: 500,
      body: createGhlMobileFailure({
        code: "GHL_NOT_CONFIGURED",
        message: "GoHighLevel is not configured on the server.",
        retryable: false,
      }),
    };
  }
}
