import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function resolveApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const candidates = [record.message, record.error];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
    if (Array.isArray(candidate) && typeof candidate[0] === "string") {
      return candidate[0];
    }
  }

  return null;
}

export function getApiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data: unknown }).data;
    const message = resolveApiMessage(data);
    if (message) return message;
    if (typeof data === "string" && data.trim()) return data;
  }

  if (error instanceof ApiError) return error.message;

  return "Unable to sign in. Please try again.";
}

export async function apiPost<TResponse>(
  path: string,
  body: unknown,
  token?: string | null,
): Promise<TResponse> {
  if (!env.apiBaseUrl) {
    throw new ApiError(
      0,
      "API URL is not configured. Set NEXT_PUBLIC_API_URL in your environment.",
    );
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      resolveApiMessage(payload) ?? "Request failed. Please try again.",
    );
  }

  return payload as TResponse;
}
