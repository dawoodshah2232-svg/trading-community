# Trading Community — Static Prototype

Mobile-first, app-like **static** web prototype for the "Trading Community" live-trading
community app concept. Plain HTML/CSS/JS — no build step, no frameworks. Open
`index.html` directly in a browser, or serve the folder with any static server.

## Preview

- Direct: open `/home/hatch/workspace/trading-community/index.html` in a browser
  (double-click works; the TradingView chart needs internet).
- Local server: `cd ~/workspace/trading-community && python3 -m http.server 8080`
  then visit `http://localhost:8080`.

On desktop the app renders inside a centered phone frame (max-width 430px);
on a real phone it is full-bleed with safe-area padding and a bottom tab bar.

## Screens

Bottom tab bar: **Home · Live · Go Live · Community · Profile**

1. **Home** — "Live now" rail + top-trader cards (avatar, verified badge, pair,
   P/L, win rate, live-trade count, Follow toggle, Watch live).
2. **Live room** — TradingView Advanced Real-Time Chart (XAUUSD), draggable +
   resizable face-cam overlay (snaps to corners, position/size persist in
   `localStorage`), simulated live trade feed, viewer count ticker, like button,
   "Copy trades" toggle, mock chat with send box.
3. **Go Live** — stream title, pair picker, multistream toggles
   (YouTube / Instagram), 4-corner face-cam position picker, Start Live button.
4. **Community** — NFP prediction poll with animated Buy/Sell sentiment bars,
   analysis post cards.
5. **Profile** — cover, verified badge, stats (win rate / live trades / followers),
   trade-history list, analysis tab, "Connect broker" entry point.
6. **Broker connect** (sub-screen from Profile) — broker list
   (Exness, Vantage, IC Markets, XM, OctaFX, FBS) with Connect buttons and
   an "Add new broker" row.

## What is MOCK vs REAL

| Feature | Status |
|---|---|
| All creators, stats, trades, chat messages, poll votes, posts | **Mock** — hardcoded in `app.js` (`MOCK_*`), chat/trade feed simulated on timers |
| TradingView Advanced Real-Time Chart (XAUUSD) | **Real** third-party widget (needs internet); a fallback notice shows if it can't load |
| Face-cam overlay | **Mock placeholder** — draggable/resizable, position persists via `localStorage`; no real camera access |
| Multistream toggles, Start Live, Copy-trades toggle | **Mock** — UI state only, toasts confirm nothing real happens |
| Broker Connect / Add new broker | **Mock** — bottom-sheet explains no auth occurs; "Connected" is a visual state |
| Follow buttons, likes, poll votes, chat send | **Mock** — in-memory page state only |
| Search, notifications, filters, share | **Mock** — toast placeholders |

## Deliberate placeholders / not built

- No backend, no accounts, no real streaming (RTMP/WebRTC), no broker APIs.
- Face-cam is a styled placeholder box, not `getUserMedia` video.
- Trade prices in the simulated feed are random-walk numbers, not market data
  (the TradingView widget itself shows real XAUUSD data when online).
- Copy trading has major regulatory/brokerage implications — intentionally left as
  a UI toggle with an explicit mock disclaimer.
- No iOS/Android wrapper; this is the mobile-web prototype that "looks like an app".
- Typography: Apple system font stack only; dark navy/black + single gold accent.
