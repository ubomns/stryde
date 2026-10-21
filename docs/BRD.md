# Business Requirements Document (BRD)

## Document Control

| Field | Value |
|-------|-------|
| Project | Jobs & Sales Leads Search UI + n8n Workflow |
| Version | 1.1 |
| Date | 2026-10-20 |
| Author | Business Analyst subagent |
| Source documents | `docs/PROJECT-CONTEXT.md`, `docs/PRD.md` |
| Status | Updated for Gate G1 approval |

> **Note:** This BRD reflects the stakeholder answers captured in `docs/PROJECT-CONTEXT.md`. The `docs/PRD.md` was used as supplementary product context; where the two documents diverge, this BRD follows the latest stakeholder confirmation (e.g., the n8n workflow already exists and uses Firecrawl + Hunter).

---

## 1. Scope and Objectives

### 1.1 Scope
Build a simple, user-friendly, aesthetically pleasing **Next.js / React** web UI hosted on **Vercel** that lets a user type a natural-language request for either **job search** or **sales lead search**. An **existing self-hosted n8n backend** interprets the request, calls **Firecrawl** (web search & scrape) and **Hunter** (domain & email verification), and returns results that the frontend displays cleanly.

This is a **demo to showcase skills**; there is no authentication, no payments, and no native app in the MVP.

### 1.2 Objectives
- Enable active job seekers and founders/freelancers to find relevant jobs or sales leads with plain-language input.
- Surface the n8n workflow's results—including interpreted intent, assumptions, and verified contact data—in a clean, scannable layout.
- Keep the experience responsive and accessible across common devices and browsers.

### 1.3 Out of Scope (per PROJECT-CONTEXT.md)
- Authentication / user accounts.
- Payment / billing / subscription tiers.
- Advanced filtering UI beyond what the n8n workflow returns.
- Native mobile applications (iOS/Android).
- Direct CRM integration or outbound automation.
- Scraping behind logins or violating terms of service.
- Monetisation features (affiliate, sponsored results, premium sources).

---

## 2. Definitions

| Term | Definition |
|------|------------|
| **Query** | The natural-language request typed by the user (e.g., "Find senior React jobs in Berlin"). |
| **Mode** | The search category selected by the user: *Job Search* or *Sales Lead Search*. |
| **Result Item** | A single job posting or sales lead returned inside the n8n `leads[]` array. |
| **Backend** | The existing self-hosted n8n workflow/backend responsible for interpreting queries and calling Firecrawl and Hunter. |
| **Frontend** | The Next.js / React web UI hosted on Vercel through which the user enters queries and views results. |
| **Firecrawl** | External tool used by the n8n workflow for web search and scraping. |
| **Hunter** | External tool used by the n8n workflow for domain and email verification. |

---

## 3. Functional Requirements

### 3.1 Core Interaction

**FR-1 Mode Selection**
The frontend shall allow the user to select one of two search modes: *Job Search* or *Sales Lead Search*.

**FR-2 Natural-Language Query Input**
The frontend shall provide a text input in which the user can type a natural-language request.

**FR-3 Request Submission**
The frontend shall let the user submit the query. The system shall validate the input before sending it to the backend.

**FR-4 Backend Interpretation**
The existing self-hosted n8n backend shall interpret the natural-language query, call Firecrawl and/or Hunter as needed, and return a structured response. *(n8n node configuration and API contracts belong to Gate G2.)*

**FR-5 Processing Status Visibility**
The frontend shall display the current processing status of a submitted search (e.g., submitted, in progress, completed, failed, partial).

### 3.2 Job Search Results

**FR-6 Job Result Attributes**
When the user selects *Job Search*, each result item shall be drawn from the n8n `leads[]` array and shall contain, when available from the source, the following attributes:
- `type` (value `job`)
- `company`
- `domain`
- `location`
- `remote_status`
- `opportunity` (job title)
- `source_url`
- `why_it_fits`
- `priority`
- `posted_date`
- `days_old`
- `contacts[]` (each with `name`, `title`, `email`, `email_status`, `linkedin_url`)

