# Production Notes

## Rate limiting

The current implementation uses an in-memory `Map` in `src/proxy.ts` to enforce per-IP rate limits (`10 req/min`, `50 req/day`). This works for a single demo instance but is **not suitable for production** because:

- Serverless/Edge functions run across many isolated workers, so limits are not shared between instances.
- The bucket store grows unbounded until the process restarts.
- IPs derived from `X-Forwarded-For` can be spoofed and should not be trusted as the sole identity signal.

Before shipping to production, replace the in-memory rate limiter with a shared store such as **Vercel KV**, **Redis**, or an external **WAF / API gateway** (e.g., Cloudflare, AWS WAF) that can enforce limits consistently across all workers.
