---
kind: external_dependency
name: Google Fonts (Noto Serif SC, Playfair Display)
slug: google-fonts
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
source_files:
    - index.html
---

Fonts are loaded at runtime from Google Fonts CDN (`fonts.googleapis.com/css2?family=Noto+Serif+SC&family=Playfair+Display`). They are referenced via `<link rel="preload">` for the splash image and a stylesheet link; no local font files are vendored.