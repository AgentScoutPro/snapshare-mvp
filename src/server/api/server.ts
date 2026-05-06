import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleBusinessCardOcrRequest } from "./businessCardEndpoint";
import { handleCrmContactUpsertRequest } from "./crmContactsEndpoint";

const PORT = Number(process.env.PORT ?? 8787);

const server = createServer(
  async (request: IncomingMessage, response: ServerResponse) => {
    if (request.method === "POST" && request.url === "/ocr/business-card") {
      const body = await readJsonBody(request);
      const result = await handleBusinessCardOcrRequest(body);

      response.writeHead(result.status, { "Content-Type": "application/json" });
      response.end(JSON.stringify(result.body));
      return;
    }

    if (request.method === "POST" && request.url === "/crm/contacts/upsert") {
      const body = await readJsonBody(request);
      const result = await handleCrmContactUpsertRequest({
        contact: isRecord(body.contact) ? body.contact as never : undefined,
        tags: Array.isArray(body.tags) ? body.tags.filter(isString) : undefined,
        sourceName: typeof body.sourceName === "string" ? body.sourceName : undefined,
        assignedTo: typeof body.assignedTo === "string" ? body.assignedTo : undefined,
        workflowId: typeof body.workflowId === "string" ? body.workflowId : undefined,
        enrollWorkflow: body.enrollWorkflow === true,
      });

      response.writeHead(result.status, { "Content-Type": "application/json" });
      response.end(JSON.stringify(result.body));
      return;
    }

    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        error: {
          code: "NOT_FOUND",
          message: "Route not found",
        },
      }),
    );
  },
);

server.listen(PORT, () => {
  console.log(`SnapShare API listening on http://localhost:${PORT}`);
});

async function readJsonBody(
  request: NodeJS.ReadableStream,
): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }

  const parsed = JSON.parse(raw) as unknown;
  return isRecord(parsed) ? parsed : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
