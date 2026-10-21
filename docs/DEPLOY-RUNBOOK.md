# Deployment Runbook — Jobs & Sales Leads Search UI

## Document control

| Field | Value |
|-------|-------|
| Status | Draft for Gate G9 approval |
| Author | DevOps subagent |
| Date | 2026-10-21 |
| Target platform | Vercel (Hobby / Pro) |

---

## 1. Goal

Deploy the Next.js 16 frontend for the Stryde portfolio demo to Vercel and wire it to the self-hosted n8n webhook.

**Scope:** This runbook covers the first Vercel deployment (preview or production). It does **not** cover n8n infrastructure changes or Firecrawl/Hunter credential rotation.

---

## 2. Prerequisites

- [ ] A Vercel account (Hobby tier is sufficient for the demo).
- [ ] The `vercel` CLI installed locally. Verified version: `54.17.3`.
- [ ] The `vercel` CLI authenticated (`vercel login`).
- [ ] The self-hosted n8n instance is running and reachable over HTTPS.
- [ ] The ngrok tunnel is active and the webhook URL is known.
  - Current URL: `https://deskbound-octopus-modulator.ngrok-free.dev/webhook/stryde`
- [ ] n8n Webhook node is configured with **Basic Auth**.
- [ ] You have the n8n Basic Auth username and password.
- [ ] This repo is tracked in Git (GitHub, GitLab, or Bitbucket) if using Git integration.

---

## 3. Required environment variables

Set these in the Vercel dashboard or via `vercel env` for **Production** and **Preview** environments.

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `N8N_WEBHOOK_URL` | Yes | Full HTTPS URL of the n8n webhook node. | `https://deskbound-octopus-modulator.ngrok-free.dev/webhook/stryde` |
| `N8N_WEBHOOK_USERNAME` | Yes | Basic auth username configured in n8n. | `stryde_user` |
| `N8N_WEBHOOK_PASSWORD` | Yes | Basic auth password configured in n8n. | `stryde_pass` |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical app URL used for CORS and metadata. | `https://jobs-leads-search.vercel.app` |
| `USE_MOCK_DATA` | No | Set to `true` to return mock data instead of calling n8n. | `false` |

**Important:**
- Do **not** commit these values to Git. `.env.local` is gitignored via `.env*`.
- Store credentials as **encrypted** Vercel environment variables (default for `vercel env`).
- Rotate the n8n Basic Auth password before any public production use. The current demo credentials (`admin` / `rootUser`) are intentionally weak.

### Set variables with the Vercel CLI

```bash
vercel env add N8N_WEBHOOK_URL
vercel env add N8N_WEBHOOK_USERNAME
vercel env add N8N_WEBHOOK_PASSWORD
vercel env add NEXT_PUBLIC_APP_URL
```

When prompted, choose `Production` and `Preview` as appropriate.

---

## 4. Deployment options

### Option A: Vercel Git integration (recommended)

1. Push the current branch to your Git remote.
2. In the Vercel dashboard, create a new project and import the repository.
3. Vercel auto-detects Next.js. Use the default build settings:
   - Build command: `next build`
   - Output directory: (leave default)
   - Install command: `npm install`
4. Add the environment variables from Section 3.
5. Deploy. Vercel will create a **Preview** deployment for the branch.
6. To promote to **Production**, merge to the production branch (usually `main`) or manually trigger a production deployment.

### Option B: Vercel CLI

From the project root:

```bash
# 1. Link the project (one-time)
vercel

# 2. Deploy a preview (safe, does not affect production)
vercel --yes

# 3. Deploy to production — requires explicit user approval
vercel --prod
```

> **Warning:** Do not run `vercel --prod` without explicit stakeholder approval.

---

## 5. Pre-deploy checks

Run these locally before every deploy:

```bash
npm run build
npm test
npm run lint
```

Expected results:
- `npm run build` completes with `✓ Compiled successfully` and no TypeScript errors.
- `npm test` reports all tests passing (current baseline: 26/26).
- `npm run lint` exits with no errors.

If any step fails, do not deploy. Fix the issue and re-run.

---

## 6. Post-deploy smoke tests

After a successful preview or production deploy, verify the deployment with these checks.

### 6.1 Homepage loads

```bash
# Replace <DEPLOY_URL> with the Vercel preview or production URL.
curl -I https://<DEPLOY_URL>/
```

Expected: `HTTP/2 200` and security headers present (`strict-transport-security`, `content-security-policy`, `x-frame-options: DENY`).

### 6.2 Search endpoint returns results

```bash
curl -X POST https://<DEPLOY_URL>/api/v1/search \
  -H "Content-Type: application/json" \
  -H "Origin: https://<DEPLOY_URL>" \
  -d '{"mode":"jobs","query":"Remote AI automation roles","maxResults":3}'
```

