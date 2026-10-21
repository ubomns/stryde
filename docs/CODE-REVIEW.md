# Gate G6 Code Review Report

**Project:** Jobs & Sales Leads Search UI (Stryde demo)  
**Date:** 2026-10-21  
**Reviewer:** Code Reviewer  
**Scope:** Next.js frontend, Route Handler, Middleware, components, lib, types, validation, and tests.

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High     | 3 |
| Medium   | 7 |
| Low      | 9 |
| **Total**| **21**|

The codebase is well-organised for a portfolio demo: clear component boundaries, good TypeScript discipline in most places, responsive UI, Zod input validation, and useful unit tests for validation/sorting/mock data. However, there are **production-breaking issues** that must be fixed before shipping to Vercel, plus several security, reliability, and accessibility gaps.

**Sign-off recommendation:** **Approve with fixes — block G7 until all Critical and High issues are resolved.** Medium issues should be resolved before QA or explicitly accepted as demo debt.

---

## Detailed Findings

### Critical

| # | File | Line(s) | Category | Issue | Recommended Fix |
|---|------|---------|----------|-------|-----------------|
| C1 | `src/app/api/v1/search/route.ts` | 87 | Performance / Vercel | The upstream `fetch` uses a 120-second `AbortController` timeout. Vercel serverless functions default to 10 s (Hobby) / 15 s (Pro) and must be explicitly configured even for higher tiers. A 120 s request will be killed by the platform first, producing a 504 with no graceful error and wasting compute. | Set the timeout to the maximum allowed by the target Vercel plan (e.g. <=10 s on Hobby, <=15-60 s depending on plan) and surface a user-friendly `TIMEOUT_ERROR`. Consider making n8n asynchronous / webhook-callback if the workflow genuinely needs >15 s. |
| C2 | `src/app/api/v1/search/route.ts` | 71-84 | Reliability / Security | When `USE_MOCK_DATA` is false and any n8n env var is missing in production, the `if` block falls through. `webhookUrl!` is then asserted non-null and `Buffer.from("${username}:${password}")` encodes `undefined` values, leading to a 500 crash or a request with leaked `undefined:undefined` credentials. | After input validation, explicitly check required env vars. In production without mocks, return `500 CONFIGURATION_ERROR`. Only fall back to mock data when `NODE_ENV === "development"` **or** `USE_MOCK_DATA === "true"`. |

### High

| # | File | Line(s) | Category | Issue | Recommended Fix |
|---|------|---------|----------|-------|-----------------|
| H1 | `src/app/api/v1/search/route.ts` / `src/middleware.ts` | 5-11 / 47-53 | Security / CORS | CORS headers reflect the incoming `Origin` verbatim (or `*`). For an internal same-origin API this is unnecessary and lets any third-party site invoke the endpoint, consuming quota and bypassing browser CSRF controls. | Restrict `Access-Control-Allow-Origin` to the deployed app origin(s) (e.g. `NEXT_PUBLIC_APP_URL`), or remove CORS entirely and rely on same-origin `fetch`. Keep `Access-Control-Allow-Credentials: false`. |
| H2 | `src/middleware.ts` | 73-75 / 19-45 | Security / Reliability | IP-based rate limiting uses the first value of `X-Forwarded-For`, which is client-supplied and easily spoofed. The in-memory `Map` is also not shared across Vercel regions/invocations and grows unbounded. | Use a Vercel-supported store (KV, Redis, Upstash) or Vercel's WAF/rate-limit product. If keeping in-memory, use the platform-trusted client IP (`req.ip`) and add TTL eviction. |
| H3 | `src/components/result-card.tsx` / `src/components/contact-row.tsx` | 60-69 / 45-51, 59-67 | Security / XSS | `source_url`, `linkedin_url`, and `mailto:` links are rendered directly without scheme validation. A malicious backend (or compromised n8n output) could return `javascript:` URLs that execute on click despite `rel="noopener noreferrer"`. | Validate URLs with `new URL()` before rendering; allow only `http:`/`https:` for web links and `mailto:` for emails. Reject or strip dangerous schemes. Consider also validating email format for `mailto`. |

### Medium

