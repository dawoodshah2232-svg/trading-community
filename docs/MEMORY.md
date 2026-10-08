# MEMORY — Trading Community (Trade.FlexSpot)

Progress log. Built from `git log`; repo state wins over memory if they conflict.

## Done

- **2026-09-26** — Phase 0 prototype (`b2c21cb`): app-like mobile web UI (home, live room, go-live, community, profile, broker connect). Re-themed gold → fintech blue+green (`f1e9968`). Full terminal upgrade: watchlist, order book, tape, limit/stop + TP/SL ticket, alerts, live account strip (`9b096b1`). Lightweight Charts replaces TradingView widget (`16a2af6`). Custom domain trade.flexspot.lol DNS-verified live (`b5d2b57`).
- **2026-09-27** — v25.5…v25.20: name-only signup replaces password gate (`f748def`, `dc7403f`); Classes LMS rebuilt (`578122d`); Reels full-screen viewer (`f519079`) + real video thumbnails (`8188888`); v25.13 mega-release — 49 items: copy guard, prop challenge, DMs, live polls/Q&A/multi-guest, indicator alerts, achievements, streak, CSV export, onboarding+quiz, i18n EN/AR/HI/UR, referrals, econ calendar (`66628de`); admin.html console (`22f9565`); v25.20 REAL cross-device live: MQTT presence + WebRTC P2P video + real chat (`dab7b13`); MQTT flags parsing fix (`262421b`).
- **2026-09-29** — Vendored Lightweight Charts v5.2.1 locally; migrated off v4 API (`81c0948`). v25.21 honesty audit recovery (`19f4e44`): fixed startup crash (F-01), volume crash + invented volume (F-02/F-03), sampled-history labels (F-04), feed honesty — stale quotes, session vs feed (F-05…F-10), paper-trading honesty — no credential collection, no invented latency, 1:100 leverage, order validation gate (F-11…F-17) + P0 regression tests. QA compliance pass (`37b000e`): privacy/terms/404/robots/sitemap/favicon/OG tags/contrast/anti-spam guards. HEAD as of 2026-10-08.
- **2026-10-08** — Added `docs/` AI context files (PRD/ARCHITECTURE/RULES/DESIGN/TASKS/MEMORY).
- **2026-10-08 (later)** — 20-fix SEO sweep (audit → fixes → verified): baseline audit found robots/sitemap/canonical(root)/OG-present-but-`name=`-instead-of-`property=`/unique titles ≤60/descriptions/no-noindex-on-public/no-http-refs, and gaps: no h1 on index.html, OG `name=` invalid for scrapers, privacy/terms missing canonical + full OG + schema, trading-community-app.html duplicate with no canonical, admin.html + 404.html indexable, picsum.photos remote hero images, PNG broker logos, sub-44px tap targets on 5 rules, no JSON-LD anywhere, no GSC placeholder. Fixes: (1) sitemap.xml valid + lastmod added; (2) robots.txt unchanged (already had sitemap ref); (3) noindex added to admin.html + 404.html, none on public pages; (4) canonical: root self ✓, privacy/terms self, trading-community-app.html → root; (5) titles unique ≤60 ✓; (6) meta descriptions on all pages incl. new admin one; (7) one visually-hidden `.vh` h1 added to index.html + trading-community-app.html home screens; (8) h1 now precedes h2/h3; (9) all imgs have alt (hero imgs descriptive; broker logos already had alt); (10) JSON-LD added — index + app-build: WebSite + WebApplication + BreadcrumbList; privacy/terms: WebPage + BreadcrumbList; (11) internal linking index ↔ privacy/terms verified (2 each); (12) all local asset refs resolve, zero broken links; (13) new local `assets/img/live-hero.webp` (1280×720, 43KB) replaces 2 picsum hotlinks; 6 broker logos PNG→WebP (60–87% smaller), refs updated in app.js + app build; (14) hero img local + fetchpriority=high, width/height set (no CLS); (15) viewport ✓, `overflow-x:clip` on html,body, 5 tap-target rules raised to 44px; (16) zero `http://` refs ✓; (17) clean slugs ✓; (18) OG fixed to `property="og:*"`, privacy/terms full OG + twitter cards; (19) GSC placeholder comment + TASKS.md owner-action TODO; (20) backlink strategy note in TASKS.md (content-only). Verified: P0 suite green, sitemap XML valid, JSON-LD parses, grep audit clean. Single commit pushed; Pages build checked `built`.

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
