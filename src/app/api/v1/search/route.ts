import { NextRequest, NextResponse } from "next/server";
import { getMockResponse } from "@/lib/mock-data";
import { searchResponseSchema, searchSchema } from "@/lib/validation";

// Keep the upstream call within Vercel's serverless limits and user expectations.
export const maxDuration = 10;

const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean));

function getAllowedOrigin(origin: string): string | null {
  if (!origin) return null;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  // Allow subdomains of the deployed app origin.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && origin.endsWith(`.${new URL(appUrl).hostname}`)) return origin;
  return null;
}

function corsHeaders(origin: string): Record<string, string> {
  const allowed = getAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowed ?? "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
    "Access-Control-Allow-Credentials": "false",
    Vary: "Origin",
  };
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
  origin = ""
) {
  return NextResponse.json(
    { error: { code, message, details } },
    { status, headers: corsHeaders(origin) }
  );
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(
      400,
      "VALIDATION_ERROR",
      "Request body must be valid JSON.",
      undefined,
      origin
    );
  }

  const parsed = searchSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues;
    const first = issues[0];
    return errorResponse(
      400,
      "VALIDATION_ERROR",
      first?.message || "Invalid request payload.",
      { issues },
      origin
    );
  }

  const { mode, query, maxResults } = parsed.data;

  const useMock = process.env.USE_MOCK_DATA === "true";
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment || useMock) {
    const mock = getMockResponse(mode);
    return NextResponse.json(mock, {
      headers: {
        ...corsHeaders(origin),
        "X-Mock-Data": "true",
      },
    });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const username = process.env.N8N_WEBHOOK_USERNAME;
  const password = process.env.N8N_WEBHOOK_PASSWORD;

  if (!webhookUrl || !username || !password) {
    return errorResponse(
      500,
      "CONFIGURATION_ERROR",
      "Server configuration is incomplete. Please check environment variables.",
      undefined,
      origin
    );
  }

  if (!webhookUrl.startsWith("https://")) {
    return errorResponse(
      500,
      "CONFIGURATION_ERROR",
      "Webhook URL must use HTTPS.",
      undefined,
      origin
    );
  }

  const payload = { mode, query, maxResults };
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let responseBody: unknown;
    try {
      responseBody = await upstream.json();
    } catch {
      responseBody = null;
    }

    if (!upstream.ok) {
      return errorResponse(
        502,
        "BACKEND_ERROR",
        "The backend returned an error. Please try again.",
        { status: upstream.status },
        origin
      );
    }

    const validated = searchResponseSchema.safeParse(responseBody);
    if (!validated.success) {
      return errorResponse(
        502,
        "BACKEND_ERROR",
        "The backend returned an unexpected response shape.",
        { issues: validated.error.issues },
        origin
      );
    }

    return NextResponse.json(validated.data, {
      status: 200,
      headers: corsHeaders(origin),
    });
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error && err.name === "AbortError") {
      return errorResponse(
        504,
        "TIMEOUT_ERROR",
        "The search took too long. Please try again or refine your query.",
        { timeoutSeconds: 10 },
        origin
      );
    }

    return errorResponse(
      502,
      "BACKEND_ERROR",
      "Could not reach the backend. Please check your connection and try again.",
      undefined,
      origin
    );
  }
}
