# Project Closeout — Stryde (Jobs & Leads Search Demo)

**Project:** Stryde — Jobs & Sales Leads Search UI + n8n Workflow  
**Location:** `C:\Users\DELL\Documents\project\jobs-leads-search`  
**Status:** Gate G11 Docs / Closeout complete  
**Date:** 2026-10-21  
**Author:** Technical Writer subagent  

---

## 1. Project summary

### 1.1 What was built

Stryde is a lightweight, public-facing web demo that lets a user type a natural-language request and receive curated job postings or sales leads. The frontend is a Next.js 16 / React 19 application hosted on Vercel. It exposes a single API endpoint, `/api/v1/search`, which forwards the request to an existing self-hosted n8n workflow. The n8n workflow orchestrates **Firecrawl** (web search and scrape) and **Hunter** (domain and email verification) and returns a structured result list.

Key features delivered:

- Three search modes: **Jobs**, **Leads**, and **Both** (API enums: `jobs`, `clients`, `both`).
- Natural-language query input (10–1000 characters).
- Up to 15 results per request, with priority and recency sorting.
- Source attribution, external source links, and verified contact display.
- Loading, empty, error, and partial-failure UI states.
- IP-based rate limiting (10 req/min, 50 req/day) via Next.js proxy middleware.
- Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy, etc.).
- Mock-data fallback for offline UI development.
- Unit tests covering validation, sorting, mock data, and URL-safety helpers.

### 1.2 Why it was built

The project is a portfolio demo designed to showcase a complete product-delivery workflow from discovery through deployment. It solves the problem of fragmented job-board and sales-prospecting tools by providing a single, minimal natural-language search layer. It also validates the decision to wrap an existing n8n workflow in a thin, secure Next.js API rather than rebuilding the backend.

### 1.3 Who it is for

- **Primary users:** active job seekers and founders/freelancers doing sales prospecting.
- **Secondary users:** SDRs, growth hires, and career switchers.
- **Stakeholder / owner:** user (DELL), using the project as a skills-demo artifact.

---

## 2. Final tech stack

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| Framework | Next.js (App Router) | 16.4.2 |
| UI library | React | 19.3.0 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui + Base UI | Latest compatible with Next.js 16 |
| Icons | Lucide React | 0.487.0 |
| Validation | Zod | 4.6.7 |
| Testing | Vitest | 3.0.0 |
| Linting | ESLint | 9.x with `eslint-config-next` |
| Hosting | Vercel | Hobby / Pro compatible |
| Backend workflow | Self-hosted n8n | Uses Basic Auth webhook protection |
| Data sources | Firecrawl + Hunter | Public/free tiers only |

---

## 3. Gate completion status (G1–G11)

| Gate | Name | Status | Date | Key artifact |
|------|------|--------|------|--------------|
| G1 | Founder / Discovery | Approved | 2026-10-20 | `docs/PRD.md`, `docs/BRD.md` |
| G2 | Architecture | Approved | 2026-10-20 | `docs/ARCHITECTURE.md`, `docs/API-CONTRACT.md`, `docs/ADRs.md` |
| G3 | Planning | Approved | 2026-10-20 | `docs/WBS.md`, `docs/PROJECT-PLAN.md` |
| G4 | Design | Approved | 2026-10-20 | `docs/DESIGN-SPEC.md` |
| G5 | Build | Approved | 2026-10-20 | Working frontend + backend integration |
| G6 | Code Review | Approved with fixes | 2026-10-21 | `docs/CODE-REVIEW.md` |
| G7 | Debug / QA | Conditional pass | 2026-10-21 | `docs/QA-REPORT.md` |
| G8 | Harden | Pass | 2026-10-21 | `docs/SECURITY-REVIEW.md` |
| G9 | Ship / DevOps | Ready for first Vercel preview | 2026-10-21 | `docs/DEPLOY-RUNBOOK.md` |
| G10 | Polish | Completed | 2026-10-21 | Final UI consistency, mock-data badge, copy refinements |
| G11 | Docs / Closeout | Completed | 2026-10-21 | This document (`docs/CLOSEOUT.md`) and updated `README.md` |

**Note on G9:** No production deploy was performed. The project is ready for a Vercel preview deployment pending explicit stakeholder approval and authenticated `vercel` CLI access.

---

## 4. Key decisions and trade-offs

### 4.1 Sync batch vs. async streaming

- **Decision:** Ship a synchronous batch UX for the MVP.
- **Rationale:** The existing n8n Webhook node is synchronous. Streaming would require a major workflow redesign (WebSocket, SSE, or callback URL) and would not reduce total wait time — only improve perceived speed.
- **Trade-off:** Users wait 5–15 seconds for results. This is mitigated by skeleton cards, a progress indicator, and reassuring status messages.
- **Upgrade path:** Implement SSE or webhook-callback if user feedback shows the wait hurts activation.

