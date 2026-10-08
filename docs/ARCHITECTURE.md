# ARCHITECTURE — Trading Community

Static app: no build step, no bundler, no backend, no database. Open
`index.html` (or `python3 -m http.server`) and it runs.

## Files

| File | Role |
|---|---|
| `index.html` (87 KB) | App shell: 12 tab roots (home, trade, reels, live, community, leaderboard, traders, ideas, portfolio, classes, brokers, profile, settings), bottom nav, dialogs |
| `app.js` (~341 KB, v25.21) | Everything: feed engine, charts, paper-trading, live rooms, reels, community, admin, i18n |
| `styles.css` (~163 KB) | Design system: theme variables, dark/light themes |
| `vendor/lightweight-charts.standalone.production.js` | Lightweight Charts v5.2.1 vendored locally (never CDN) |
| `admin.html` | Admin console (unlinked; announcements/traders/courses/contest prize overrides) |
| `trading-community-app.html` | Single-file inline build (styles + app.js inlined into index.html) for sharing |
| `404.html`, `privacy.html`, `terms.html`, `robots.txt`, `sitemap.xml`, `CNAME` | QA pages + SEO files |
| `assets/brokers/*.png` | Raw broker logos (exness, fbs, icmarkets, octafx, vantage, xm) |
| `assets/reels/*.mp4` | 8 sample reels |
| `tests/p0-regress.mjs` | Node regression tests (run: `node tests/p0-regress.mjs`) |

## Data flow

```
Public feeds (CoinGecko crypto+PAXG, open.er-api.com FX)
        │  fetch, fail-soft, 12s timeouts
        ▼
app.js feed engine ──▶ symbol badges (LIVE/STALE/CLOSED/OFFLINE/Simulated)
        │
        ├─▶ chart layer (Lightweight Charts, Unix-seconds timestamps)
        │       real candles where available; simulated anchored random-walk
        │       otherwise, honestly badged; volume hidden when not true per-candle
        │
        ├─▶ paper-trading engine (orders, TP/SL, alerts, 1:100 leverage gate)
        │       fills checked against tick stream; P/L computed locally
        │
        ├─▶ live rooms (MQTT presence + WebRTC P2P video + real chat)
        │
        └─▶ persistence: localStorage only
            tc_profile_v1 (name-only signup identity), votes, streaks, settings,
            face-cam position, recordings metadata
```

No server calls other than the two public price feeds. No cookies, no tracking.

## Chart honesty model (v25.21 audit)

- Crypto + gold: real CoinGecko OHLC history; intraday moves only on real quotes.
- FX/metals: daily anchor from open.er-api.com; intraday is anchored simulation, badged as such.
- Volumes: shown only when true per-candle volume exists; CoinGecko `total_volumes` is deliberately hidden (not true per-candle volume).
- Volume-empty crash (F-02/F-03) fixed; covered by `tests/p0-regress.mjs`.

## Deploy

Push to `main` → GitHub Pages rebuild → live at trade.flexspot.lol.
After each push, wait for the Pages build (`built` status) before pushing again — never stack pushes.

## TODO

- Backend: when a backend is built it must be MySQL + PHP only (cPanel rule). App code today assumes localStorage; a storage abstraction will be needed before real accounts.
- `trading-community-app.html` is hand-generated; there is no script that rebuilds it — stale risk if `index.html`/`app.js` change without regenerating.
