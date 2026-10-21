# QA Test Report — Jobs & Sales Leads Search UI

**Gate:** G7 Debug / QA  
**Project:** Jobs & Sales Leads Search UI (Stryde demo)  
**Location:** `C:\Users\DELL\Documents\project\jobs-leads-search`  
**Date:** 2026-10-21  
**Tester:** QA subagent  
**Scope:** Functional, API contract, responsive/layout, accessibility, and performance smoke tests for the portfolio demo. Focus on high-impact, demo-critical paths.

---

## 1. Executive Summary

The demo frontend **builds, lints, type-checks, and passes all automated unit tests**. End-to-end search against the live n8n webhook succeeds for all three modes (`jobs`, `clients`, `both`) and returns correctly shaped results. Core validation, CORS, and error-state code paths are functional.

However, **two G6 blockers remain unaddressed** in the code and should be fixed before shipping:

1. The `/api/v1/search` route uses a 120-second upstream timeout / `maxDuration`, which exceeds Vercel serverless limits.
2. In-memory IP rate limiting is unreliable in a production `next start` / serverless deployment.

A deprecation warning for the `middleware` file convention is also emitted on every build/dev start.

**Sign-off recommendation:** *Conditional Pass* — demo is presentable, but fix D1 (timeout) and address D2/D3 before production deployment.

---

## 2. Test Strategy and Scope

### 2.1 Strategy

- **Automated:** run existing Vitest suite and add unit tests for URL-safety helpers.
- **Build / lint / type:** verify production build, ESLint, and `tsc --noEmit`.
- **API contract:** exercise `POST /api/v1/search` and `OPTIONS /api/v1/search` with valid/invalid payloads against both the dev server (mock data) and a production build (live n8n webhook).
- **End-to-end functional:** verify mode selection, query validation, search submission, results display, sorting, loading/error/empty states, and about-page navigation by inspecting responses and code paths.
- **Responsive / layout:** review Tailwind breakpoints and component structure; no runtime browser automation available in this environment.
- **Accessibility:** audit markup for ARIA attributes, landmarks, labels, focus rings, and color-contrast classes.
- **Performance:** measure cold-start build time, document timeout values, and observe loading-state thresholds.

### 2.2 In Scope

- `src/app/page.tsx` (search flow)
- `src/app/about/page.tsx`
- `src/app/api/v1/search/route.ts`
- `src/middleware.ts`
- `src/components/*`
- `src/lib/*` helpers, validation, sorting, mock data

### 2.3 Out of Scope

- Cross-browser visual regression (no browser automation in this environment).
- Load / concurrency testing beyond rapid sequential requests.
- Security penetration testing (limited to CORS / URL-scheme sanity checks).

---

## 3. Environment

| Item | Value |
|------|-------|
| OS | Windows (win32) |
| Node / package manager | npm (package-lock.json present) |
| Next.js | 16.4.2 (Turbopack) |
| React | 19.3.0 |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| Test runner | Vitest 1.6.0 |
| Dev server | `http://127.0.0.1:3000` (pre-existing) |
| Production test server | `http://127.0.0.1:3003` (`next build` + `next start`) |
| n8n webhook | `https://deskbound-octopus-modulator.ngrok-free.dev/webhook/stryde` |
| Env vars | `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_USERNAME`, `N8N_WEBHOOK_PASSWORD` from `.env.local`; `USE_MOCK_DATA=false` |

---

## 4. Test Execution Results

### 4.1 Automated Unit Tests

**Command:** `npm test`

```text
Test Files  4 passed (4)
     Tests  26 passed (26)
  Duration  5.47s
```

| File | Tests | Status |
|------|-------|--------|
| `src/lib/validation.test.ts` | 5 | Pass |
| `src/lib/sort.test.ts` | 3 | Pass |
| `src/lib/mock-data.test.ts` | 5 | Pass |
| `src/lib/utils.test.ts` (new) | 13 | Pass |

**Notes:**
- Added `src/lib/utils.test.ts` covering `isSafeUrl`, `isSafeWebUrl`, and `isSafeMailto` (valid/invalid schemes, malformed URLs, JS injection URIs, email format edge cases).
- Existing tests validate schema defaults, query length, `maxResults` bounds, unsupported modes, sort order, and mock-data fixtures.

### 4.2 Build, Lint, and Type Checks

| Check | Command | Result |
|-------|---------|--------|
| Production build | `npm run build` | Pass (with deprecation warning, see D2) |
| ESLint | `npm run lint` | Pass |
| TypeScript | `npx tsc --noEmit` | Pass |

