# RULES — Trading Community

## Stack (fixed)

- Plain HTML/CSS/JS. **No build step, no framework, no bundler.** Keep it that way.
- No backend today. When one is built: **MySQL + PHP only** (cPanel hosting supports nothing else). No Supabase/Postgres backends.
- Charts: **vendored Lightweight Charts v5.2.1 only** (`vendor/`). Never a CDN script tag. TradingView widget was removed for licensing (ToS restricts commercial use) — do not re-add it.
- Cache-bust assets with `?v=` on every release (e.g. `app.js?v=25.21`), bumped in the script tag.

## Conventions

- Version string: `APP_VERSION` in `app.js` (e.g. `"25.21"`), shown in footer as `· demo build`. Bump on every release.
- Persistence: `localStorage` only. Keys are `tc_`-prefixed (`tc_profile_v1`).
- Commit style: `v25.21: <what changed>` (see git log). One concern per commit; no force pushes; never `git reset --hard`.
- GitHub Pages rule: after each push, check the Pages build status and wait for `built` before pushing again.
- Pull `origin/main` before starting work. Never commit other people's uncommitted changes.

## What AI must do

- **Honesty is the law.** Any invented number (latency, viewers, volume, P/L) must be badged/labelled in the UI and commented in code. See the v25.21 audit (commit `19f4e44`, findings F-01…F-17) as the reference standard.
- Chart work: Unix-seconds timestamps only; honesty badge per symbol (LIVE/STALE/CLOSED/OFFLINE/Simulated); hide volume when true per-candle volume is unavailable.
- UI work: load the `apple-design` skill + `web-animations` workspace skill first (owner standing rule). Run the blocking-issues audit in `references/apple-visual.md` before shipping UI.
- Test after editing: run `node tests/p0-regress.mjs`. Add a regression case when fixing a real bug.
- Broker connect: simulated login only. Never collect, transmit, or log real broker credentials. Never present a simulated fill as a real trade.

## What AI must NOT do

- No emojis in the UI. Icons = Heroicons inline SVG only.
- Never Roboto/Titillium/Montserrat/Open Sans as primary fonts — Apple font stack only (see DESIGN.md).
- Never put logos or product images on cards/boxes — logos float raw on the page (`assets/brokers/*.png` are already transparent).
- No fake reviews, fake stats, fake traffic, guaranteed outcomes.
- Never add a CDN dependency for anything vendored (charts) or bundled.
- No TradingView embed (licensing).
- Never auto-deploy backend code: when a backend exists, code is pushed to GitHub but stays off live until the owner's manual review + deploy.
- Never force-push. Never rewrite history.
