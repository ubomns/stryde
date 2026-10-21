# Product Requirements Document — Jobs & Sales Leads Search UI + n8n Workflow

## Document control
- **Status:** Updated for Gate G1 stakeholder approval
- **Author:** Product Manager subagent
- **Date:** 2026-10-20
- **Next gate:** G2 (Architecture & stack decisions)

---

## 1. Founder-thinking summary
The following discovery prompts were run to stress-test the idea before writing requirements.

### Stress-test
A natural-language "command center" for jobs and sales leads breaks first on **data-source reliability, legal access, and result relevance**. Most prospects already have a bookmarked job board or a Sales Navigator tab; the UI alone will not win. The top 3% of founders in this space would: (1) pick a narrow wedge (e.g., remote tech jobs + bootstrapped SaaS leads), (2) make data freshness and source attribution visible, and (3) distribute through content/SEO rather than paid ads.

### Competitor gap
Competitors are fragmented point tools (LinkedIn, Indeed, Apollo, ZoomInfo). Their blind spots: expensive seats, siloed search UX, and noisy results. The positioning gap is a **dead-simple, unified natural-language search layer** that returns opportunities from multiple sources in one view. Fastest moves: ship a single-query page, publish the n8n workflow as a template, then verticalize around one tribe.

### Hard decision
Decision: *Should the MVP rely entirely on n8n, or build a custom backend?*  
If n8n-only is wrong, the product becomes fragile when workflows grow. However, a custom backend adds weeks of engineering before any user feedback. We are optimising for **speed-to-validation and modularity**. A founder who already over-engineered the backend would advise: "Build the thinnest possible wrapper; you can always extract a service later." The existence of a self-hosted n8n workflow using Firecrawl + Hunter reinforces this choice.

### Hidden revenue
Three monetisation angles, ranked by effort-to-return:
1. **Affiliate / sponsored result links** — lowest effort; test first.
2. **Premium data-source integrations** (LinkedIn Sales Navigator, Apollo, Crunchbase Pro) — medium effort; higher LTV.
3. **API access / white-label search** for recruiters or agencies — highest effort; validate after traction.

*None of these are in MVP scope.*

---

## 2. Problem statement

### Jobs mode
Active job seekers spend too much time hopping between job boards, retyping filters, and wading through irrelevant postings. The signal-to-noise ratio is low, and the search experience is built around forms, not intent.

### Sales-leads mode
Founders, freelancers, and SDRs need qualified companies to pitch. Existing sales-intelligence tools are expensive, complex, and require manual boolean prospecting. Smaller operators often default to ad-hoc Google/LinkedIn searches that cannot be repeated or shared.

### Core problem (both modes)
There is no lightweight, unified place where a non-technical user can type what they want in plain language and get back curated, attributed opportunities from multiple sources.

---

## 3. Target users

| Mode | Primary user | Who they are | Job-to-be-done |
|------|--------------|--------------|----------------|
| **Job search** | Active job seeker | Mid-level professional in tech, marketing, or design who is openly looking. | "Find me relevant roles I can apply to today." |
| **Job search** | Secondary: career switcher | Someone exploring a new function/industry and unsure which boards cover it. | "Show me what is out there for X in Y." |
| **Sales leads** | Founder / freelancer | Solo operator or small agency selling services/software to a defined ICP. | "Give me a list of companies that fit my ideal customer profile." |
| **Sales leads** | Secondary: SDR / growth hire | Early-stage sales rep with limited tooling budget. | "Find prospects matching this description without learning a new CRM." |

**Prioritisation for MVP:** job seekers and founder/freelancer sales prospectors. Recruiters and enterprise SDRs are explicit secondary users.

---

## 4. Value proposition & key differentiators

### Value proposition
**"Type what you want. Get curated opportunities in seconds."**
A single, minimal interface turns a plain-English request into job openings or sales leads by orchestrating external data sources through an existing self-hosted n8n workflow.

### Key differentiators
1. **Natural-language input** — one box, no complex filters.
2. **Unified jobs + leads modes** — same mental model for two different use cases.
3. **Source transparency** — every result shows its origin, so users trust and verify.
4. **Composable backend** — n8n lets the team add, swap, or remove data sources without redesigning the frontend.
5. **Aesthetic minimalism** — the UI is intentionally simple, fast, and distraction-free.

---

## 5. Goals & measurable success metrics

Targets below are **working assumptions** to be validated after launch. They are not market facts.

| # | Metric | Target | Rationale |
|---|--------|--------|-----------|
| M1 | **Activation rate** — % of visitors who submit at least one query in their first session | ≥ 60% | Validates that the value proposition and empty-state copy are clear. |
| M2 | **Time to first result** — p95 duration from submit to first rendered result | ≤ 10 s | Keeps the experience feeling instantaneous; includes n8n + data-source latency. |
| M3 | **Workflow success rate** — % of submitted queries that complete without n8n/data-source failure | ≥ 95% over 7 days | Core reliability gate before scaling traffic. |
| M4 | **Result engagement** — average number of result cards clicked or shared per session | ≥ 1.0 | Early proxy for relevance. |
| M5 | **Result relevance** — % of returned results judged relevant in weekly spot-checks (n=50) | ≥ 70% | Validates that n8n parsing + source selection are delivering useful answers. |