Expected: HTTP `200` with a JSON body matching the locked n8n output schema (`mode`, `intent_summary`, `assumptions`, `leads[]`, `notes`).

### 6.3 Validation errors work

```bash
curl -X POST https://<DEPLOY_URL>/api/v1/search \
  -H "Content-Type: application/json" \
  -H "Origin: https://<DEPLOY_URL>" \
  -d '{"mode":"jobs","query":"short","maxResults":3}'
```

Expected: HTTP `400` with `{ error: { code: "VALIDATION_ERROR", ... } }`.

### 6.4 Rate limiting works

Send more than 10 POST requests to `/api/v1/search` from the same IP within one minute.

Expected: HTTP `429` with `{ error: { code: "RATE_LIMITED", ... } }` and a `Retry-After: 60` header.

### 6.5 Browser end-to-end

1. Open the deploy URL in a browser.
2. Select **Jobs**, enter a 10+ character query, and submit.
3. Confirm loading state, then results render.
4. Repeat for **Leads** (`clients`) and **Both** modes.
5. Check the browser console for CSP or CORS errors.

---

## 7. Rollback procedure

Vercel does not have a single "rollback" button for CLI deployments, but you can revert quickly:

### Option A: Re-deploy a previous production deployment (dashboard)

1. Go to the Vercel project dashboard → **Deployments**.
2. Find the last known-good production deployment.
3. Click **…** → **Promote to Production**.

### Option B: Revert via Git

1. Revert the offending commit on the production branch.
2. Push the revert.
3. Vercel will build and deploy the previous state automatically (Git integration).

### Option C: CLI re-deploy of a previous build

```bash
# List recent deployments
vercel list

# Deploy a previous version by ID to production (requires approval)
vercel --prod <DEPLOYMENT_URL>
```

### Emergency: disable the search endpoint

If the n8n webhook is compromised or abused:

1. In Vercel, temporarily set `USE_MOCK_DATA=true` and re-deploy.
2. Rotate the n8n Basic Auth credentials.
3. Update `N8N_WEBHOOK_USERNAME` and `N8N_WEBHOOK_PASSWORD` in Vercel.
4. Set `USE_MOCK_DATA=false` and re-deploy.

---

## 8. Known limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Vercel Hobby serverless timeout is 10 s.** | The n8n workflow must respond within 10 s or the user sees a timeout error. | The Route Handler (`src/app/api/v1/search/route.ts`) sets `maxDuration = 10` and aborts the upstream fetch at 10 s. Optimize the n8n workflow for sub-10 s responses (see `docs/N8N-OPTIMIZATION.md`). |
| **Weak demo credentials.** | The current n8n Basic Auth username/password (`admin` / `rootUser`) are not safe for public production use. | Rotate credentials in n8n and Vercel before public launch. |
| **In-memory rate-limit store.** | Rate limits are per-instance and reset on every cold start. Sufficient for a demo but not robust abuse protection. | Documented in `docs/PRODUCTION-NOTES.md`. For public production, migrate to Redis or Vercel KV. |
| **ngrok free tier.** | The n8n webhook URL changes when the tunnel restarts, breaking production until Vercel env vars are updated. | Use a paid ngrok reserved domain or host n8n on a stable domain for production. |
| **No health-check endpoint.** | There is no dedicated `/health` route; you must rely on the homepage and search endpoint for liveness. | Acceptable for the portfolio demo. Add `/health` if production monitoring is required. |
| **CSP allows `'unsafe-inline'` scripts/styles.** | Required for Next.js/Tailwind v4 in this setup; slightly weaker CSP. | Monitor for XSS; consider a nonce-based CSP for a production hardening pass. |

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `CONFIGURATION_ERROR` 500 | Missing `N8N_WEBHOOK_URL`, `USERNAME`, or `PASSWORD` in Vercel. | Add the missing env vars and re-deploy. |
| `TIMEOUT_ERROR` 504 | n8n workflow took longer than 10 s. | Optimize n8n nodes or reduce `maxResults`. |
| `BACKEND_ERROR` 502 | n8n returned a non-2xx status. | Check n8n execution logs and confirm Basic Auth credentials match. |
| `RATE_LIMITED` 429 | IP exceeded 10 req/min or 50 req/day. | Wait 60 s or test from a different network. |
| CORS errors in browser | `NEXT_PUBLIC_APP_URL` does not match the deploy URL. | Update `NEXT_PUBLIC_APP_URL` to the canonical domain and re-deploy. |

---

## 10. Recommended next command

When you are ready to deploy and have completed the prerequisites:

```bash
vercel --yes
```

This creates a **preview deployment** only. To promote to production, run:

```bash
vercel --prod
```

> **Do not run `vercel --prod` without explicit user approval.**

---

## 11. Change log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1 | 2026-10-21 | DevOps subagent | Initial runbook for Gate G9. |