### 4.2 10-second serverless timeout

- **Decision:** Set `maxDuration = 10` and a 10-second upstream `AbortController` timeout in `src/app/api/v1/search/route.ts`.
- **Rationale:** Vercel Hobby serverless functions hard-limit execution to 10 seconds. Aligning the timeout with the platform prevents `FUNCTION_TIMEOUT` errors and wasted compute.
- **Trade-off:** Slow n8n workflows return a `TIMEOUT_ERROR` to the user. The n8n workflow must be optimized to respond within this window.
- **Upgrade path:** Move to Vercel Pro (60 s on select plans) or make n8n asynchronous with a callback/polling mechanism.

### 4.3 In-memory rate limiting

- **Decision:** Implement per-IP rate limits (`10 req/min`, `50 req/day`) in `src/proxy.ts` using a module-level `Map`.
- **Rationale:** Fastest path to basic abuse protection for a demo with no user accounts.
- **Trade-off:** Limits are not shared across Vercel workers, buckets grow until eviction, and `X-Forwarded-For` IPs can be spoofed. This is acceptable for a portfolio demo but not for production scale.
- **Upgrade path:** Replace with Vercel KV, Upstash Redis, or an edge WAF/API gateway.

### 4.4 Thin Next.js API proxy

- **Decision:** The browser calls only `/api/v1/search` on Vercel; the Route Handler forwards to n8n over HTTPS with Basic Auth.
- **Rationale:** Hides the n8n webhook URL and credentials from the browser, centralizes validation and rate limiting, and keeps the backend change-free.
- **Trade-off:** Adds a small latency hop and a serverless timeout boundary.

### 4.5 No authentication / no accounts

- **Decision:** The MVP remains auth-free and unmonetised.
- **Rationale:** The project is a demo; adding auth would delay validation.
- **Trade-off:** Abuse protection relies solely on IP rate limiting. A public launch would require stronger protection.

### 4.6 Mock-data fallback

- **Decision:** In development (`NODE_ENV === "development"`) or when `USE_MOCK_DATA=true`, the Route Handler returns mock fixtures instead of calling n8n.
- **Rationale:** Allows UI development and testing when n8n is offline.
- **Trade-off:** Mock data is not representative of real Firecrawl/Hunter output shape variance. Production should run with `USE_MOCK_DATA=false`.

---

## 5. Known limitations and production upgrade path

| Limitation | Impact | Production upgrade |
|------------|--------|--------------------|
| **10 s Vercel serverless timeout** | Slow n8n queries surface `TIMEOUT_ERROR`. | Optimize n8n (see `docs/N8N-OPTIMIZATION.md`) or upgrade Vercel plan / switch to async callback. |
| **In-memory rate-limit store** | Limits not shared across workers; best-effort abuse protection. | Migrate to Vercel KV, Upstash Redis, or an edge WAF. Documented in `docs/PRODUCTION-NOTES.md`. |
| **Weak demo Basic Auth credentials** | `admin` / `rootUser` are not safe for public use. | Rotate credentials in n8n and Vercel before public launch. |
| **ngrok free-tier tunnel** | Webhook URL changes when the tunnel restarts. | Use a paid ngrok reserved domain or host n8n on a stable domain. |
| **No health-check endpoint** | Liveness checks rely on homepage or search endpoint. | Add a lightweight `/health` route if production monitoring is required. |
| **CSP allows `'unsafe-inline'`** | Required for Next.js/Tailwind v4 setup; slightly weaker CSP. | Consider a nonce-based CSP in a hardening pass. |
| **No structured audit logging** | Security events are not centrally logged. | Add a logging provider and log validation failures, rate-limit hits, and upstream errors (without secrets or PII). |
| **No end-to-end browser automation tests** | Visual/regression testing is manual. | Add Playwright or Cypress if the project evolves beyond a demo. |

---

## 6. How to run locally

### 6.1 Prerequisites

- Node.js (LTS recommended; project uses npm).
- The `vercel` CLI is optional for deployment but not required for local dev.
- An active n8n webhook is optional if you use mock data.

### 6.2 Install dependencies

```bash
cd C:\Users\DELL\Documents\project\jobs-leads-search
npm install
```

### 6.3 Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required only if calling a real n8n webhook
N8N_WEBHOOK_URL=https://your-ngrok-url.ngrok-free.dev/webhook/stryde
N8N_WEBHOOK_USERNAME=your_n8n_username
N8N_WEBHOOK_PASSWORD=your_n8n_password

