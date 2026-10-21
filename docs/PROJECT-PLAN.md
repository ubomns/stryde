# Project Plan — Jobs & Sales Leads Search Demo

**Status:** Gate G3 planning deliverable  
**Date:** 2026-10-20  
**Owner:** Project Manager subagent  
**Audience:** Solo developer + stakeholder  

---

## 1. Project summary and MVP demo objective

Build the thinnest possible Next.js / React frontend for the existing self-hosted n8n workflow. The demo proves that a non-technical user can type a natural-language request, pick a mode (`jobs`, `clients`, `both`), and get back curated, attributed results from Firecrawl + Hunter in a clean, responsive UI.

**MVP demo objective:** a live Vercel URL where a visitor can submit a query in all three modes, see loading / error / empty / result states, click source links, and view contacts — with no auth, no payments, and no backend rebuild.

**Non-goals for this plan:** auth, billing, native apps, CRM integration, paid data sources, real-time streaming (batch only), advanced analytics, full test automation.

---

## 2. Milestones and rough timeline

**Assumed cadence:** solo developer, 4–6 focused hours/day, 2.5 weeks total.

| Milestone | Target | Deliverables | Key decisions / gates |
|-----------|--------|--------------|-----------------------|
| **M0 — G4 Build-ready** | Day 0–1 | Dependency matrix green; dev environment runs; repo bootstrapped. | G4 go/no-go met. |
| **M1 — Foundation & API** | Day 6 | Next.js project, Edge Middleware, `/api/v1/search` route, shared types, search form, loading/error/empty states, mock fallback. | Sprint 1 done; UI functional without live n8n. |
| **M2 — Results & Deploy** | Day 11 | Lead/contact cards, assumptions/notes, sorting, Vercel production deploy, live n8n wired. | Sprint 2 done; live e2e search passes. |
| **M3 — Demo accepted** | Day 14–15 | Smoke tests fixed, attribution/responsive polish, 2-minute demo recorded, stakeholder sign-off. | G9 complete. |

**Day-by-day sketch (flexible):**

- **Days 0–1:** Kickoff, dependency checklist, repo init, env template, Vercel project linked.
- **Days 2–3:** Edge Middleware + `/api/v1/search` route + shared types.
- **Days 4–5:** Mode selector, search form, loading, error, empty states, local mock fallback.
- **Days 6:** Sprint 1 review / buffer.
- **Days 7–9:** Lead cards, contacts, assumptions/notes, sort controls.
- **Days 10–11:** Vercel deploy, live n8n integration check.
- **Days 12–13:** Attribution footer, responsive polish, smoke tests.
- **Days 14–15:** Demo recording, bug fixes, stakeholder acceptance.

> **No hard calendar deadlines are set.** Target dates are offsets from G4 start and assume dependencies are ready on Day 0.

---

## 3. Resource assumptions

| Resource | Assumption | Risk if wrong |
|----------|------------|---------------|
| **Developer** | 1 solo full-stack dev, 4–6 h/day for ~2.5 weeks. | Illness/unavailability delays the whole build. |
| **Vercel** | Hobby/Pro project available; build minutes sufficient for demo. | Outages or quota limits block deploy. |
| **n8n backend** | Self-hosted instance is maintained by stakeholder; webhook reachable from Vercel. | Unavailable n8n blocks live integration. |
| **Firecrawl + Hunter** | Free/public tiers cover demo traffic; API keys active. | Rate limits or API changes degrade results. |
| **Design** | No brand guidelines; dev picks a neutral, accessible Tailwind/shadcn palette. | “Aesthetically pleasing” may be subjective. |
| **QA** | No dedicated QA; smoke tests run by dev + stakeholder spot-checks. | Undiscovered edge cases in demo. |
| **Browser / device access** | Dev has access to desktop Chrome/Firefox/Safari and a mobile viewport for manual checks. | Responsive issues slip through. |

---

## 4. Dependency matrix — must be ready before build starts

| # | Prerequisite | Why it blocks | Owner | Required by | Status |
|---|--------------|---------------|-------|-------------|--------|
| D1 | **n8n production webhook URL** for `POST /api/v1/search` | Route Handler cannot forward requests without it. | Stakeholder | Day 0 | TBC |
| D2 | **Optional n8n webhook secret** documented, or explicit decision to skip | Security hardening; secret must be added to Vercel env vars. | Stakeholder | Day 0 | TBC |
| D3 | **Vercel project created** and linked to Git repo | Required for deploy and env var management. | Dev / Stakeholder | Day 0 | TBC |
| D4 | **Git repo initialised** and push access confirmed | Source control baseline. | Dev | Day 0 | TBC |
| D5 | **Environment variable list** agreed (`.env.example`) | Prevents config drift between local and production. | Dev | Day 1 | TBC |
| D6 | **n8n workflow health check** — sample 200 response for all 3 modes | Confirms schema, latency, and data-source connectivity. | Stakeholder | Day 0 | TBC |
| D7 | **Firecrawl + Hunter free-tier headroom** confirmed | Avoids demo-day rate-limit failures. | Stakeholder | Day 0 | TBC |
| D8 | **Design references / moodboard** (1–2 screenshots) | Reduces subjective rework on “aesthetically pleasing.” | Dev | Day 1 | TBC |
| D9 | **Responsive test devices/browsers** listed | Defines the minimum manual QA matrix. | Dev | Day 12 | TBC |

