---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### 张玲的夸夸机
- Definition：The product's public-facing title and brand — a personal "praise machine" web app dedicated to Zhang Ling. Replaced the previous owner's branding (liuyingchun / 刘迎春的开心小角落). Appears in `<title>`, canvas rendering, and push notification titles.
- Aliases：夸夸机、zhangling

### ZHANGLING_MOOD_KV
- Definition：The Cloudflare KV namespace binding name used across all serverless functions to persist mood entries, daily counts, notes, push subscriptions, game state, CD progress, dog names, lottery results, and prizes. Must be bound in the Pages project settings; without it every `/api/*` route returns 500.
- Aliases：KV、KV namespace

### 摸鱼小游戏
- Definition：The idle-clicker mini-game accessible from the bottom button of the main page (Whack-a-mole style), backed by `functions/api/whack_play.js` and storing play counts in KV. Retained after removing other modules.
- Aliases：whack、whack_play

### 推送通知
- Definition：Browser push-notification feature implemented via VAPID (Web Push). Requires both a public/private VAPID key pair and a `PUSH_SECRET` shared token; users subscribe through `/api/push-subscribe` and messages are sent via `/api/push-send` from `push.html`.
- Aliases：push、VAPID、web push

### 心情记录
- Definition：The historical mood log page (`history.html`) that fetches past mood entries and daily counts via `/api/mood` and `/api/count`. Separate from the removed "today's mood" UI but still functional.
- Aliases：历史心情、history
