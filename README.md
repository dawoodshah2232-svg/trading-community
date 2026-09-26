# Trading Community — App UI Prototype (FULL REBUILD)

Mobile-first, app-like **static** web prototype for the "Trading Community"
live-trading community app concept. Plain HTML/CSS/JS — no build step, no
frameworks. Opens **directly into the logged-in trading interface** (like
Binance / Exness Trade): no landing page, no marketing.

## Preview

- Direct: open `index.html` in a browser (double-click works; the TradingView
  chart needs internet).
- Local server: `cd ~/workspace/trading-community && python3 -m http.server 8080`
  then visit `http://localhost:8080`.
- Single-file build: `trading-community-app.html` (CSS+JS inlined) — generated
  from the three source files for easy sharing.

On desktop the app renders inside a phone frame; on mobile it is full-bleed.

## Screens (bottom tab bar always visible)

1. **Trade** (default) — app bar with brand mark, symbol picker (XAUUSD, EURUSD,
   GBPUSD, USDJPY, BTCUSD, ETHUSD, US30, NAS100), ticking price + 24h change,
   alerts bell, avatar. TradingView Advanced chart with timeframe bar
   (1m–1D, reloads widget interval). Trade ticket: spread, lot stepper (0.01),
   margin estimate, BUY/SELL with live bid/ask → mock market orders land in
   Positions with live-ticking P/L.
2. **Positions** — Open / Pending / History tabs. Open rows show live P/L and a
   close (×) button; pending mock limit orders can be cancelled; history lists
   closed trades. Equity chip ticks with open P/L; tab badge counts open
   positions.
3. **Live** — streamer room: TradingView chart, draggable + resizable face-cam
   placeholder (position/size persist in localStorage), simulated live trade
   feed, viewer count, Copy-trades toggle, working chat with simulated
   incoming messages.
4. **Community** — XAUUSD sentiment poll (one vote, animated bars, persisted)
   + analysis post cards with like buttons.
5. **Profile** — trader stats, weekly P/L banner, trade history, broker connect
   list (Exness, Vantage, IC Markets, XM + Add broker) — UI mock.

## Mock vs real

| Area | Status |
|---|---|
| Prices, spreads, P/L, margin, equity | Simulated random-walk engine in `app.js` |
| Order execution, close, cancel | Mock, in-memory only |
| TradingView chart widget | Real embed (needs internet); canvas fallback if offline |
| Face-cam | Styled placeholder box, no camera access |
| Brokers, copy-trading, alerts, votes | UI mock; votes/poll persisted locally only |
| Chat, live feed, viewers | Simulated timers |

## Theme

Fintech blue `#2F80FF` primary + profit green `#22C55E` / loss red `#F04452`
on dark navy (`#05080F` family). Apple font stack only.