---

## 5. Risk register

| ID | Risk | Impact | Likelihood | Mitigation | Owner | Status |
|----|------|--------|------------|------------|-------|--------|
| R1 | **Self-hosted n8n unavailable during build/test** | High | Low | WP6.2 local fallback data lets UI work offline; schedule live n8n window with stakeholder. | Dev | Open |
| R2 | **n8n workflow latency exceeds 15 s** | Medium | Medium | 20 s server timeout; batch UX with skeletons; “still searching” message at 10 s; partial-failure notes. | Dev | Open |
| R3 | **Firecrawl / Hunter free-tier limits or API changes** | High | Medium | Monitor usage; design partial-failure UI; record demo during low-traffic window; keep fallback mock. | Stakeholder / Dev | Open |
| R4 | **Result relevance is poor** | High | Medium | Start with narrow demo queries; iterate prompt/source selection post-G5; weekly spot-checks. | Stakeholder | Open |
| R5 | **No auth leads to abuse or cost overruns** | Medium | Low | IP-based rate limits (10/min, 50/day); optional webhook secret; global daily cap in n8n if needed. | Dev | Open |
| R6 | **n8n returns schema fields/types the frontend does not expect** | Medium | Low | Types driven by locked schema; frontend renders optional fields defensively; flag mismatches immediately. | Dev | Open |
| R7 | **Legal / source TOS issues with scraped/verified data** | High | Low | Display clear source attribution + external links only; never scrape behind logins; review source terms before demo. | Stakeholder | Open |
| R8 | **Scope creep into auth, payments, streaming, CRM** | Medium | Low | Reject additions; defer to post-MVP; reference PRD/WBS scope at every gate. | Dev / Stakeholder | Open |
| R9 | **Solo dev unavailable** | High | Low | Buffer days built into timeline; escalate immediately if capacity drops below 50%. | Dev / Stakeholder | Open |
| R10 | **Subjective design feedback causes rework** | Medium | Medium | Lock 1–2 references before G4; one design checkpoint at end of Sprint 1. | Dev | Open |

---

## 6. Go / no-go criteria

### Gate G4 — Build start

**Go if all true:**
- [ ] D1–D7 dependency matrix items are green (webhook URL, Vercel project, n8n health, env vars).
- [ ] WBS and this plan are reviewed and accepted by stakeholder.
- [ ] PRD, API contract, architecture, and ADRs are final and unchanged.
- [ ] Local dev environment boots (`pnpm dev`) and repo is in Git.
- [ ] No unresolved open questions that affect frontend build.

**No-go triggers:** missing n8n webhook URL, no Vercel access, n8n workflow returning errors, unapproved scope changes.

### Gate G5 — Build / integration complete

**Go if all true:**
- [ ] All WBS work packages through WP5.2 are complete.
- [ ] Production Vercel URL is live and stable.
- [ ] Live queries succeed for `jobs`, `clients`, and `both` modes.
- [ ] Error states (400, 429, 502, 504, timeout, empty) are verified in production.
- [ ] Rate limiting is tested and enforced.
- [ ] No PII or secrets are exposed in the UI or repo.

**No-go triggers:** live n8n integration failing, production build broken, major responsive/layout issues, secrets leaked.

### Gate G9 — Demo / project close

**Go if all true:**
- [ ] 2-minute demo video recorded covering all three modes + an error state.
- [ ] Stakeholder accepts the demo (sign-off or written OK).
- [ ] Known issues and limitations are documented.
- [ ] README / runbook explains env vars, deploy, and how to toggle mock data.
- [ ] Lessons learned captured for next iteration.

**No-go triggers:** demo fails on core path, unresolved high-severity bugs, stakeholder rejects acceptance criteria.

---

## 7. Definition of done — overall demo

The demo is **done** when:

1. A visitor can open the production Vercel URL and immediately understand the value proposition.
2. The user can switch between `jobs`, `clients`, and `both` modes.
3. The user can submit a natural-language query of 10–1000 characters and receive up to 15 results.
4. The UI shows clear loading, empty, and user-friendly error states for every submission.
5. Result cards display all locked-schema fields: type, company, domain, location, remote status, opportunity, source URL, why-it-fits, priority, posted date, days old, and contacts.
6. Source badges/links open the original listing/record in a new tab.
7. Contact details render with email status badge and LinkedIn/mailto links when provided.
8. Rate limiting (10 req/min, 50 req/day per IP) is active and surfaces a friendly 429 message.
9. Layout is usable from 320 px mobile to 2560 px desktop.
10. No auth, no payments, no CRM, no streaming, no paid data sources are introduced.
11. Attribution footer / about page is present.
12. A 2-minute demo video is recorded and shared.

---

## Change log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1 | 2026-10-20 | PM subagent | Initial project plan for Gate G3. |
