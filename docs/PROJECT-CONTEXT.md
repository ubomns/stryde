# PROJECT-CONTEXT.md

## Project
**Name:** Jobs & Sales Leads Search UI + n8n Workflow
**Vision:** A simple, user-friendly, aesthetically pleasing web UI that lets a user type what they want (e.g., job search, sales leads) and have an n8n backend call the required tools and return results.

## Gate status
- **G1 Founder / Discovery:** Approved on 2026-10-20
- **G2 Architecture:** Approved on 2026-10-20
- **G3 Planning:** Approved on 2026-10-20
- **G4 Design:** Approved on 2026-10-20
- **G5 Build:** Approved on 2026-10-20
- **G6 Code Review:** Approved on 2026-10-21
- **G7 Debug / QA:** Approved on 2026-10-21
- **G8 Harden:** Approved on 2026-10-21
- **G9 Ship / DevOps:** Ready for first Vercel preview deployment
- **G10 Polish:** Completed on 2026-10-21
- **G11 Docs / Closeout:** Completed on 2026-10-21
- **Current gate:** G11 Docs / Closeout
- **Portfolio-demo note:** This is a skills-demo project; non-critical constraints (e.g., advanced analytics, extensive error-state polish, full test coverage) can be pragmatically deferred, but the API contract must still be locked before parallel build.

## Gate G6 Code Review
- **Status:** Completed 2026-10-21 — Approved with fixes
- **Outcome:** Full code review report saved to `docs/CODE-REVIEW.md`
- **Issue counts:** Critical 2, High 3, Medium 7, Low 9
- **Blockers before G7:**
   - C1 — `route.ts` 120 s upstream timeout exceeds Vercel serverless limits.
   - C2 — Missing n8n env vars can cause a production crash / credential leak.
   - H1 — CORS reflects arbitrary `Origin`, allowing third-party abuse.
   - H2 — IP rate limiting uses spoofable `X-Forwarded-For` and an unbounded in-memory `Map`.
   - H3 — External URLs (`source_url`, `linkedin_url`, `mailto:`) are not scheme-validated.
- **Strongly recommended before QA:** M1-M7 (upstream response validation, stable React keys, textarea placeholder accessibility, safe date sorting, bucket eviction, retry backoff, HTTPS enforcement for Basic Auth).
- **Demo debt (time-boxed):** L1-L10.

## Gate G7 Debug / QA
- **Status:** Approved on 2026-10-21
- **Outcome:** QA test report saved to `docs/QA-REPORT.md`; new unit tests added for `src/lib/utils.ts`
- **Test results:** 26/26 Vitest tests pass; `npm run build`, `npm run lint`, and `npx tsc --noEmit` all pass
- **End-to-end verification:** Live n8n searches succeed for `jobs`, `clients`, and `both` modes via production build
- **Defects remediated:**
   - D1 — Reduced timeout / `maxDuration` to 10 s.
   - D2 — Migrated `src/middleware.ts` → `src/proxy.ts`.
   - D3 — Documented production rate-limit store migration in `docs/PRODUCTION-NOTES.md`.
   - D4 — Replaced index keys with stable composite keys.
   - D5 — `ErrorState` now reads `retryAfter` from error details.

## Gate G8 Harden
- **Status:** Approved on 2026-10-21
- **Outcome:** Security review report saved to `docs/SECURITY-REVIEW.md`
- **Issue counts:** Critical 0, High 0, Medium 2, Low 3 (residual/accepted)
- **Blockers before G9:** None
- **Resolved:**
   - C1 — Confirmed `src/proxy.ts` is wired (build output `ƒ Proxy (Middleware)`).
   - H1 — Added CSP, HSTS, Permissions-Policy, X-DNS-Prefetch-Control.
   - H2 — Patched critical `tinypool` RCE via override; upgraded `vitest` to v3.
   - M1 — Added security warning in `.env.local`; `.env.example` uses placeholders.
   - M3 — Switched to left-most `X-Forwarded-For` and prefer `X-Vercel-Forwarded-For`.
   - M4 — Added `Vary: Origin` to CORS responses.
   - L2 — Tightened `isSafeMailto` regex and URL-encoded mailto href.
   - L3 — Added Permissions-Policy and X-DNS-Prefetch-Control.