Build output:

```text
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
└ ƒ /api/v1/search

ƒ Proxy (Middleware)
```

### 4.3 API Contract Tests

All requests used `Content-Type: application/json`.

#### Dev server (mock data, `USE_MOCK_DATA` not required in dev)

| # | Scenario | Request | Expected | Actual | Status |
|---|----------|---------|----------|--------|--------|
| A1 | Valid jobs search | `POST /api/v1/search` `{mode:"jobs", query:"Senior React...", maxResults:5}` | HTTP 200, `mode: "jobs"`, `X-Mock-Data: true` | HTTP 200, mock job payload, `X-Mock-Data: true` | Pass |
| A2 | Valid clients search | `mode:"clients"` | HTTP 200, client payload | HTTP 200, client payload | Pass |
| A3 | Valid both search | `mode:"both"` | HTTP 200, mixed payload | HTTP 200, mixed payload | Pass |
| A4 | Invalid mode | `mode:"invalid"` | HTTP 400 `VALIDATION_ERROR` | HTTP 400 `VALIDATION_ERROR` | Pass |
| A5 | Query too short | `query:"short"` | HTTP 400 `VALIDATION_ERROR` | HTTP 400 `VALIDATION_ERROR` | Pass |
| A6 | maxResults too high | `maxResults:50` | HTTP 400 `VALIDATION_ERROR` | HTTP 400 `VALIDATION_ERROR` | Pass |
| A7 | Invalid JSON body | `not json` | HTTP 400 `VALIDATION_ERROR` | HTTP 400 `VALIDATION_ERROR` | Pass |
| A8 | OPTIONS preflight | `OPTIONS` with `Origin: http://localhost:3000` | HTTP 204 + CORS headers | HTTP 204 + CORS headers | Pass |
| A9 | Method not allowed | `GET /api/v1/search` | HTTP 405 | HTTP 405 | Pass |
| A10 | Rate limiting | 11 rapid POSTs | First 10 × 200, then 429 | First 3 × 200 (prior state), then 429 from request 4 | Pass* |

\* Rate-limit bucket had state from earlier requests; behavior is consistent with a 10 req/min limit.

#### Production server (live n8n webhook)

| # | Scenario | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| B1 | Jobs search against real n8n | HTTP 200, real leads | HTTP 200, 6 real job leads with assumptions, source URLs, priority | Pass |
| B2 | Clients search against real n8n | HTTP 200, real leads | HTTP 200, real client leads | Pass |
| B3 | Both search against real n8n | HTTP 200, mixed real leads | HTTP 200, mixed real leads | Pass |
| B4 | Invalid query length | HTTP 400 | HTTP 400 `VALIDATION_ERROR` | Pass |
| B5 | Invalid maxResults | HTTP 400 | HTTP 400 `VALIDATION_ERROR` | Pass |
| B6 | OPTIONS arbitrary origin | No `Access-Control-Allow-Origin` | CORS headers present except origin | Pass |
| B7 | OPTIONS allowed origin | `Access-Control-Allow-Origin: http://localhost:3000` | As expected | Pass |
| B8 | Rate limiting (rapid same IP) | First 10 × 200, then 429 | Intermittent 000 under rapid load; eventual 429s observed with `USE_MOCK_DATA=true` | Conditional (see D3) |

**API contract observation:** The live n8n response omits the optional `intent_summary` field and uses `remote` instead of `remote_status` in some leads. The `searchResponseSchema` correctly treats both as optional, so responses validate without errors.

### 4.4 Functional UI Tests

| # | Requirement | Verification | Status |
|---|-------------|--------------|--------|
| F1 | Mode selection (Jobs / Leads / Both) | `ModeSelector` renders segmented control; `aria-pressed` reflects selection; form sends correct `mode` enum | Pass |
| F2 | Query validation (10–1000 chars) | `search-form.tsx` disables submit, shows counter, sets `aria-invalid`, displays length error | Pass |
| F3 | Max results selector (1–15) | Native `<select>` with 15 options; schema rejects >15 | Pass |
| F4 | Submit search | `handleSearch` POSTs to `/api/v1/search`, sets loading, resets error/response | Pass |
| F5 | Loading state | Skeleton cards, progress bar, messages at 0s/5s/10s thresholds, `aria-busy="true"` | Pass |
| F6 | Results display | `ResultCard` shows type badge, priority badge, opportunity, company/domain, location/remote/date, why-it-fits, contacts; source link gated by `isSafeWebUrl` | Pass |
| F7 | Empty state | `EmptyState` renders tips and suggestion chips when `leads.length === 0` | Pass* |
| F8 | Error state | `ErrorState` maps codes to copy, shows retry button / countdown for rate limit, focuses input for validation | Pass* |
| F9 | Sort controls | Priority (High→Low) and recency (newest first) via `sortLeads`; unit tests pass | Pass |
| F10 | About page navigation | `/about` reachable, title correct, back link present, footer on every page | Pass |
| F11 | Mock-data badge | `X-Mock-Data: true` triggers `MockBadge` in dev | Pass |