**FR-7 Job Results Display**
The frontend shall render job result items in a clean, scannable layout, indicate the total result count and the query that produced them, and display any top-level context returned by the backend.

### 3.3 Sales Lead Search Results

**FR-8 Lead Result Attributes**
When the user selects *Sales Lead Search*, each result item shall be drawn from the n8n `leads[]` array and shall contain, when available from the source, the following attributes:
- `type` (value `lead`)
- `company`
- `domain`
- `location`
- `remote_status` (if applicable)
- `opportunity` (opportunity title or signal)
- `source_url`
- `why_it_fits`
- `priority`
- `posted_date` (if available)
- `days_old` (if available)
- `contacts[]` (each with `name`, `title`, `email`, `email_status`, `linkedin_url`)

**FR-9 Lead Results Display**
The frontend shall render lead result items in a clean, scannable layout, indicate the total result count and the query that produced them, and display any top-level context returned by the backend.

### 3.4 Context, Contact, Error, Empty, and Edge Handling

**FR-10 No-Results Handling**
If the backend returns zero results, the frontend shall display a clear no-results message and, where possible, suggestions for refining the query.

**FR-11 Partial-Failure Handling**
If some data sources fail but others return data, the frontend shall display the available results together with a visible warning that some sources could not be reached.

**FR-12 Complete-Failure Handling**
If the backend fails or all sources fail, the frontend shall display a user-friendly error message and provide a way to retry the search.

**FR-13 Invalid Input Feedback**
The frontend shall provide immediate feedback when the query is empty, too short, too long, or contains disallowed content, and shall block submission until the input is valid.

**FR-14 Source Linking**
Each result item that includes a `source_url` shall provide a clickable link that opens the original source in a new browser tab.

**FR-15 Responsive Layout**
The frontend shall be usable on desktop, tablet, and mobile browsers without horizontal scrolling or broken layouts.

**FR-16 Top-Level Context Display**
The frontend shall display the top-level `intent_summary`, `assumptions`, and `notes` fields returned by the n8n backend when they are present.

**FR-17 Contact Information Display**
For each result item that includes `contacts[]`, the frontend shall render `name`, `title`, `email`, `email_status`, and `linkedin_url`. Valid email addresses shall be clickable to open the user's mail client; valid LinkedIn URLs shall open in a new tab. Missing or unverified contact data shall be shown as absent or marked according to `email_status`.

---

## 4. Non-Functional Requirements

| ID | Requirement | Measurement |
|----|-------------|-------------|
| **NFR-1 Performance - Response Time** | Batch/async results are acceptable for the MVP. Real-time/streaming is preferable if feasible. Under normal conditions, the frontend shall update status within 2 seconds and return a full result set within 15 seconds for queries returning up to 25 items. | P95 measured in staging/production. |
| **NFR-2 Performance - Page Load** | The initial page shall load and become interactive within 3 seconds on a standard broadband connection. | Lighthouse / synthetic monitoring. |
| **NFR-3 Usability - First Success** | A first-time user shall be able to complete a successful search within 60 seconds without training or documentation. | Usability test / telemetry. |
| **NFR-4 Usability - Accessibility** | The UI shall conform to WCAG 2.1 Level AA for color contrast, keyboard navigation, focus indicators, and screen-reader labels. | Automated + manual audit. |
| **NFR-5 Reliability - Availability** | The service shall be available at least 99% of the time, excluding planned maintenance and third-party outages. Uptime applies to the self-hosted n8n instance and the Vercel-hosted frontend. | Uptime monitoring. |
| **NFR-6 Reliability - Graceful Degradation** | If one or more data sources fail, the system shall still return any available results and notify the user of the partial state. | Test scenario. |
| **NFR-7 Security - Transport** | All communication between the user and the frontend, and between the frontend and backend, shall use HTTPS/TLS. Vercel and the self-hosted n8n instance must serve traffic over HTTPS. | Security scan / certificate check. |
| **NFR-8 Security - Input Safety** | Query input shall be sanitized to prevent injection attacks; no user-entered scripts shall execute in the browser. | Penetration test / code review. |
| **NFR-9 Security - Privacy** | The system shall not persistently store personally identifiable information (PII) beyond what is transiently required to process a search. | Data-flow review. |
| **NFR-10 Scalability** | The system shall support at least 10 concurrent searches without functional degradation. | Load test. |
| **NFR-11 Maintainability** | Every functional requirement shall be traceable to at least one user story and acceptance criterion. | Traceability matrix review. |
| **NFR-12 Technology Stack** | The frontend shall be built with Next.js / React and hosted on Vercel. The backend shall be the existing self-hosted n8n workflow. | Architecture review (Gate G2). |

