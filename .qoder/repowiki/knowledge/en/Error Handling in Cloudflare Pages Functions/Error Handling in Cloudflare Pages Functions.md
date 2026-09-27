---
kind: error_handling
name: Error Handling in Cloudflare Pages Functions
category: error_handling
scope:
    - '**'
source_files:
    - functions/api/track.js
    - functions/api/push-send.js
    - functions/api/monthly_report.js
---

## Overview

This is a Cloudflare Pages single-page web app whose server-side logic lives entirely in `functions/api/*.js` — one module per endpoint, each exporting `onRequestGet`, `onRequestPost`, and `onRequestOptions`. There is no centralized error-handling framework, middleware layer, or shared error types. Error handling is ad-hoc and varies by file.

## Observed Patterns

### 1. Silent failure via try/catch returning `{ ok: false }`

`functions/api/track.js` wraps the entire handler body in a try/catch and returns `JSON.stringify({ ok: false })` on any exception:

```js
try {
  // parse request, write to KV
} catch (e) {
  return new Response(JSON.stringify({ ok: false }), { ...CORS });
}
```

The same shape (`{ ok: true }` / `{ ok: false }`) is used as the success response, so clients cannot distinguish between "success" and "failure" without inspecting the boolean. No error message or status code is attached to failures.

### 2. Per-endpoint explicit validation with HTTP 4xx

`functions/api/monthly_report.js` validates query parameters inline and returns a JSON body with an `error` field plus an HTTP status:

```js
if (!month || !/^\d{4}-\d{2}$/.test(month)) {
  return new Response(JSON.stringify({ error: 'invalid month' }), {
    status: 400, headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
```

`functions/api/push-send.js` uses the same pattern for authorization and missing data:

```js
if (secret !== env.PUSH_SECRET)
  return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, ... });
if (!subJson || subs.length === 0)
  return new Response(JSON.stringify({ error: 'no subscription' }), { status: 404, ... });
```

### 3. Partial failure aggregation

In `push-send.js`, individual push deliveries are wrapped in their own try/catch inside a `Promise.all` map. Failures are collected into a `failed` array and reported back alongside successes:

```js
const results = await Promise.all(subs.map(async sub => {
  try { /* encrypt + fetch */ }
  catch (e) { return { ok: false, error: e.message }; }
}));
return new Response(JSON.stringify({ ok: true, sent, failed }), ...);
```

The outer response still reports `ok: true` even when some pushes fail — only the `failed` count exposes partial failure.

### 4. Graceful degradation for external calls

`monthly_report.js` wraps the DeepSeek API call in a try/catch that silently falls back to a default letter text when the LLM call fails:

```js
try {
  const res = await fetch('https://api.deepseek.com/chat/completions', ...);
  // ...
} catch (e) {
  // 用默认兜底
}
```

No error is surfaced to the caller; the generated report always succeeds with a fallback letter.

### 5. No centralized error types or sentinel values

There is no `errors/` directory, no custom `Error` subclass, no error-code constants, and no shared error-response helper. Each file defines its own string-based error messages (`'unauthorized'`, `'no subscription'`, `'invalid month'`).

### 6. No panic/recover

JavaScript has no `panic`; there is no `try/catch` around the top-level function export in any handler. Uncaught exceptions bubble up to the Cloudflare runtime, which returns a generic 500 — this behavior is not instrumented or logged anywhere in the repo.

### 7. CORS is local to each file

Every handler file re-declares a `CORS` object and spreads it into every `Response` header. There is no shared middleware or global configuration.

## Conventions

- Validation errors use HTTP status codes (400, 401, 404) with a `{ error: '<string>' }` JSON body.
- Runtime/runtime-like failures in fire-and-forget endpoints (`track.js`) swallow exceptions and return `{ ok: false }`.
- External service failures (LLM, push delivery) are caught locally and either degraded gracefully (monthly report) or aggregated (push send).
- There is no logging of errors anywhere in the codebase.
- Success responses consistently use `{ ok: true }` (or richer payloads like the monthly report), while failure responses are inconsistent — sometimes `{ ok: false }`, sometimes `{ error: '...' }` with an HTTP status.

## Constraints Enforced by Code

- The `track` endpoint accepts any malformed input without throwing — it always responds with `{ ok: true }` on success or `{ ok: false }` on parse/KV failure.
- The `push-send` endpoint requires a `PUSH_SECRET` environment variable and rejects mismatched secrets with HTTP 401.
- The `monthly_report` GET endpoint requires a `month` parameter matching `YYYY-MM`.
- Push delivery failures do not cause the overall request to fail; the response remains `ok: true` with a `failed` count.