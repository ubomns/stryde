# API Contract — Jobs & Sales Leads Search UI + n8n Workflow

## Document control

| Field | Value |
|-------|-------|
| Status | Draft for Gate G2 approval |
| Author | Solution Architect subagent |
| Date | 2026-10-20 |
| Version | v1.1.0 |
| Next gate | G3 (Build / parallel development) |

---

## 1. Purpose and scope

This contract defines the interface between the Next.js frontend and the existing self-hosted n8n backend. It is intentionally minimal: one endpoint, one request shape, and one response shape.

- The frontend calls only the Vercel-hosted Next.js endpoint described below.
- The Next.js Route Handler forwards the request to the n8n webhook and returns the n8n response unchanged.
- The n8n output schema is **locked** for the MVP and must be returned as-is.

---

## 2. Base URL and versioning

### 2.1 Frontend-facing base URL

The frontend uses a relative path so the same build works across production and preview deployments:

```text
/api/v1/search
```

On a deployed Vercel project this resolves to:

```text
https://<vercel-domain>/api/v1/search
```

### 2.2 n8n webhook URL

The Next.js Route Handler forwards requests to the n8n webhook URL stored in the `N8N_WEBHOOK_URL` environment variable. The exact URL is an implementation detail, but it must accept the request payload defined in this contract and return the locked response schema.

Example convention:

```text
https://n8n.example.com/webhook/search-v1
```

### 2.3 Versioning strategy

- The API is versioned in the URL path (`/api/v1/search`).
- A new major version is required only when the request or response schema changes in a breaking way.
- For the MVP only **v1** exists. Any future schema change must go through stakeholder approval and result in `/api/v2/search` and a corresponding n8n webhook path.

---

## 3. Authentication

- **No end-user authentication** is required for the demo.
- The Next.js Route Handler authenticates to the n8n webhook using **HTTP Basic Authentication** (username and password). These credentials are stored in Vercel environment variables and are never sent to the browser.
- The n8n Webhook node is configured to require basic auth; requests without valid credentials are rejected.
- For this demo the credentials are the n8n basic-auth username/password. Rotating them requires updating both n8n and the Vercel environment variables.

---

## 4. Endpoints

### 4.1 Submit a search

```http
POST /api/v1/search
Content-Type: application/json
Origin: https://<vercel-domain>
```

#### Request body

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| `mode` | string | Yes | Enum: `"jobs"`, `"clients"`, `"both"` | — |
| `query` | string | Yes | Length 10–1000 characters; no executable scripts | — |
| `maxResults` | integer | No | 1–15 inclusive | `15` |

#### Example request

```http
POST /api/v1/search HTTP/1.1
Host: jobs-leads-search.vercel.app
Content-Type: application/json
Origin: https://jobs-leads-search.vercel.app

{
  "mode": "jobs",
  "query": "Remote AI automation roles at US companies",
  "maxResults": 15
}
```

---

## 5. Response payload schema

### 5.1 Success response

**HTTP status:** `200 OK`

**Content-Type:** `application/json`

The response body is the **locked n8n output schema**. The Next.js handler does not wrap, rename, or transform fields.

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

### 5.2 Field reference

| Field | Type | Description |
|-------|------|-------------|
| `mode` | string | `"jobs"`, `"clients"`, or `"both"`. Must match the requested mode in a successful execution. |
| `intent_summary` | string | Human-readable summary of what the backend understood from the query. |
| `assumptions` | array of strings | Explicit assumptions made while interpreting the query. |
| `leads` | array of objects | Result items. May be empty. |
| `notes` | string | Free-form notes, especially useful for partial-failure warnings. |

#### Result item (`leads[]`)

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Expected values: `"job"` for `mode: "jobs"`, `"client"` for `mode: "clients"`, and `"both"` for `mode: "both"`. **Contract assumption:** these strings match the existing n8n workflow output. Confirm with the workflow before build if possible; if they differ, the frontend should render the returned value as a label without hard-coding these three strings. |
| `company` | string | Company or organization name. |
| `domain` | string | Company domain, e.g. `example.com`. |
| `location` | string | Geographic location or region. |
| `remote_status` | string | Remote/onsite/hybrid indicator. May be empty. |
| `opportunity` | string | Job title for jobs; opportunity title or signal for clients. |
| `source_url` | string (URL) | Link to the original source. May be empty. |
| `why_it_fits` | string | Reason the result matches the query. |
| `priority` | string | Priority or relevance indicator, e.g. `High`, `Medium`, `Low`. |
| `posted_date` | string (ISO 8601 date) | Date the opportunity was posted or identified. |
| `days_old` | integer | Number of days since `posted_date`. |
| `contacts` | array of objects | Relevant contacts. May be empty or omitted. |

#### Contact (`contacts[]`)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Contact person's name. |
| `title` | string | Contact's job title or role. |
| `email` | string (email) | Contact email address. |
| `email_status` | string | Hunter verification status, e.g. `valid`, `invalid`, `unknown`. |
| `linkedin_url` | string (URL) | Contact's LinkedIn profile URL. May be empty. |

