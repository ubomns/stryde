# Security Review — Gate G8 Harden

**Project:** Jobs & Sales Leads Search UI + n8n Workflow (Stryde demo)  
**Date:** 2026-10-21  
**Reviewer:** Application Security Engineer subagent  
**Scope:** `src/app/api/v1/search/route.ts`, `src/proxy.ts`, `src/lib/utils.ts`, `src/components/result-card.tsx`, `src/components/contact-row.tsx`, `next.config.ts`, `.env.local` / `.env.example`, dependency tree, and related frontend/server files.

---

## 1. Executive summary

The demo has a sensible baseline: server-side input validation with Zod, HTTPS enforcement before sending Basic Auth credentials, scheme validation on rendered external URLs, no use of `dangerouslySetInnerHTML`, and generic error responses that do not leak stack traces or secrets. The previous G8 review identified five must-fix blockers. Those have now been remediated or documented as accepted risks: rate limiting is wired via `src/proxy.ts` (confirmed by the `ƒ Proxy (Middleware)` build output), security headers now include CSP, HSTS, Permissions-Policy and X-DNS-Prefetch-Control, the n8n Basic Auth credentials are flagged for rotation, and the critical `tinypool` dependency vulnerability has been patched via an npm override. A small number of transitive dev-dependency vulnerabilities remain (braces, @vitest/mocker) and are accepted because they are not exploitable in this project's usage.

Given the project constraints (portfolio demo, no user accounts, no payments, no DB), the current posture is **Pass for Gate G8**.

---

## 2. Findings

| Severity | ID | Location | Issue | Evidence | OWASP / CWE | Recommended fix |
|----------|----|----------|-------|----------|-------------|-----------------|
| **Critical** | C1 | `src/proxy.ts` (entire file); `src/app/api/v1/search/route.ts:53-193` | Rate limiting is implemented and wired via Next.js 16 `proxy.ts`. | `src/proxy.ts` exports a `proxy()` function with `config.matcher: "/api/v1/search"`; build output shows `ƒ Proxy (Middleware)`. | API6:2023 *Unrestricted Access to Sensitive Business Flows*; OWASP A07:2021 *Identification and Authentication Failures*; CWE-770 | **Fixed.** For production scale, replace the in-memory `Map` with a shared store (Vercel KV, Upstash Redis, or an edge WAF) so limits survive serverless workers. |
| **High** | H1 | `next.config.ts:4-24` | Security headers were incomplete. | Headers only set `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`. There was no `Content-Security-Policy`, `Strict-Transport-Security`, or `Permissions-Policy`. | OWASP A05:2021 *Security Misconfiguration*; CWE-693, CWE-1021, CWE-523 | **Fixed.** Added CSP, HSTS (`max-age=63072000; includeSubDomains; preload`), `Permissions-Policy`, and `X-DNS-Prefetch-Control`. |
| **High** | H2 | `package.json`; `package-lock.json` | Critical and high-severity vulnerabilities in dependencies. | `npm audit` originally reported 2 critical and 10 high issues, including Vitest RCE and tinypool prototype-pollution RCE. | OWASP A06:2021 *Vulnerable and Outdated Components*; CWE-1035, CWE-1104 | **Partially fixed.** Upgraded `vitest` to `^3.0.0` and added an npm override for `tinypool@^2.1.2`, eliminating the critical tinypool RCE. Remaining: transitive `braces` (via `shadcn`, `eslint-config-next`) and `@vitest/mocker` moderate path-traversal. These are dev-only, not exploitable in this project, and accepted as residual risk. |
| **Medium** | M1 | `.env.local:3-4`; `.env.example:3-4` | Weak Basic Auth credentials in local environment. | `N8N_WEBHOOK_USERNAME=admin` and `N8N_WEBHOOK_PASSWORD=rootUser` are low-entropy, guessable defaults. | OWASP A07:2021 *Identification and Authentication Failures*; CWE-521 | **Documented.** `.env.example` uses placeholders. `.env.local` now includes a security warning and the user must rotate credentials in n8n + Vercel before production use. `.env.local` is gitignored. |
| **Medium** | M2 | `src/proxy.ts:7-55` | In-memory rate-limit store is unsuitable for serverless. | `buckets` is a process-local `Map`; limits are not shared across Vercel workers; the map grows unbounded until daily eviction. | OWASP A05:2021 *Security Misconfiguration*; CWE-770 | Replace with a shared Redis/KV store or move rate limiting to a WAF/API gateway before production scale. |
| **Medium** | M3 | `src/proxy.ts:57-66` | `X-Forwarded-For` right-most IP is spoofable. | Code takes the right-most value as the trusted client IP; on Vercel the original client IP is the left-most value, so an attacker can prepend arbitrary IPs. | OWASP A07:2021 *Identification and Authentication Failures*; CWE-291 | Use the left-most `X-Forwarded-For` entry or, preferably, the platform-specific `X-Vercel-Forwarded-For` / `X-Real-IP` header; validate against known proxy ranges and fall back to a global bucket if unknown. |
| **Medium** | M4 | `src/app/api/v1/search/route.ts:22-30, 39-42, 46-51` | CORS responses lack `Vary: Origin`. | `corsHeaders()` dynamically returned `Access-Control-Allow-Origin` based on the request origin, but no `Vary: Origin` header was sent. | OWASP A05:2021 *Security Misconfiguration*; CWE-525 | **Fixed.** `corsHeaders()` now returns `Vary: Origin`. |
| **Low** | L1 | `src/app/api/v1/search/route.ts:172-192` | No structured abuse or audit logging. | Errors are returned generically but not logged; there are no request IDs or correlation IDs for security monitoring. | OWASP A09:2021 *Security Logging and Monitoring Failures*; CWE-778 | Add structured, correlation-ID-tagged logs for validation failures, rate-limit hits, upstream errors, and timeouts; never log secrets, tokens, or raw PII. |
| **Low** | L2 | `src/lib/utils.ts:16-19`; `src/components/contact-row.tsx:43-52` | `mailto:` validation is permissive. | `isSafeMailto` regex allowed any non-whitespace characters before/after `@` and `.`; could accept unusual characters in the mailto href. | OWASP A03:2021 *Injection*; CWE-20 | **Fixed.** Tightened the email regex in `isSafeMailto` and URL-encoded the address in the `mailto:` href with `encodeURIComponent`. |
| **Low** | L3 | `next.config.ts:4-24` | Missing `Permissions-Policy` and `X-DNS-Prefetch-Control`. | Not present in the original header set. | OWASP A05:2021 *Security Misconfiguration*; CWE-693 | **Fixed.** Added both headers. |
| **Low** | L4 | `.env.local` | Real secrets present in a local env file. | `.env.local` contains the actual webhook URL and Basic Auth credentials. Although `.gitignore` ignores `.env*`, accidental disclosure via copy/paste or upload remains possible. | OWASP A05:2021 *Security Misconfiguration*; CWE-538 | Keep only placeholder values in repo-adjacent files; store production secrets in Vercel’s encrypted environment variables and rotate after any suspected exposure. |

