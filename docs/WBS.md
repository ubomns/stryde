# Work Breakdown Structure — Jobs & Sales Leads Search UI

## Gate G3 Planning

| Field | Value |
|-------|-------|
| Status | Draft for Gate G3 approval |
| Author | Scrum Master subagent |
| Date | 2026-10-20 |
| Next gate | G3 approval → build starts |

---

## 1. Goal

Produce an actionable, solo-developer plan for building and deploying the Next.js frontend for the Jobs & Sales Leads Search demo. Scope is locked to the approved G2 architecture and API contract: one search endpoint, three modes, batch results, IP rate limiting, optional n8n webhook secret.

---

## 2. Epics

| Epic ID | Epic | Description |
|---------|------|-------------|
| E1 | Setup & Tooling | Bootstrap the Next.js project, dev workflow, and environment configuration. |
| E2 | API Route & Middleware | Build the secure, thin `/api/v1/search` route and Edge Middleware. |
| E3 | UI Components | Build the search form, mode selector, loading, error, and empty states. |
| E4 | Results Display | Render leads, contacts, assumptions, notes, and simple sorting. |
| E5 | Deployment & Integration | Deploy to Vercel and wire the live n8n webhook. |
| E6 | Demo Prep & Hardening | Attribution, local fallback data, smoke tests, and demo recording. |

---

## 3. Work packages

| ID | Epic | Title | Description | Owner | Estimate | Dependencies | Definition of Done |
|----|------|-------|-------------|-------|----------|--------------|---------------------|
| WP1.1 | E1 | Initialise Next.js project | Create Next.js 14+ app with TypeScript, Tailwind CSS, `shadcn/ui`, ESLint/Prettier, and a `src/` folder structure. | Dev (solo) | 4h | None | `pnpm dev` starts cleanly; repo pushes to Git; no build errors. |
| WP1.2 | E1 | Environment config template | Add `.env.example` and Vercel env vars for `N8N_WEBHOOK_URL`, optional `N8N_WEBHOOK_SECRET`, rate limits, and `NEXT_PUBLIC_APP_URL`. | Dev (solo) | 1h | WP1.1 | `.env.example` documents every variable; local dev can run without real secrets. |
| WP2.1 | E2 | Edge Middleware for rate limiting & CORS | Implement IP-based limits (10 req/min, 50 req/day) and CORS preflight for the search route. | Dev (solo) | 3h | WP1.1 | Middleware returns `429` after limits and `204` on OPTIONS; tested locally. |
| WP2.2 | E2 | `/api/v1/search` Route Handler | Build POST handler: validate payload with Zod, forward to n8n webhook, attach optional `X-N8N-Webhook-Secret`, map errors to API-contract envelope, 20 s timeout. | Dev (solo) | 5h | WP1.2, WP2.1 | Handler returns correct 200/400/429/502/504 responses; unit tests for validation pass. |
| WP2.3 | E2 | Shared API types | Define TypeScript request/response types matching the locked n8n output schema and error envelope. | Dev (solo) | 2h | WP1.1 | Types exported; compile-time coverage of request/response shapes. |
| WP3.1 | E3 | Mode selector | Build a segmented control for `jobs` / `clients` / `both`. | Dev (solo) | 2h | WP1.1 | Selector updates state; accessible labels; works on mobile. |
| WP3.2 | E3 | Search form | Query textarea with 10–1000 char counter, `maxResults` selector (1–15, default 15), submit button, client-side validation. | Dev (solo) | 4h | WP3.1 | Invalid queries block submission; error messages shown; char counter live. |
| WP3.3 | E3 | Loading state | Skeleton cards, indeterminate progress bar, and reassuring status text ("Searching…", "Still searching…" after 10 s). | Dev (solo) | 3h | WP1.1 | Loading UI renders during mock fetch; timeout hint visible at 15 s. |
| WP3.4 | E3 | Error & empty states | Friendly messages for 400, 429, 502, 504, network errors, timeout, and empty `leads[]`; one auto-retry for network/5xx/timeout. | Dev (solo) | 3h | WP2.2, WP3.2 | Each error code maps to a clear UI state; retry button functional. |
| WP4.1 | E4 | Lead card component | Render all lead fields: type, company, domain, location, remote status, opportunity, source link, why-it-fits, priority badge, posted date, days old. | Dev (solo) | 5h | WP2.3 | Card displays every schema field; source link opens externally; responsive layout. |
| WP4.2 | E4 | Contact display | Sub-component for `contacts[]` with name, title, email status badge, `mailto:` link, LinkedIn link. | Dev (solo) | 2h | WP4.1 | Contact row renders empty state; valid/unknown/invalid badges styled. |
| WP4.3 | E4 | Assumptions & notes | Display `intent_summary`, `assumptions[]`, and `notes` (including partial-failure warnings). | Dev (solo) | 1h | WP4.1 | All three fields render correctly; notes styled as warning when non-empty. |
| WP4.4 | E4 | Sort controls | Simple sort by priority (High → Low) and recency (newest first). | Dev (solo) | 3h | WP4.1 | Sort updates lead order; default matches n8n order. |
| WP5.1 | E5 | Vercel deployment | Create Vercel project, link repo, set environment variables, deploy production domain. | Dev (solo) | 3h | WP2.2, WP3.4, WP4.4 | Production URL loads; build passes; env vars set. |
| WP5.2 | E5 | n8n integration check | Configure `N8N_WEBHOOK_URL` and optional secret; run live end-to-end searches in all three modes. | Dev (solo) | 2h | WP5.1 | Successful 200 responses from real n8n; errors map correctly. |
| WP6.1 | E6 | Attribution & responsive polish | Add footer/about page with source attribution, data-source compliance note, and final mobile/desktop polish. | Dev (solo) | 2h | WP5.1 | Footer on every page; about page accessible; no layout breaks on 320 px. |
| WP6.2 | E6 | Local fallback data | Add a mock n8n response fixture and a dev-only toggle so UI can be built/tested without a live n8n instance. | Dev (solo) | 3h | WP2.3, WP4.1 | Toggle returns mock data; fixture covers all three modes and partial-failure notes. |
| WP6.3 | E6 | Smoke tests & demo | Run end-to-end scenarios (valid query, validation error, rate limit, empty results, timeout, all modes); fix bugs; record a 2-minute demo. | Dev (solo) | 4h | WP5.2, WP6.1, WP6.2 | All scenarios pass; demo video uploaded; no PII in recording. |

