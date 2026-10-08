# TASKS — Trading Community

Status derived from `git log` (v25.21, 2026-09-29) + current repo state. Unknowns are TODO, not guesses.

## Done (v25.x, verified in log)

- [x] v25.21 honesty audit: F-01…F-17 fixes — startup crash, volume crash + invented volume, stale-quote/session-vs-feed honesty, paper-trading honesty (no credential collection, no invented latency, 1:100 leverage, order validation gate)
- [x] v25.21 QA compliance: privacy.html / terms.html / 404.html / robots.txt / sitemap.xml / favicon / OG tags / contrast (4.5:1 muted text) / anti-spam guards
- [x] Lightweight Charts v5.2.1 vendored locally; v4 API migrated; TradingView widget removed (licensing)
- [x] Real feeds: CoinGecko OHLC history (crypto + PAXG) + open.er-api.com FX anchors; honesty badges per symbol
- [x] Real cross-device live: MQTT presence, WebRTC P2P host/viewer, real chat, countdown, session recordings
- [x] Name-only signup (password gate replaced); name + initials avatar render as the account identity
- [x] Reels: real video thumbnails, upload from device, full-screen viewer
- [x] Classes LMS rebuilt (Lessons/Recordings/Strategies/Trades/Materials)
- [x] admin.html: announcements, traders, courses, contest prize overrides
- [x] v25.13 mega-release (49 items): prop challenge, DMs, live polls/Q&A, indicator alerts, achievements, streak, CSV export, onboarding+quiz, i18n EN/AR/HI/UR, referrals, econ calendar
- [x] P0 regression suite `tests/p0-regress.mjs`

## Next / TODO

- [ ] **SEO follow-ups (owner actions in Search Console UI — repo-side done):** (a) verify https://trade.flexspot.lol as a property in Google Search Console, then paste the issued `<meta name="google-site-verification" content="...">` tag at the marked placeholder in `index.html` head; (b) submit `https://trade.flexspot.lol/sitemap.xml` in Sitemaps; (c) request indexing for `/`, `/privacy.html`, `/terms.html`; (d) check the Enhancements/CWV report after a week of real traffic. Nothing here needs code changes — all repo-side SEO is committed.
- [ ] **Backlink strategy (earn via content only — NEVER buy links, NEVER spam):** publish original trading-education content (reels highlights, class lesson summaries, economic-calendar explainers) on the site and share natively on Dawood's own channels (IG @daudtradefx, YouTube @daudtradefx, trading community Telegram); earn links from event/partner pages (ProFX Media events, Trading Expo sites) where a real relationship exists; submit to legitimate directories only if editorially reviewed. No link schemes, no paid placements, no comment spam.
- [ ] Update `README.md` — it describes the old UI terminal build and a TradingView chart; reality is v25.21 with vendored Lightweight Charts (verify before rewriting)
- [ ] Script the `trading-community-app.html` inline build — today it is hand-generated and goes stale when `index.html`/`app.js` change
- [ ] Run `node tests/p0-regress.mjs` after every app.js change (nothing runs automatically; no CI)
- [ ] Real backend (when commissioned): MySQL + PHP only; storage abstraction over `localStorage`
- [ ] Real user accounts replacing name-only `localStorage` profiles
- [ ] Real broker mirror trading (today: simulated login + paper fills)
- [ ] $5 paid private classes checkout flow (room UI exists, payment does not)
- [ ] Admin console auth hardening (static page behind unlinked path today)
- [ ] APK / iOS builds (phases: web done → APK → iOS → mass)
- [ ] Confirm live state at https://trade.flexspot.lol after next push (Pages build status check)