# Required for CORS and metadata
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: return mock data instead of calling n8n
USE_MOCK_DATA=false
```

For pure UI development without n8n, set `USE_MOCK_DATA=true`.

### 6.4 Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6.5 Run quality checks

```bash
# Unit tests
npm test

# Production build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

Expected baselines:

- Tests: 26/26 pass.
- Build: succeeds with no TypeScript errors.
- Lint: exits cleanly.

### 6.6 Test the API endpoint locally

With mock data (`USE_MOCK_DATA=true` or in dev mode):

```bash
curl -X POST http://localhost:3000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"mode":"jobs","query":"Senior React engineer roles in Berlin","maxResults":5}'
```

With a live n8n webhook, set the real credentials in `.env.local` first.

---

## 7. How to deploy

Deployment is covered in detail in **`docs/DEPLOY-RUNBOOK.md`**. The high-level steps are:

1. Complete prerequisites (Vercel account, authenticated `vercel` CLI, active n8n webhook, Basic Auth credentials).
2. Set Vercel environment variables:
   - `N8N_WEBHOOK_URL`
   - `N8N_WEBHOOK_USERNAME`
   - `N8N_WEBHOOK_PASSWORD`
   - `NEXT_PUBLIC_APP_URL`
   - `USE_MOCK_DATA=false`
3. Run local quality gates: `npm run build`, `npm test`, `npm run lint`.
4. Deploy a preview:
   ```bash
   vercel --yes
   ```
5. Run post-deploy smoke tests (homepage, search endpoint, validation, rate limiting, browser check).
6. Promote to production only with explicit approval:
   ```bash
   vercel --prod
   ```

**Important reminders from the runbook:**

- Rotate the n8n Basic Auth password before any public production use.
- Do not commit secrets to Git; `.env*` is already gitignored.
- Optimize the n8n workflow to respond within the 10-second Vercel Hobby timeout.

---

## 8. Link to all major docs

| Document | Purpose |
|----------|---------|
| `docs/PROJECT-CONTEXT.md` | Living project overview, gate status, stakeholder answers, and n8n integration details. |
| `docs/PRD.md` | Product Requirements Document (Gate G1). |
| `docs/BRD.md` | Business Requirements Document (Gate G1). |
| `docs/ARCHITECTURE.md` | System architecture, data flow, deployment topology, security posture (Gate G2). |
| `docs/API-CONTRACT.md` | Locked API contract between Next.js frontend and n8n backend (Gate G2). |
| `docs/ADRs.md` | Architecture Decision Records (Gate G2). |
| `docs/WBS.md` | Work Breakdown Structure and sprint plan (Gate G3). |
| `docs/PROJECT-PLAN.md` | Lean project plan, risk register, and go/no-go criteria (Gate G3). |
| `docs/DESIGN-SPEC.md` | UI/UX design specification, color palette, component specs, screen map (Gate G4). |
| `docs/CODE-REVIEW.md` | Gate G6 code review findings, resolutions, and sign-off. |
| `docs/QA-REPORT.md` | Gate G7 debug/QA findings, test results, and defects. |
| `docs/SECURITY-REVIEW.md` | Gate G8 security review findings, remediations, and residual risks. |
| `docs/DEPLOY-RUNBOOK.md` | Vercel deployment, smoke-test, and rollback procedure (Gate G9). |
| `docs/N8N-OPTIMIZATION.md` | Guide for reducing n8n workflow latency. |
| `docs/PRODUCTION-NOTES.md` | Production upgrade notes, especially rate-limit store migration. |
| `docs/CLOSEOUT.md` | This document — final closeout summary and handoff. |

---

## 9. Final sign-off

| Gate | Verdict |
|------|---------|
| G11 Docs / Closeout | **Complete** |

### What was delivered in G11

- Created `docs/CLOSEOUT.md` with project summary, final stack, gate status, decisions, limitations, local setup, deploy overview, and doc index.
- Updated `README.md` with concise intro, setup, quality commands, and links.
- Updated `docs/PROJECT-CONTEXT.md` to reflect G10 and G11 completion.
- No source code changes.

### Recommended next steps for the stakeholder

1. Review `docs/CLOSEOUT.md` and updated `README.md`.
2. Decide whether to proceed with the first Vercel preview deployment (see `docs/DEPLOY-RUNBOOK.md`).
3. Before any public launch, rotate n8n Basic Auth credentials and migrate rate limiting to a shared store.
4. Optimize the n8n workflow for sub-10-second responses using `docs/N8N-OPTIMIZATION.md`.

---

## 10. Change log

| Date | Change |
|------|--------|
| 2026-10-21 | Created `docs/CLOSEOUT.md` for Gate G11 closeout. |
| 2026-10-21 | Updated `README.md` and `docs/PROJECT-CONTEXT.md` gate status. |
