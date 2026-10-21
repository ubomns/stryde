# Stryde — Jobs & Sales Leads Search Demo

<p align="center">
  <strong>Natural-language search for jobs and sales leads</strong><br>
  <em>Powered by Next.js, n8n, Firecrawl, and Hunter</em>
</p>

<p align="center">
  <a href="https://jobs-leads-search.vercel.app">Live Demo</a> ·
  <a href="https://github.com/ubomns/stryde">GitHub</a> ·
  <a href="docs/API-CONTRACT.md">API Contract</a> ·
  <a href="docs/DEPLOY-RUNBOOK.md">Deploy Runbook</a>
</p>

---

## Table of contents

- [Overview](#overview)
- [What it does](#what-it-does)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment variables](#environment-variables)
  - [Running locally](#running-locally)
  - [Using mock data](#using-mock-data)
- [API reference](#api-reference)
  - [`POST /api/v1/search`](#post-apiv1search)
  - [Response schema](#response-schema)
  - [Error codes](#error-codes)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Production readiness](#production-readiness)
- [Known limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)
- [Project documentation](#project-documentation)
- [License](#license)

---

## Overview

**Stryde** is a portfolio-ready web demo that lets users type plain-English queries like:

> *“Remote senior React developer roles in Berlin”*

> *“SaaS fintech startups in Europe hiring sales reps”*

The app forwards the request to a self-hosted **n8n** workflow that orchestrates **Firecrawl** (web search and scraping) and **Hunter** (domain and email verification), then renders curated results in a clean, responsive UI.

This project was built following an 11-gate delivery workflow: Discovery → Architecture → Planning → Design → Build → Code Review → QA → Harden → Ship → Polish → Closeout.

---

## What it does

1. **User selects a mode:** Jobs, Leads, or Both.
2. **User types a natural-language query** (10–1000 characters).
3. **Frontend validates input** and sends a request to `/api/v1/search`.
4. **Next.js API route** enforces CORS, IP rate limits, and input validation.
5. **Route forwards to n8n** over HTTPS with Basic Auth.
6. **n8n calls Firecrawl and Hunter**, then returns structured results.
7. **Frontend renders result cards** with source links, priority/recency sorting, and verified contacts.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Components | [shadcn/ui](https://ui.shadcn.com/) |
| Validation | [Zod](https://zod.dev/) |
| Testing | [Vitest](https://vitest.dev/) |
| Hosting | [Vercel](https://vercel.com/) |
| Backend workflow | [n8n](https://n8n.io/) |
| Web search/scrape | [Firecrawl](https://www.firecrawl.dev/) |
| Email verification | [Hunter](https://hunter.io/) |

---

## Architecture

```
┌─────────────────┐      POST /api/v1/search      ┌──────────────────┐
│   Browser UI    │ ─────────────────────────────> │  Next.js API     │
│  (Next.js app)  │                                │  Route Handler   │
└─────────────────┘                                └────────┬─────────┘
       ^                                                    │
       │                                                    │ HTTPS + Basic Auth
       │                                                    ▼
       │                                           ┌──────────────────┐
       │                                           │   Self-hosted    │
       │                                           │   n8n workflow   │
       │                                           └────────┬─────────┘
       │                                                    │
       │                            ┌──────────┐   ┌────────▼────────┐
       │                            │ Firecrawl │   │     Hunter      │
       │                            │  search   │   │ email/verify    │
       │                            │  + scrape │   │                 │
       │                            └─────┬─────┘   └────────┬────────┘
       │                                  │                  │
       └──────────────────────────────────┴──────────────────┘
                                          │
                                          ▼
                              Structured JSON results
```

### Key design decisions

- **Thin API proxy:** The Next.js route does not implement business logic; it only validates, rate-limits, and forwards to n8n.
- **Sync request model:** Kept simple for the demo. n8n must respond within Vercel's 10-second Hobby timeout.
- **Mock-data fallback:** Set `USE_MOCK_DATA=true` to develop the UI without n8n.
- **In-memory rate limiting:** Sufficient for a demo; production should use Vercel KV, Redis, or an edge WAF.

---

## Project structure

```
.
├── docs/                           # Project documentation
│   ├── API-CONTRACT.md
│   ├── ARCHITECTURE.md
│   ├── CLOSEOUT.md
│   ├── CODE-REVIEW.md
│   ├── DEPLOY-RUNBOOK.md
│   ├── DESIGN-SPEC.md
│   ├── N8N-OPTIMIZATION.md
│   ├── PRD.md
│   ├── PRODUCTION-NOTES.md
│   ├── PROJECT-CONTEXT.md
│   ├── QA-REPORT.md
│   ├── SECURITY-REVIEW.md
│   └── WBS.md
├── public/                         # Static assets
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── about/page.tsx          # About page
│   │   ├── api/v1/search/route.ts  # Search API route
│   │   ├── globals.css             # Global styles + Tailwind
│   │   ├── layout.tsx              # Root layout + metadata
│   │   └── page.tsx                # Home / search page
│   ├── components/                 # React components
│   │   ├── contact-row.tsx
│   │   ├── context-card.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   ├── loading-state.tsx
│   │   ├── mode-toggle.tsx
│   │   ├── result-card.tsx
│   │   ├── result-list.tsx
│   │   ├── search-form.tsx
│   │   └── ui/                     # shadcn/ui primitives
│   ├── lib/                        # Shared utilities
│   │   ├── mock-data.ts
│   │   ├── sort.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   ├── validation.ts
│   │   └── *.test.ts               # Unit tests
│   └── proxy.ts                    # Next.js 16 middleware proxy (rate limiting)
├── .env.example                    # Environment variable template
├── .env.local                      # Local secrets (gitignored)
├── next.config.ts                  # Next.js config + security headers
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## Getting started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- (Optional) A running n8n instance with the Stryde webhook workflow
- (Optional) A Vercel account for deployment

### Installation

```bash
git clone https://github.com/ubomns/stryde.git
cd stryde
npm install
```

### Environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required for n8n webhook forwarding
N8N_WEBHOOK_URL=https://your-ngrok-url.ngrok-free.dev/webhook/stryde
N8N_WEBHOOK_USERNAME=your_n8n_username
N8N_WEBHOOK_PASSWORD=your_n8n_password

# Optional: set to true to return local mock data instead of calling n8n
USE_MOCK_DATA=false

# Canonical app URL used for CORS and metadata
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Security note:** Never commit `.env.local`. It is gitignored by default.

### Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Using mock data

To develop the UI without a live n8n backend:

```env
USE_MOCK_DATA=true
```

The API will return realistic mock results for all three modes.

---

## API reference

### `POST /api/v1/search`

The locked API contract between the frontend and the n8n workflow.

#### Request body

```json
{
  "mode": "jobs",
  "query": "Remote senior React developer roles in Berlin",
  "maxResults": 5
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `mode` | string | Yes | `"jobs"`, `"clients"`, or `"both"` |
| `query` | string | Yes | 10–1000 characters |
| `maxResults` | number | No | 1–15 (default: 10) |

#### Response schema

```json
{
  "results": [
    {
      "title": "Senior Frontend Engineer",
      "source_url": "https://example.com/job/123",
      "summary": "Build React apps...",
      "date": "2026-10-15",
      "priority": 8,
      "contacts": [
        {
          "name": "Jane Doe",
          "title": "Engineering Manager",
          "email": "jane@example.com",
          "email_status": "valid",
          "linkedin_url": "https://linkedin.com/in/janedoe"
        }
      ]
    }
  ],
  "context": {
    "assumptions": ["Remote-first role", "React experience required"],
    "recommendations": ["Tailor resume to React"]
  }
}
```

#### Error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Request body failed Zod validation. |
| `CONFIGURATION_ERROR` | 500 | Missing or invalid server environment variables. |
| `BACKEND_ERROR` | 502 | n8n returned a non-2xx response or malformed JSON. |
| `TIMEOUT_ERROR` | 504 | Upstream n8n call exceeded 10 seconds. |
| `RATE_LIMITED` | 429 | IP exceeded 10 req/min or 50 req/day. |

---

## Testing

```bash
# Run unit tests
npm test

# Production build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

Current status: **26/26 tests pass**, build succeeds, lint passes.

---

## Deployment

See [`docs/DEPLOY-RUNBOOK.md`](docs/DEPLOY-RUNBOOK.md) for the full procedure.

Quick preview deploy:

```bash
npm run build
npm test
npm run lint
vercel --yes
```

Promote to production:

```bash
vercel --prod
```

After the first deploy, set these environment variables in the Vercel dashboard:

- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_USERNAME`
- `N8N_WEBHOOK_PASSWORD`
- `NEXT_PUBLIC_APP_URL`
- `USE_MOCK_DATA`

---

## Security

- Server-side input validation with Zod.
- HTTPS enforcement before sending Basic Auth credentials.
- CORS restricted to the configured app origin.
- IP-based rate limiting via `src/proxy.ts`.
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- External URLs validated before rendering.
- Generic error messages that do not leak stack traces or secrets.

Full details: [`docs/SECURITY-REVIEW.md`](docs/SECURITY-REVIEW.md)

---

## Production readiness

Before promoting to a public production deployment:

1. **Rotate n8n Basic Auth credentials** — replace weak demo values like `admin` / `rootUser`.
2. **Optimize the n8n workflow** to respond reliably within 10 seconds, or upgrade to Vercel Pro for longer timeouts. See [`docs/N8N-OPTIMIZATION.md`](docs/N8N-OPTIMIZATION.md).
3. **Replace in-memory rate limiting** with Vercel KV, Redis, or an edge WAF.
4. **Use a stable n8n host** instead of a free ngrok tunnel that changes on restart.
5. **Add structured logging and monitoring** (e.g., Vercel Analytics, Sentry).

See [`docs/PRODUCTION-NOTES.md`](docs/PRODUCTION-NOTES.md).

---

## Known limitations

- **10-second timeout** on Vercel Hobby serverless functions. The current n8n workflow takes ~24 seconds, so production queries will time out unless n8n is optimized or Vercel Pro is used.
- **In-memory rate limiting** does not scale across multiple serverless workers.
- **No user authentication** in the MVP; abuse protection relies on IP limits.
- **Demo credentials** in `.env.local` are not safe for public use.

---

## Troubleshooting

### API returns `CONFIGURATION_ERROR`

Ensure all required environment variables are set in Vercel (or `.env.local` locally):

```env
N8N_WEBHOOK_URL
N8N_WEBHOOK_USERNAME
N8N_WEBHOOK_PASSWORD
```

### API returns `TIMEOUT_ERROR`

The n8n workflow took longer than 10 seconds. Options:

1. Optimize n8n (`docs/N8N-OPTIMIZATION.md`).
2. Reduce `maxResults`.
3. Upgrade to Vercel Pro for up to 300-second function timeouts.
4. Switch to an async/polling architecture (documented trade-off in `docs/CLOSEOUT.md`).

### CORS errors in the browser

Make sure `NEXT_PUBLIC_APP_URL` matches the deployed origin, including `https://`.

### Rate limited

The app allows 10 requests per minute and 50 per day per IP. Wait a minute and try again.

---

## Project documentation

| Document | Purpose |
|----------|---------|
| [`docs/CLOSEOUT.md`](docs/CLOSEOUT.md) | Final project summary, gate status, and handoff. |
| [`docs/PROJECT-CONTEXT.md`](docs/PROJECT-CONTEXT.md) | Living project overview and current gate status. |
| [`docs/PRD.md`](docs/PRD.md) | Product Requirements Document. |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture and data flow. |
| [`docs/API-CONTRACT.md`](docs/API-CONTRACT.md) | Locked API contract between frontend and n8n. |
| [`docs/DESIGN-SPEC.md`](docs/DESIGN-SPEC.md) | UI/UX design specification. |
| [`docs/WBS.md`](docs/WBS.md) | Work breakdown structure and sprint plan. |
| [`docs/CODE-REVIEW.md`](docs/CODE-REVIEW.md) | G6 code review findings. |
| [`docs/QA-REPORT.md`](docs/QA-REPORT.md) | G7 QA test report. |
| [`docs/SECURITY-REVIEW.md`](docs/SECURITY-REVIEW.md) | G8 security review. |
| [`docs/DEPLOY-RUNBOOK.md`](docs/DEPLOY-RUNBOOK.md) | Step-by-step Vercel deployment guide. |
| [`docs/N8N-OPTIMIZATION.md`](docs/N8N-OPTIMIZATION.md) | How to speed up the n8n workflow. |
| [`docs/PRODUCTION-NOTES.md`](docs/PRODUCTION-NOTES.md) | Production upgrade notes. |

---

## License

This is a personal portfolio demo project. It is not licensed for commercial redistribution.