---

## 5. User Stories and Acceptance Criteria

### US-1 Select search mode
**As a** user, **I want** to choose between job search and sales lead search, **so that** I receive results relevant to my goal.

**Acceptance Criteria**
- Given I open the application, when I view the search area, then I can see and select *Job Search* or *Sales Lead Search*.
- Given I select a mode, when I submit a query, then the backend receives the selected mode.

### US-2 Enter a natural-language request
**As a** user, **I want** to type my request in plain language, **so that** I do not need to learn query syntax or filters.

**Acceptance Criteria**
- Given I am on the search page, when I type "Find senior React jobs in Berlin" in the query box, then the text is accepted and I can submit it.
- Given I type fewer than 10 characters or more than 280 characters, when I attempt to submit, then I see a validation message and the submission is blocked.

### US-3 Submit a search
**As a** user, **I want** to submit my query, **so that** the system starts searching.

**Acceptance Criteria**
- Given I have selected a mode and entered a valid query, when I click the submit button or press Enter, then the request is sent and an in-progress indicator is shown.
- Given the backend is unreachable, when I submit, then I see an error message within 5 seconds.

### US-4 View processing status
**As a** user, **I want** to see whether my search is still running, **so that** I know the system is working.

**Acceptance Criteria**
- Given I submitted a query, when results are not yet ready, then I see a loading indicator and status text such as "Searching…".
- Given the search takes longer than 10 seconds, when I am waiting, then I see a reassuring message (e.g., "Still searching, this can take a moment").

### US-5 View job search results
**As a** job seeker, **I want** to see relevant job postings, **so that** I can decide which opportunities to pursue.

**Acceptance Criteria**
- Given I selected *Job Search* and entered a valid query, when results return, then each result card shows `company`, `domain`, `location`, `remote_status`, `opportunity` (title), `source_url`, `why_it_fits`, `priority`, `posted_date`, `days_old`, and any `contacts[]` when provided.
- Given zero jobs are found, when the search completes, then I see a no-results message with tips to refine my query.

### US-6 View sales lead results
**As a** sales user, **I want** to see potential sales leads, **so that** I can identify prospects to contact.

**Acceptance Criteria**
- Given I selected *Sales Lead Search* and entered a valid query, when results return, then each result card shows `company`, `domain`, `location`, `remote_status`, `opportunity`, `source_url`, `why_it_fits`, `priority`, `posted_date`, `days_old`, and any `contacts[]` when provided.
- Given zero leads are found, when the search completes, then I see a no-results message with tips to refine my query.

### US-7 Open a result source
**As a** user, **I want** to open the original source of a result, **so that** I can verify details or take action.

**Acceptance Criteria**
- Given a result card includes a `source_url`, when I click the source link, then the original source opens in a new browser tab.
- Given a result card does not include a `source_url`, then no broken or misleading link is shown.

### US-8 Handle errors and partial failures
**As a** user, **I want** to understand when something goes wrong, **so that** I can retry or adjust my query.

