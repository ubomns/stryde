import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/api/v1/search",
};

const LIMITS = {
  perMinute: 10,
  perDay: 50,
};

interface Bucket {
  minute: number;
  day: number;
  resetMinute: number;
  resetDay: number;
}

const buckets = new Map<string, Bucket>();
let lastEviction = Date.now();

function evictStaleBuckets(now: number) {
  if (now - lastEviction < 60_000) return;
  for (const [ip, bucket] of buckets.entries()) {
    if (now > bucket.resetDay) {
      buckets.delete(ip);
    }
  }
  lastEviction = now;
}

function getBucket(ip: string, now: number): Bucket {
  const existing = buckets.get(ip);

  if (existing) {
    if (now > existing.resetMinute) {
      existing.minute = 0;
      existing.resetMinute = now + 60 * 1000;
    }
    if (now > existing.resetDay) {
      existing.day = 0;
      existing.resetDay = now + 24 * 60 * 60 * 1000;
    }
    return existing;
  }

  const bucket: Bucket = {
    minute: 0,
    day: 0,
    resetMinute: now + 60 * 1000,
    resetDay: now + 24 * 60 * 60 * 1000,
  };
  buckets.set(ip, bucket);
  return bucket;
}

function getClientIp(req: NextRequest): string {
  // Vercel-specific header is preferred when present.
  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0]?.trim() ?? "unknown";

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // On Vercel the original client IP is the left-most value.
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return "unknown";
}

export function proxy(req: NextRequest) {
  // Only apply rate limiting to POST requests. CORS and request handling are
  // managed by the route.ts Route Handler so they are not duplicated here.
  if (req.method !== "POST") {
    return NextResponse.next();
  }

  const now = Date.now();
  evictStaleBuckets(now);

  const ip = getClientIp(req);
  const bucket = getBucket(ip, now);

  if (bucket.minute >= LIMITS.perMinute || bucket.day >= LIMITS.perDay) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Too many searches. Please wait a minute and try again.",
          details: { retryAfter: 60 },
        },
      },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  bucket.minute += 1;
  bucket.day += 1;

  return NextResponse.next();
}