**Total estimated effort:** ~46 hours

---

## 4. Sprint plan

### Sprint 1 — Foundation & API (Days 1–5)

**Goal:** Project is bootstrapped, the API contract is implemented, and the core search UI is functional.

| Work packages |
|---------------|
| WP1.1 — Initialise Next.js project |
| WP1.2 — Environment config template |
| WP2.1 — Edge Middleware for rate limiting & CORS |
| WP2.2 — `/api/v1/search` Route Handler |
| WP2.3 — Shared API types |
| WP3.1 — Mode selector |
| WP3.2 — Search form |
| WP3.3 — Loading state |
| WP3.4 — Error & empty states |
| WP6.2 — Local fallback data |

**Sprint 1 Definition of Done:**
- `pnpm dev` runs; repo is in Git.
- `/api/v1/search` returns correct validation, rate-limit, and mock-success responses.
- User can select a mode, type a query, submit, and see loading/error/empty/success states.

### Sprint 2 — Results, Deploy & Demo (Days 6–10)

**Goal:** Results are polished and deployed; live n8n integration verified; demo ready.

| Work packages |
|---------------|
| WP4.1 — Lead card component |
| WP4.2 — Contact display |
| WP4.3 — Assumptions & notes |
| WP4.4 — Sort controls |
| WP5.1 — Vercel deployment |
| WP5.2 — n8n integration check |
| WP6.1 — Attribution & responsive polish |
| WP6.3 — Smoke tests & demo |

**Sprint 2 Definition of Done:**
- Production Vercel URL serves the app.
- Live searches against n8n succeed for `jobs`, `clients`, and `both`.
- All error and edge-case states verified.
- 2-minute demo recorded and shared.

---

## 5. Risk log

| ID | Risk | Impact | Likelihood | Mitigation / Owner |
|----|------|--------|------------|---------------------|
| R1 | n8n workflow latency exceeds 15 s | Medium | Medium | Keep batch UX with skeletons/timeout messaging; set 20 s client timeout. Dev |
| R2 | Self-hosted n8n unavailable during build/test | High | Low | WP6.2 local fallback data lets UI work offline; coordinate n8n window with stakeholder. Dev |
| R3 | Firecrawl / Hunter free-tier rate limits hit | High | Medium | n8n partial-failure logic surfaces warnings; demo recorded during low-traffic window. Dev |
| R4 | Abuse despite IP rate limits | Medium | Low | Optional webhook secret recommended; if abused, add global daily cap in n8n. Dev |
| R5 | n8n returns different `type` strings than assumed | Low | Low | Frontend renders `type` as opaque label; no hard-coded type checks. Dev |
| R6 | Scope creep (auth, payments, streaming, CRM) | Medium | Low | Reject additions; defer to post-MVP; reference this WBS and API contract. Dev / Stakeholder |

---

## 6. Approval checklist

Before build work begins:

- [ ] WBS reviewed and approved by stakeholder.
- [ ] Sprint 1 and 2 scope accepted; no additions without change request.
- [ ] n8n webhook URL and optional secret expected delivery date confirmed.
- [ ] Vercel project ownership / deployment permissions confirmed.
- [ ] Demo acceptance criteria (2-minute video, all three modes, error states) agreed.

---

## 7. Change log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1 | 2026-10-20 | Scrum Master | Initial WBS for Gate G3. |