**Acceptance Criteria**
- Given one data source fails but others return data, when results display, then I see the available results plus a warning that some sources failed.
- Given all sources fail or a backend error occurs, when the search ends, then I see a clear error message and a retry option.

### US-9 Use the app on a mobile browser
**As a** user, **I want** to use the app on my phone, **so that** I can search while away from my desk.

**Acceptance Criteria**
- Given I access the app on a mobile browser, when I enter a query and submit, then the layout is usable without horizontal scrolling and controls are reachable.

### US-10 View search context
**As a** user, **I want** to see what the system understood and any assumptions it made, **so that** I can refine my query if needed.

**Acceptance Criteria**
- Given the backend returns `intent_summary` and `assumptions`, when results display, then I see a summary of the interpreted intent and a list of assumptions.
- Given the backend returns `notes`, when results display, then the notes are visible to the user.

### US-11 View contact details
**As a** user, **I want** to see verified contact information for a company or opportunity, **so that** I can reach out directly.

**Acceptance Criteria**
- Given a result item contains `contacts[]`, when the card renders, then each contact shows `name`, `title`, `email`, `email_status`, and `linkedin_url` when available.
- Given a contact has a valid `email`, when I click it, then my default mail client opens with a new message.
- Given a contact has a valid `linkedin_url`, when I click it, then the profile opens in a new tab.
- Given a contact's `email_status` is not "valid", then the UI indicates the verification status without implying deliverability.

---

## 6. Edge Cases and Data Validation Rules

### 6.1 Edge Cases

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-1 | Empty query | Submission blocked; message asks user to enter a query. |
| EC-2 | Query shorter than 10 characters | Submission blocked; message states minimum length. |
| EC-3 | Query longer than 280 characters | Submission blocked or truncated with warning. |
| EC-4 | Query contains HTML/script tags | Content sanitized; no script execution. |
| EC-5 | Backend returns zero results | Display no-results message with refinement tips. |
| EC-6 | One source fails, others succeed | Display partial results with a non-blocking warning. |
| EC-7 | All sources fail | Display error message with retry option. |
| EC-8 | Network timeout | Display timeout message and retry option. |
| EC-9 | Duplicate result items returned | UI displays items as returned by backend; deduplication is a backend concern. |
| EC-10 | `source_url` is missing or malformed | Hide or disable the source link; do not navigate to an invalid URL. |
| EC-11 | `contacts[]` is missing or empty | Omit the contacts section; do not show placeholder fields. |
| EC-12 | Contact `email` or `linkedin_url` is missing/invalid | Render the field as absent or disabled; do not create broken links. |
| EC-13 | `email_status` is missing or unknown | Display the email with a neutral status indicator. |

### 6.2 Data Validation Rules

| Field | Rule | Error / Note |
|-------|------|--------------|
| **Mode** | Required; UI value must map to a supported n8n mode. | "Please select a search mode." |
| **Query** | Required; length 10–280 characters; no executable scripts. | "Please enter a query between 10 and 280 characters." |
| **Max Results** *(if exposed)* | Optional; integer between 1 and 50; default 20. | "Please request between 1 and 50 results." |
| **Source URL** *(result)* | If present, must be a valid URL format. | Invalid URLs are not rendered as clickable links. |
| **Email** *(contact)* | If present, must be a valid email format before being rendered as a mailto link. | Invalid emails are shown as plain text or omitted. |
| **LinkedIn URL** *(contact)* | If present, must be a valid URL format before being rendered as a link. | Invalid URLs are shown as plain text or omitted. |
| **Result Count** | Non-negative integer. | Internal consistency check. |

---

## 7. Business-Level Input / Output Data Model

### 7.1 Inputs

