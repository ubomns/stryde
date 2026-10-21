# n8n Workflow Optimization Guide — Stryde Demo

This guide describes how to restructure your existing n8n workflow to reduce latency from ~24s to **under 10 seconds** so it works reliably on Vercel Hobby.

## Diagnosis from production tests

We deployed to Vercel and tested the live endpoint:

| Test | Result | Time |
|---|---|---|
| `maxResults: 3` | `FUNCTION_INVOCATION_TIMEOUT` | ~10.9s |
| `maxResults: 1` | `FUNCTION_INVOCATION_TIMEOUT` | ~11.7s |

**Conclusion:** The workflow has a high fixed cost *before* result count matters, or `maxResults` is not being applied early enough. The bottleneck is almost certainly **sequential Firecrawl scraping** plus **Hunter lookups**.

## Current bottleneck

Your current flow likely does:

1. Webhook
2. AI Agent (parses intent)
3. Firecrawl search
4. Firecrawl scrape each URL **sequentially**
5. Hunter lookup **sequentially**
6. Respond to Webhook

The biggest delays are **sequential scraping** and running **Hunter when it isn't needed**.

## Optimization checklist (do in this order)

### 1. Apply `maxResults` immediately after Firecrawl search

Add a **Limit** node right after the Firecrawl search node:

- **Limit:** `{{ $json.maxResults ?? 5 }}`
- **Keep:** First items

This is the highest-impact single change. If your workflow currently scrapes 10–20 URLs, limiting to 3–5 will cut several seconds immediately.

### 2. Scrape URLs in parallel

Replace sequential scraping with parallel processing:

1. Add a **Split In Batches** node:
   - **Batch Size:** `1`
   - **Parallel Processing:** `true`
   - **Max parallel executions:** `5`
   - **Input:** the limited result list

2. Inside the loop, place only:
   - **Firecrawl: Scrape URL**

3. After the loop, merge results.

This alone can save **4–10 seconds** depending on how many URLs you scrape.

### 3. Skip Hunter entirely for `jobs` mode

Add an **If** node before Hunter:

```
{{ $json.mode !== 'jobs' }}
```

Only run Hunter for `clients` and `both` modes. Job postings rarely need email verification, so this saves **2–5 seconds** for the most common mode.

### 4. Use a faster/cheaper LLM

If you use an AI Agent to parse intent, switch to:

- OpenAI `gpt-4o-mini`
- Anthropic `claude-3-haiku`
- Or any local small model

Also shorten the prompt to output only:

```json
{
  "searchQuery": "5-10 word search string",
  "location": "inferred location or remote",
  "role": "target role",
  "remote": "remote or onsite"
}
```

### 5. Reduce Firecrawl search limit

In the Firecrawl search node, set:

- **Search limit:** `5` or `10` (not unlimited)

You can still return fewer results via the Limit node, but this prevents the search node itself from taking too long.

### 6. Cache or skip AI parsing when possible

For common query patterns, consider a simple regex/path-based parser that bypasses the LLM entirely. Example:

- If query contains "jobs" or "roles" → mode = jobs
- If query contains "leads" or "contacts" → mode = clients
- Extract location from common phrases like "in Berlin"

This removes the LLM cold-start latency for straightforward queries.

## Optimized workflow structure

```
Webhook
  │
  ▼
Set: normalize inputs (mode, query, maxResults)
  │
  ▼
AI Agent: extract search intent + build Firecrawl query
  │
  ▼
Firecrawl: Search web (limit = 10)
  │
  ▼
Limit results to top N (maxResults, default 5)
  │
  ▼
Split In Batches (batchSize = 1, parallel = 5)
  │
  ▼
Firecrawl: Scrape URL  ──┐
  │                        │
  ▼                        │
If mode != 'jobs'          │
  │                        │
  ▼                        │
Hunter: domain/email       │
  │                        │
  ▼                        │
Merge results ◀────────────┘
  │
  ▼
Set: build final response JSON
  │
  ▼
Respond to Webhook
```

## Step-by-step node changes

### Webhook node

- **Path:** `stryde`
- **Method:** `POST`
- **Authentication:** Basic Auth (username/password as configured)
- **Respond:** `Using Respond to Webhook Node`
- **Response Mode:** `Last Node`

### Set node — normalize inputs

Create a Set node right after Webhook:

