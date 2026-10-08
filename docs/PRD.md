# PRD — Trading Community

**Product:** Trade.FlexSpot — a mobile-first, app-like web app for a live-trading community.
**Live:** https://trade.flexspot.lol (custom domain, CNAME in repo) + GitHub Pages.
**Version:** v25.21 (`APP_VERSION = "25.21"` in `app.js`). Demo build — everything is simulated unless it hits a real public price feed.
**Stack:** static HTML/CSS/JS, no build step, no framework, no backend.

## Goal

A free community trading app: Dawood goes live daily (5–6 PM Dubai) and trades
XAUUSD + BTCUSD, members watch, copy-trade on paper accounts, take $5 paid
private classes, and discuss in a social feed. Build phases: web → APK → iOS → mass.

## Users

- **Members** — traders who watch live rooms, copy-trade in demo, post reels/ideas, vote in polls, take classes.
- **Admin** (Dawood) — via `admin.html` (secret path, not linked publicly): announcements, traders, courses, contest prize overrides.
- TODO: real user accounts. Today there is no backend: name-only signup stored in `localStorage` (`tc_profile_v1`).

## Features (verified in `app.js` / `index.html`)

- **Trade terminal** — 8-symbol watchlist (XAUUSD, EURUSD, GBPUSD, USDJPY, BTCUSD, ETHUSD, US30, NAS100), order book + tape, Market/Limit/Stop order ticket with TP/SL, lots stepper, margin estimate, price alerts. All paper trading (1:100 leverage, order validation gate).
- **Positions** — Open / Pending / History tabs with live-ticking P/L.
- **Charts** — self-hosted Lightweight Charts v5.2.1 (`vendor/`); TradingView widget removed in v4. Real history via CoinGecko (crypto + PAXG gold); real FX anchors via open.er-api.com. Every symbol carries an honesty badge: LIVE / STALE / CLOSED / OFFLINE / Simulated. Unix-seconds timestamps.
- **Live rooms** — go-live with real device camera (WebRTC P2P host/viewer), MQTT presence, real chat, session recordings saved locally.
- **Reels** — Instagram-style upload + viewer; 8 sample MP4s in `assets/reels/`.
- **Community** — top traders, leaderboards, sentiment poll, analysis posts, DMs, referrals, achievements, streak.
- **Classes** — LMS tab with lessons/recordings/strategies/trades/materials and paid rooms ($5 private classes planned).
- **Broker connect** — Exness, Vantage, IC Markets, XM, OctaFX, FBS. Login modal is simulated — no real trading, no credentials leave the device.
- **i18n** — EN / AR / HI / UR.

## Explicitly NOT real (labelled "demo" in UI + code)

Auth, all prices except the real feeds, order fills, P/L, broker connections,
mirror latency, community content, chat, viewers, leaderboard. Nothing invented
is presented as real money or real performance.

## Open / TODO

- Real backend (when built: MySQL + PHP only per owner rule — no Supabase/Postgres).
- Real user accounts replacing name-only `localStorage` profiles.
- Real broker mirror trading (today: login modal + "connect" is demo).
- $5 paid classes checkout flow.
- Admin auth hardening (currently a static page behind an unlinked path).
