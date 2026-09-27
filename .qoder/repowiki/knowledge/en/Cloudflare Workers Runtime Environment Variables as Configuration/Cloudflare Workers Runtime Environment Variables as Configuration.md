---
kind: configuration_system
name: Cloudflare Workers Runtime Environment Variables as Configuration
category: configuration_system
scope:
    - '**'
source_files:
    - functions/api/aiquote.js
    - functions/api/push-send.js
    - functions/api/mood.js
    - functions/api/track.js
---

## What system/approach is used

This repository has no dedicated configuration framework, config files (`.env`, YAML, TOML), or config-loading library. Runtime configuration is provided exclusively through **Cloudflare Workers runtime environment variables** (`env`), which are injected at deploy time by Cloudflare Pages/Workers.

The app is a flat collection of Worker route handlers under `functions/api/*.js`; each handler reads its own secrets and service bindings directly from the `env` object passed into `onRequest*`.

## Key files and packages

- `functions/api/aiquote.js` — reads `env.DEEPSEEK_API_KEY` to call DeepSeek chat completions.
- `functions/api/push-send.js` — reads `env.PUSH_SECRET`, `env.VAPID_PUBLIC_KEY`, `env.VAPID_PRIVATE_KEY` for Web Push encryption/VAPID signing.
- All handlers access KV storage via the `env.ZHANGLING_MOOD_KV` binding (e.g. `moods`, `track_events`, `push_subscriptions`).
- No shared config module exists; each file declares its own CORS constants inline.

## Architecture and conventions

1. **One env var per secret/binding.** There is no config object, schema, or loader. Secrets are referenced as bare identifiers on `env`:
   - `env.DEEPSEEK_API_KEY`
   - `env.PUSH_SECRET`
   - `env.VAPID_PUBLIC_KEY`
   - `env.VAPID_PRIVATE_KEY`
   - `env.ZHANGLING_MOOD_KV` (KV namespace binding)

2. **No defaults or validation.** If an env var is missing, the handler fails at the point of use (e.g. `Bearer ${env.DEEPSEEK_API_KEY}` becomes `Bearer undefined`). There is no fallback logic in any handler.

3. **Secrets are not loaded once and cached.** Each request re-reads `env` properties; there is no singleton config store.

4. **Feature flags / toggles do not exist.** The codebase contains no boolean switches derived from env vars; behavior is controlled purely by code paths.

5. **Hardcoded business values live in source.** Examples include the DeepSeek model name `'deepseek-chat'`, the SYSTEM_PROMPT string, the Beijing timezone offset (`8 * 60 * 60 * 1000`), retention limits (`splice(60)` for moods, `> 2000` for track events), and the VAPID sub `'mailto:no-reply@example.com'`. None of these are externalized.

6. **CORS policy is duplicated per file.** Every handler defines its own `const CORS = { ... }` object rather than sharing one.

## Conventions and constraints

- **Observed convention:** All secrets and service bindings are consumed from the `env` parameter destructured in `onRequestGet` / `onRequestPost` / `onRequestOptions` handlers.
- **Enforced constraint:** The `Authorization` header sent to DeepSeek is constructed as `` `Bearer ${env.DEEPSEEK_API_KEY}` `` — a missing variable produces a literal `undefined` token, so deployment requires this variable to be set.
- **Enforced constraint:** `push-send.js` rejects requests where `secret !== env.PUSH_SECRET` with `{ error: 'unauthorized' }` and status 401 — callers must supply the matching secret in the JSON body.
- **Enforced constraint:** Web Push messages require both `env.VAPID_PUBLIC_KEY` and `env.VAPID_PRIVATE_KEY`; the private key is imported as PKCS#8 ECDSA P-256 for signing the VAPID JWT.
- **Enforced constraint:** All data persistence goes through the single KV binding `env.ZHANGLING_MOOD_KV`; keys used are `moods`, `track_events`, and `push_subscriptions`.
- **Not enforced but observed:** Timezone handling is hardcoded to UTC+8 (Beijing) via arithmetic on `Date.now()` rather than reading a timezone setting.