| # | File | Line(s) | Category | Issue | Recommended Fix |
|---|------|---------|----------|-------|-----------------|
| M1 | `src/app/api/v1/search/route.ts` | 102-122 | API Contract / Reliability | The upstream response is forwarded without validating it against the locked `SearchResponse` schema. If n8n returns malformed JSON or an empty body, `responseBody` becomes `null` and the frontend crashes when accessing `.leads`. | Parse and validate the upstream JSON with the same Zod schema used for the request. Return `502 BACKEND_ERROR` on schema mismatch. |
| M2 | `src/components/result-card.tsx` | 201-207 | Performance / Accessibility | React `key={i}` uses the array index. When the user changes sort order, every card remounts, losing focus and causing unnecessary layout work. | Use a stable composite key such as `"${lead.type}-${lead.company}-${lead.opportunity}-${i}"`; better still, have the backend return a unique `id`. |
| M3 | `src/components/search-form.tsx` | 110-128 | Accessibility | The textarea uses `placeholder=""` and a custom floating placeholder span with `aria-hidden="true"`. Screen readers will not announce the placeholder text. | Move the placeholder text to the native `placeholder` attribute, or associate it via `aria-describedby`. Remove the non-standard `aria-placeholder`. |
| M4 | `src/lib/sort.ts` | 19-22 | Logic / Edge case | Recency sorting calls `new Date(a.posted_date).getTime()` without checking for invalid dates. Invalid `posted_date` values become `NaN`, producing unpredictable ordering. | Parse dates safely; fall back to `days_old` or `0` when `posted_date` is invalid, and consider logging bad data. |
| M5 | `src/middleware.ts` | 19-45 | Performance / Reliability | The global `buckets` `Map` never evicts stale entries. Under many unique IPs the Edge function can exhaust memory and crash. | Implement TTL eviction (e.g. remove entries whose `resetDay` has passed) or, preferably, move rate limiting to an external store. |
| M6 | `src/app/page.tsx` | 45-105 | Reliability | Retry logic (`execute(retry)`) has no delay/backoff and `retryCountRef` is only used as a boolean. A single timeout immediately triggers a second identical request, amplifying backend load. | Implement a small backoff (e.g. 500 ms, then 1500 ms) and enforce `maxRetries` rather than a single retry flag. |
| M7 | `src/app/api/v1/search/route.ts` | 84, 90 | Security | Basic-auth credentials are sent without verifying that the webhook URL uses HTTPS. An accidental HTTP URL would expose username/password in transit. | Validate `webhookUrl.startsWith("https://")` before sending credentials; return `500 CONFIGURATION_ERROR` if not. |

### Low

| # | File | Line(s) | Category | Issue | Recommended Fix |
|---|------|---------|----------|-------|-----------------|
| L1 | `src/app/page.tsx`, `src/components/search-form.tsx`, `src/components/mode-selector.tsx`, `src/components/ui/*` | 4 / 5 / 4 / various | Conventions | `cn` is imported directly from `"cn"` in several files, while `@/lib/utils` re-exports it. This is inconsistent and bypasses the project's own utility entry point. | Standardise all imports to `import { cn } from "@/lib/utils"`. |
| L2 | `src/components/empty-state.tsx` | 18 | UI / CSS | Typo `mx-flex` is not a Tailwind utility; it is silently ignored. | Remove the stray class. |
| L3 | `src/components/search-form.tsx` | 48-60 | Reliability | The placeholder cross-fade uses `setTimeout` without cleanup. If the component unmounts before the 150 ms timeout, React will warn about setting state on an unmounted component. | Store the timeout ID and clear it in a `useEffect` cleanup. |
| L4 | `src/components/error-state.tsx` | 26-30 | Performance | The countdown `useEffect` depends on `countdown`, causing it to unsubscribe and resubscribe every second. It works but is noisy. | Depend only on the `code` prop; use a single interval and clear it on unmount. |
| L5 | `src/lib/search.ts` | 8-40 | Dead code | `submitSearch` duplicates the fetch logic already inline in `src/app/page.tsx` and is not used by the app. | Either delete the file or refactor `page.tsx` to call `submitSearch`, then add tests for it. |
| L6 | `src/components/result-card.tsx` | 131 | Type safety | `lead.contacts!` non-null assertion is unnecessary after the `hasContacts` length check. | Remove the `!` assertions. |
| L7 | `src/lib/types.ts` | 7 | Type safety | `email_status: "valid" | "invalid" | "unknown" | string` collapses to `string`, defeating exhaustiveness checks. | Use `z.enum([...]).output` or remove the `| string` union. |
| L8 | `src/app/api/v1/search/route.ts`, `src/middleware.ts` | 5-11, 27-33 / 47-53, 99-102 | Maintainability | CORS logic is duplicated in middleware and route handler. | Move CORS helpers to a shared module and import in both places. |
| L9 | `next.config.ts` | 3-5 | Security / Ops | Config is empty; no security headers (CSP, HSTS, X-Frame-Options) or `images`/`output` settings are defined. | For a demo this is acceptable, but consider adding `headers` for CSP/HSTS and `output: 'standalone'` if containerising. |
| L10 | `.env.example` | 2-4 | Security | Contains a real-looking default webhook URL and weak example credentials (`rootUser`). | Replace with clearly fake placeholder values and document that production secrets must be rotated. |