- **Accepted residual risks:** Transitive dev-dependency `braces`/`@vitest/mocker` audit warnings; in-memory rate-limit store (documented in `docs/PRODUCTION-NOTES.md`).

## Gate G9 Ship / DevOps
- **Status:** Ready for first Vercel preview deployment on 2026-10-21
- **Outcome:** Deployment runbook created at `docs/DEPLOY-RUNBOOK.md`; build/test/lint pass.
- **Verifications completed:**
   - `package.json` scripts and dependencies are deployment-ready.
   - `.env.example` matches all runtime environment variables used by `src/app/api/v1/search/route.ts` and `src/proxy.ts`.
   - `next.config.ts` contains production-safe security headers and no dev-only settings.
   - `.gitignore` excludes `.env*`, `.vercel`, and other secrets.
   - `vercel` CLI is installed (v54.17.3) but **not authenticated**.
   - Final local gates pass: `npm run build`, `npm test`, `npm run lint`.
- **Blockers before production deploy:**
   - Vercel CLI must be authenticated (`vercel login`) or the project must be imported via Git integration.
   - n8n Basic Auth credentials should be rotated before public production use (currently weak demo credentials).
   - n8n workflow should be optimized to respond within the 10 s Vercel Hobby timeout.
- **No production deploy was performed.** Awaits explicit user approval.

## Gate G10 Polish
- **Status:** Completed on 2026-10-21
- **Outcome:** Final UI consistency pass, copy refinements, mock-data badge behavior verified, and demo-presentation readiness confirmed.
- **Verifications completed:**
   - All loading, error, empty, and results states render consistently with `docs/DESIGN-SPEC.md`.
   - Mock-data indicator (`X-Mock-Data: true`) triggers the demo badge in development.
   - Sort controls and result card hover states match the design spec.
- **No production deploy was performed.**

## Gate G11 Docs / Closeout
- **Status:** Completed on 2026-10-21
- **Outcome:** Final project documentation created and `README.md` updated for handoff or showcase.
- **Artifacts created/updated:**
   - `docs/CLOSEOUT.md` — project summary, final tech stack, gate completion status, key decisions and trade-offs, known limitations, local setup, deploy overview, and doc index.
   - `README.md` — concise project intro, quick start, quality commands, key constraints, and links to docs.
   - `docs/PROJECT-CONTEXT.md` — gate status updated to reflect G10 and G11 completion.
- **No source code changes.**

## Known requirements
- User types a natural-language request (e.g., "Find me senior React jobs in Berlin", "Find sales leads for SaaS startups in fintech").
- n8n backend interprets the request, calls the required tools/data sources, and returns results.
- Frontend displays results in a clean, intuitive way.
- Two primary modes: job search and sales lead search.
- Simple and aesthetically pleasing UI.

## Stakeholder answers to G1 open questions
1. **Target users:** Confirmed — active job seekers + founders/freelancers doing sales prospecting.
2. **Auth / monetisation:** Confirmed none in MVP. This is a demo to showcase skills.
3. **Data sources / budget:** Public/free only.
4. **n8n hosting:** Self-hosted n8n instance.
5. **Results model:** Batch/async acceptable, but real-time/streaming is preferable if feasible.
6. **Success metrics:** No concerns.
7. **Brand guidelines:** None.
8. **n8n backend / tools:** Already built. Uses **Firecrawl** (web search & scrape) and **Hunter** (domain & email verification).
9. **Frontend stack / hosting:** Next.js / React, hosted on Vercel.
10. **Legal/compliance:** None.

## Stakeholder answers to G2 open questions
1. **Modes:** n8n workflow has **three modes**: `jobs`, `clients`, and `both`.
2. **Query length:** Up to **1000 characters**.
3. **Max results:** **15** maximum, enforced on both frontend and n8n.
4. **Rate limits:** Confirmed OK with `10 req/min` and `50 req/day` per IP.
5. **Webhook secret:** Stakeholder uses **basic auth** in n8n for webhook protection.