| Entity | Attribute | Type | Business Meaning |
|--------|-----------|------|------------------|
| **Search Request** | `query` | Text (10–280 chars) | The natural-language request from the user. |
| | `mode` | Enum | UI label: *Job Search* or *Sales Lead Search*. Maps to the n8n mode value (e.g., `jobs` / `leads`). |
| | `maxResults` | Integer (optional) | Desired maximum number of result items. Default 20, maximum 50 unless decided otherwise. |
| **Extracted Concepts** *(backend responsibility)* | `location` | Text | Geographic or remote-work intent parsed from the query. |
| | `role` / `title` | Text | Job title or role inferred for job searches. |
| | `industry` | Text | Industry/vertical inferred for lead searches. |
| | `companySize` | Text | Size criteria inferred for lead searches. |
| | `employmentType` | Text | Full-time, part-time, contract, etc. |

### 7.2 Outputs

The output payload is the exact business object returned by the existing n8n workflow. Transport envelope concerns (request IDs, status codes, timestamps) are out of scope for Gate G1 and will be defined in Gate G2.

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

| Entity | Attribute | Type | Business Meaning |
|--------|-----------|------|------------------|
| **Search Response** | `mode` | Enum | `"jobs"` or `"leads"` (exact values to be confirmed with the n8n workflow). |
| | `intent_summary` | Text | Human-readable summary of what the backend understood from the query. |
| | `assumptions` | Array of text | Explicit assumptions the backend made while interpreting the query. |
| | `leads` | Array | List of result items. Each item may represent a job or a sales lead. |
| | `notes` | Text | Additional free-form notes from the backend. |
| **Result Item** (`leads[]`) | `type` | Enum | `"job"` for job results, `"lead"` for sales-lead results. |
| | `company` | Text | Company or organization name. |
| | `domain` | Text | Company domain (e.g., `example.com`). |
| | `location` | Text | Geographic location or region. |
| | `remote_status` | Text | Remote/onsite/hybrid indicator, if applicable. |
| | `opportunity` | Text | For jobs: job title. For leads: opportunity title or signal. |
| | `source_url` | URL | Link to the original source. |
| | `why_it_fits` | Text | Reason the result matches the user's request. |
| | `priority` | Text | Priority or relevance indicator (e.g., High, Medium, Low). |
| | `posted_date` | Date | Date the opportunity was posted or identified (ISO 8601). |
| | `days_old` | Integer | Number of days since `posted_date`. |
| | `contacts` | Array | List of relevant contacts. |
| **Contact** (`contacts[]`) | `name` | Text | Contact person's name. |
| | `title` | Text | Contact's job title or role. |
| | `email` | Email | Contact email address. |
| | `email_status` | Enum | Verification status from Hunter (e.g., `valid`, `invalid`, `unknown`). |
| | `linkedin_url` | URL | Contact's LinkedIn profile URL. |

---

## 8. Dependencies

1. **Self-hosted n8n instance** – Must be running, reachable, and operating reliably to receive requests and execute the existing workflow.
2. **Firecrawl** – Used by the n8n workflow for web search and scraping; dependency on service availability and rate limits.
3. **Hunter** – Used by the n8n workflow for domain and email verification; dependency on service availability and rate limits.
4. **Next.js / React frontend** – Built and deployed to Vercel.
5. **Vercel hosting** – Must serve the frontend over HTTPS and support the chosen deployment model.
6. **Browser support** – Modern evergreen browsers (last two versions of Chrome, Firefox, Safari, Edge).

---

## 9. Assumptions, Constraints, and Reasoned Decisions

### 9.1 Assumptions