```json
{
  "mode": "={{ $json.body.mode ?? 'jobs' }}",
  "query": "={{ $json.body.query }}",
  "maxResults": "={{ Math.min($json.body.maxResults ?? 5, 15) }}"
}
```

### AI Agent node — lighter prompt

Keep the AI Agent but make it faster:

```text
You turn a natural-language job/lead request into a precise web search query.
Return ONLY a JSON object with these keys:
- searchQuery: a 5-10 word search string
- location: inferred location or "remote"
- role: target role or ""
- remote: "remote" or ""
```

### Firecrawl — Search web

- Use the AI Agent's `searchQuery` output as the search term.
- Set **limit** to `5` or `10`.

### Limit results

- **Limit:** `{{ $json.maxResults }}`
- **Keep:** First items

### Split In Batches + parallel scraping

- **Batch Size:** `1`
- **Parallel Processing:** `true`
- **Max parallel executions:** `5`

Inside the loop:

1. **Firecrawl: Scrape URL**
2. **If node:** `{{ $json.mode !== 'jobs' }}`
3. **Hunter: domain/email** (only if true)
4. **Merge** the scrape + Hunter outputs.

### Set node — build final response

After the loop, build the exact JSON schema the frontend expects:

```json
{
  "mode": "={{ $json.mode }}",
  "intent_summary": "={{ 'Showing ' + $json.maxResults + ' results for ' + $json.query }}",
  "assumptions": "={{ $json.assumptions ?? [] }}",
  "leads": "={{ $json.leads }}",
  "notes": ""
}
```

### Respond to Webhook node

- **Respond With:** `JSON`
- **Response Body:** `{{ $json }}`
- **Enable Streaming:** `false`

## Expected final schema

The frontend accepts either `remote_status` or `remote`, but return `remote_status` if possible:

```json
{
  "mode": "jobs",
  "intent_summary": "Showing 5 results for AI automation remote in US",
  "assumptions": ["Interpreted as current US-remote AI automation roles."],
  "leads": [
    {
      "type": "job",
      "company": "Example Co",
      "domain": "example.com",
      "location": "United States",
      "remote_status": "Remote",
      "opportunity": "AI Automation Engineer",
      "source_url": "https://example.com/jobs/123",
      "why_it_fits": "Strong match for AI workflow automation.",
      "priority": "High",
      "posted_date": "2026-10-20",
      "days_old": 0,
      "contacts": []
    }
  ],
  "notes": ""
}
```

## Quick wins summary

| Change | Time saved |
|---|---|---|
| Limit Firecrawl search to 5–10 results | 3–6s |
| Apply `maxResults` immediately after search | 2–4s |
| Scrape URLs in parallel (5 max) | 4–10s |
| Skip Hunter for jobs mode | 2–5s |
| Use a faster/cheaper LLM | 1–4s |
| **Total potential** | **12–29s** |

With all changes, a typical query should finish in **5–12 seconds** instead of 24s.

## Alternative: instant demo mode

If you need the live demo to work *right now* while you optimize n8n, set the Vercel environment variable:

```env
USE_MOCK_DATA=true
```

Then redeploy. The app will return realistic mock results instantly. This is useful for portfolio reviews but does not exercise the real backend.

## Alternative: upgrade Vercel plan

If you cannot optimize n8n below 10 seconds, upgrade to **Vercel Pro**, which supports serverless function timeouts up to **300 seconds**. This avoids the timeout issue without changing the n8n workflow, but it is a paid solution.

## Alternative: async/polling architecture

For a production-grade solution, refactor to:

1. Frontend calls `/api/v1/search` to **start a job**.
2. Backend enqueues the job and returns a `jobId` immediately.
3. n8n processes the job asynchronously (e.g., via webhook or queue).
4. Frontend polls `/api/v1/jobs/:jobId` until results are ready.

This requires changes to both the Next.js app and the n8n workflow and is out of scope for the portfolio demo.

## Testing your optimized workflow

After making changes, test directly against n8n with curl:

```bash
curl -X POST https://your-ngrok-url.ngrok-free.dev/webhook/stryde \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:rootUser' | base64)" \
  -d '{"mode":"jobs","query":"senior react developer remote","maxResults":3}' \
  -w "\nTime: %{time_total}s\n"
```

Aim for a consistent response time under **8 seconds** to leave a safety margin below Vercel's 10-second limit.
