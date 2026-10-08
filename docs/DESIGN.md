# DESIGN — Trading Community (Trade.FlexSpot)

Source of truth: `styles.css` tokens (lines 1–95). Re-themed gold → fintech blue+green in commit `f1e9968`.

## Brand

- **Brand accent:** green `--brand: #22C55E` (brand = buy/up/profit).
- **Secondary:** blue `--blue: #2F80FF`, `--blue-deep: #1B5FD6` (info, links, broker chips).
- **Direction color:** green `#22C55E` = buy/up/profit · red `#F04452` = sell/down/loss.
- Lightweight Charts v5 logo attribution disabled (`attributionLogo:false`); app honours data honesty badges instead.

## Themes

- Dark (default): near-black navy `--bg: #060A13`, `--surface: #0E1526`, text `#F2F5FA`, muted `#8A94A8`.
- Light: paper `--bg: #F2F4F7`, `--surface: #FFFFFF`, text `#0F172A`, muted `#5B6B84`.
- QA 2026-09-29: muted colors were darkened for 4.5:1 small-text contrast — don't lighten them back.

## Typography

- Words: Apple font stack — `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif`. Never Roboto/Titillium/Montserrat/Open Sans.
- Numbers/prices: system mono `ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace` with **tabular numerals** (price columns must not jitter).
- Type scale: hero 28 · h2 20 · h3 15 · body 14 · small 12.5 · micro 11 (px).

## Components

- Buttons: `.btn` variants; primary = green brand gradient w/ white text; buy = green, sell = red. Radius: `--r-sm: 8px`, `--r-md: 12px`, `--r-lg: 16px`.
- Icon buttons: 44px touch targets (`.icon-btn`); primary variant = blue gradient.
- Avatars: 44px circles, blue gradient, initials — never stock photos for fresh accounts.
- Badges: honesty badges (LIVE/STALE/CLOSED/OFFLINE/Simulated), demo chips, LIVE rooms = red badge.
- Bottom nav (mobile): persistent, always visible. Desktop: full terminal layout — left sidebar nav + top app bar + watchlist/chart/order-book/ticket side-by-side.

## Spacing

4/8/12/16/24 scale (`--sp1…--sp6`). Mobile-first: everything must hold at 320–430px; landscape ticket becomes a slide-over.

## Brand rules (owner standing)

- **No emojis in UI.** Icons = Heroicons inline SVG only.
- Logos and product images float **raw** — no cards/boxes behind them (`assets/brokers/*.png` used as-is).
- Data honesty: simulated prices/fills/viewers are labelled "demo" in UI and code. Empty states = friendly designed message, never a generic red error box.
- UI motion: apple-design + web-animations standards — respond on pointer-down, critically-damped springs, transform/opacity only.