### 5.3 Empty-result response

When no results are found, the backend still returns `200 OK` with an empty `leads` array:

```json
{
  "mode": "jobs",
  "intent_summary": "Remote AI automation roles at US companies",
  "assumptions": ["No industry specified, searched broadly"],
  "leads": [],
  "notes": ""
}
```

### 5.4 Partial-failure response

When one data source fails but others succeed, the backend returns available results and describes the partial failure in `notes`:

```json
{
  "mode": "clients",
  "intent_summary": "SaaS fintech startups in Europe",
  "assumptions": ["Focused on companies with public websites"],
  "leads": [...],
  "notes": "Hunter contact verification was temporarily unavailable; results may lack verified emails."
}
```

---

## 6. Error response schema

All errors return a JSON envelope. The frontend uses `error.code` for logic and `error.message` for user-facing copy.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Query must be between 10 and 1000 characters.",
    "details": {
      "field": "query",
      "received": 5,
      "minimum": 10,
      "maximum": 1000
    }
  }
}
```

### 6.1 Error codes

| Code | HTTP status | Meaning |
|------|-------------|---------|
| `VALIDATION_ERROR` | `400` | Request payload failed validation (mode, query length, maxResults). |
| `UNSUPPORTED_MODE` | `400` | The requested mode is not supported by the backend. |
| `RATE_LIMITED` | `429` | Too many requests from this IP. |
| `BACKEND_ERROR` | `502` | n8n returned a non-2xx status or an unparseable response. |
| `TIMEOUT_ERROR` | `504` | n8n or an upstream data source did not respond in time. |
| `UNKNOWN_ERROR` | `500` | Unexpected failure in the Route Handler. |

### 6.2 HTTP status codes

| Status | When returned |
|--------|---------------|
| `200 OK` | Successful search, including empty results. |
| `400 Bad Request` | Invalid request payload. |
| `429 Too Many Requests` | Rate limit exceeded. |
| `500 Internal Server Error` | Unexpected handler failure. |
| `502 Bad Gateway` | n8n returned an error. |
| `504 Gateway Timeout` | n8n or upstream data source timed out. |

### 6.3 Example error responses

#### Validation error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Query must be between 10 and 1000 characters.",
    "details": {
      "field": "query",
      "received": 5,
      "minimum": 10,
      "maximum": 1000
    }
  }
}
```

#### Rate limited

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many searches. Please wait a minute and try again.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

#### Backend timeout

```json
{
  "error": {
    "code": "TIMEOUT_ERROR",
    "message": "The search took too long. Please try again or refine your query.",
    "details": {
      "timeoutSeconds": 20
    }
  }
}
```

---

## 7. CORS requirements

### 7.1 Frontend → Next.js Route Handler

The Next.js handler exposes CORS headers for browser requests:

- `Access-Control-Allow-Origin`: canonical production domain, plus preview domains if preview access is required.
- `Access-Control-Allow-Methods`: `POST, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type, X-Requested-With`
- `Access-Control-Allow-Credentials`: `false`

### 7.2 Next.js Route Handler → n8n webhook

- Communication is server-to-server over HTTPS.
- CORS is not required.
- If `N8N_WEBHOOK_SECRET` is set, the request must include the `X-N8N-Webhook-Secret` header.
- The n8n webhook can optionally restrict requests by source IP.

---

## 8. Complete example request / response

### 8.1 Job search example

#### Request

```http
POST /api/v1/search HTTP/1.1
Host: jobs-leads-search.vercel.app
Content-Type: application/json
Origin: https://jobs-leads-search.vercel.app

{
  "mode": "jobs",
  "query": "Remote AI automation roles at US companies",
  "maxResults": 5
}
```

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: https://jobs-leads-search.vercel.app

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

### 8.2 Client search example

#### Request

```http
POST /api/v1/search HTTP/1.1
Host: jobs-leads-search.vercel.app
Content-Type: application/json
Origin: https://jobs-leads-search.vercel.app

{
  "mode": "clients",
  "query": "SaaS fintech startups in Europe hiring sales reps",
  "maxResults": 5
}
```

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: https://jobs-leads-search.vercel.app

{
  "mode": "clients",
  "intent_summary": "SaaS fintech startups in Europe with active sales hiring",
  "assumptions": [
    "Focused on companies with public career pages",
    "European timezone preferred"
  ],
  "leads": [
    {
      "type": "client",
      "company": "Finnovate Ltd",
      "domain": "finnovate.example",
      "location": "London, UK",
      "remote_status": "Hybrid",
      "opportunity": "Hiring Account Executives",
      "source_url": "https://finnovate.example/careers",
      "why_it_fits": "Early-stage fintech SaaS expanding sales team",
      "priority": "High",
      "posted_date": "2026-10-15",
      "days_old": 5,
      "contacts": [
        {
          "name": "John Smith",
          "title": "VP of Sales",
          "email": "john@finnovate.example",
          "email_status": "valid",
          "linkedin_url": "https://linkedin.com/in/johnsmith"
        }
      ]
    }
  ],
  "notes": ""
}
```

### 8.3 Both modes example

#### Request

```http
POST /api/v1/search HTTP/1.1
Host: jobs-leads-search.vercel.app
Content-Type: application/json
Origin: https://jobs-leads-search.vercel.app