## n8n integration details
- **Webhook URL:** `https://deskbound-octopus-modulator.ngrok-free.dev/webhook/stryde`
- **Webhook authentication:** Basic auth (username/password configured in n8n Webhook node).
- **Vercel env vars needed:** `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_USERNAME`, `N8N_WEBHOOK_PASSWORD`.

## n8n output schema
```json
{
  "mode": "jobs",
  "intent_summary": "Remote AI automation roles at US companies",
  "assumptions": ["No industry specified, searched broadly"],
  "leads": [
    {
      "type": "job",
      "company": "Example Co",
      "domain": "example.com",
      "location": "United States",
      "remote_status": "Remote",
      "opportunity": "AI Automation Engineer",
      "source_url": "https://example.com/jobs/123",
      "why_it_fits": "Hiring for n8n and workflow automation skills",
      "priority": "High",
      "posted_date": "2026-10-18",
      "days_old": 2,
      "contacts": [
        {
          "name": "Jane Doe",
          "title": "Head of Operations",
          "email": "jane@example.com",
          "email_status": "valid",
          "linkedin_url": ""
        }
      ]
    }
  ],
  "notes": ""
}
```

## Key decisions (from G1 + stakeholder input)
1. **MVP remains auth-free and unmonetised.**
2. **Batch/async results** for the MVP; real-time/streaming is preferable if feasible.
3. **n8n workflow already exists** and uses Firecrawl + Hunter.
4. **Primary target users:** active job seekers and founders/freelancers doing sales prospecting.
5. **Data sources:** Firecrawl (web search & scrape) and Hunter (domain & email verification), public/free only.
6. **No native apps, no CRM integration, no payments** in MVP.
7. **Frontend stack:** Next.js / React, hosted on Vercel.
8. **n8n hosting:** Self-hosted.
9. **Default/max result set:** 20/50 unless decided otherwise.
10. **No legal/compliance constraints** identified.

## Key decisions (from Gate G2 architecture + stakeholder clarifications)
11. **Frontend calls n8n through a thin Next.js Route Handler (`/api/v1/search`)** rather than directly from the browser, to hide the n8n webhook URL and enforce server-side rate limiting.
12. **API contract locked:** `POST /api/v1/search` accepts `{ mode, query, maxResults }` and returns the locked n8n output schema unchanged.
13. **Mode enum values:** `jobs` / `clients` / `both`; result `type` values: `job` / `client` / `both` depending on what the existing n8n workflow returns.
14. **Query length:** minimum 10 characters, maximum **1000 characters**; `maxResults`: 1–**15**, default 15.
15. **Batch UX approved for MVP; streaming deferred** to a post-MVP experiment.
16. **Rate limiting:** IP-based limits in Vercel Edge Middleware (10 req/min, 50 req/day) confirmed.
17. **No end-user authentication for MVP;** abuse protection via IP rate limiting. The n8n webhook is protected by **HTTP Basic Authentication** using `N8N_WEBHOOK_USERNAME` and `N8N_WEBHOOK_PASSWORD` stored in Vercel environment variables.
18. **Result limit enforcement:** 15-result maximum enforced on both frontend and n8n.

## Design decisions (from Gate G4 approval)
19. **User-facing mode labels:** Jobs / **Leads** / Both. The API enum remains `jobs` / `clients` / `both`.
20. **Result `type` strings:** Assumed `job` / `client` / `both`; UI will render the returned value as an opaque label if different.
21. **Sorting:** Priority and recency sorting is **required** for the demo.
22. **About page:** Ship `/about` with source attribution and stack credits.
23. **Mock-data indicator:** Show a “demo data” badge when using local mock responses for offline development.

## Assumptions
- Users will tolerate an auth-free MVP.
- Firecrawl + Hunter can provide enough relevant results to prove value.
- n8n can reliably parse natural-language intent using LLM or keyword routing.
- Displaying attributed external links complies with source terms.
- A single shared instance is acceptable for MVP.
- Success-metric targets are working assumptions to be validated after launch.

## Out of scope (until proven otherwise)
- Authentication / user accounts
- Payment / billing
- Advanced filtering beyond what the n8n workflow returns
- Native mobile apps
- Direct CRM integration or outbound automation
- Scraping behind logins or TOS violations
- Monetisation features (affiliate, sponsored results, premium sources)