| ID | Assumption | Reasoning |
|----|------------|-----------|
| **A1** | The primary users are **active job seekers** and **founders/freelancers doing sales prospecting**. | Confirmed by the stakeholder in `docs/PROJECT-CONTEXT.md`. |
| **A2** | The MVP is auth-free and unmonetised. | Confirmed as a demo to showcase skills; no payments or accounts in scope. |
| **A3** | Data sources are public/free only. | Confirmed by stakeholder; aligns with no payments and no login-required sources. |
| **A4** | The n8n workflow **already exists** and uses **Firecrawl** (web search & scrape) and **Hunter** (domain & email verification). | Confirmed in `docs/PROJECT-CONTEXT.md`; removes backend-build uncertainty. |
| **A5** | The frontend is **Next.js / React** hosted on **Vercel**. | Confirmed in `docs/PROJECT-CONTEXT.md`. |
| **A6** | n8n is **self-hosted** on infrastructure operated by the team. | Confirmed in `docs/PROJECT-CONTEXT.md`. |
| **A7** | **Batch/async results** are acceptable for the MVP; **real-time/streaming is preferable if feasible**. | Confirmed in `docs/PROJECT-CONTEXT.md`; keeps performance expectations realistic. |
| **A8** | No brand guidelines exist; a neutral, accessible design is acceptable. | Confirmed in `docs/PROJECT-CONTEXT.md`. |
| **A9** | Default result set size is 20 items, with a maximum of 50 items per request, unless decided otherwise. | Reasonable starting point for performance and usability; recorded as a working assumption. |
| **A10** | Displaying attributed external links complies with source terms. | Public/free data with source URLs implies attribution; legal/compliance constraints were declared none for this demo. |
| **A11** | A single shared instance is acceptable for the MVP. | No multi-tenancy or user accounts are required. |

### 9.2 Constraints

- Do not specify technical architecture, API contracts, or n8n node configuration; these belong to Gate G2.
- Do not produce visual designs, brand assets, or component mock-ups; these belong to Gate G4.
- Requirements must remain testable and traceable without prescribing implementation.
- Scope remains limited to the MVP: no auth, no payments, no native apps, no CRM integration.

---

## 10. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| **R1** | Self-hosted n8n instance experiences downtime, version drift, or ops issues. | Medium | High | Document deployment and backup procedures; monitor instance health; maintain a staging environment. |
| **R2** | Firecrawl or Hunter impose rate limits, pricing changes, or service outages. | Medium | High | Implement graceful degradation (NFR-6); set per-source timeouts; cache results where permitted; monitor source health. |
| **R3** | End-to-end search exceeds the 15-second target due to n8n + external API latency. | High | Medium | Set per-source timeouts; return partial results; optimize workflow concurrency in Gate G2; fallback to async if needed. |
| **R4** | Public, unauthenticated app is exposed to abuse or excessive cost. | Low | Medium | Add per-session rate limiting and a daily query cap at the hosting or backend layer; keep authentication out of MVP scope. |
| **R5** | Contact data quality from Hunter is inaccurate or outdated. | Medium | Medium | Display `email_status` prominently; do not guarantee deliverability; allow users to verify before outreach. |
| **R6** | Result relevance is poor because public/free sources are noisy. | Medium | High | Start with narrow, well-understood verticals; iterate on prompt/source selection; run weekly spot checks. |
| **R7** | "Aesthetically pleasing" is subjective and causes design rework. | Medium | Medium | Gather 1–2 design references before Gate G4; set an early design-review checkpoint. |
| **R8** | Real-time/streaming may not be feasible with the current n8n workflow. | Medium | Low-Medium | Default to batch UX; implement streaming only if proven feasible in Gate G2 without compromising reliability. |

---

## 11. Clarifications Needed / Gate G1 Approval

### 11.1 Gate G1 Questions — Answered

All open questions from the initial Gate G1 discovery have been answered in `docs/PROJECT-CONTEXT.md` and are reflected in this BRD:

| # | Question | Answer |
|---|----------|--------|
| 1 | Target user | Active job seekers + founders/freelancers doing sales prospecting. |
| 2 | Auth / monetisation | None in MVP; this is a demo. |
| 3 | Data sources / budget | Public/free only. |
| 4 | n8n hosting | Self-hosted n8n instance. |
| 5 | Results model | Batch/async acceptable; real-time/streaming preferable if feasible. |
| 6 | Success metrics | No concerns; working assumptions retained from PRD. |
| 7 | Brand guidelines | None. |
| 8 | n8n backend / tools | Already built; uses Firecrawl + Hunter. |
| 9 | Frontend stack / hosting | Next.js / React on Vercel. |
| 10 | Legal / compliance | None identified for this demo. |