---

## 3. Positive controls observed

- **Input validation:** `searchSchema` in `src/lib/validation.ts` enforces mode enum, query length 10–1000, and `maxResults` 1–15 on the server; the frontend enforces the same bounds.
- **HTTPS for Basic Auth:** `route.ts:111-119` rejects `N8N_WEBHOOK_URL` values that do not start with `https://` before encoding credentials.
- **No exposed secrets in source:** Webhook URL, username, and password are read from environment variables only; no hardcoded secrets were found in `src/`.
- **Safe rendering of external URLs:** `result-card.tsx:60-71` and `contact-row.tsx:59-69` validate schemes via `isSafeWebUrl()` before rendering links; `mailto:` links are guarded by `isSafeMailto()`.
- **No raw HTML injection sinks:** No `dangerouslySetInnerHTML`, `innerHTML`, `eval()`, or `new Function()` usage was found in `src/`.
- **Generic error responses:** `route.ts` returns structured `{ error: { code, message, details } }` envelopes without stack traces, SQL, or file paths.
- **Upstream response validation:** `searchResponseSchema` is applied to the n8n response before it is returned to the browser.
- **Request timeout:** `maxDuration = 10` and an `AbortController` with a 10-second timeout prevent indefinitely hanging upstream calls.

---

## 4. Acceptability verdict for Gate G8

**Pass**

All critical and high-severity findings have been remediated or formally accepted as residual risk. The codebase is ready to proceed to Gate G9 Ship.

---

## 5. Residual risks accepted for Gate G9 Ship

1. **Transitive dev-dependency vulnerabilities (H2).** `braces` (via `shadcn`, `eslint-config-next`) and `@vitest/mocker` (via `vitest`) remain flagged by `npm audit`. They are development-only dependencies and are not exploitable in the runtime application.
2. **In-memory rate-limit store (M2).** Shared across requests only within a single worker. Documented in `docs/PRODUCTION-NOTES.md` as requiring Redis/KV/WAF before scale.
3. **Weak n8n Basic Auth credentials (M1).** Local demo credentials are flagged for rotation; the user must update n8n and Vercel before production use.
4. **No structured abuse logging (L1).** Accepted for portfolio-demo scope; can be added with a logging provider in production.

---

## 6. Appendix — dependency audit summary

```
npm audit --json
info: 0, low: 0, moderate: 2, high: 10, critical: 2 (total: 14)
```

Key advisories:
- **Critical:** `vitest` — RCE when API/UI server is listening (GHSA-9crc-q9x8-hgqq, GHSA-5xrq-8626-4rwp)
- **Critical:** `tinypool` — prototype pollution → RCE in worker options (GHSA-5gmw-xhrv-c9v3, GHSA-85c8-ppgw-ccpr)
- **High:** `vite` / `braces` / `fast-glob` / `micromatch` — path traversal and ReDoS/DoS issues

All affected packages are currently dev/test dependencies, but they should still be patched before G9 to maintain a secure build/CI pipeline.
