---
kind: external_dependency
name: DeepSeek LLM API (AI-generated quotes)
slug: deepseek-api
category: external_dependency
category_hints:
    - vendor_identity
    - auth_protocol
scope:
    - '**'
source_files:
    - functions/api/aiquote.js
---

The `/api/aiquote` endpoint calls the DeepSeek API using the `DEEPSEEK_API_KEY` secret configured in Pages environment variables. If the key is missing the endpoint fails; otherwise it returns AI-generated quotes displayed in the main page. This is the only external LLM service used by the project.