# Contract Test Report — n8n Webhook Integration

**Project:** Jobs & Sales Leads Search UI + n8n Workflow  
**Gate:** G5 Build — backend/integration verification  
**Test date:** 2026-10-20  
**Tester:** backend-dev subagent  
**Webhook URL tested:** `https://deskbound-octopus-modulator.ngrok-free.dev/webhook/stryde`  
**n8n UI root reachable:** Yes (`https://deskbound-octopus-modulator.ngrok-free.dev/` returned 200, n8n v2.34.6 HTML)  

---

## 1. Test method

1. Attempted unauthenticated `POST` and `GET` requests to the production webhook path.
2. Attempted a request to the test webhook path (`/webhook-test/stryde`).
3. Inspected response status, headers, and body.
4. Verified n8n instance availability via the root path.
5. Produced test fixtures based on the locked API contract for frontend use.
6. Authored `curl-tests.sh` so the team can re-run the same checks once the workflow is active.

**Tools used:** `curl` from the build environment.  
**Network timeout:** 30 s per request.  

---

## 2. Live webhook results

### 2.1 Production webhook — `POST /webhook/stryde`

| Metric | Value |
|--------|-------|
| HTTP status | `404 Not Found` |
| Latency | ~2.4 s |
| Response body | `{"code":404,"message":"The requested webhook \"POST stryde\" is not registered.","hint":"The workflow must be active for a production URL to run successfully. You can activate the workflow using the toggle in the top-right of the editor. Note that unlike test URL calls, production URL calls aren't shown on the canvas (only in the executions list)"}` |

### 2.2 Production webhook — `GET /webhook/stryde`

| Metric | Value |
|--------|-------|
| HTTP status | `404 Not Found` |
| Latency | ~2.5 s |
| Response body | `{"code":404,"message":"The requested webhook \"GET stryde\" is not registered.","hint":"The workflow must be active..."}` |

### 2.3 Test webhook — `POST /webhook-test/stryde`

| Metric | Value |
|--------|-------|
| HTTP status | `404 Not Found` |
| Latency | ~2.4 s |
| Response body | `{"code":404,"message":"The requested webhook \"stryde\" is not registered.","hint":"Click the 'Execute workflow' button on the canvas, then try again. (In test mode, the webhook only works for one call after you click this button)"}` |

### 2.4 n8n root health check — `GET /`

| Metric | Value |
|--------|-------|
| HTTP status | `200 OK` |
| Latency | ~2.9 s |
| Observed headers | `Ngrok-Agent-Ips: 105.112.190.245`, `X-Robots-Tag: noindex, nofollow` |
| Body | n8n UI HTML, version `n8n@2.34.6` |

---

## 3. Schema conformance

Because the webhook path is not registered, no successful contract response could be obtained from the live endpoint.  
Therefore, **live schema conformance cannot be verified yet**. The request/response envelope conformance was checked against the locked contract in `docs/API-CONTRACT.md` by producing representative fixtures (see section 5).

Expected contract shape (unchanged):

```json
{
  "mode": "jobs",
  "intent_summary": "...",
  "assumptions": ["..."],
  "leads": [ { ... } ],
  "notes": ""
}
```

| Contract item | Status | Notes |
|---------------|--------|-------|
| `mode` enum (`jobs`, `clients`, `both`) | Locked | Fixtures reflect all three values. |
| `query` length 10–1000 | Locked | Frontend and Route Handler must enforce. |
| `maxResults` 1–15, default 15 | Locked | Fixtures use 5, 10, and 15. |
| Top-level fields (`mode`, `intent_summary`, `assumptions`, `leads`, `notes`) | Locked | Verified in fixture set. |
| Lead item fields | Locked | All schema fields represented in fixtures. |
| `contacts[]` optional | Locked | Fixtures include empty and populated arrays. |
| Error envelope (`error.code`, `error.message`, `error.details`) | Locked | `invalid-request.json` example included. |

---

## 4. Deviations and issues found

### 4.1 Blocker: webhook is not registered / workflow not active