## Open questions needing approval before G3
All G2 architecture questions have been answered. Awaiting final stakeholder approval of the updated API contract and architecture before moving to Gate G3.

| # | Question | Answer |
|---|---|----------|--------|
| 1 | Thin Next.js API route accepted? | Yes. |
| 2 | Rate-limit values? | 10 req/min, 50 req/day per IP. |
| 3 | n8n webhook auth? | HTTP Basic Authentication with username/password. |
| 4 | Mode and type values? | Modes: `jobs`, `clients`, `both`. |
| 5 | Query length? | Up to 1000 characters. |
| 6 | Result limit enforcement? | Max 15 results, enforced on frontend and n8n. |
| 7 | Streaming deferred? | Yes; batch UX for MVP. |
| 8 | Firecrawl / Hunter free-tier headroom? | Assumed sufficient for demo traffic. |

## Stakeholders
- Client / product owner: user (DELL)

## Artifacts
- `docs/PRD.md` — Product Requirements Document (Gate G1)
- `docs/BRD.md` — Business Requirements Document (Gate G1)
- `docs/ARCHITECTURE.md` — System architecture, data flow, deployment topology, and security posture (Gate G2)
- `docs/API-CONTRACT.md` — Locked API contract between Next.js frontend and n8n backend (Gate G2)
- `docs/ADRs.md` — Architecture Decision Records for Gate G2 decisions
- `docs/DESIGN-SPEC.md` — UI/UX design specification and screen map (Gate G4)
- `docs/N8N-OPTIMIZATION.md` — Guide for reducing n8n workflow latency
- `docs/PROJECT-PLAN.md` — Lean project plan, risk register, and go/no-go criteria (Gate G3)
- `docs/CODE-REVIEW.md` — Gate G6 code review findings and sign-off (Gate G6)
- `docs/QA-REPORT.md` — Gate G7 debug/QA findings and sign-off (Gate G7)
- `docs/SECURITY-REVIEW.md` — Gate G8 security review findings and blockers (Gate G8)
- `docs/DEPLOY-RUNBOOK.md` — Vercel deployment, smoke-test, and rollback procedure (Gate G9)
- `docs/CLOSEOUT.md` — Final project closeout summary and handoff (Gate G11)

## Change log
| Date | Change |
|------|--------|
| 2026-10-20 | Initial context + G1 outputs |
| 2026-10-20 | Added stakeholder answers and n8n output schema |
| 2026-10-20 | Added Gate G2 architecture decisions, API contract summary, and open questions for G3 |
| 2026-10-20 | G3 approved; added n8n webhook URL and basic auth details; updated API contract and architecture docs |
| 2026-10-20 | Added Gate G4 design spec and screen map |
| 2026-10-20 | G4 approved; locked design decisions (Leads label, sorting required, about page, mock-data badge) |
| 2026-10-20 | G5 frontend build complete; backend integration blocked by inactive n8n webhook (404) |
| 2026-10-20 | Updated G2 architecture artifacts (API-CONTRACT.md, ARCHITECTURE.md, ADRs.md) to reflect three modes, 1000-char query, 15-result limit, and optional webhook secret. |
| 2026-10-20 | Added `docs/PROJECT-PLAN.md`; G3 planning complete pending stakeholder approval. |
| 2026-10-21 | G6 Code Review completed; report saved to `docs/CODE-REVIEW.md`; blockers identified before G7. |
| 2026-10-21 | G7 Debug / QA completed; report saved to `docs/QA-REPORT.md`; 26/26 tests pass; live n8n end-to-end verified; blockers before G8 documented. |
| 2026-10-21 | G8 Harden completed; `docs/SECURITY-REVIEW.md` added; blockers documented before G9. |
| 2026-10-21 | G9 Ship / DevOps completed; `docs/DEPLOY-RUNBOOK.md` added; project ready for first Vercel preview deployment. |
| 2026-10-21 | G10 Polish completed; UI consistency and demo-presentation readiness confirmed. |
| 2026-10-21 | G11 Docs / Closeout completed; `docs/CLOSEOUT.md` created, `README.md` updated, gate status refreshed. |