---

## 6. Scope

### 6.1 IN scope (MVP)

#### Must have
- A **Next.js / React** frontend hosted on **Vercel**.
- A visible toggle between **Job Search** and **Sales Lead Search**.
- A natural-language query input with concise placeholder examples for each mode.
- Submit action that sends the query to the configured **self-hosted n8n** backend.
- The existing n8n workflow that interprets the request, calls **Firecrawl** (web search & scrape) and **Hunter** (domain & email verification), and returns a structured result list matching the locked output schema.
- Result cards aligned to the n8n schema: opportunity/role, company, location, remote status, priority, posted date, days old, why_it_fits, source_url, and contacts.
- Loading, empty, and error states (including n8n, Firecrawl, or Hunter failure).
- Responsive layout that works on desktop and mobile browsers.
- Basic abuse protection (e.g., per-session rate limiting / max query length).

#### Should have
- Results sorted by priority, recency, or relevance.
- Source badge and direct link to the original listing/record via `source_url`.
- Contact display for each lead (name, title, email status, LinkedIn URL when provided).

#### Could have
- Real-time / streaming of partial results **if technically feasible**.
- Local search history (browser storage only, no accounts).
- Export results to CSV/JSON.
- Minimal analytics event stream.

### 6.2 OUT of scope (MVP)
- User authentication / accounts / saved profiles.
- Payment, billing, or subscription tiers.
- Native mobile apps (iOS/Android).
- Advanced filtering/faceting beyond what the natural-language query + n8n workflow return.
- Direct CRM integration or outbound automation (e.g., auto-email sequences).
- Scraping sites that require login or violate terms of service.
- Monetisation features (affiliate, sponsored results, premium sources).

### 6.3 MoSCoW summary
- **Must:** Next.js/React + Vercel frontend; self-hosted n8n backend; mode toggle; NL input; n8n backend call; structured results aligned to schema; error/loading states; responsive UI; basic rate limiting.
- **Should:** source badges, priority/recency sorting, contact display, shareable link.
- **Could:** real-time streaming if feasible, local history, export, analytics.
- **Won't:** auth, billing, native apps, CRM integration, paid data sources, scraping behind logins.

---

## 7. Requirements (prioritised & testable)

| ID | Priority | Requirement | Acceptance hint |
|----|----------|-------------|-----------------|
| R1 | Must | The UI shall provide a visible toggle between Job Search mode and Sales Lead Search mode. | User can switch modes and see mode-specific placeholder text. |
| R2 | Must | The UI shall accept a natural-language query of at least 10 and at most 280 characters. | Queries outside the range are blocked with a clear message. |
| R3 | Must | Submitting a query shall route it to the configured self-hosted n8n workflow and return a structured response matching the locked schema. | A valid query produces HTTP 200/202 and a JSON result list. |
| R4 | Must | The existing n8n workflow shall parse the query and call Firecrawl and Hunter as appropriate. | Logs show Firecrawl and/or Hunter invoked for representative queries. |
| R5 | Must | Each result card shall display the fields returned by the n8n schema: opportunity/role title, company, location, remote status, priority, posted date and days old, why_it_fits summary, source_url, and available contacts. | Each rendered card contains all schema fields when provided by the backend. |
| R6 | Must | The UI shall show loading, empty, and error states for every submission. | Tested by throttling network and submitting invalid/empty queries. |
| R7 | Must | Failed n8n executions or data-source errors shall surface a user-friendly message, not raw errors. | No stack traces or internal identifiers shown to end users. |
| R8 | Must | The interface shall be usable on viewport widths from 320 px to 2560 px. | Visual check on mobile, tablet, and desktop. |
| R9 | Should | Results shall be orderable by priority and/or recency, with the active ordering visible. | Sorting control is present and changes the displayed order. |
| R10 | Should | Each result shall show its source badge and link to the original listing/record via `source_url`. | Clicking the source opens the original URL in a new tab. |
| R11 | Should | When contacts are returned, each contact shall display name, title, email status, and LinkedIn URL if available. | A contact card renders all provided fields without layout breakage. |
| R12 | Could | Users shall be able to copy a link that reproduces the current search. | Pasting the link on a fresh browser restores mode + query. |
| R13 | Could | The UI shall retain the last N searches in browser-local history. | History survives page reload and is cleared with browser data. |

---

## 8. Dependencies & risks

### Dependencies
1. **Existing self-hosted n8n workflow** — already built and operational; the frontend integrates with it rather than rebuilding it.
2. **Firecrawl** — provides web search and scrape capability; must remain within public/free rate limits.
3. **Hunter** — provides domain and email verification; must remain within public/free rate limits.
4. **Vercel hosting** — the Next.js / React frontend is deployed and served from Vercel.
5. **Public data-source terms** — Firecrawl and Hunter results must be displayable with attribution and without violating source terms of service.

### Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Firecrawl or Hunter rate limits / API changes break results. | High | Monitor usage against free tiers; design fallback messaging; abstract display logic so backend changes do not require frontend redesign. |
| Result relevance is poor, hurting engagement. | High | Start with a narrow, well-understood vertical; iterate on prompt/source selection weekly; spot-check relevance (M5). |
| n8n workflow latency exceeds 10 s. | Medium | Set client-side timeout handling; prefer batch UX; add streaming only if it reduces perceived latency without adding fragility. |
| No authentication leads to abuse or cost overruns. | Medium | Implement per-session rate limiting and a daily query cap; defer auth until validated demand. |
| Legal/TOS issues with scraped or verified data. | High | Rely on Firecrawl/Hunter public/free capabilities; review source terms in G2; never scrape behind logins. |
| Scope creep into CRM, billing, or mobile apps. | Medium | Enforce the Won't list; schedule those for post-MVP roadmap. |
| Locked n8n schema cannot support a future UX need. | Low | Treat schema as fixed for MVP; any schema change must go through stakeholder approval and impact assessment. |

---

## 9. Open questions from PROJECT-CONTEXT.md — answers & assumptions

**All open questions from G1 are now answered.** The n8n output schema is locked for the MVP.

| # | Open question | Answer / reasoned assumption | Notes |
|---|---------------|------------------------------|-------|
| 1 | What exact data sources/tools will n8n call? | **Firecrawl** (web search & scrape) and **Hunter** (domain & email verification). Public/free only. | Locked for MVP. |
| 2 | Is the n8n workflow already built? | **Yes.** A self-hosted n8n workflow already exists. | Frontend integrates with it; no workflow rebuild in MVP. |
| 3 | Who is the target user? | **Active job seekers** and **founders/freelancers doing sales prospecting**. | Confirmed by stakeholder. |
| 4 | What is the preferred frontend stack? | **Next.js / React**, hosted on **Vercel**. | Locked for MVP. |
| 5 | Are there brand guidelines? | **None.** Use a neutral, accessible palette. | No brand constraints. |
| 6 | Real-time streaming or batch results? | **Batch/async is acceptable**; real-time/streaming is preferable if feasible and is a Could-have. | Decision recorded in scope. |
| 7 | Hosting/deployment target? | **Vercel** for frontend; **self-hosted n8n** for backend. | Locked for MVP. |
| 8 | Budget or complexity constraints? | **Demo scope:** no auth, no payments, no paid data tiers. | Locked for MVP. |

**Schema lock note:** The n8n output schema fields (`mode`, `intent_summary`, `assumptions`, `leads[]` with `type`, `company`, `domain`, `location`, `remote_status`, `opportunity`, `source_url`, `why_it_fits`, `priority`, `posted_date`, `days_old`, and `contacts[]` with `name`, `title`, `email`, `email_status`, `linkedin_url`) are fixed for the MVP. Any schema change requires explicit approval and an impact assessment.

---

## 10. Assumptions

1. Users are willing to use the product without accounts for the MVP.
2. The existing self-hosted n8n workflow can reliably parse natural-language intent and return results using Firecrawl + Hunter.
3. Firecrawl + Hunter can provide enough relevant results to prove value within public/free limits.
4. Results can be displayed with attribution and external links without violating source terms.
5. A single shared instance is acceptable; no multi-tenancy is required for MVP.
6. The success-metric targets are working assumptions, not guaranteed baselines.
7. The n8n output schema is locked for the MVP; frontend requirements are written against it.
8. Vercel hosting and self-hosted n8n operations are available and maintained by the stakeholder.

---

## 11. Approval checklist before Gate G2

The following decisions are now confirmed and need explicit stakeholder sign-off before moving to architecture:

- [ ] Target-user prioritisation (job seekers + founders/freelancers) is correct.
- [ ] MVP remains auth-free, unmonetised, and limited to public/free data.
- [ ] Firecrawl + Hunter are the accepted data-source tools for the existing n8n workflow.
- [ ] Self-hosted n8n + Vercel (Next.js / React) hosting is agreed.
- [ ] Batch/async UX is acceptable; real-time/streaming is optional and may be attempted only if feasible.
- [ ] The n8n output schema is locked for the MVP.
- [ ] Success-metric targets are reasonable or should be adjusted.
- [ ] No brand/design constraints are expected before G4.

---

## 12. Change log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1 | 2026-10-20 | PM subagent | Initial PRD for Gate G1. |
| 0.2 | 2026-10-20 | PM subagent | Updated for confirmed stakeholder answers: locked n8n schema (Firecrawl + Hunter), Next.js/React + Vercel frontend, self-hosted n8n, batch/async with streaming as optional, target users confirmed, auth/payments/native apps/CRM remain out. Updated Sections 6–11 and change log. |