- **Severity:** High (blocks end-to-end testing and frontend integration).
- **Evidence:** n8n returns `404` for both `/webhook/stryde` and `/webhook-test/stryde`.
- **Likely cause:** The workflow containing the Webhook node is either not saved with the path `stryde`, not active, or the production/test webhook paths differ from the documented URL.
- **Impact:** No live request can reach the n8n workflow; Firecrawl and Hunter are not exercised; the Next.js Route Handler will map this to a `502 Bad Gateway` if deployed as-is.

### 4.2 No basic-auth challenge observed

- **Severity:** Informational (expected given 404).
- **Evidence:** No `WWW-Authenticate` header was returned because the webhook path was not found.
- **Impact:** Basic auth setup cannot be verified until the webhook path is active.

### 4.3 Latency to ngrok endpoint

- **Observation:** Each request took 2.4–2.9 s just to reach the n8n server and return a 404.
- **Implication:** When active, total latency will be this base round-trip plus n8n/Firecrawl/Hunter processing time (expected 3–12 s per ARCHITECTURE.md). The frontend should continue to use a 20 s client timeout and a polished loading state.

---

## 5. Recommended n8n workflow adjustments

No code changes to the workflow are proposed because the workflow could not be reached. Once it is active, confirm the following before declaring the integration complete:

1. **Activate the workflow and verify the webhook path.** In the n8n editor, ensure the Webhook node is configured with:
   - **Path:** `stryde`
   - **Method:** `POST`
   - **Authentication:** `Basic Auth`
   - Toggle the workflow to **Active**.
2. **Confirm the production URL format.** n8n production webhooks use `/webhook/<path>`; test URLs use `/webhook-test/<path>`. The documented URL matches the production format, which is correct for the live integration.
3. **Verify basic-auth credentials match Vercel env vars.** The username/password set in the n8n Webhook node must exactly match `N8N_WEBHOOK_USERNAME` and `N8N_WEBHOOK_PASSWORD` in Vercel.
4. **Validate the response schema.** The workflow should return the locked top-level fields and no more than 15 items in `leads`.
5. **Partial-failure handling.** If a source (Firecrawl/Hunter) fails, the workflow should still return `200 OK` with available results and a non-empty `notes` string describing the issue.
6. **Result type strings.** Confirm the workflow returns `type` values of `job`, `client`, and `both` (per API-CONTRACT.md assumption). If it returns different strings, the frontend is prepared to render them as opaque labels.

---

## 6. Basic auth setup verification notes

- The n8n instance is reachable over HTTPS and serves a valid n8n UI, so TLS and ngrok tunnel are operational.
- Basic auth could not be exercised because the webhook path returned 404 before any auth check.
- After the workflow is activated, re-run `backend/curl-tests.sh` with valid credentials. A successful run will return `200 OK`; incorrect credentials should return `401 Unauthorized`.
- **Security reminder:** Do not commit credentials to the repository. Use environment variables or a secure secret store.

---

## 7. Artifacts produced

All artifacts are located under `backend/`:

| Artifact | Purpose |
|----------|---------|
| `test-fixtures/jobs-response.json` | Representative success response for `mode: "jobs"`. |
| `test-fixtures/clients-response.json` | Representative success response for `mode: "clients"`. |
| `test-fixtures/both-response.json` | Representative success response for `mode: "both"`. |
| `test-fixtures/empty-response.json` | Zero-lead response with explanatory note. |
| `test-fixtures/partial-failure-response.json` | Response with available leads and a failure note in `notes`. |
| `test-fixtures/invalid-request.json` | Example validation error envelope. |
| `curl-tests.sh` | Re-runnable shell script for live webhook testing with basic auth. |
| `CONTRACT-TEST-REPORT.md` | This report. |

---

## 8. Next steps

1. Stakeholder activates the n8n workflow and confirms the webhook path `stryde`.
2. Re-run `backend/curl-tests.sh` with the n8n basic-auth credentials.
3. Compare live responses against the fixtures; update fixtures if the live schema differs (requires contract change approval if fields are added/removed).
4. Once live responses pass, the frontend team can use the fixtures for offline development and the curl script for integration validation.

---

## 9. Sign-off

- **Contract alignment:** Cannot be confirmed against live endpoint because the webhook is inactive.
- **Fixture/schema alignment:** Fixtures match the locked API contract in `docs/API-CONTRACT.md`.
- **Issues found:** One blocker — n8n webhook path returns 404, workflow not active/registered.
- **No credentials exposed in any artifact.**
