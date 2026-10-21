# n8n Workflow Optimization Guide — Stryde Demo

This guide describes how to restructure your existing n8n workflow to reduce latency from ~24s to ~8–12s while still returning real results.

## Current bottleneck

Your current flow does:

1. Webhook
2. AI Agent (parses intent)
3. Firecrawl search
4. Firecrawl scrape each URL **sequentially**
5. Hunter lookup **sequentially**
6. Respond to Webhook

The biggest delays are **sequential scraping** and running **Hunter when it isn't needed**.

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
Firecrawl: Search web
  │
  ▼
Limit results to top N (e.g., 5)
  │
  ▼
Split In Batches (batchSize = 1, parallel = true)
  │
  ▼
Firecrawl: Scrape URL  ──┐
  │                        │
  ▼                        │
Hunter: domain/email       │  (only for clients/both)
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

### 1. Webhook node

- **Path:** `stryde`
- **Method:** `POST`
- **Authentication:** Basic Auth (username/password as configured)
- **Respond:** `Using Respond to Webhook Node`
- **Response Mode:** `Last Node`

### 2. Set node — normalize inputs

Create a Set node right after Webhook to set consistent variables:

```json
{
  "mode": "={{ $json.body.mode ?? 'jobs' }}",
  "query": "={{ $json.body.query }}",
  "maxResults": "={{ Math.min($json.body.maxResults ?? 15, 15) }}"
}
```

### 3. AI Agent node — lighter prompt

Keep the AI Agent but make it faster:

- Use a cheaper/faster model (e.g., GPT-4o-mini, Claude Haiku, or local equivalent).
- Shorten the system prompt.
- Output only: `searchQuery`, `location`, `role`, `remote`.

Example system prompt:

```text
You turn a natural-language job/lead request into a precise web search query.
Return ONLY a JSON object with these keys:
- searchQuery: a 5-10 word search string
- location: inferred location or "remote"
- role: target role or ""
- remote: "remote" or ""
```

### 4. Firecrawl — Search web

Use the AI Agent's `searchQuery` output as the search term.

Set **limit** to `5` or `10` (not unlimited). This alone saves several seconds.

### 5. Limit results

After Firecrawl search, add a **Limit** node:

- **Limit:** `{{ $json.maxResults ?? 5 }}`
- **Keep:** First items

This ensures you never scrape more than the user asked for.

### 6. Split In Batches + parallel scraping

Add a **Split In Batches** node:

- **Batch Size:** `1`
- **Parallel Processing:** `true` (or max 5 parallel)
- **Input:** the limited result list

Inside the loop:

1. **Firecrawl: Scrape URL** — scrape the current item's URL.
2. **If node** — only run Hunter if `mode != 'jobs'`.
3. **Hunter: domain/email** — look up the domain.
4. **Merge** the scrape + Hunter outputs.

### 7. Hunter only for leads/clients

Add an **If** node before Hunter:

```
{{ $json.mode !== 'jobs' }}
```

If `true`, run Hunter. If `false`, skip it. This saves 2–5 seconds for job searches.

### 8. Set node — build final response

After the loop, add a Set node that builds the exact JSON schema the frontend expects:

```json
{
  "mode": "={{ $json.mode }}",
  "intent_summary": "={{ 'Showing ' + $json.maxResults + ' results for ' + $json.query }}",
  "assumptions": "={{ $json.assumptions ?? [] }}",
  "leads": "={{ $json.leads }}",
  "notes": ""
}
```

### 9. Respond to Webhook node

- **Respond With:** `JSON`
- **Response Body:** `{{ $json }}`
- **Enable Streaming:** `false`

## Expected final schema

The frontend now accepts either `remote_status` or `remote`, but return `remote_status` if possible:

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

## Alternative: even faster demo mode

If you want **instant results for the demo**, add an early-return branch:

```
If query contains "demo" or "example"
  → Return a static mock response immediately
Else
  → Run full search
```

This guarantees a snappy first impression during portfolio reviews.

## Quick wins summary

| Change | Time saved |
|---|---|
| Limit Firecrawl search to 5 results | 3–6s |
| Scrape URLs in parallel | 4–8s |
| Skip Hunter for jobs mode | 2–5s |
| Use a faster/cheaper LLM | 1–4s |
| **Total potential** | **10–23s** |

With all changes, a typical query should finish in **5–12 seconds** instead of 24s.