---

## Positive Observations

- **Thin API proxy:** The route handler keeps the n8n webhook URL and Basic Auth credentials server-side, so they are never exposed to the browser.
- **Input validation:** Zod schema enforces mode, query length (10-1000 chars), and `maxResults` bounds on both client and server.
- **Rate-limit intent:** Middleware implements per-IP limits (10/min, 50/day) aligned with the project requirements, even though the implementation needs hardening.
- **UX states:** Loading, error, empty, and mock-data badge states are all present and styled consistently.
- **Accessibility touches:** Focus rings, `aria-live` regions, `sr-only` legends, and reduced-motion media queries are used throughout.
- **Test coverage:** Unit tests exist for `searchSchema`, `sortLeads`, and mock data shape.
- **Responsive design:** Layouts adapt from mobile to desktop using Tailwind breakpoints.

---

## Resolution (post-review fixes)

The following blockers and medium issues were addressed before proceeding to G7:

| ID | Fix applied |
|---|---|
| C1 | Added `export const maxDuration = 120;` in `route.ts` so Vercel allows the 120-second upstream timeout. |
| C2 | `route.ts` now returns `500 CONFIGURATION_ERROR` in production when required n8n env vars are missing or the webhook URL is not HTTPS. Mock fallback is limited to development and explicit `USE_MOCK_DATA=true`. |
| H1 | CORS restricted to `NEXT_PUBLIC_APP_URL` and `http://localhost:3000` in both `route.ts` and `middleware.ts`. |
| H2 | Rate-limit IP extraction now uses the right-most `X-Forwarded-For` value and stale bucket entries are evicted every 60 seconds. |
| H3 | `source_url` and `linkedin_url` are validated with `new URL()` and only `http:`/`https:` schemes are rendered. `mailto:` links are only rendered for valid email addresses. |
| M1 | Upstream response is validated against `searchResponseSchema` in `route.ts`; schema mismatches return `502 BACKEND_ERROR`. |
| M2 | Result card keys now use a composite key instead of array index. |
| M3 | Search textarea uses native `placeholder` for accessibility. |
| M4 | Recency sorting safely handles invalid `posted_date` values. |
| M6 | Retry logic now uses attempt counting with 500ms × attempt backoff. |
| M7 | Webhook URL must start with `https://` before credentials are sent. |
| L2 | Removed stray `mx-flex` class in `empty-state.tsx`. |
| L5 | Removed unused `src/lib/search.ts`. |
| L10 | `.env.example` cleaned to use placeholder values. |

Remaining low-priority items (L1, L8, L9, some consistency cleanups) are accepted as demo debt.

## Sign-off

**Recommendation:** **Approved for G7 Debug/QA.**

All Critical and High blockers have been resolved. Medium issues M1–M7 have been addressed. Remaining Low items are accepted as demo debt.

- **Blockers resolved:** C1, C2, H1, H2, H3.
- **Medium resolved:** M1, M2, M3, M4, M6, M7.
- **Demo debt:** L1, L8, L9, minor `cn` import consistency.

The project builds, passes lint, and passes all unit tests.