### 11.2 New Items to Resolve Early in Gate G2

These are not Gate G1 blockers, but should be confirmed during architecture so the BRD can be updated if needed:

1. **Exact n8n mode values** – Confirm whether the workflow uses `"jobs"` / `"leads"` or different strings, and how the UI maps to them.
2. **Contact population by mode** – Confirm whether `contacts[]` is populated for both job and lead results, or only for one mode.
3. **Result limits** – Confirm the default and maximum result set size (assumed 20 / 50) and where the limit is enforced (n8n workflow vs. frontend).
4. **Real-time/streaming feasibility** – Confirm whether the existing n8n workflow can support streaming partial results without major redesign.
5. **Error/partial-failure payload shape** – Confirm how the frontend distinguishes complete failure, partial failure, and empty results from the n8n workflow.

### 11.3 Conflicts and Flags

- **PRD vs. latest context:** `docs/PRD.md` assumed the n8n workflow did not yet exist and deferred several decisions to G2. `docs/PROJECT-CONTEXT.md` confirms the workflow exists and the stack is fixed. This BRD follows the latest stakeholder confirmation.
- **No legal/compliance review:** The stakeholder stated no legal constraints, but Firecrawl and Hunter terms of service still apply. A quick G2 compliance sanity check is recommended even though it is not a formal requirement.

---

## 12. Traceability Matrix

| Requirement | User Story | Acceptance Criteria | Related NFR |
|-------------|------------|---------------------|-------------|
| FR-1 | US-1 | AC-1, AC-2 | NFR-4 |
| FR-2 | US-2 | AC-1 | NFR-3, NFR-4 |
| FR-3 | US-2, US-3 | US-2 AC-2, US-3 AC-1, AC-2 | NFR-1, NFR-5 |
| FR-4 | US-3, US-4 | US-3 AC-1 | NFR-10, NFR-12 |
| FR-5 | US-4 | AC-1, AC-2 | NFR-1, NFR-3 |
| FR-6 | US-5 | AC-1 | NFR-3 |
| FR-7 | US-5, US-10 | US-5 AC-1, AC-2; US-10 AC-1 | NFR-4 |
| FR-8 | US-6 | AC-1 | NFR-3 |
| FR-9 | US-6, US-10 | US-6 AC-1, AC-2; US-10 AC-1 | NFR-4 |
| FR-10 | US-5, US-6 | AC-2 | NFR-3 |
| FR-11 | US-8 | AC-1 | NFR-6 |
| FR-12 | US-8 | AC-2 | NFR-5, NFR-6 |
| FR-13 | US-2 | AC-2 | NFR-4, NFR-8 |
| FR-14 | US-7 | AC-1, AC-2 | NFR-4 |
| FR-15 | US-9 | AC-1 | NFR-4 |
| FR-16 | US-10 | AC-1, AC-2 | NFR-3 |
| FR-17 | US-11 | AC-1, AC-2, AC-3, AC-4 | NFR-3, NFR-4 |

---

## 13. Approval

| Role | Name | Signature / Date | Status |
|------|------|------------------|--------|
| Product Owner / Client | *(DELL)* | _________________ | Pending |
| Business Analyst | Subagent | 2026-10-20 | Updated draft complete |

**Next Step:** Resolve any remaining G2-bound clarifications in Section 11.2 and obtain product-owner approval before proceeding to Gate G2 (Architecture & Design).

---

## 14. Change Log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-10-20 | Business Analyst subagent | Initial BRD for Gate G1 review. |
| 1.1 | 2026-10-20 | Business Analyst subagent | Updated to reflect confirmed stack (Next.js/Vercel, self-hosted n8n), existing Firecrawl + Hunter workflow, exact n8n output schema, and answered G1 questions. Added context/contact display requirements, updated risks, and aligned query-length validation with PRD. |