{
  "mode": "both",
  "query": "n8n workflow automation opportunities in Berlin",
  "maxResults": 10
}
```

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: https://jobs-leads-search.vercel.app

{
  "mode": "both",
  "intent_summary": "n8n workflow automation opportunities in Berlin",
  "assumptions": ["Combined job listings and prospective client companies"],
  "leads": [
    {
      "type": "job",
      "company": "Workflow GmbH",
      "domain": "workflow.example",
      "location": "Berlin, Germany",
      "remote_status": "Hybrid",
      "opportunity": "Automation Engineer",
      "source_url": "https://workflow.example/jobs/42",
      "why_it_fits": "Actively hiring for n8n automation expertise",
      "priority": "High",
      "posted_date": "2026-10-18",
      "days_old": 2,
      "contacts": []
    },
    {
      "type": "client",
      "company": "ProcessFirst UG",
      "domain": "processfirst.example",
      "location": "Berlin, Germany",
      "remote_status": "On-site",
      "opportunity": "Hiring operations talent — likely automation needs",
      "source_url": "https://processfirst.example/careers",
      "why_it_fits": "Growing ops team signals automation consulting opportunity",
      "priority": "Medium",
      "posted_date": "2026-10-16",
      "days_old": 4,
      "contacts": [
        {
          "name": "Anna Müller",
          "title": "Head of Operations",
          "email": "anna@processfirst.example",
          "email_status": "valid",
          "linkedin_url": "https://linkedin.com/in/annamueller"
        }
      ]
    }
  ],
  "notes": ""
}
```

---

## 9. n8n webhook contract

The following is the contract the Next.js Route Handler expects from n8n. Frontend developers do not need to implement against this directly, but it explains what the handler forwards.

### 9.1 Request received by n8n

```http
POST <N8N_WEBHOOK_URL> HTTP/1.1
Content-Type: application/json
Authorization: Basic <base64(username:password)>

{
  "mode": "jobs",
  "query": "Remote AI automation roles at US companies",
  "maxResults": 15
}
```

**Validation rules on the Next.js handler (before forwarding):**

- `mode` must be one of `"jobs"`, `"clients"`, `"both"`.
- `query` must be a string between 10 and 1000 characters.
- `maxResults` must be an integer between 1 and 15 inclusive; if omitted it defaults to 15.

### 9.2 Response expected from n8n

- **Success:** `200 OK` + locked JSON schema.
- **Partial failure:** `200 OK` + locked JSON schema with a non-empty `notes` field describing the issue.
- **Complete failure:** Non-2xx status + optional plain-text or JSON error body. The Route Handler maps this to `502` or `504`.

---

## 10. Gate G2 lock checklist

The following items are locked for Gate G3:

- [ ] `POST /api/v1/search` is the only frontend-facing endpoint.
- [ ] Request payload fields: `mode`, `query`, `maxResults`.
- [ ] `mode` enum values: `"jobs"`, `"clients"`, `"both"`.
- [ ] `query` length: 10–1000 characters.
- [ ] `maxResults` range: 1–15, default 15.
- [ ] Success response is the locked n8n output schema, returned unchanged.
- [ ] Error response envelope uses `error.code`, `error.message`, `error.details`.
- [ ] n8n webhook uses HTTP Basic Authentication; the Next.js Route Handler sends the configured username/password.
- [ ] CORS allows only Vercel production (and optionally preview) domains.

---

## 11. Open contract assumptions

The following items are documented as assumptions pending final confirmation from the existing n8n workflow:

1. **Result `type` strings.** The contract assumes n8n returns `"job"` for `mode: "jobs"`, `"client"` for `mode: "clients"`, and `"both"` for `mode: "both"`. If the workflow returns different strings, the frontend should treat `type` as an opaque label and render it without hard-coding the three values.
2. **Contacts in `both` mode.** It is assumed `contacts[]` may be populated for any result item where Hunter can verify an email, regardless of mode.
3. **Result count enforcement in n8n.** The 15-result maximum is enforced in the Next.js handler and must also be respected by the n8n workflow.

---

## 12. Change log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0.0 | 2026-10-20 | Solution Architect | Initial API contract for Gate G2. |
| 1.1.0 | 2026-10-20 | Solution Architect | Updated modes (`jobs`/`clients`/`both`), query length (1000), maxResults (15/15), and made webhook secret optional for the demo. |
| 1.2.0 | 2026-10-20 | Orchestrator | Confirmed n8n webhook uses HTTP Basic Authentication; updated auth sections accordingly. |