\* Triggered by code inspection; no runtime browser automation available to click UI states.

### 4.5 Responsive / Layout Checks

| # | Check | Finding | Status |
|---|-------|---------|--------|
| R1 | Mobile breakpoint (320px+) | Components use `sm:`, `lg:` breakpoints; mode selector wraps; form stacks vertically | Pass (static review) |
| R2 | No horizontal scroll | Max-width containers (`max-w-3xl`, `max-w-4xl`, `max-w-5xl`) with `mx-auto` and `px-4` padding | Pass (static review) |
| R3 | Source link mobile label | Hides text label on small screens (`hidden sm:inline`) to save space | Pass |
| R4 | Touch targets | Buttons and selects are `h-11`/`h-12`; mode buttons `h-11 px-5` | Pass |

### 4.6 Accessibility Checks

| # | Check | Finding | Status |
|---|-------|---------|--------|
| A11y-1 | Page language | `<html lang="en">` | Pass |
| A11y-2 | Landmarks | `<header>`, `<main>`, `<footer>` present; search results section has `aria-label="Search results"` | Pass |
| A11y-3 | Mode selector | `<fieldset>` + `<legend class="sr-only">`; `aria-pressed` on buttons | Pass |
| A11y-4 | Query textarea | `<Label htmlFor="query">`; `aria-invalid`, `aria-describedby` pointing to counter and error | Pass |
| A11y-5 | Error / status regions | Error state `role="alert" aria-live="assertive"`; loading state `role="status" aria-live="polite"`; results `aria-live="polite"` | Pass |
| A11y-6 | Focus indicators | `focus-visible:ring-2 focus-visible:ring-indigo-500` used consistently | Pass |
| A11y-7 | Reduced motion | `motion-reduce:animate-none` on skeleton and shimmer | Pass |
| A11y-8 | Decorative icons | `aria-hidden="true"` on Lucide icons inside buttons/links | Pass |
| A11y-9 | Color contrast | Tailwind slate/indigo palette with `text-slate-900` on light backgrounds; no dark-mode inversion tested | Pass (static review) |

### 4.7 Performance Notes

| # | Item | Value / Observation |
|---|------|---------------------|
| P1 | Production cold build | ~4.0s compile + 11.1s TypeScript + 2.5s static generation |
| P2 | Initial page load | Static pages prerendered; no SSR blocking on `/` or `/about` |
| P3 | API upstream timeout | 120 seconds (see D1) |
| P4 | Client retry logic | One automatic retry with 500ms backoff for 5xx/0/TIMEOUT errors |
| P5 | Loading state thresholds | 0s/5s/10s messages; skeletons render immediately |
| P6 | Live n8n response time | Real job search returned in ~10–15s in local tests; within BRD 15s target for small batches |

---

## 5. Defects Found

