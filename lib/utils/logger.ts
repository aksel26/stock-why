import { randomUUID } from "crypto";

export function createRequestId(): string {
  return randomUUID().slice(0, 8);
}

export function log(requestId: string, message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, requestId, message, ...data }));
}

export function logError(requestId: string, message: string, error: unknown) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ timestamp, requestId, message, error: errorMessage }));
}
