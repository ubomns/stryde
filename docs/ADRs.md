# Architecture Decision Records (ADRs)

## Document control

| Field | Value |
|-------|-------|
| Status | Draft for Gate G2 approval |
| Author | Solution Architect subagent |
| Date | 2026-10-20 |

---

## ADR-001: Next.js / Vercel for the portfolio demo frontend

### Context

The project needs a simple, fast, aesthetically pleasing web UI that can be deployed quickly for a portfolio demo. The stakeholder has already indicated a preference for Next.js / React and Vercel.

### Decision

Use **Next.js (App Router)** with **React Server Components and Client Components** where appropriate, hosted on **Vercel**.

### Consequences

**Pros**

- Zero-infrastructure hosting with automatic preview deployments.
- Built-in Edge Middleware and serverless Route Handlers, removing the need for a separate backend.
- Excellent static and dynamic rendering options for a search-focused page.
- Familiar stack for frontend developers; easy to showcase in a portfolio.
- Free tier is sufficient for demo traffic.

**Cons**

- Tied to the Vercel platform for the simplest deployment path.
- Serverless function cold starts can add ~100–300 ms to the first `/api/v1/search` request.
- Less control over runtime than a self-hosted Node.js server.

### Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| Plain React + static host (e.g., GitHub Pages) | Cannot hide the n8n webhook URL or run server-side rate limiting. |
| Vue / Nuxt | Fine technically, but Next.js is the stated stakeholder preference and has stronger Vercel integration. |
| SvelteKit | Similar to Nuxt; adds unfamiliarity without a clear advantage for this demo. |

### Status

Accepted.

---

## ADR-002: Use a thin Next.js API route instead of calling n8n directly from the browser

### Context

The project constraint says "No custom backend proxy unless strongly justified (keep the stack thin)." The simplest connection would be for the browser to call the n8n webhook directly. However, doing so would expose the n8n webhook URL and any secret to anyone who inspects the frontend bundle or network traffic.

### Decision

Introduce a **thin, stateless Next.js Route Handler at `/api/v1/search`** that forwards requests to the n8n webhook.

This is **not** a separate custom backend service; it is a single serverless function co-located with the frontend on Vercel. Its only responsibilities are input validation, rate limiting, optionally attaching the n8n shared secret, and returning the n8n response unchanged.

### Consequences

**Pros**

- The n8n webhook URL and secret are never exposed to the browser.
- Rate limiting can be enforced server-side by IP.
- CORS is controlled at the Vercel layer.
- Keeps the n8n workflow focused on business logic; the handler is pure transport.
- Easy to extend later (logging, caching, request transformation) without a new service.

**Cons**

- Adds one small serverless function to the codebase.
- Slightly more latency than a direct call (one extra hop, typically < 100 ms).

### Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| Browser calls n8n webhook directly | Exposes webhook URL and secret; cannot enforce server-side rate limits; trivial to abuse with curl. |
| Separate Express / NestJS proxy | Adds a whole service, deployment pipeline, and ops overhead. Overkill for a demo. |
| Vercel Edge Middleware rewrites to n8n | Possible, but less idiomatic and harder to transform request/response bodies than a Route Handler. |

### Status

Accepted.

---

## ADR-003: Batch / async UX over real-time streaming for the MVP

### Context

The n8n workflow orchestrates Firecrawl and Hunter calls. The current workflow is webhook-driven and returns only when all upstream calls complete. Stakeholders said batch/async is acceptable and real-time/streaming is preferable only if feasible.

### Decision

Implement a **batch / async UX for the MVP** with a polished loading state. Defer streaming to a post-MVP experiment.

### Consequences

**Pros**

- Aligns with the existing n8n webhook pattern; no workflow redesign required.
- Simpler client state: one request, one response.
- Lower risk of partial-result corruption or connection-drop handling.
- Skeleton loaders and reassuring copy adequately address the 3–12 s wait for a demo.

**Cons**

- Users wait for the full set before seeing anything.
- Perceived latency is higher than an incremental stream, even if total time is the same.

### Streaming assessment

Streaming partial results from n8n is technically possible but non-trivial:

- n8n Webhook nodes are synchronous; they wait for a *Respond to Webhook* node.
- Streaming would require WebSocket, Server-Sent Events, or callback mechanisms not present in the existing workflow.
- It would not reduce total time spent in Firecrawl / Hunter; it would only improve perceived speed.

If user feedback shows wait time hurts activation, the next step is a controlled experiment using **Server-Sent Events (SSE)** from a redesigned n8n workflow or a lightweight polling endpoint.

### Status

Accepted for MVP; streaming recorded as a future experiment.

---

## ADR-004: No end-user authentication for the demo

### Context

The project is an auth-free, unmonetised portfolio demo. Adding authentication would slow down development, complicate the UX, and reduce the "try it immediately" appeal.

### Decision

Do **not** implement user authentication, accounts, or sessions for the MVP.

### Consequences

**Pros**

- Faster development and simpler codebase.
- Zero-friction user experience; visitors can search immediately.
- No need to store passwords, manage tokens, or comply with auth-related security obligations.

**Cons**

- No per-user history, saved searches, or personalisation.
- Abuse protection is limited to IP-based rate limiting and an optional shared webhook secret.
- Cannot offer paid tiers or gated features later without adding auth.

### Mitigations

- IP-based rate limiting in Vercel Edge Middleware (10 req/min, 50 req/day per IP).
- Optional shared secret between Next.js handler and n8n webhook. For the demo this is **recommended but optional** because the stakeholder is not yet comfortable configuring it in n8n. If the secret is not configured, the handler skips the header and logs a warning; this must be remediated before any production launch.
- Optional global daily cap inside n8n if Firecrawl / Hunter free tiers require it.
- Client-side session debounce as a secondary, easily bypassed hint.

### Status

Accepted for MVP; authentication is a post-MVP consideration if the app moves beyond a demo.

---

## Change log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-10-20 | Solution Architect | Initial ADRs for Gate G2. |
| 1.1 | 2026-10-20 | Solution Architect | Clarified that the shared webhook secret is recommended but optional for the demo. |
