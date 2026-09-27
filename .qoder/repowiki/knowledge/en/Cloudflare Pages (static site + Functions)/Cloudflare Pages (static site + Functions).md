---
kind: external_dependency
name: Cloudflare Pages (static site + Functions)
slug: cloudflare-pages
category: external_dependency
category_hints:
    - vendor_identity
    - framework_behavior
scope:
    - '**'
source_files:
    - functions/api/mood.js
    - functions/api/push-send.js
    - functions/api/count.js
---

The project is deployed as a **pure static site** on Cloudflare Pages with no build step: Framework preset `None`, Build command empty, Build output directory `/`. The root-level `functions/api/` directory is automatically served as `/api/*` routes. KV namespace binding is required under the variable name `ZHANGLING_MOOD_KV`; without it all data endpoints return 500. Secrets (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_SECRET`, `DEEPSEEK_API_KEY`) are injected via Pages secrets/environment variables and consumed by the serverless functions.

- Deployment is Git-driven: connecting the repo to Pages triggers a redeploy on every push to `main`.
- KV namespaces must be created first in the Dashboard and then bound to the Pages project; this cannot be done purely through `wrangler` CLI unless a `wrangler.toml` is used.