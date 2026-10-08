# MEMORY — Trading Community (Trade.FlexSpot)

Progress log. Built from `git log`; repo state wins over memory if they conflict.

## Done

- **2026-09-26** — Phase 0 prototype (`b2c21cb`): app-like mobile web UI (home, live room, go-live, community, profile, broker connect). Re-themed gold → fintech blue+green (`f1e9968`). Full terminal upgrade: watchlist, order book, tape, limit/stop + TP/SL ticket, alerts, live account strip (`9b096b1`). Lightweight Charts replaces TradingView widget (`16a2af6`). Custom domain trade.flexspot.lol DNS-verified live (`b5d2b57`).
- **2026-09-27** — v25.5…v25.20: name-only signup replaces password gate (`f748def`, `dc7403f`); Classes LMS rebuilt (`578122d`); Reels full-screen viewer (`f519079`) + real video thumbnails (`8188888`); v25.13 mega-release — 49 items: copy guard, prop challenge, DMs, live polls/Q&A/multi-guest, indicator alerts, achievements, streak, CSV export, onboarding+quiz, i18n EN/AR/HI/UR, referrals, econ calendar (`66628de`); admin.html console (`22f9565`); v25.20 REAL cross-device live: MQTT presence + WebRTC P2P video + real chat (`dab7b13`); MQTT flags parsing fix (`262421b`).
- **2026-09-29** — Vendored Lightweight Charts v5.2.1 locally; migrated off v4 API (`81c0948`). v25.21 honesty audit recovery (`19f4e44`): fixed startup crash (F-01), volume crash + invented volume (F-02/F-03), sampled-history labels (F-04), feed honesty — stale quotes, session vs feed (F-05…F-10), paper-trading honesty — no credential collection, no invented latency, 1:100 leverage, order validation gate (F-11…F-17) + P0 regression tests. QA compliance pass (`37b000e`): privacy/terms/404/robots/sitemap/favicon/OG tags/contrast/anti-spam guards. HEAD as of 2026-10-08.
- **2026-10-08** — Added `docs/` AI context files (PRD/ARCHITECTURE/RULES/DESIGN/TASKS/MEMORY).

## In progress

- None active — repo is a stable v25.21 demo. Working tree clean at HEAD `37b000e`, in sync with `origin/main`.

## Next

- README is stale (describes old UI terminal build + TradingView chart) — verify and rewrite.
- Script the `trading-community-app.html` inline build so it can't drift from `index.html`/`app.js`.
- Real backend (MySQL + PHP only) when commissioned; storage abstraction over `localStorage`.
- Real broker mirror trading, real user accounts, $5 classes checkout, admin auth hardening.
- APK → iOS builds (phases: web done → APK → iOS → mass).
- Confirm live at trade.flexspot.lol after next push via Pages build status.

## Key decisions / rules (durable)

- Everything simulated is badged "demo" in UI and code — the v25.21 audit standard applies to all future work.
- Chart stack: vendored Lightweight Charts v5 only, never CDN; Unix-seconds timestamps; volume shown only when true per-candle data exists.
- TradingView embed removed for licensing — do not re-add.
- Broker connect is simulated; never collect/transmit real broker credentials.
- Backend rule: MySQL + PHP only (cPanel). No auto-deploy of backend code — owner's manual review required.
- No emojis in UI; Heroicons inline SVG only; logos raw, never on cards; Apple font stack only.
- GitHub Pages: check build status after each push; wait for `built`; never stack pushes.