| ID | Severity | Title | Description | Repro Steps | Expected | Actual | Recommendation |
|----|----------|-------|-------------|-------------|----------|--------|----------------|
| D1 | **High** | API route timeout exceeds Vercel limits | `src/app/api/v1/search/route.ts` sets `maxDuration = 120` and `AbortController` timeout of 120s. Vercel Hobby functions timeout at 10s; Pro functions at 60s (60s only on select plans). | 1. Open `src/app/api/v1/search/route.ts`.<br>2. Observe `export const maxDuration = 120;` and `setTimeout(() => controller.abort(), 120_000);`. | Timeout aligned with platform limits and BRD 15s target. | 120s configured, risking `FUNCTION_TIMEOUT` or unnecessary user wait. | Reduce `maxDuration` and fetch timeout to ≤20s (or ≤60s on Pro). Update BRD performance targets if needed. |
| D2 | Medium | `middleware` file convention deprecated | `next dev` / `next build` emits: "The 'middleware' file convention is deprecated. Please use 'proxy' instead." | 1. Run `npm run build` or `npm run dev`.<br>2. Read warnings. | Clean build with no deprecation warnings. | Deprecation warning printed. | Run `npx @next/codemod@canary middleware-to-proxy .` and verify route matching. |
| D3 | Medium | In-memory rate limiting unreliable in production | Middleware stores buckets in a module-level `Map`. Under rapid sequential requests in `next start`, behavior was inconsistent (intermittent 000s, eventual 429s with mock data). State is not shared across serverless instances or worker processes. | 1. `npm run build && npm start`.<br>2. Fire >10 rapid POSTs from the same IP. | Consistent 429 after 10 requests. | Some requests time out or slip through; state not portable. | Replace with Redis / Vercel KV or at minimum document that rate limiting is best-effort for the demo. |
| D4 | Low | React list keys use array indices | `context-card.tsx` assumptions and `result-card.tsx` contacts use `key={i}`. | 1. Open both files.<br>2. Search for `key={i}`. | Stable, deterministic keys. | Index keys used for dynamic lists. | Use content-derived keys (e.g., `assumption-${i}` is still weak; prefer slug/ID if available). |
| D5 | Low | Rate-limit retry countdown ignores `retryAfter` | `ErrorState` hardcodes a 60s countdown regardless of the `retryAfter` value returned by middleware. | 1. Trigger 429.<br>2. Inspect `ErrorState` source. | Countdown matches server's `retryAfter` (default 60s). | Always 60s. | Read `error.details?.retryAfter` and initialize countdown from it. |

### 5.1 G6 Blocker Status

| G6 Item | Status in G7 | Notes |
|---------|--------------|-------|
| C1 — 120s upstream timeout | **Still open** → D1 | Not fixed. |
| C2 — Missing n8n env vars | Mitigated | Route returns `CONFIGURATION_ERROR` when vars missing; no crash. |
| H1 — CORS reflects arbitrary origin | Fixed | Arbitrary origins receive no `Access-Control-Allow-Origin`. |
| H2 — Spoofable `X-Forwarded-For` + unbounded Map | Partially mitigated | Right-most IP used, eviction added, but production reliability remains weak → D3. |
| H3 — External URL scheme validation | Fixed | `isSafeWebUrl` / `isSafeMailto` used for source, LinkedIn, and email links. |

---

## 6. Sign-Off Recommendation

### 6.1 Overall Assessment

The application meets the **demo acceptance criteria** defined in the WBS and BRD for Gate G7:

- All three search modes work against the live n8n webhook.
- Validation, loading, error, empty, and sort states are implemented.
- The build is green and all unit tests pass.
- Basic accessibility and responsive structure are in place.

However, **D1 (timeout) is a shipping risk** on Vercel and should be resolved before production deployment. D2 and D3 are also recommended fixes for a public demo.

### 6.2 Recommendation

**Conditional Pass for Gate G7.**

- ✅ Approve progression to Gate G8 (Harden) with the expectation that D1 is fixed first.
- 🔧 Fix D1 before any production deployment.
- 🔧 Address D2 and D3 during Gate G8 if schedule allows.
- 🔧 Fix D4/D5 as low-priority polish in Gate G8.

### 6.3 Test Evidence Summary

| Evidence | Result |
|----------|--------|
| `npm test` | 26/26 pass |
| `npm run build` | Pass (with middleware deprecation warning) |
| `npm run lint` | Pass |
| `npx tsc --noEmit` | Pass |
| Live n8n jobs search | HTTP 200, 6 leads |
| Live n8n clients search | HTTP 200 |
| Live n8n both search | HTTP 200 |
| Validation errors | HTTP 400 for invalid mode, short query, high maxResults, invalid JSON |
| CORS preflight | HTTP 204, origin reflected only for allow-listed origins |
| Rate limiting (dev) | 429 returned after limit exceeded |

---

## 7. Appendix — Commands Run

```bash
# Unit tests
npm test

# Build & quality gates
npm run build
npm run lint
npx tsc --noEmit

# Dev server API smoke tests
curl -X POST http://127.0.0.1:3000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"mode":"jobs","query":"Senior React engineer roles in Berlin","maxResults":5}'

# Production server start
npm run build
npm start -- --port 3003

# Production live-webhook test
curl -X POST http://127.0.0.1:3003/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"mode":"jobs","query":"Senior React engineer roles in Berlin","maxResults":5}'
```

---

**End of report.**
