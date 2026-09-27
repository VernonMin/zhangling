---
kind: external_dependency
name: Open-Meteo weather API (Chongqing forecast)
slug: open-meteo-api
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
source_files:
    - push.html
---

The push composition page (`push.html`) fetches Chongqing weather from `https://api.open-meteo.com/v1/forecast` with fixed latitude/longitude (29.5647, 106.5507) and timezone `Asia/Shanghai`. It maps numeric weather codes to Chinese descriptions and inserts them into the message body. No authentication key is required.