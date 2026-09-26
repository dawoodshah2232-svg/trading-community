/* ============================================================
   Trading Community — trading terminal (FULL REBUILD)
   *** EVERYTHING IS MOCK / SIMULATED ***
   Random-walk price engine, mock fills, mock brokers, mock
   chat/feed/alerts. No real market data, no real broker, no
   real auth. The chart is self-hosted on Lightweight Charts
   v4.2.3 (CDN) and fed by the same simulated engine below —
   there is no external chart provider anymore.
   ============================================================ */
(function(){
"use strict";

/* ============================================================
   AUTH DISABLED for demo — re-enable later.
   The app opens straight into the terminal. The old auth flow
   (splash / welcome / social buttons / session) is preserved
   below in dormant form for the real rollout.

   function showView(name){ ... }
   function finishAuth(user){ ... localStorage tc_session_v1 ... }
   socialLogin("google"|"facebook"|"apple") -> finishAuth(...)
   logout() -> clears session, shows auth view
   ============================================================ */

/* ---------------- ICONS (handcrafted 1.8px stroke set) ---------------- */
const ICONS = {
  home:'<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>',
  trade:'<path d="M6 4v3M6 11v9M4 7h4M4 14h4M12 3v4M12 11v10M10 7h4M10 15h4M18 8v3M18 15v5M16 11h4M16 18h4"/>',
  positions:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  live:'<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 000 7M15.5 8.5a5 5 0 010 7M5.6 5.6a9 9 0 000 12.8M18.4 5.6a9 9 0 010 12.8"/>',
  community:'<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.8.3 5 2.6 5 5.8"/>',
  profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  theme:'<path d="M20 13.5A8 8 0 1110.5 4 6.5 6.5 0 0020 13.5z"/>',
  bell:'<path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 004 0"/>',
  chev:'<path d="M6 9l6 6 6-6"/>',
  check:'<path d="M4 12.5l5 5L20 6.5"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  link:'<path d="M10 14a5 5 0 007.1 0l2.4-2.4a5 5 0 00-7.1-7.1L11 5.9"/><path d="M14 10a5 5 0 00-7.1 0l-2.4 2.4a5 5 0 007.1 7.1L13 18.1"/>',
  trash:'<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
  send:'<path d="M4 12l16-7-7 16-2.5-6.5z"/><path d="M11.5 14.5L20 5"/>',
  cam:'<rect x="3" y="7" width="13" height="12" rx="3"/><path d="M16 10.5l5-3v9l-5-3"/>',
  star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5L16 16"/>',
  reel:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9.5h18M7.5 5v4.5M16.5 5v4.5"/><path d="M10.5 12.5l4.5 2.5-4.5 2.5z"/>',
  edit:'<path d="M4 20l4-1L19 8l-3-3L5 16l-1 4z"/><path d="M13.5 6.5l3 3"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  bank:'<path d="M4 10l8-6 8 6"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/><path d="M4 20h16"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5h.01"/>',
};
function injectIcons(){
  document.querySelectorAll("[data-icon]").forEach(el=>{
    const p = ICONS[el.dataset.icon];
    if(!p) return;
    el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
  });
}

/* ---------------- MOCK SYMBOL UNIVERSE (18 assets, 5 categories) ---------------- */
const SYMBOLS = {
  XAUUSD: { cat:"Metals",  name:"Gold vs US Dollar",   ex:"OANDA",    base:2652.40, digits:2, spread:0.25,   vol:0.85,   perPoint:100,    contract:100,    chg:0.42 },
  XAGUSD: { cat:"Metals",  name:"Silver vs US Dollar", ex:"OANDA",   base:31.20,   digits:2, spread:0.04,   vol:0.06,   perPoint:5000,   contract:5000,   chg:0.65 },
  EURUSD: { cat:"Forex",   name:"Euro vs US Dollar",   ex:"OANDA",    base:1.08420, digits:5, spread:0.00012, vol:0.00026, perPoint:100000, contract:100000, chg:-0.11 },
  GBPUSD: { cat:"Forex",   name:"Pound vs US Dollar",  ex:"OANDA",    base:1.29740, digits:5, spread:0.00018, vol:0.00032, perPoint:100000, contract:100000, chg:0.23 },
  USDJPY: { cat:"Forex",   name:"US Dollar vs Yen",    ex:"OANDA",    base:149.820, digits:3, spread:0.015,   vol:0.042,  perPoint:667,    contract:100000, chg:-0.31 },
  AUDUSD: { cat:"Forex",   name:"Aussie vs US Dollar", ex:"OANDA",    base:0.65800, digits:5, spread:0.00015, vol:0.00020, perPoint:100000, contract:100000, chg:0.18 },
  USDCAD: { cat:"Forex",   name:"US Dollar vs CAD",    ex:"OANDA",    base:1.36500, digits:5, spread:0.00018, vol:0.00030, perPoint:100000, contract:100000, chg:-0.22 },
  NZDUSD: { cat:"Forex",   name:"Kiwi vs US Dollar",   ex:"OANDA",    base:0.59800, digits:5, spread:0.00020, vol:0.00019, perPoint:100000, contract:100000, chg:0.05 },
  USDCHF: { cat:"Forex",   name:"US Dollar vs Franc",  ex:"OANDA",    base:0.89500, digits:5, spread:0.00016, vol:0.00021, perPoint:100000, contract:100000, chg:-0.14 },
  BTCUSD: { cat:"Crypto",  name:"Bitcoin vs Dollar",   ex:"BITSTAMP", base:97420.00, digits:2, spread:25,      vol:95,     perPoint:1,      contract:1,      chg:1.84 },
  ETHUSD: { cat:"Crypto",  name:"Ethereum vs Dollar",  ex:"BITSTAMP", base:3420.50, digits:2, spread:2.2,     vol:6.2,    perPoint:10,     contract:10,     chg:2.12 },
  SOLUSD: { cat:"Crypto",  name:"Solana vs Dollar",    ex:"BINANCE",  base:215.40,  digits:2, spread:0.35,    vol:0.9,    perPoint:100,    contract:100,    chg:3.05 },
  BNBUSD: { cat:"Crypto",  name:"BNB vs Dollar",       ex:"BINANCE",  base:585.20,  digits:2, spread:0.60,    vol:1.8,    perPoint:20,     contract:20,     chg:1.12 },
  XRPUSD: { cat:"Crypto",  name:"XRP vs Dollar",       ex:"BINANCE",  base:0.6250,  digits:4, spread:0.0020,  vol:0.004,  perPoint:20000,  contract:20000,  chg:-1.45 },
  US30:   { cat:"Indices", name:"Dow Jones 30",        ex:"DJ",       base:42150.00, digits:2, spread:2.4,     vol:13,     perPoint:5,      contract:1,      chg:0.35 },
  NAS100: { cat:"Indices", name:"Nasdaq 100",          ex:"NASDAQ",   base:19280.50, digits:2, spread:1.6,     vol:8.5,    perPoint:5,      contract:1,      chg:0.62 },
  SPX500: { cat:"Indices", name:"S&P 500",             ex:"SP",       base:5980.25, digits:2, spread:0.45,    vol:2.2,    perPoint:25,     contract:1,      chg:0.28 },
  USOIL:  { cat:"Energy",  name:"WTI Crude Oil",       ex:"NYMEX",    base:68.45,   digits:2, spread:0.04,    vol:0.12,   perPoint:1000,   contract:1000,   chg:-0.85 }
};
const SYM_ORDER = ["XAUUSD","XAGUSD","EURUSD","GBPUSD","USDJPY","AUDUSD","USDCAD","NZDUSD","USDCHF",
                   "BTCUSD","ETHUSD","SOLUSD","BNBUSD","XRPUSD","US30","NAS100","SPX500","USOIL"];
const LEVERAGE = 100;
const START_BALANCE = 10000;

/* ---------------- STATE (all mock) ---------------- */
const state = {
  sym:"XAUUSD", tf:"1m",
  ttype:"market", dir:"buy", lots:0.10, tpslOn:false,
  prices:{}, hist:{}, depth:{},
  open:[], pending:[], history:[],
  alerts:[], alertSeq:1, orderSeq:1,
  balance:START_BALANCE,
  liveBuilt:false, voted:null
};
SYM_ORDER.forEach(s=>{
  const m = SYMBOLS[s];
  state.prices[s] = { bid:m.base, ask:m.base+m.spread, chg:m.chg };
  state.hist[s] = [m.base];
});

/* ---------------- MARKET HOURS ----------------
   Spot forex/metals/indices/energy trade Sun 22:00 UTC -> Fri 21:00 UTC.
   Crypto trades 24/7. When closed we FREEZE the price (no fake ticking)
   and the UI shows a clear "Market closed" state. */
const CRYPTO_SYMS = new Set(["BTCUSD","ETHUSD","SOLUSD","BNBUSD","XRPUSD"]);
function mktOpen(sym){
  if(CRYPTO_SYMS.has(sym)) return true;
  const n = new Date(), d = n.getUTCDay(), h = n.getUTCHours() + n.getUTCMinutes()/60;
  if(d === 6) return false;             /* Saturday */
  if(d === 0 && h < 22) return false;   /* Sunday before 22:00 UTC */
  if(d === 5 && h >= 21) return false;  /* Friday after 21:00 UTC */
  return true;
}
state.live = {};   /* sym -> "live" (real-time quote) | "daily" (daily indicative anchor) */
state.quoteAt = {}; /* sym -> timestamp of the last real quote (for freshness display) */
state.dataReal = {}; /* sym -> true once the chart holds REAL candles */

/* ---------------- REAL MARKET FEEDS (free, no key, CORS-ok; fail-soft) ---------------- */
const CG_IDS = { BTCUSD:"bitcoin", ETHUSD:"ethereum", SOLUSD:"solana", BNBUSD:"binancecoin", XRPUSD:"ripple", XAUUSD:"pax-gold" };
function fetchJSON(url, ms){
  const c = new AbortController(); const t = setTimeout(()=>c.abort(), ms || 8000);
  return fetch(url, { cache:"no-store", signal:c.signal })
    .then(r=>{ clearTimeout(t); if(!r.ok) throw new Error("bad"); return r.json(); })
    .catch(e=>{ clearTimeout(t); throw e; });
}
/* Anchors the price to the market. Real quotes set the traded price exactly —
   no glide, no invented ticks: what you see is the quote we received.
   kind: "live" = real-time quote, "daily" = daily indicative anchor, falsy = simulated. */
function anchorPrice(sym, price, chg, hard, kind){
  const m = SYMBOLS[sym]; if(!m || !(price > 0)) return;
  m.base = price;
  if(typeof chg === "number" && isFinite(chg)) m.chg = Math.max(-99, Math.min(99, chg));
  const pr = state.prices[sym];
  if(hard || kind){ pr.bid = price; pr.ask = price + m.spread; }
  pr.chg = m.chg;
  if(kind){ state.live[sym] = kind; state.quoteAt[sym] = Date.now(); }
  const h = state.hist[sym]; h.push(pr.bid); if(h.length > 140) h.shift();
}
/* how old the last real quote for a symbol is — shown next to the feed badge */
function quoteAge(sym){
  const t = state.quoteAt[sym]; if(!t) return "";
  const s = Math.round((Date.now()-t)/1000);
  if(s < 5) return "just now";
  if(s < 60) return s+"s ago";
  const m = Math.round(s/60);
  if(m < 60) return m+"m ago";
  return Math.round(m/60)+"h ago";
}
async function fetchRealPrices(full){
  const jobs = [];
  /* crypto + gold (PAXG tracks spot gold) — 24/7 quote, but we only move the
     chart anchor while each market is actually open */
  const ids = Object.values(CG_IDS).join(",");
  jobs.push(fetchJSON("https://api.coingecko.com/api/v3/simple/price?ids="+ids+"&vs_currencies=usd&include_24hr_change=true").then(j=>{
    Object.entries(CG_IDS).forEach(([s,id])=>{
      const d = j && j[id];
      if(d && d.usd > 0 && mktOpen(s)) anchorPrice(s, d.usd, d.usd_24h_change, full, "live");
    });
  }).catch(()=>{}));
  if(full){
    /* forex — free, no key, CORS-enabled (daily anchor; the price holds the
       anchor between refreshes — no invented intraday movement) */
    jobs.push(fetchJSON("https://open.er-api.com/v6/latest/USD").then(f=>{
      const r = f && f.rates; if(!r || f.result !== "success") return;
      const conv = { EURUSD:1/r.EUR, GBPUSD:1/r.GBP, USDJPY:r.JPY, AUDUSD:1/r.AUD,
                     USDCAD:r.CAD, NZDUSD:1/r.NZD, USDCHF:r.CHF };
      Object.entries(conv).forEach(([s,p])=>{ if(mktOpen(s)) anchorPrice(s, p, undefined, true, "daily"); });
    }).catch(()=>{}));
  }
  await Promise.all(jobs);
  updateDataBadges();
}
fetchRealPrices(true);
setInterval(()=>fetchRealPrices(false), 60000);
setInterval(()=>fetchRealPrices(true), 15*60000);
setInterval(()=>{ try{ updateDataBadges(); }catch(e){} }, 10000); /* keep the quote-age label fresh */
/* seed one demo alert so the feature is visible */
state.alerts.push({ id:"a"+(state.alertSeq++), sym:"XAUUSD", cond:"above", price:2660.00, triggered:false });

/* ---------------- FAVORITES / WISHLIST (persisted) ---------------- */
const FAV_KEY = "tc_favs_v1";
const DEFAULT_FAVS = ["XAUUSD","EURUSD","BTCUSD"];
function loadFavs(){
  try{
    const raw = JSON.parse(localStorage.getItem(FAV_KEY)||"null");
    if(Array.isArray(raw)) return raw.filter(s=>SYMBOLS[s]);
  }catch(e){}
  return DEFAULT_FAVS.slice();
}
state.favs = loadFavs();
function saveFavs(){ try{ localStorage.setItem(FAV_KEY, JSON.stringify(state.favs)); }catch(e){} }
function isFav(s){ return state.favs.includes(s); }
function toggleFav(s){
  if(!SYMBOLS[s]) return;
  if(isFav(s)) state.favs = state.favs.filter(x=>x!==s);
  else state.favs.push(s);
  saveFavs();
  renderWatchlist();
  if(!$("symbolSheet").hidden) renderSymbolSheet(); /* refresh the open picker */
  toast(s + (isFav(s) ? " added to" : " removed from") + " favorites — demo");
}
/* watchlist order: favorites first (in fav order), then everything else */
function watchOrder(){
  const favs = state.favs.filter(s=>SYMBOLS[s]);
  return [...favs, ...SYM_ORDER.filter(s=>!favs.includes(s))];
}

/* ---------------- HELPERS ---------------- */
const $ = id => document.getElementById(id);
const meta = s => SYMBOLS[s];
const px = s => state.prices[s];
const fmtP = (s,v) => v.toFixed(meta(s).digits);
const fmt$ = v => (v<0?"-$":"$") + Math.abs(v).toLocaleString("en-US",{minimumFractionDigits:2, maximumFractionDigits:2});
const plClass = v => v>=0 ? "pl-pos" : "pl-neg";
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

let toastTimer = null;
function toast(msg){
  const t = $("toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.hidden = true; }, 2400);
}
/* 150ms tick flash on a price element */
function flash(el, up){
  if(!el) return;
  el.classList.remove("flash-up","flash-down");
  void el.offsetWidth;
  el.classList.add(up ? "flash-up" : "flash-down");
}

/* ---------------- THEME ---------------- */
function theme(){ return document.documentElement.dataset.theme || "dark"; }
function setTheme(t){
  document.documentElement.dataset.theme = t;
  $("themeNameSide").textContent = t === "dark" ? "Dark" : "Light";
  const stn = $("setThemeName"); if(stn) stn.textContent = t === "dark" ? "Dark" : "Light";
  try{ localStorage.setItem("tc_theme_v1", t); }catch(e){}
  applyChartTheme(); /* recolor the self-hosted chart */
}
$("themeBtn").addEventListener("click", ()=>setTheme(theme()==="dark"?"light":"dark"));
$("themeToggleSide").addEventListener("click", ()=>setTheme(theme()==="dark"?"light":"dark"));

/* ---------------- TABS ---------------- */
function goTab(tab){
  document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $("screen-"+tab).classList.add("active");
  document.querySelector(".content").scrollTop = 0;
  if(tab==="live" && !state.liveBuilt){ state.liveBuilt = true; buildLive(); }
  if(tab!=="live" && state.liveBuilt) stopCamera(); /* stop face-cam tracks off the live tab */
}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click", ()=>goTab(b.dataset.tab)));
$("avatarBtn").addEventListener("click", ()=>goTab("profile"));
$("bellBtn").addEventListener("click", ()=>{
  goTab("trade");
  setTimeout(()=>{ $("alertsCard").scrollIntoView({behavior:"smooth", block:"center"}); }, 60);
});

/* ---------------- PRICE ENGINE (simulated random walk) ---------------- */
let prevBid = {};
function tick(){
  SYM_ORDER.forEach(s=>{
    const m = meta(s), pr = px(s);
    prevBid[s] = pr.bid;
    if(!mktOpen(s)) return; /* market closed: freeze at last price, no fake movement */
    if(state.live[s]) return; /* real feed: price moves ONLY when a real quote arrives — never invented */
    /* simulated symbols only: honest random-walk, badged "Simulated" in the UI */
    pr.bid += (m.base - pr.bid)*0.004 + (Math.random()-0.5)*2*m.vol;
    pr.ask = pr.bid + m.spread;
    pr.chg += (Math.random()-0.5)*0.02;
    const h = state.hist[s]; h.push(pr.bid); if(h.length>140) h.shift();
  });
  checkAlerts();
  fillPending();
  checkTpSl();
  renderWatchlistTick();
  renderSheetTick(); /* live prices inside the open asset picker */
  renderHeaderTick();
  renderDepth();
  renderTapeTick();
  renderTicketTick();
  renderPositionsTick();
  renderAccount();
  updateChartTick(); /* roll the self-hosted candle chart forward */
  if(++tickCount % 7 === 0){ renderYouCard(); updateDataBadges(); } /* your presence card, ~5s */
  if(lw.bars.length !== lastIndBars || tickCount % 9 === 0) renderIndicators(); /* keep indicators live */
}
let tickCount = 0;

/* ---------------- WATCHLIST ---------------- */
function renderWatchlist(){
  const list = $("watchList"); list.innerHTML = "";
  watchOrder().forEach(s=>{
    const b = document.createElement("button");
    b.className = "wl-item" + (s===state.sym ? " current" : "") + (!mktOpen(s) ? " is-closed" : "");
    b.dataset.sym = s; b.setAttribute("role","option");
    b.setAttribute("aria-selected", s===state.sym ? "true" : "false");
    b.innerHTML = '<span class="wl-sym">'+(isFav(s)?'<span class="ic xs wl-star" data-icon="star"></span>':"")+'<b>'+s+'</b>'+(!mktOpen(s)?'<span class="wl-closed">Closed</span>':"")+'</span>'+
      '<span class="wl-px"><span class="num" data-wl-px="'+s+'">—</span><br>'+
      '<span class="chg num" data-wl-chg="'+s+'">—</span></span>';
    b.addEventListener("click", ()=>setSymbol(s));
    list.appendChild(b);
  });
  injectIcons(); /* star markers */
  renderWatchlistTick();
}
function renderWatchlistTick(){
  document.querySelectorAll(".wl-item").forEach(el=>{
    el.classList.toggle("is-closed", !mktOpen(el.dataset.sym));
  });
  SYM_ORDER.forEach(s=>{
    const pr = px(s);
    const pxEl = document.querySelector('[data-wl-px="'+s+'"]');
    const chgEl = document.querySelector('[data-wl-chg="'+s+'"]');
    if(pxEl){
      const up = pr.bid >= (prevBid[s] ?? pr.bid);
      pxEl.textContent = fmtP(s, pr.bid);
      flash(pxEl, up);
    }
    if(chgEl){
      chgEl.textContent = (pr.chg>=0?"+":"") + pr.chg.toFixed(2) + "%";
      chgEl.classList.toggle("up", pr.chg>=0);
      chgEl.classList.toggle("down", pr.chg<0);
    }
  });
}

/* ---------------- SYMBOL HEADER + SHEET ---------------- */
function setSymbol(s){
  if(!SYMBOLS[s]) return;
  state.sym = s;
  $("symName").textContent = s;
  $("symTitle").textContent = s;
  $("symSub").textContent = meta(s).name + " · " + meta(s).ex;
  document.querySelectorAll(".wl-item").forEach(el=>{
    const cur = el.dataset.sym === s;
    el.classList.toggle("current", cur);
    el.setAttribute("aria-selected", cur ? "true" : "false");
  });
  refreshMainData(); /* regenerate candles for the new symbol */
  renderDepth(true); renderTape(true);
  renderHeaderTick(); renderTicketTick();
  updateDataBadges(); /* market open/closed + real-time/simulated state */
  $("tPrice").value = "";
}
function renderHeaderTick(){
  const s = state.sym, pr = px(s);
  const hp = $("hdrPrice"), sp = $("symPrice");
  const up = pr.bid >= (prevBid[s] ?? pr.bid);
  hp.textContent = fmtP(s, pr.bid); flash(hp, up);
  sp.textContent = fmtP(s, pr.bid); flash(sp, up);
  const c = $("hdrChg");
  c.textContent = (pr.chg>=0?"+":"") + pr.chg.toFixed(2) + "%";
  c.className = "chg-pill num " + (pr.chg>=0 ? "up" : "down");
  $("hdrSpread").textContent = fmtP(s, meta(s).spread);
}
$("symPicker").addEventListener("click", ()=>{
  sheetQuery = ""; $("sheetSearch").value = ""; /* fresh search each open */
  renderSymbolSheet(); openSheet();
});
function openSheet(){ $("backdrop").hidden = false; $("symbolSheet").hidden = false; }
function closeSheet(){ $("backdrop").hidden = true; $("symbolSheet").hidden = true; }
$("backdrop").addEventListener("click", closeSheet);
$("sheetX").addEventListener("click", closeSheet);

/* ---------------- ASSET PICKER: search + category tabs + favorites ---------------- */
let sheetCat = "Favorites", sheetQuery = "";
function sheetSymbols(){
  const q = sheetQuery.trim().toLowerCase();
  if(q) return SYM_ORDER.filter(s=>s.toLowerCase().includes(q) || meta(s).name.toLowerCase().includes(q));
  if(sheetCat==="Favorites") return state.favs.filter(s=>SYMBOLS[s]);
  return SYM_ORDER.filter(s=>meta(s).cat===sheetCat);
}
function renderSymbolSheet(){
  const list = $("symbolList"); list.innerHTML = "";
  const arr = sheetSymbols();
  if(!arr.length){
    list.innerHTML = '<div class="empty">'+(sheetQuery.trim() || sheetCat!=="Favorites"
      ? "No assets match your search."
      : "No favorites yet.<br>Tap the star on any asset to pin it here.")+'</div>';
    return;
  }
  arr.forEach(s=>{
    const pr = px(s), fav = isFav(s);
    const row = document.createElement("div");
    row.className = "sym-row" + (s===state.sym ? " current" : "");
    row.setAttribute("role","option");
    row.setAttribute("aria-selected", s===state.sym ? "true" : "false");
    row.innerHTML =
      '<button class="fav-star'+(fav?" on":"")+'" data-fav="'+s+'" aria-label="'+(fav?"Remove from":"Add to")+' favorites" aria-pressed="'+fav+'"><span class="ic sm" data-icon="star"></span></button>'+
      '<span class="sym-id"><b>'+s+'</b><i>'+esc(meta(s).name)+'</i></span>'+
      '<span class="sym-px"><span class="num" data-sh-px="'+s+'">'+fmtP(s,pr.bid)+'</span>'+
      '<span class="chg num '+(pr.chg>=0?"up":"down")+'" data-sh-chg="'+s+'">'+(pr.chg>=0?"+":"")+pr.chg.toFixed(2)+'%</span></span>';
    row.addEventListener("click", (e)=>{
      if(e.target.closest("[data-fav]")) return; /* star toggle handles itself — don't also select */
      setSymbol(s); closeSheet();
    });
    list.appendChild(row);
  });
  injectIcons();
}
/* star toggles — delegated; stopPropagation keeps the row from selecting */
$("symbolList").addEventListener("click", e=>{
  const st = e.target.closest("[data-fav]");
  if(st){ e.stopPropagation(); toggleFav(st.dataset.fav); }
});
$("sheetCats").addEventListener("click", e=>{
  const b = e.target.closest(".scat"); if(!b) return;
  sheetCat = b.dataset.cat;
  document.querySelectorAll(".scat").forEach(x=>x.classList.toggle("active", x===b));
  renderSymbolSheet();
});
$("sheetSearch").addEventListener("input", e=>{ sheetQuery = e.target.value; renderSymbolSheet(); });
/* live ticking inside the open picker */
function renderSheetTick(){
  if($("symbolSheet").hidden) return;
  sheetSymbols().forEach(s=>{
    const pr = px(s);
    const p = document.querySelector('[data-sh-px="'+s+'"]');
    const c = document.querySelector('[data-sh-chg="'+s+'"]');
    if(p) p.textContent = fmtP(s, pr.bid);
    if(c){
      c.textContent = (pr.chg>=0?"+":"")+pr.chg.toFixed(2)+"%";
      c.classList.toggle("up", pr.chg>=0);
      c.classList.toggle("down", pr.chg<0);
    }
  });
}

/* ---------------- SELF-HOSTED CHART — Lightweight Charts v4.2.3 ----------------
   The TradingView widget iframe was removed (it errored on real devices).
   Candles are generated from the same simulated price engine, seeded per
   symbol+timeframe so the history looks real. EVERYTHING REMAINS MOCK. */
const LW = () => window.LightweightCharts;
const TF_MIN = { "1m":1, "5m":5, "15m":15, "1H":60, "4H":240, "1D":1440 };
const N_BARS = 240;
function hashStr(str){ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

/* Generate N_BARS candles for symbol s at timeframe tf, last close = live price */
function genBars(s, tf){
  const m = meta(s), mins = TF_MIN[tf]||1, cur = px(s).bid;
  const rnd = mulberry32(hashStr(s+"|"+tf));
  const perMin = (m.vol*(0.55+rnd()*0.9)) / Math.sqrt(mins);
  const total = N_BARS*mins, closes = new Array(total+1);
  closes[total] = cur;
  for(let i=total-1;i>=0;i--) closes[i] = closes[i+1] - (rnd()-0.5)*2*perMin;
  const bucket = mins*60;
  const lastT = Math.floor(Date.now()/1000/bucket)*bucket;
  const bars = [], vols = [];
  for(let j=0;j<N_BARS;j++){
    const a = j*mins, b = (j+1)*mins, o = closes[a], c = closes[b];
    let h = o, l = o;
    for(let k=a;k<=b;k++){ const v = closes[k]; if(v>h) h=v; if(v<l) l=v; }
    const up = c>=o, t = lastT-(N_BARS-1-j)*bucket;
    bars.push({ time:t, open:o, high:h, low:l, close:c });
    vols.push({ time:t, value:+(0.4+rnd()*2.2).toFixed(2), color: up?"rgba(34,197,94,0.32)":"rgba(239,68,68,0.32)" });
  }
  return { bars, vols };
}

const lw = { chart:null, candles:null, volume:null, bars:[], vols:[], liveChart:null, liveCandles:null, liveBars:[] };

function lwTheme(){
  const dark = theme()==="dark";
  return {
    layout:{
      background:{ type:"solid", color:"transparent" },
      textColor: dark ? "#8b93a7" : "#5b6478",
      fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Arial,sans-serif',
      fontSize: 11
    },
    grid:{
      vertLines:{ color: dark ? "rgba(148,163,184,0.07)" : "rgba(15,23,42,0.06)" },
      horzLines:{ color: dark ? "rgba(148,163,184,0.07)" : "rgba(15,23,42,0.06)" }
    },
    crosshair:{
      mode: LW().CrosshairMode.Normal,
      vertLine:{ color: dark ? "rgba(148,163,184,0.5)" : "rgba(15,23,42,0.4)", labelBackgroundColor: dark ? "#2a3448" : "#e2e8f0" },
      horzLine:{ color: dark ? "rgba(148,163,184,0.5)" : "rgba(15,23,42,0.4)", labelBackgroundColor: dark ? "#2a3448" : "#e2e8f0" }
    },
    rightPriceScale:{ borderVisible:false },
    timeScale:{ borderVisible:false, timeVisible:true, secondsVisible:false }
  };
}
function lwCandleOpts(){
  return { upColor:"#22C55E", downColor:"#EF4444", wickUpColor:"#22C55E", wickDownColor:"#EF4444",
           borderVisible:false, priceLineVisible:true, lastValueVisible:true };
}

function chartErr(host, msg){
  if(host) host.innerHTML = '<div class="lw-err">'+msg+'<br>Check your connection and reload.</div>';
}
/* Deferred, guarded chart creation: the #tvChart container can be zero-sized
   at init (not yet laid out), which used to produce a permanently blank chart.
   We wait via rAF until it has real dimensions, then build inside try/catch so
   a chart failure can NEVER kill the rest of the app again. */
function buildMainChart(){
  const host = $("tvChart");
  if(!host) return;
  if(!LW()){ chartErr(host, "Chart library failed to load."); return; }
  if(lw.chart) return;
  let tries = 0;
  (function waitSize(){
    if(lw.chart) return;
    if(host.clientWidth > 0 && host.clientHeight > 0){
      try{ buildMainChartNow(host); }
      catch(err){ console.error("[chart] init failed:", err); chartErr(host, "Chart failed to start."); }
      return;
    }
    if(++tries < 90) requestAnimationFrame(waitSize);
    else chartErr(host, "Chart area unavailable.");
  })();
}
function buildMainChartNow(host){
  host.innerHTML = "";
  /* indicator objects belong to the previous chart instance — drop them so they rebuild cleanly */
  try{ Object.keys(indPanes).forEach(dropIndPane); }catch(e){}
  indBuilt = null; indSig = ""; indSyncBound = false;
  lw.chart = LW().createChart(host, Object.assign({ width:host.clientWidth, height:host.clientHeight }, lwTheme()));
  lw.candles = lw.chart.addCandlestickSeries(lwCandleOpts());
  lw.volume = lw.chart.addHistogramSeries({ priceScaleId:"vol", priceFormat:{ type:"volume" } });
  lw.chart.priceScale("vol").applyOptions({ scaleMargins:{ top:0.84, bottom:0 } });
  refreshMainData();
  lw.chart.subscribeCrosshairMove(onMainCrosshair);
  bindIndSync(); /* keep indicator panes glued to the main chart's scroll/zoom */
  new ResizeObserver(()=>{ if(lw.chart && host.clientWidth) lw.chart.resize(host.clientWidth, host.clientHeight); }).observe(host);
}
/* Real OHLC history (CoinGecko, free/no-key/CORS-ok) for crypto + PAXG (gold).
   Other symbols keep anchored simulated intraday, honestly badged. */
const realBarsCache = {};
function bucketBars(pts, mins){
  const bucket = mins*60*1000, map = new Map();
  pts.forEach(pt=>{
    const t = pt[0], p = pt[1]; if(!(p > 0)) return;
    const b = Math.floor(t/bucket)*bucket;
    let c = map.get(b);
    if(!c) map.set(b, c = { time:Math.floor(b/1000), open:p, high:p, low:p, close:p });
    else { c.close = p; if(p > c.high) c.high = p; if(p < c.low) c.low = p; }
  });
  return [...map.values()].sort((a,b)=>a.time-b.time);
}
function bucketVols(vpts, mins, bars){
  /* real per-bucket volume from CoinGecko total_volumes — never invented */
  if(!Array.isArray(vpts) || !vpts.length) return [];
  const bucket = mins*60*1000, map = new Map();
  vpts.forEach(pt=>{
    const t = pt[0], v = pt[1]; if(!(v >= 0)) return;
    const b = Math.floor(t/bucket)*bucket;
    map.set(b, (map.get(b) || 0) + v);
  });
  return bars.map(b=>{
    const v = map.get(b.time*1000);
    return v == null ? null : { time:b.time, value:+v.toFixed(2),
      color: b.close >= b.open ? "rgba(34,197,94,0.32)" : "rgba(239,68,68,0.32)" };
  }).filter(Boolean);
}
async function fetchRealBars(sym, tf){
  const id = CG_IDS[sym]; if(!id) return null;
  const key = sym+"|"+tf, now = Date.now(), c = realBarsCache[key];
  if(c && now - c.t < 5*60000) return c;
  const mins = TF_MIN[tf] || 1, days = mins >= 240 ? 30 : 2;
  try{
    const j = await fetchJSON("https://api.coingecko.com/api/v3/coins/"+id+"/market_chart?vs_currency=usd&days="+days+(days <= 2 ? "&interval=minutely" : ""), 12000);
    const pts = j && j.prices;
    if(!Array.isArray(pts) || pts.length < 20) return null;
    const bars = bucketBars(pts, mins).slice(-N_BARS);
    if(bars.length < 30) return null;
    const out = { t:now, bars, vols:bucketVols(j.total_volumes, mins, bars) };
    realBarsCache[key] = out;
    return out;
  }catch(e){ return null; }
}
async function refreshMainData(){
  if(!lw.candles) return;
  const s = state.sym, tf = state.tf;
  let data = null, real = false, bars = null, vols = null;
  try{ data = await fetchRealBars(s, tf); }catch(e){ data = null; }
  if(state.sym !== s || state.tf !== tf) return; /* user switched mid-fetch */
  if(data && data.bars.length > 30){ real = true; bars = data.bars; vols = data.vols || []; }
  else { const d = genBars(s, tf); bars = d.bars; vols = d.vols; }
  state.dataReal[s] = real;
  lw.bars = bars; lw.vols = vols;
  lw.candles.setData(bars);
  lw.volume.setData(vols);
  lw.chart.timeScale().scrollToRealTime();
  $("lgSym").textContent = s;
  $("lgTF").textContent = tf;
  updateLegend(bars[bars.length-1]);
  renderIndicators();
  updateDataBadges();
}
function applyChartTheme(){
  if(!LW()) return;
  if(lw.chart) lw.chart.applyOptions(lwTheme());
  if(lw.liveChart) lw.liveChart.applyOptions(lwTheme());
  try{ Object.values(indPanes).forEach(P=>P.chart.applyOptions(lwTheme())); }catch(e){}
}
function onMainCrosshair(param){
  if(!lw.candles || !lw.bars.length) return;
  let bar = null;
  if(param && param.time && param.seriesData){
    const sd = param.seriesData.get(lw.candles);
    if(sd && sd.time) bar = sd;
  }
  updateLegend(bar || lw.bars[lw.bars.length-1]);
}
function updateLegend(bar){
  if(!bar) return;
  const s = state.sym;
  $("lgO").textContent = fmtP(s, bar.open);
  $("lgH").textContent = fmtP(s, bar.high);
  $("lgL").textContent = fmtP(s, bar.low);
  $("lgC").textContent = fmtP(s, bar.close);
  const ch = (bar.close-bar.open)/bar.open*100, el = $("lgChg");
  el.textContent = (ch>=0?"+":"")+ch.toFixed(2)+"%";
  el.className = "num " + (ch>=0 ? "up" : "down");
}

/* Live-tab mini chart (XAUUSD 5m), built when the Live tab first opens */
function buildLiveChart(){
  const host = $("tvChartLive");
  if(!host || !LW() || lw.liveChart) return;
  try{
    host.innerHTML = "";
    lw.liveChart = LW().createChart(host, Object.assign({ width:host.clientWidth||300, height:host.clientHeight||300 }, lwTheme()));
    lw.liveCandles = lw.liveChart.addCandlestickSeries(lwCandleOpts());
    lw.liveBars = genBars("XAUUSD", "5m").bars;
    lw.liveCandles.setData(lw.liveBars);
    lw.liveChart.timeScale().scrollToRealTime();
    new ResizeObserver(()=>{ if(lw.liveChart && host.clientWidth) lw.liveChart.resize(host.clientWidth, host.clientHeight); }).observe(host);
  }catch(err){ console.error("[chart] live init failed:", err); chartErr(host, "Chart failed to start."); }
}

/* Called from the 700ms price engine tick: rolls the live candle forward */
function updateChartTick(){
  if(lw.candles && lw.bars.length){
    const p = px(state.sym).bid, bucket = (TF_MIN[state.tf]||1)*60;
    const bt = Math.floor(Date.now()/1000/bucket)*bucket;
    let last = lw.bars[lw.bars.length-1];
    if(bt > last.time){
      last = { time:bt, open:last.close, high:Math.max(last.close,p), low:Math.min(last.close,p), close:p };
      lw.bars.push(last); lw.candles.update(last);
      const up = p>=last.open;
      const v = { time:bt, value:0.05, color: up?"rgba(34,197,94,0.32)":"rgba(239,68,68,0.32)" };
      lw.vols.push(v); lw.volume.update(v);
      if(lw.bars.length > N_BARS+20){ lw.bars.shift(); lw.vols.shift(); }
    }else{
      last.close = p; if(p>last.high) last.high = p; if(p<last.low) last.low = p;
      lw.candles.update(last);
      const lv = lw.vols[lw.vols.length-1];
      lv.value = +(lv.value+0.01).toFixed(2); lw.volume.update(lv);
    }
    updateLegend(last);
  }
  if(lw.liveCandles && lw.liveBars.length){
    const p = px("XAUUSD").bid, bucket = 300;
    const bt = Math.floor(Date.now()/1000/bucket)*bucket;
    let last = lw.liveBars[lw.liveBars.length-1];
    if(bt > last.time){
      last = { time:bt, open:last.close, high:Math.max(last.close,p), low:Math.min(last.close,p), close:p };
      lw.liveBars.push(last); lw.liveCandles.update(last);
    }else{
      last.close = p; if(p>last.high) last.high = p; if(p<last.low) last.low = p;
      lw.liveCandles.update(last);
    }
  }
}

/* timeframe chips */
$("tfBar").addEventListener("click", e=>{
  const b = e.target.closest(".tf"); if(!b) return;
  document.querySelectorAll(".tf").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  state.tf = b.dataset.tf;
  refreshMainData(); /* regenerate candles at the new timeframe */
});

/* ---------------- ORDER BOOK DEPTH (simulated) ---------------- */
const DEPTH_ROWS = 8;
function buildDepth(s){
  const m = meta(s), pr = px(s);
  const step = m.spread > 0 ? Math.max(m.spread/2, m.vol/4) : m.vol/4;
  const asks = [], bids = [];
  let cum = 0;
  for(let i=DEPTH_ROWS;i>=1;i--){
    const size = 0.2 + Math.random()*2.4;
    cum += size;
    asks.push({ price: pr.ask + step*(i-1) + (Math.random()-0.5)*step*0.4, size, cum });
  }
  cum = 0;
  for(let i=1;i<=DEPTH_ROWS;i++){
    const size = 0.2 + Math.random()*2.4;
    cum += size;
    bids.push({ price: pr.bid - step*(i-1) - (Math.random()-0.5)*step*0.4, size, cum });
  }
  const maxCum = Math.max(asks[asks.length-1].cum, bids[bids.length-1].cum);
  return { asks, bids, maxCum };
}
function renderDepth(force){
  const s = state.sym;
  if(force || !state.depth[s] || Math.random()<0.6) state.depth[s] = buildDepth(s);
  const d = state.depth[s], pr = px(s);
  const row = (r, side) =>
    '<div class="ob-row '+side+'"><span class="bar" style="width:'+(r.cum/d.maxCum*100).toFixed(1)+'%"></span>'+
    '<span>'+fmtP(s,r.price)+'</span><span>'+r.size.toFixed(2)+'</span><span>'+r.cum.toFixed(2)+'</span></div>';
  $("obAsks").innerHTML = d.asks.map(r=>row(r,"ask")).join("");
  $("obBids").innerHTML = d.bids.map(r=>row(r,"bid")).join("");
  const last = $("obLast"), up = pr.bid >= (prevBid[s] ?? pr.bid);
  last.textContent = fmtP(s, pr.bid);
  last.className = "num " + (up ? "pl-pos" : "pl-neg");
  $("obSpread").textContent = fmtP(s, meta(s).spread);
}
/* tap a depth row -> prefill limit price (Binance pattern) */
$("mdDepth").addEventListener("click", e=>{
  const r = e.target.closest(".ob-row"); if(!r) return;
  const priceTxt = r.querySelector("span:nth-child(2)").textContent;
  setTType(r.classList.contains("ask") ? "limit" : "limit");
  $("tPrice").value = priceTxt;
  toast("Limit price set from order book — demo");
});

/* ---------------- RECENT TRADES TAPE (simulated) ---------------- */
const tape = [];
function renderTape(force){
  if(force) tape.length = 0;
  const s = state.sym, pr = px(s);
  if(tape.length===0 || Math.random()<0.7){
    const now = new Date();
    tape.unshift({
      t: String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0")+":"+String(now.getSeconds()).padStart(2,"0"),
      p: Math.random()>0.5 ? pr.ask : pr.bid,
      z: (0.01 + Math.random()*1.9),
      up: Math.random()>0.5
    });
    while(tape.length>14) tape.pop();
  }
  $("tapeBody").innerHTML = tape.map(r=>
    '<div class="ob-row"><span>'+r.t+'</span>'+
    '<span class="'+(r.up?"pl-pos":"pl-neg")+'">'+fmtP(s,r.p)+'</span>'+
    '<span>'+r.z.toFixed(2)+'</span></div>'
  ).join("");
}
function renderTapeTick(){ if(!$("mdTape").hidden) renderTape(false); }

/* market-data tabs */
$("mdTabs").addEventListener("click", e=>{
  const b = e.target.closest(".md-tab"); if(!b) return;
  document.querySelectorAll(".md-tab").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  const depth = b.dataset.md === "depth";
  $("mdDepth").hidden = !depth;
  $("mdTape").hidden = depth;
  if(depth) renderDepth(true); else renderTape(true);
});

/* ---------------- PRO ORDER TICKET ---------------- */
function setTType(t){
  state.ttype = t;
  document.querySelectorAll(".ttype").forEach(x=>x.classList.toggle("active", x.dataset.ttype===t));
  const needPrice = t !== "market";
  $("tPriceWrap").hidden = !needPrice;
  $("tPriceLabel").textContent = t==="limit" ? "Limit price" : t==="stop" ? "Stop price" : "Price";
}
$("ttypeTabs").addEventListener("click", e=>{
  const b = e.target.closest(".ttype"); if(!b) return;
  setTType(b.dataset.ttype);
});
$("dirToggle").addEventListener("click", e=>{
  const b = e.target.closest(".dir-btn"); if(!b) return;
  state.dir = b.dataset.dir;
  document.querySelectorAll(".dir-btn").forEach(x=>x.classList.toggle("active", x===b));
  renderTicketTick();
});
function setLots(v){
  state.lots = Math.min(50, Math.max(0.01, Math.round(v*100)/100));
  $("lotVal").textContent = state.lots.toFixed(2);
  renderTicketTick();
}
$("lotMinus").addEventListener("click", ()=>setLots(state.lots-0.01));
$("lotPlus").addEventListener("click", ()=>setLots(state.lots+0.01));
$("tpslToggle").addEventListener("click", ()=>{
  state.tpslOn = !state.tpslOn;
  $("tpslToggle").setAttribute("aria-pressed", state.tpslOn ? "true" : "false");
  $("tpslWrap").hidden = !state.tpslOn;
  renderTicketTick();
});
["tPrice","tpPrice","slPrice"].forEach(id=>$(id).addEventListener("input", renderTicketTick));

function ticketPx(){
  const s = state.sym, pr = px(s);
  if(state.ttype==="market") return state.dir==="buy" ? pr.ask : pr.bid;
  const v = parseFloat($("tPrice").value);
  return isNaN(v) ? (state.dir==="buy" ? pr.ask : pr.bid) : v;
}
function estMargin(){
  const s = state.sym;
  return state.lots * meta(s).contract * ticketPx() / LEVERAGE;
}
function estRisk(){
  if(!state.tpslOn) return null;
  const sl = parseFloat($("slPrice").value);
  if(isNaN(sl)) return null;
  const s = state.sym, entry = ticketPx();
  const diff = state.dir==="buy" ? (entry - sl) : (sl - entry);
  if(diff <= 0) return null;
  return diff * meta(s).perPoint * state.lots;
}
function renderTicketTick(){
  const s = state.sym, pr = px(s);
  $("buyPx").textContent = fmtP(s, pr.ask);
  $("sellPx").textContent = fmtP(s, pr.bid);
  $("estMargin").textContent = fmt$(estMarginSafe());
  const r = estRisk();
  $("estRisk").textContent = r===null ? "—" : fmt$(r);
}
function estMarginSafe(){ try{ return estMargin(); }catch(e){ return 0; } }

function linkedBroker(){
  return BROKERS.find(b=>b.connected) || null;
}
function execute(){
  const s = state.sym, dir = state.dir.toUpperCase();
  const lots = state.lots;
  let tp = null, sl = null;
  if(state.tpslOn){
    const tpV = parseFloat($("tpPrice").value), slV = parseFloat($("slPrice").value);
    if(!isNaN(tpV)) tp = tpV;
    if(!isNaN(slV)) sl = slV;
  }
  if(state.ttype==="market"){
    const pr = px(s);
    const entry = dir==="BUY" ? pr.ask : pr.bid;
    const lb = linkedBroker();
    state.open.push({
      id:"o"+(state.orderSeq++), sym:s, dir, lots, entry, tp, sl,
      time:new Date(),
      mirror: lb ? { broker: lb.name, ms: 40 + Math.round(Math.random()*100) } : null
    });
    renderPositions();
    toast(lb ? "Market "+dir+" filled · Mirrored to "+lb.name+" — demo"
             : "Market "+dir+" "+lots.toFixed(2)+" "+s+" filled — demo");
  }else{
    const price = parseFloat($("tPrice").value);
    if(isNaN(price) || price<=0){ toast("Enter a valid "+state.ttype+" price — demo"); $("tPrice").focus(); return; }
    const type = (dir==="BUY" ? "Buy " : "Sell ") + (state.ttype==="limit" ? "Limit" : "Stop");
    state.pending.push({ id:"p"+(state.orderSeq++), sym:s, dir, type, lots, price, tp, sl });
    renderPositions();
    toast(type+" placed @ "+fmtP(s,price)+" — fills when price reaches it");
  }
}
$("buyBtn").addEventListener("click", ()=>{ state.dir="buy"; syncDir(); execute(); });
$("sellBtn").addEventListener("click", ()=>{ state.dir="sell"; syncDir(); execute(); });
function syncDir(){
  document.querySelectorAll(".dir-btn").forEach(x=>x.classList.toggle("active", x.dataset.dir===state.dir));
}

/* pending limit/stop auto-fill when price reaches trigger (simulated) */
function fillPending(){
  if(!state.pending.length) return;
  const filled = [];
  state.pending = state.pending.filter(o=>{
    const pr = px(o.sym);
    let hit = false;
    if(o.type==="Buy Limit"  && pr.ask <= o.price) hit = true;
    if(o.type==="Sell Limit" && pr.bid >= o.price) hit = true;
    if(o.type==="Buy Stop"   && pr.ask >= o.price) hit = true;
    if(o.type==="Sell Stop"  && pr.bid <= o.price) hit = true;
    if(hit){ filled.push(o); return false; }
    return true;
  });
  filled.forEach(o=>{
    const lb = linkedBroker();
    state.open.push({
      id:"o"+(state.orderSeq++), sym:o.sym, dir:o.dir, lots:o.lots, entry:o.price,
      tp:o.tp, sl:o.sl, time:new Date(),
      mirror: lb ? { broker: lb.name, ms: 40 + Math.round(Math.random()*100) } : null
    });
    toast(o.type+" "+o.sym+" filled @ "+fmtP(o.sym,o.price)+" — demo");
  });
  if(filled.length) renderPositions();
}

/* TP/SL auto-close on open positions (simulated) */
function checkTpSl(){
  if(!state.open.length) return;
  let changed = false;
  state.open = state.open.filter(p=>{
    const pr = px(p.sym);
    const cur = p.dir==="BUY" ? pr.bid : pr.ask;
    let exit = null;
    if(p.tp!==null && p.tp!==undefined){
      if((p.dir==="BUY" && cur>=p.tp) || (p.dir==="SELL" && cur<=p.tp)) exit = p.tp;
    }
    if(exit===null && p.sl!==null && p.sl!==undefined){
      if((p.dir==="BUY" && cur<=p.sl) || (p.dir==="SELL" && cur>=p.sl)) exit = p.sl;
    }
    if(exit!==null){ closePosition(p, exit, exit===p.tp ? "Take profit" : "Stop loss"); changed = true; return false; }
    return true;
  });
  if(changed) renderPositions();
}

/* ---------------- ACCOUNT STRIP ---------------- */
function positionPL(p){
  const pr = px(p.sym);
  const closePx = p.dir==="BUY" ? pr.bid : pr.ask;
  const diff = p.dir==="BUY" ? (closePx - p.entry) : (p.entry - closePx);
  return diff * meta(p.sym).perPoint * p.lots;
}
function openPL(){ return state.open.reduce((a,p)=>a+positionPL(p),0); }
function usedMargin(){
  return state.open.reduce((a,p)=>a + p.lots*meta(p.sym).contract*p.entry/LEVERAGE, 0);
}
function equity(){ return state.balance + openPL(); }
function renderAccount(){
  const eq = equity(), m = usedMargin(), free = eq - m;
  $("acctEquity").textContent = fmt$(eq);
  $("acctBalance").textContent = fmt$(state.balance);
  $("acctMargin").textContent = fmt$(m);
  $("acctFree").textContent = fmt$(free);
  const lvl = $("acctLevel");
  if(m > 0.01){
    const pct = eq/m*100;
    lvl.textContent = pct.toFixed(0)+"%";
    lvl.classList.toggle("warn", pct<200);
  }else{ lvl.textContent = "—"; lvl.classList.remove("warn"); }
  $("eqVal").textContent = fmt$(eq);
}

/* ---------------- PRICE ALERTS ---------------- */
function renderAlerts(){
  const list = $("alertList"); list.innerHTML = "";
  $("alertDot").hidden = !state.alerts.some(a=>!a.triggered);
  if(!state.alerts.length){
    list.innerHTML = '<div class="alerts-empty fine">No alerts yet. Tap “New alert” to get notified when a price crosses your level.</div>';
    return;
  }
  state.alerts.forEach(a=>{
    const r = document.createElement("div");
    r.className = "alert-row" + (a.triggered ? " triggered" : "");
    r.innerHTML = '<span class="ic" data-icon="'+(a.triggered?"check":"bell")+'"></span>'+
      '<div><b class="num">'+a.sym+' '+(a.cond==="above"?"≥":"≤")+' '+fmtP(a.sym,a.price)+'</b>'+
      '<span>'+(a.triggered?"Triggered":"Active")+'</span></div>'+
      '<button class="del" data-adel="'+a.id+'" aria-label="Delete alert"><span class="ic sm" data-icon="trash"></span></button>';
    list.appendChild(r);
  });
  injectIcons();
}
$("alertAddBtn").addEventListener("click", ()=>{
  const f = $("alertForm");
  f.hidden = !f.hidden;
  if(!f.hidden){
    const sel = $("afSym");
    if(!sel.options.length) SYM_ORDER.forEach(s=>{ const o=document.createElement("option"); o.value=s; o.textContent=s; sel.appendChild(o); });
    sel.value = state.sym;
    if(!$("afPrice").value) $("afPrice").value = fmtP(state.sym, px(state.sym).bid);
  }
});
$("afCancel").addEventListener("click", ()=>{ $("alertForm").hidden = true; });
$("afSave").addEventListener("click", ()=>{
  const price = parseFloat($("afPrice").value);
  if(isNaN(price) || price<=0){ toast("Enter a valid alert price — demo"); return; }
  state.alerts.push({ id:"a"+(state.alertSeq++), sym:$("afSym").value, cond:$("afCond").value, price, triggered:false });
  $("alertForm").hidden = true; $("afPrice").value = "";
  renderAlerts();
  toast("Alert created — demo");
});
document.addEventListener("click", e=>{
  const d = e.target.closest("[data-adel]"); if(!d) return;
  state.alerts = state.alerts.filter(a=>a.id!==d.dataset.adel);
  renderAlerts();
  toast("Alert deleted — demo");
});
function checkAlerts(){
  let hit = false;
  state.alerts.forEach(a=>{
    if(a.triggered) return;
    const bid = px(a.sym).bid;
    if((a.cond==="above" && bid>=a.price) || (a.cond==="below" && bid<=a.price)){
      a.triggered = true; hit = true;
      toast("Alert triggered: "+a.sym+" "+(a.cond==="above"?"≥":"≤")+" "+fmtP(a.sym,a.price));
    }
  });
  if(hit) renderAlerts();
}

/* ---------------- POSITIONS ---------------- */
$("posTabs").addEventListener("click", e=>{
  const b = e.target.closest(".subtab"); if(!b) return;
  document.querySelectorAll(".subtab").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  const t = b.dataset.ptab;
  $("posOpen").hidden = t!=="open";
  $("posPending").hidden = t!=="pending";
  $("posHistory").hidden = t!=="history";
});
function closePosition(p, exit, reason){
  const pl = (p.dir==="BUY" ? (exit-p.entry) : (p.entry-exit)) * meta(p.sym).perPoint * p.lots;
  state.balance += pl;
  state.history.push({ sym:p.sym, dir:p.dir, lots:p.lots, entry:p.entry, exit, pl, copy:p.copy||null });
  state.open = state.open.filter(x=>x.id!==p.id);
  toast((reason ? reason+": " : "Closed ")+p.sym+" "+fmt$(pl)+" — demo");
}
function renderPositions(){
  /* open */
  const open = $("posOpen"); open.innerHTML = "";
  $("openCount").textContent = state.open.length;
  ["posBadge","posBadgeSide"].forEach(id=>{
    const b = $(id); b.hidden = !state.open.length; b.textContent = state.open.length;
  });
  if(!state.open.length) open.innerHTML = '<div class="empty">No open positions.<br>Place a trade from the Trade tab.</div>';
  state.open.forEach(p=>{
    const card = document.createElement("div");
    card.className = "pos-card"; card.dataset.pid = p.id;
    const mb = p.copy
      ? '<div class="copy-badge"><span class="mdot"></span>Copied from '+esc(p.copy.from)+' · auto</div>'
      : p.mirror
      ? '<div class="mirror-badge"><span class="mdot"></span>Mirrored to '+esc(p.mirror.broker)+' · '+p.mirror.ms+'ms</div>'
      : '<div class="mirror-badge demo"><span class="mdot"></span>Demo fill — connect a broker to mirror</div>';
    card.innerHTML =
      '<div class="pos-top"><span class="pos-sym">'+p.sym+'</span>'+
      '<span class="dir '+(p.dir==="BUY"?"buy":"sell")+'">'+p.dir+'</span>'+
      '<span class="pos-lots">'+p.lots.toFixed(2)+' lots</span>'+
      '<button class="pos-close" data-close="'+p.id+'" aria-label="Close position">×</button></div>'+
      '<div class="pos-grid">'+
      '<div class="pos-col"><span>Entry</span><b>'+fmtP(p.sym,p.entry)+'</b></div>'+
      '<div class="pos-col"><span>Current</span><b data-cur="'+p.id+'">—</b></div>'+
      '<div class="pos-col"><span>P/L</span><b data-pl="'+p.id+'">—</b></div>'+
      '</div>'+
      ((p.tp||p.sl) ? '<div class="pos-tpsl">'+(p.tp?'TP <b>'+fmtP(p.sym,p.tp)+'</b>':"")+(p.sl?'<span>SL <b>'+fmtP(p.sym,p.sl)+'</b></span>':"")+'</div>' : "")+
      mb;
    open.appendChild(card);
  });
  /* pending */
  const pend = $("posPending"); pend.innerHTML = "";
  $("pendCount").textContent = state.pending.length;
  if(!state.pending.length) pend.innerHTML = '<div class="empty">No pending orders.<br>Limit and Stop orders wait here until price reaches them.</div>';
  state.pending.forEach(o=>{
    const card = document.createElement("div");
    card.className = "pos-card";
    card.innerHTML =
      '<div class="pos-top"><span class="pos-sym">'+o.sym+'</span>'+
      '<span class="dir '+(o.dir==="BUY"?"buy":"sell")+'">'+esc(o.type.toUpperCase())+'</span>'+
      '<span class="pos-lots">'+o.lots.toFixed(2)+' lots</span>'+
      '<button class="pos-close" data-cancel="'+o.id+'" aria-label="Cancel order">×</button></div>'+
      '<div class="pos-grid"><div class="pos-col"><span>Trigger</span><b>'+fmtP(o.sym,o.price)+'</b></div>'+
      '<div class="pos-col"><span>Current</span><b>'+fmtP(o.sym,px(o.sym).bid)+'</b></div></div>';
    pend.appendChild(card);
  });
  renderHistory($("posHistory"));
  renderHistory($("profHistory"));
  renderAccount();
}
function renderHistory(el){
  if(!el) return;
  el.innerHTML = "";
  if(!state.history.length){ el.innerHTML = '<div class="empty">No closed trades yet.</div>'; return; }
  state.history.slice().reverse().forEach(h=>{
    const d = document.createElement("div");
    d.className = "pos-card";
    d.innerHTML =
      '<div class="pos-top"><span class="pos-sym">'+h.sym+'</span>'+
      '<span class="dir '+(h.dir==="BUY"?"buy":"sell")+'">'+h.dir+'</span>'+
      '<span class="pos-lots">'+h.lots.toFixed(2)+' lots</span>'+(h.copy?'<span class="copy-badge">📋 copied</span>':"")+'</div>'+
      '<div class="pos-grid">'+
      '<div class="pos-col"><span>Entry</span><b>'+fmtP(h.sym,h.entry)+'</b></div>'+
      '<div class="pos-col"><span>Exit</span><b>'+fmtP(h.sym,h.exit)+'</b></div>'+
      '<div class="pos-col"><span>P/L</span><b class="'+plClass(h.pl)+'">'+fmt$(h.pl)+'</b></div>'+
      '</div>';
    el.appendChild(d);
  });
}
function renderPositionsTick(){
  state.open.forEach(p=>{
    const pr = px(p.sym);
    const curEl = document.querySelector('[data-cur="'+p.id+'"]');
    const plEl = document.querySelector('[data-pl="'+p.id+'"]');
    if(curEl) curEl.textContent = fmtP(p.sym, p.dir==="BUY"?pr.bid:pr.ask);
    if(plEl){ const v = positionPL(p); plEl.textContent = fmt$(v); plEl.className = plClass(v); }
  });
}
document.addEventListener("click", e=>{
  const c = e.target.closest("[data-close]");
  if(c){
    const p = state.open.find(x=>x.id===c.dataset.close);
    if(p){
      const pr = px(p.sym);
      closePosition(p, p.dir==="BUY" ? pr.bid : pr.ask, null);
      renderPositions();
    }
    return;
  }
  const x = e.target.closest("[data-cancel]");
  if(x){
    state.pending = state.pending.filter(o=>o.id!==x.dataset.cancel);
    renderPositions();
    toast("Pending order cancelled — demo");
  }
});

/* ---------------- LIVE TAB ---------------- */
const MOCK_CHAT = [
  ["goldrush_99","That entry was clean"],
  ["fxnoob","how do you set your stop loss?"],
  ["DubaiTrader","buy the dip let's gooo"],
  ["sniperfx","TP hit already?? insane"],
  ["Ayesha","watching from Abu Dhabi"],
  ["pipmaster","this is why live > signals"],
  ["omar_trades","spread widening a bit, careful"],
  ["NFP_queen","holding my buy from 2648"],
  ["chartwizard","double bottom on M5 forming"],
  ["riyadhfx","copied, let's eat"],
  ["quietstorm","risk 1% only guys"],
  ["trendrider","that wick rejection though"]
];
let chatIdx = 0, viewers = 2412;
function buildLive(){
  buildLiveChart(); /* self-hosted XAUUSD 5m chart */
  restoreFaceCam();
  for(let i=0;i<3;i++) pushFeed();
  MOCK_CHAT.slice(0,6).forEach(m=>addChat(m[0], m[1], false));
  setInterval(()=>{
    viewers = Math.max(1800, viewers + Math.round((Math.random()-0.48)*60));
    $("viewerCount").textContent = viewers.toLocaleString("en-US");
  }, 3000);
  setInterval(()=>pushFeed(), 6000);
  setInterval(()=>{ const m = MOCK_CHAT[chatIdx++ % MOCK_CHAT.length]; addChat(m[0], m[1], false); }, 8000);
}
function pushFeed(){
  const pr = px("XAUUSD");
  const dir = Math.random()>0.45 ? "BUY" : "SELL";
  const lots = (Math.random()*0.4+0.05).toFixed(2);
  const at = dir==="BUY" ? pr.ask : pr.bid;
  const feed = $("liveFeed");
  const d = document.createElement("div");
  d.className = "feed-item";
  const now = new Date();
  d.innerHTML = '<span class="dir '+(dir==="BUY"?"buy":"sell")+'">'+dir+'</span>'+
    "<b>"+lots+" XAUUSD @ "+fmtP("XAUUSD",at)+"</b>"+
    '<span class="t">'+String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0")+"</span>";
  feed.prepend(d);
  while(feed.children.length>6) feed.lastChild.remove();
  mirrorHostTrade(dir, at); /* copy-trading: host trades land in your account (demo) */
}
function addChat(user, text, me){
  const box = $("liveChat");
  const d = document.createElement("div");
  d.className = "chat-msg"+(me?" me":"");
  const b = document.createElement("b"); b.textContent = user;
  d.appendChild(b); d.appendChild(document.createTextNode(text));
  box.appendChild(d);
  while(box.children.length>30) box.firstChild.remove();
  box.parentElement.scrollTop = box.parentElement.scrollHeight;
}
$("chatSend").addEventListener("click", sendChat);
$("chatInput").addEventListener("keydown", e=>{ if(e.key==="Enter") sendChat(); });
function sendChat(){
  const inp = $("chatInput"), v = inp.value.trim();
  if(!v) return;
  addChat("You", v, true); inp.value = "";
}
$("copySwitch").addEventListener("click", function(){
  if(copyState.on) stopCopy();
  else openCopyModal("daud"); /* the demo live room hosts @daudtradefx */
});

/* draggable + resizable face-cam, position persisted */
(function(){
  const cam = $("faceCam"), wrap = $("liveChartWrap"), grip = $("fcResize");
  const KEY = "tc_facecam_v1";
  let drag = null, resizing = false;
  window.restoreFaceCam = function(){
    try{
      const saved = JSON.parse(localStorage.getItem(KEY)||"null");
      if(saved && saved.w){
        cam.style.left = saved.x+"px"; cam.style.top = saved.y+"px";
        cam.style.right = "auto"; cam.style.bottom = "auto";
        cam.style.width = saved.w+"px"; cam.style.height = saved.h+"px";
        return;
      }
    }catch(e){}
    cam.style.right = "10px"; cam.style.bottom = "10px";
  };
  function save(){
    try{
      localStorage.setItem(KEY, JSON.stringify({ x:cam.offsetLeft, y:cam.offsetTop, w:cam.offsetWidth, h:cam.offsetHeight }));
    }catch(e){}
  }
  function clamp(){
    const wr = wrap.getBoundingClientRect();
    const x = Math.min(Math.max(0, cam.offsetLeft), Math.max(0, wr.width - cam.offsetWidth));
    const y = Math.min(Math.max(0, cam.offsetTop), Math.max(0, wr.height - cam.offsetHeight));
    cam.style.left = x+"px"; cam.style.top = y+"px";
    cam.style.right = "auto"; cam.style.bottom = "auto";
  }
  cam.addEventListener("pointerdown", e=>{
    if(e.target===grip || (e.target.closest && e.target.closest("button"))) return; /* let buttons tap */
    drag = { dx: e.clientX - cam.offsetLeft, dy: e.clientY - cam.offsetTop };
    try{ cam.setPointerCapture(e.pointerId); }catch(err){}
  });
  grip.addEventListener("pointerdown", e=>{
    e.stopPropagation();
    resizing = true;
    drag = { sx:e.clientX, sy:e.clientY, w:cam.offsetWidth, h:cam.offsetHeight };
    try{ grip.setPointerCapture(e.pointerId); }catch(err){}
  });
  cam.addEventListener("pointermove", e=>{
    if(!drag) return;
    if(resizing){
      cam.style.width = Math.min(220, Math.max(64, drag.w + (e.clientX - drag.sx)))+"px";
      cam.style.height = Math.min(300, Math.max(80, drag.h + (e.clientY - drag.sy)))+"px";
      clamp();
    }else{
      const wr = wrap.getBoundingClientRect();
      cam.style.left = (e.clientX - wr.left - drag.dx)+"px";
      cam.style.top = (e.clientY - wr.top - drag.dy)+"px";
      cam.style.right = "auto"; cam.style.bottom = "auto";
      clamp();
    }
  });
  ["pointerup","pointercancel"].forEach(ev=>cam.addEventListener(ev, ()=>{ if(drag) save(); drag = null; resizing = false; }));
})();

/* ---------------- REAL FACE CAMERA (getUserMedia; needs HTTPS — GitHub Pages is HTTPS) ---------------- */
let camStream = null;
function camOn(){ return !!camStream; }
function camVideoEls(){ return [$("faceCamVideo"), $("lsCamVideo")].filter(Boolean); }
function paintCamUI(on){
  camVideoEls().forEach(v=>{
    if(on){ v.srcObject = camStream; v.hidden = false; }
    else { try{ v.pause(); }catch(e){} v.srcObject = null; v.hidden = true; }
  });
  const e1 = $("faceCamEmpty"); if(e1) e1.hidden = on;
  const e2 = $("lsCamEmpty"); if(e2) e2.hidden = on;
  const b1 = $("camToggleBtn"); if(b1) b1.textContent = on ? "Stop camera" : "Enable camera";
  const b2 = $("lsCamBtn"); if(b2) b2.textContent = on ? "Stop camera" : "Enable camera";
}
function stopCamera(){
  if(camStream){ try{ camStream.getTracks().forEach(t=>t.stop()); }catch(e){} camStream = null; }
  paintCamUI(false);
}
async function enableCamera(){
  if(camStream) return;
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    toast("Camera not supported here — showing placeholder (demo)"); return;
  }
  try{
    /* front camera preferred on phones (ideal, not required), default webcam on laptops */
    camStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ ideal:"user" } }, audio:false });
    paintCamUI(true);
    for(const v of camVideoEls()){ try{ await v.play(); }catch(e){ /* mobile browsers need the explicit play() call */ } }
    toast("Camera on — preview only, nothing is streamed (demo)");
  }catch(err){
    camStream = null;
    const n = (err && err.name) || "";
    if(n === "NotAllowedError" || n === "SecurityError")
      toast("Camera blocked — allow camera in your browser settings, then tap Enable camera");
    else if(n === "NotFoundError" || n === "OverconstrainedError")
      toast("No camera found on this device — showing placeholder (demo)");
    else
      toast("Camera unavailable — showing placeholder (demo)");
  }
}
$("camToggleBtn").addEventListener("click", e=>{ e.stopPropagation(); camOn() ? stopCamera() : enableCamera(); });

/* ---------------- GO-LIVE SETUP (camera check + title + symbol before broadcast) ---------------- */
const liveSetup = { sym:"XAUUSD", title:"", bg:"none" };
const BG_OPTIONS = [
  { id:"none",   label:"None" },
  { id:"blur",   label:"Blur" },
  { id:"remove", label:"Remove" },
  { id:"desk",   label:"Desk" },
  { id:"city",   label:"City night" },
  { id:"studio", label:"Studio" }
];
function renderBgChips(){
  const el = $("lsBgChips"); if(!el) return;
  el.innerHTML = BG_OPTIONS.map(o=>'<button class="bg-chip bg-'+o.id+(liveSetup.bg===o.id?" active":"")+'" data-bg="'+o.id+'"><i></i><span>'+o.label+'</span></button>').join("");
  el.querySelectorAll(".bg-chip").forEach(b=>b.addEventListener("click", ()=>{
    liveSetup.bg = b.dataset.bg; renderBgChips(); applyLsBg();
  }));
}
function applyLsBg(){
  const bg = $("lsCamBg"); if(bg) bg.className = "cam-bg bg-"+liveSetup.bg;
}
const LS_SYMS = ["XAUUSD","BTCUSD","EURUSD","GBPUSD","ETHUSD","US30"];
function renderLsChips(){
  const box = $("lsSymChips"); if(!box) return; box.innerHTML = "";
  LS_SYMS.forEach(s=>{
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ls-chip" + (s === liveSetup.sym ? " on" : "");
    b.textContent = s;
    b.addEventListener("click", ()=>{
      liveSetup.sym = s;
      $("lsTitle").value = s + " · Live scalps";
      renderLsChips();
    });
    box.appendChild(b);
  });
}
function openLiveSetup(){
  if(youLive.active) return;
  liveSetup.sym = state.sym;
  renderLsChips();
  renderBgChips(); applyLsBg();
  $("lsTitle").value = state.sym + " · Live scalps";
  $("liveSetupBackdrop").hidden = false;
  $("liveSetupSheet").hidden = false;
  enableCamera(); /* preview attempt; fails gracefully to the placeholder */
}
function closeLiveSetup(){
  $("liveSetupBackdrop").hidden = true;
  $("liveSetupSheet").hidden = true;
}
let liveHintTimer = null;
function showLiveHint(){
  const h = $("liveHint"); if(!h) return;
  $("liveHintSym").textContent = liveSetup.sym;
  h.hidden = false;
  clearTimeout(liveHintTimer);
  liveHintTimer = setTimeout(()=>{ h.hidden = true; }, 12000);
}

/* ---------------- GO LIVE (demo broadcast; ALL numbers simulated) ---------------- */
const youLive = { active:false, viewers:0, startT:0, pl:0, timerId:null };
function fmtClock(ms){
  const s = Math.floor(ms/1000), p = n=>String(n).padStart(2,"0");
  const h = Math.floor(s/3600), m = Math.floor(s%3600/60);
  return h>0 ? p(h)+":"+p(m)+":"+p(s%60) : p(m)+":"+p(s%60);
}
function startLive(){
  if(youLive.active) return;
  youLive.active = true;
  youLive.viewers = 120 + Math.round(Math.random()*80);
  youLive.startT = Date.now();
  youLive.pl = 0;
  $("goLiveBtn").hidden = true;
  $("youLiveBar").hidden = false;
  const fbg = $("faceCamBg"); if(fbg) fbg.className = "cam-bg bg-"+liveSetup.bg;
  renderLiveNow();
  enableCamera(); /* auto-request camera; fails gracefully to the placeholder */
  youLive.timerId = setInterval(()=>{
    youLive.viewers = Math.max(50, youLive.viewers + Math.round((Math.random()-0.47)*24));
    youLive.pl += (Math.random()-0.48)*8;
    $("youViewers").textContent = youLive.viewers.toLocaleString("en-US");
    $("youTimer").textContent = fmtClock(Date.now()-youLive.startT);
    const plEl = $("youPL");
    plEl.textContent = (youLive.pl>=0?"+$":"−$")+Math.abs(youLive.pl).toFixed(2);
    plEl.className = "num "+(youLive.pl>=0?"pl-pos":"pl-neg");
    renderYouLiveCard();
  }, 1000);
  renderYouLiveCard();
  showLiveHint();
  toast("You are LIVE — demo broadcast, nothing really streams");
}
function endLive(){
  if(!youLive.active) return;
  youLive.active = false;
  clearInterval(youLive.timerId); youLive.timerId = null;
  $("goLiveBtn").hidden = false;
  $("youLiveBar").hidden = true;
  const fbg = $("faceCamBg"); if(fbg) fbg.className = "cam-bg bg-none";
  renderLiveNow();
  stopCamera();
  const card = $("youLiveCard"); if(card) card.remove();
  toast("Live ended — demo");
}
$("goLiveBtn").addEventListener("click", openLiveSetup);
$("hubNewReel").addEventListener("click", triggerReelUpload);
$("endLiveBtn").addEventListener("click", endLive);
$("lsClose").addEventListener("click", closeLiveSetup);
$("lsCancel").addEventListener("click", closeLiveSetup);
$("liveSetupBackdrop").addEventListener("click", closeLiveSetup);
$("lsCamBtn").addEventListener("click", e=>{ e.stopPropagation(); camOn() ? stopCamera() : enableCamera(); });
$("lsStart").addEventListener("click", ()=>{
  liveSetup.title = ($("lsTitle").value || "").trim().slice(0, 60) || (liveSetup.sym + " · Live scalps");
  closeLiveSetup();
  startLive();
});
$("liveHintOk").addEventListener("click", ()=>{ $("liveHint").hidden = true; clearTimeout(liveHintTimer); });

/* live card published to the TOP of the Traders tab while you are live */
function renderYouLiveCard(){
  if(!youLive.active) return;
  let card = $("youLiveCard");
  if(!card){
    card = document.createElement("div");
    card.className = "card you-live-card";
    card.id = "youLiveCard";
    const sc = $("screen-traders");
    sc.insertBefore(card, sc.firstChild);
  }
  const plCls = youLive.pl>=0 ? "pl-pos" : "pl-neg";
  const plTxt = (youLive.pl>=0?"+$":"−$")+Math.abs(youLive.pl).toFixed(2);
  card.innerHTML =
    '<div class="yl-top"><span class="live-pill"><i></i>LIVE</span>'+
    '<span class="pair-badge">'+liveSetup.sym+'</span>'+
    '<span class="yl-viewers num">'+youLive.viewers.toLocaleString("en-US")+' watching</span></div>'+
    '<div class="yl-main"><div class="avatar">DR</div>'+
    '<div><b>'+esc(liveSetup.title || (liveSetup.sym+" · Live scalps"))+'</b><span class="tstat">Today <b class="'+plCls+'">'+plTxt+'</b> · '+liveSetup.sym+' scalps</span></div>'+
    '<button class="primary-btn sm" id="youLiveWatch">Watch</button></div>'+
    '<p class="fine">Demo broadcast — viewers and profit are simulated.</p>';
  $("youLiveWatch").addEventListener("click", ()=>goTab("live"));
}

/* ---------------- COMMUNITY (social) ---------------- */
const TRADERS = [
  { id:"daud", name:"Marcus Cole", handle:"@daudtradefx", ini:"DR", g:["#2F80FF","#1B5FD6"],
    bio:"XAUUSD scalper · London session · 8 yrs trading", following:false, followers:48200, followingN:312,
    win:67, pl:4210, live:true,
    monthly:[820, -140, 1150, 640, 980, -220, 1310, 760, 540, 890, 410, 690],
    trades:[ {s:"XAUUSD",d:"BUY",pl:184.20},{s:"EURUSD",d:"SELL",pl:96.40},{s:"BTCUSD",d:"BUY",pl:-58.10} ] },
  { id:"sara", name:"Sara Malik", handle:"@saramalik", ini:"SM", g:["#B678F0","#5E2B8A"],
    bio:"FX swing trader · fundamentals + technicals", following:false, followers:21700, followingN:428,
    win:61, pl:2980, live:false,
    monthly:[410, 320, -90, 520, 610, 280, -140, 490, 350, 420, 260, 380],
    trades:[ {s:"EURUSD",d:"BUY",pl:142.80},{s:"GBPUSD",d:"BUY",pl:88.20},{s:"USDJPY",d:"SELL",pl:-34.50} ] },
  { id:"arjun", name:"Arjun Rao", handle:"@arjunfx", ini:"AR", g:["#5B8DEF","#2B4A8A"],
    bio:"Crypto + indices · risk-first, always", following:false, followers:15300, followingN:196,
    win:58, pl:2140, live:false,
    monthly:[260, 180, 340, -120, 290, 410, 220, -60, 310, 190, 240, 200],
    trades:[ {s:"BTCUSD",d:"BUY",pl:212.60},{s:"NAS100",d:"SELL",pl:74.30},{s:"ETHUSD",d:"BUY",pl:-41.20} ] },
  { id:"lena", name:"Lena Fischer", handle:"@lenafx", ini:"LF", g:["#22C55E","#166534"],
    bio:"Gold & silver specialist · patient entries", following:false, followers:9800, followingN:154,
    win:64, pl:1875, live:false,
    monthly:[180, 240, 120, 300, -80, 260, 190, 220, 140, 260, 110, 170],
    trades:[ {s:"XAUUSD",d:"SELL",pl:118.90},{s:"XAGUSD",d:"BUY",pl:62.40},{s:"XAUUSD",d:"BUY",pl:-28.70} ] },
];
const fmtK = n => n>=1000 ? (n/1000).toFixed(1).replace(/\.0$/,"")+"k" : String(n);
/* --- you (the owner) on the social layer --- */
const YOU = { rank:null, followers:1204, todayPL:0 };

let lbSort = "profit";
function lbValue(t){
  if(lbSort==="win") return t.win;
  if(lbSort==="followers") return t.followers;
  return t.pl;
}
function rankBadge(i){
  if(i===0) return '<span class="rank r1">#1</span>';
  if(i===1) return '<span class="rank r2">#2</span>';
  if(i===2) return '<span class="rank r3">#3</span>';
  return '<span class="rank">#'+(i+1)+'</span>';
}
function lbStat(t){
  if(lbSort==="win") return '<b class="num">'+t.win+'%</b><span>win rate</span>';
  if(lbSort==="followers") return '<b class="num">'+fmtK(t.followers)+'</b><span>followers</span>';
  return '<b class="num '+plClass(t.pl)+'">'+fmt$(t.pl)+'</b><span>profit</span>';
}
function renderTraders(){
  const list = $("traderList"); list.innerHTML = "";
  const rows = TRADERS.slice().sort((a,b)=>lbValue(b)-lbValue(a));
  rows.forEach((t,i)=>{
    const c = document.createElement("div");
    c.className = "trader-card lb-row";
    c.dataset.tprof = t.id; /* whole row opens the profile; live traders get a Watch-live button inside */
    c.innerHTML =
      rankBadge(i)+
      '<div class="avatar" style="background:linear-gradient(135deg,'+t.g[0]+','+t.g[1]+')">'+t.ini+
      (t.live ? '<span class="trader-live">LIVE</span>' : '') + '</div>'+
      '<div class="lb-info" data-tprof="'+t.id+'"><b>'+esc(t.name)+' <span class="handle">'+esc(t.handle)+'</span></b>'+
      '<span class="tstat">'+fmtK(t.followers)+' followers · '+t.win+'% win</span></div>'+
      '<div class="lb-stat">'+lbStat(t)+'</div>'+
      '<button class="follow-btn'+(t.following?" following":"")+'" data-follow="'+t.id+'">'+(t.following?"Following":"Follow")+'</button>';
    list.appendChild(c);
  });
}
$("lbTabs").addEventListener("click", e=>{
  const b = e.target.closest("[data-lb]"); if(!b) return;
  lbSort = b.dataset.lb;
  document.querySelectorAll("#lbTabs .lb-tab").forEach(x=>x.classList.toggle("active", x===b));
  renderTraders();
});
/* follow toggles — delegated so leaderboard, posts and profile all work */
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-follow]"); if(!b) return;
  e.stopPropagation();
  const t = TRADERS.find(x=>x.id===b.dataset.follow); if(!t) return;
  if(t.you){ toast("That's you — demo"); return; }
  t.following = !t.following;
  t.followers += t.following ? 1 : -1;
  document.querySelectorAll('[data-follow="'+t.id+'"]').forEach(x=>{
    x.classList.toggle("following", t.following);
    x.textContent = t.following ? "Following" : "Follow";
  });
  renderTraders(); renderYouCard();
  if(!$("traderProfile").hidden) renderTraderProfile(t.id);
  toast((t.following ? "Following " : "Unfollowed ") + t.name + " — demo");
});
/* tap a trader identity -> full profile view (follow buttons excluded) */
document.addEventListener("click", e=>{
  if(e.target.closest("[data-follow]")) return;
  const el = e.target.closest("[data-tprof]"); if(!el) return;
  if(el.dataset.tprof==="you"){ goTab("profile"); return; }
  openTraderProfile(el.dataset.tprof);
});

/* --- community sentiment poll (restored: init calls renderPoll()) --- */
const POLL_KEY = "tc_poll_v1";
let poll = { buy:7693, sell:4715, voted:null };
try{ const s = JSON.parse(localStorage.getItem(POLL_KEY)||"null"); if(s && s.voted) poll = s; }catch(e){}
function renderPoll(){
  const total = poll.buy + poll.sell;
  const bp = Math.round(poll.buy/total*100), sp = 100-bp;
  $("pollBuyFill").style.width = bp+"%";
  $("pollSellFill").style.width = sp+"%";
  $("pollBuyPct").textContent = bp+"%";
  $("pollSellPct").textContent = sp+"%";
  $("pollVotes").textContent = total.toLocaleString("en-US")+" votes";
  $("pollBtns").classList.toggle("voted", !!poll.voted);
}
function vote(side){
  if(poll.voted){ toast("You already voted — demo"); return; }
  poll[side]++; poll.voted = side;
  try{ localStorage.setItem(POLL_KEY, JSON.stringify(poll)); }catch(e){}
  renderPoll();
  toast("Vote counted: "+side.toUpperCase()+" — demo");
}
$("pollBuy").addEventListener("click", ()=>vote("buy"));
$("pollSell").addEventListener("click", ()=>vote("sell"));

/* --- trader profile overlay --- */
function monthlyBars(m){
  const max = Math.max.apply(null, m.map(v=>Math.abs(v)).concat([1]));
  return m.map(v=>{
    const h = Math.max(6, Math.round(Math.abs(v)/max*56));
    return '<div class="mb"><i class="'+(v>=0?"pos":"neg")+'" style="height:'+h+'px"></i></div>';
  }).join("");
}
function openTraderProfile(id){
  renderTraderProfile(id);
  $("traderProfile").hidden = false;
  document.body.classList.add("lock-scroll");
}
function closeTraderProfile(){
  $("traderProfile").hidden = true;
  document.body.classList.remove("lock-scroll");
}
$("tprofBack").addEventListener("click", closeTraderProfile);
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && !$("traderProfile").hidden) closeTraderProfile(); });

/* --- your presence card --- */
function yourTodayPL(){
  let pl = openPL();
  state.history.forEach(h=>{ pl += h.pl||0; });
  return pl;
}
function renderYouCard(){
  const tpl = yourTodayPL();
  const sorted = TRADERS.slice().sort((a,b)=>b.pl-a.pl);
  const rank = sorted.findIndex(t=>tpl>t.pl)+1 || sorted.length+1;
  YOU.todayPL = tpl; YOU.rank = rank;
  const el = $("youCard"); if(!el) return;
  el.innerHTML =
    '<div class="avatar">YOU</div>'+
    '<div class="you-info"><b>Your trading</b>'+
    '<span class="you-stats"><span class="num '+plClass(tpl)+'">'+fmt$(tpl)+'</span> today · '+
    '<span class="num">#'+rank+'</span> rank · <span class="num">'+fmtK(YOU.followers)+'</span> followers</span></div>'+
    '<button class="ghost-btn sm" id="youViewProf">Profile</button>';
  $("youViewProf").addEventListener("click", ()=>goTab("profile"));
}

/* --- social feed: posts, likes, comments, share, composer --- */
const MOCK_POSTS = [
  { id:"p1", tid:"daud", time:"12m", likes:214, liked:false,
    body:"NFP Friday: expecting a hot print. DXY strength = gold pullback first, then dip-buy into 2640 liquidity. Not financial advice — sharing my read.",
    comments:[ {n:"Sara Malik", t:"Agree on the pullback — watching 2642 myself.", time:"8m"} ] },
  { id:"p2", tid:"sara", time:"1h", likes:96, liked:false,
    body:"EURUSD swept Asia lows and reclaimed 1.0840. If London holds above, targeting 1.0890. Invalidation: M15 close back below the lows.",
    comments:[] },
  { id:"p3", tid:"arjun", time:"3h", likes:158, liked:false,
    body:"BTC funding neutral, spot bid on every dip. 98k is the line in the sand — lose it and I stand aside. Trade the plan, not the feeling.",
    comments:[ {n:"Lena Fischer", t:"That 98k level held beautifully.", time:"2h"}, {n:"Marcus Cole", t:"Patience pays.", time:"1h"} ] },
];
function traderOf(p){ return TRADERS.find(t=>t.id===p.tid) || TRADERS[0]; }
function postCard(p){
  const t = traderOf(p);
  const c = document.createElement("div");
  c.className = "card post";
  c.innerHTML =
    '<div class="post-head"><div class="avatar" style="background:linear-gradient(135deg,'+t.g[0]+','+t.g[1]+')">'+t.ini+'</div>'+
    '<div data-tprof="'+t.id+'"><b>'+esc(t.name)+'</b><span>'+esc(t.handle)+' · '+p.time+'</span></div>'+
    '<button class="follow-btn xs'+(t.following?" following":"")+'" data-follow="'+t.id+'">'+(t.following?"Following":"Follow")+'</button></div>'+
    '<div class="post-body"></div>'+
    '<div class="comments" id="cm-'+p.id+'" hidden></div>'+
    '<div class="post-actions">'+
      '<button class="like-btn'+(p.liked?" liked":"")+'" data-like="'+p.id+'" aria-pressed="'+p.liked+'"><span class="heart">♥</span> <span class="num">'+p.likes+'</span></button>'+
      '<button class="like-btn" data-comments="'+p.id+'"><span class="ic xs" data-icon="send"></span> <span class="num">'+p.comments.length+'</span></button>'+
      '<button class="like-btn" data-share="'+p.id+'"><span class="ic xs" data-icon="link"></span> Share</button>'+
    '</div>'+
    '<div class="comment-bar" id="cb-'+p.id+'" hidden>'+
      '<input class="field" id="ci-'+p.id+'" placeholder="Write a comment…" maxlength="140" autocomplete="off">'+
      '<button class="primary-btn sm" data-sendcomment="'+p.id+'">Send</button>'+
    '</div>';
  if(p.idea){
    const ib = document.createElement("div");
    ib.className = "idea-block";
    ib.innerHTML =
      '<div class="idea-top"><b>'+esc(p.idea.sym)+'</b>'+
      '<span class="dir '+(p.idea.dir==="BUY"?"buy":"sell")+'">'+(p.idea.dir==="BUY"?"BULLISH":"BEARISH")+'</span>'+
      '<span class="idea-tf">'+esc(p.idea.tf)+'</span></div>'+
      '<div class="idea-grid"><div><span>Entry ref</span><b class="num">'+fmtP(p.idea.sym,p.idea.price)+'</b></div>'+
      (p.idea.win?'<div><span>Backtest win</span><b class="num">'+p.idea.win+'%</b></div><div><span>Trades tested</span><b class="num">'+p.idea.n+'</b></div>':"")+
      '</div><span class="demo-tag">Strategy idea · demo</span>';
    c.insertBefore(ib, c.querySelector(".post-body"));
  }
  c.querySelector(".post-body").textContent = p.body;
  renderComments(p);
  injectIcons();
  return c;
}
function renderComments(p){
  const box = $("cm-"+p.id); if(!box) return;
  box.innerHTML = p.comments.map(cm=>
    '<div class="comment"><b>'+esc(cm.n)+'</b><span class="ctime"> · '+esc(cm.time)+'</span><p></p></div>'
  ).join("");
  box.querySelectorAll(".comment p").forEach((el,i)=>{ el.textContent = p.comments[i].t; });
}
function renderPosts(){
  const list = $("postList"); list.innerHTML = "";
  MOCK_POSTS.forEach(p=>list.appendChild(postCard(p)));
}
document.addEventListener("click", e=>{
  let b = e.target.closest("[data-like]");
  if(b){
    const p = MOCK_POSTS.find(x=>x.id===b.dataset.like); if(!p) return;
    p.liked = !p.liked; p.likes += p.liked?1:-1;
    b.classList.toggle("liked", p.liked);
    b.setAttribute("aria-pressed", p.liked);
    b.querySelector(".num").textContent = p.likes;
    if(p.liked){ b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
    return;
  }
  b = e.target.closest("[data-comments]");
  if(b){
    const id = b.dataset.comments;
    const box = $("cm-"+id), bar = $("cb-"+id);
    const show = box.hidden;
    box.hidden = !show; bar.hidden = !show;
    if(show) $("ci-"+id).focus();
    return;
  }
  b = e.target.closest("[data-share]");
  if(b){ toast("Link copied — demo"); return; }
  b = e.target.closest("[data-sendcomment]");
  if(b){
    const p = MOCK_POSTS.find(x=>x.id===b.dataset.sendcomment); if(!p) return;
    const inp = $("ci-"+p.id);
    const v = inp.value.trim(); if(!v){ toast("Write something first"); return; }
    p.comments.push({ n:"You", t:v, time:"now" });
    inp.value = "";
    renderComments(p);
    document.querySelectorAll('[data-comments="'+p.id+'"] .num').forEach(el=>{ el.textContent = p.comments.length; });
    toast("Comment posted — demo");
  }
});
/* composer */
$("composerPost").addEventListener("click", ()=>{
  const inp = $("composerInput");
  const v = inp.value.trim(); if(!v){ toast("Write something first"); return; }
  MOCK_POSTS.unshift({ id:"p"+Date.now(), tid:"you", time:"now", likes:0, liked:false, body:v, comments:[] });
  inp.value = "";
  renderPosts();
  toast("Posted — demo");
});
$("composerInput").addEventListener("keydown", e=>{ if(e.key==="Enter") $("composerPost").click(); });

/* ---------------- PROFILE + BROKERS ---------------- */
const BROKERS = [
  { name:"Exness",     sub:"MT4 / MT5",            g:["#2F80FF","#1B5FD6"], ini:"EX", server:"Exness-MT5Real", connected:false, logo:"assets/brokers/exness.png" },
  { name:"Vantage",    sub:"MT4 / MT5",            g:["#22C55E","#166534"], ini:"VA", server:"Vantage-MT5",     connected:false, logo:"assets/brokers/vantage.png" },
  { name:"IC Markets", sub:"MT4 / MT5 · cTrader",  g:["#5B8DEF","#2B4A8A"], ini:"IC", server:"ICMarkets-MT5",  connected:false, logo:"assets/brokers/icmarkets.png" },
  { name:"XM",         sub:"MT4 / MT5",            g:["#B678F0","#5E2B8A"], ini:"XM", server:"XM-MT5",          connected:false, logo:"assets/brokers/xm.png" },
  { name:"OctaFX",     sub:"MT4 / MT5",            g:["#F5A623","#B26A00"], ini:"OC", server:"OctaFX-MT5",     connected:false, logo:"assets/brokers/octafx.png" },
  { name:"FBS",        sub:"MT4 / MT5",            g:["#F04452","#8A1F28"], ini:"FB", server:"FBS-MT5",         connected:false, logo:"assets/brokers/fbs.png" }
];
/* broker logo tile: real logo image; falls back to the gradient monogram if the image fails */
function brokerLogoHTML(b, cls){
  const fb = '<div class="broker-logo '+(cls||"")+'" style="--g1:'+b.g[0]+';--g2:'+b.g[1]+'"><b>'+esc(b.name.split(" ")[0])+'</b><span>MT5</span></div>';
  if(!b.logo) return fb;
  return '<div class="broker-logo has-img '+(cls||"")+'"><img src="'+b.logo+'" alt="'+esc(b.name)+' logo" loading="lazy" onerror="this.closest(\'.broker-logo\').outerHTML=\''+fb.replace(/'/g,"\\'")+'\'"></div>';
}
function renderBrokers(){
  const list = $("brokerList"); list.innerHTML = "";
  BROKERS.forEach((b,i)=>{
    const r = document.createElement("div");
    r.className = "broker-row";
    r.innerHTML =
      brokerLogoHTML(b)+
      '<div><b>'+esc(b.name)+'</b><span>'+esc(b.sub)+(b.connected?' · <span class="pl-pos">Live link · demo</span>':"")+'</span></div>'+
      '<button class="conn-btn'+(b.connected?" connected":"")+'" data-broker="'+i+'">'+
      (b.connected?'<span class="conn-dot"></span>Connected':"Connect")+'</button>';
    list.appendChild(r);
  });
}
$("brokerList").addEventListener("click", e=>{
  const btn = e.target.closest("[data-broker]"); if(!btn) return;
  const i = +btn.dataset.broker;
  if(BROKERS[i].connected){ toast(BROKERS[i].name+" already linked — demo"); return; }
  openBrokerModal(i);
});
$("addBroker").addEventListener("click", ()=>toast("Add your broker — demo"));

/* broker login modal — simulated connection; open AND close reliably */
let brokerTarget = null;
function openBrokerModal(i){
  brokerTarget = i;
  const b = BROKERS[i];
  $("brokerModalIc").innerHTML = brokerLogoHTML(b, "lg");
  $("brokerModalName").textContent = b.name;
  $("brokerLogin").value = ""; $("brokerPass").value = "";
  $("brokerServer").value = b.server;
  const go = $("brokerConnectGo");
  go.disabled = false; go.textContent = "Connect";
  const m = $("brokerModal");
  m.hidden = false; m.style.display = ""; /* belt & braces with the [hidden] CSS rule */
}
function closeBrokerModal(){
  const m = $("brokerModal");
  m.hidden = true; m.style.display = "none";
  brokerTarget = null;
}
$("brokerModalX").addEventListener("click", closeBrokerModal);
$("brokerModalBg").addEventListener("click", closeBrokerModal);
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && !$("brokerModal").hidden) closeBrokerModal(); });
$("brokerConnectGo").addEventListener("click", ()=>{
  if(brokerTarget===null) return;
  /* demo: connect instantly, whatever is typed (or nothing at all) */
  const go = $("brokerConnectGo");
  go.disabled = true;
  go.innerHTML = '<span class="spinner"></span>Connecting…';
  setTimeout(()=>{
    BROKERS[brokerTarget].connected = true;
    toast(BROKERS[brokerTarget].name+" connected — demo");
    closeBrokerModal(); renderBrokers();
  }, 1200);
});

/* ================= v15: SOCIAL PROFILES, REELS, COPY, ACCOUNTS, KYC, LMS ================= */
/* --- enrich traders with posts + reels (seeded demo content) --- */
(function enrichTraders(){
  const P = (tid,n)=>({ id:tid+"-p"+n });
  const D = {
    daud:[
      { sym:"XAUUSD", dir:"BUY", pl:184.20, likes:214, time:"2h", seed:11, body:"NFP scalp: bought the dip into 2640 liquidity, +184 on the bounce. Plan over prediction." },
      { sym:"XAUUSD", dir:"SELL", pl:96.40, likes:156, time:"1d", seed:23, body:"London open fade — swept Asia high then dumped. Textbook liquidity grab." },
      { sym:"BTCUSD", dir:"BUY", pl:-58.10, likes:89, time:"3d", seed:37, body:"Took the L on this one. Stopped at 98k like I said I would. Discipline > ego." }
    ],
    sara:[
      { sym:"EURUSD", dir:"BUY", pl:142.80, likes:132, time:"5h", seed:41, body:"EURUSD reclaimed 1.0840 after sweeping Asia lows. Target 1.0890 hit." },
      { sym:"GBPUSD", dir:"BUY", pl:88.20, likes:97, time:"2d", seed:53, body:"Cable followed through on the DXY weakness. Partial at +60, runner stopped BE." },
      { sym:"USDJPY", dir:"SELL", pl:-34.50, likes:64, time:"4d", seed:67, body:"Small loss — BoJ headline spiked it through my stop. Risk was 0.5%, moving on." }
    ],
    arjun:[
      { sym:"BTCUSD", dir:"BUY", pl:212.60, likes:178, time:"8h", seed:71, body:"98k held beautifully. Spot bid on every dip — added on the retest." },
      { sym:"NAS100", dir:"SELL", pl:74.30, likes:91, time:"1d", seed:83, body:"Faded the tech euphoria into resistance. Quick in-and-out." },
      { sym:"ETHUSD", dir:"BUY", pl:-41.20, likes:55, time:"5d", seed:97, body:"ETH wicked me out before the real move. Frustrating but that's the game." }
    ],
    lena:[
      { sym:"XAUUSD", dir:"SELL", pl:118.90, likes:143, time:"3h", seed:103, body:"Patient short from the highs — metals reward those who wait." },
      { sym:"XAGUSD", dir:"BUY", pl:62.40, likes:88, time:"2d", seed:109, body:"Silver broke the range, rode half the move. Enough." },
      { sym:"XAUUSD", dir:"BUY", pl:-28.70, likes:47, time:"6d", seed:113, body:"Early on the long, stopped for -0.3%. Re-entered later for the win (not shown)." }
    ]
  };
  const R = {
    daud:[
      { title:"How I scalp gold on NFP day", views:"12.4k", likes:842, seed:5 },
      { title:"3 liquidity traps to avoid", views:"8.1k", likes:517, seed:9 }
    ],
    sara:[
      { title:"My swing checklist (5 min)", views:"6.7k", likes:402, seed:13 },
      { title:"Fundamentals + technicals", views:"4.2k", likes:268, seed:17 }
    ],
    arjun:[
      { title:"Risk-first crypto entries", views:"9.8k", likes:633, seed:21 },
      { title:"When I stand aside", views:"5.5k", likes:341, seed:25 }
    ],
    lena:[
      { title:"Patience: my gold edge", views:"7.3k", likes:489, seed:29 },
      { title:"Silver range breakout", views:"3.9k", likes:214, seed:33 }
    ]
  };
  TRADERS.forEach(t=>{
    t.posts = (D[t.id]||[]).map((p,i)=>Object.assign(P(t.id,i+1), p, { tid:t.id, liked:false, comments:[] }));
    t.reels = (R[t.id]||[]).map((r,i)=>Object.assign({ id:t.id+"-r"+(i+1), liked:false }, r));
    t.postCount = t.posts.length;
  });
  /* you, as a trader on the social layer */
  TRADERS.push({ id:"you", name:"Alex Trader", handle:"@alextrader", ini:"AT", g:["#2F80FF","#1B5FD6"],
    bio:"Learning in public · XAUUSD & majors", following:false, followers:1204, followingN:86,
    win:52, pl:0, live:false, you:true,
    monthly:[120,-40,200,90,-60,150,80,210,-30,140,60,110],
    trades:[], posts:[], reels:[], postCount:0 });
})();
function traderPosts(tid){ const t = TRADERS.find(x=>x.id===tid); return t ? t.posts||[] : []; }

/* --- seeded sparkline / equity canvases --- */
function drawSpark(cv, seed, up){
  try{
    const ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
    const rnd = mulberry32(seed*7919+13);
    const pts = []; let v = 0.5;
    for(let i=0;i<28;i++){ v += (rnd()-0.46)*0.14; v = Math.max(0.08, Math.min(0.92, v)); pts.push(v); }
    if(up) pts[27] = Math.min(0.92, pts[0]+0.25); else pts[27] = Math.max(0.08, pts[0]-0.25);
    const grd = ctx.createLinearGradient(0,0,W,H);
    grd.addColorStop(0,"#2F80FF"); grd.addColorStop(1,"#22C55E");
    ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 5; ctx.lineJoin = "round"; ctx.beginPath();
    pts.forEach((p,i)=>{ const x = 14+i*(W-28)/27, y = H-16-p*(H-32); i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
    ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.beginPath();
    ctx.arc(14+27*(W-28)/27, H-16-pts[27]*(H-32), 9, 0, 7); ctx.fill();
  }catch(e){}
}
function drawEquity(cv, monthly){
  try{
    const ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
    let cum = 0; const pts = monthly.map(m=>cum+=m);
    const min = Math.min.apply(null,pts.concat([0])), max = Math.max.apply(null,pts.concat([1]));
    const X = i=>14+i*(W-28)/(pts.length-1), Y = v=>H-14-((v-min)/(max-min))*(H-28);
    const dark = theme()==="dark";
    ctx.strokeStyle = dark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"; ctx.lineWidth = 1;
    for(let g=0;g<4;g++){ ctx.beginPath(); ctx.moveTo(0,14+g*(H-28)/3); ctx.lineTo(W,14+g*(H-28)/3); ctx.stroke(); }
    const up = pts[pts.length-1] >= 0;
    const grd = ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0, up?"rgba(34,197,94,.35)":"rgba(240,68,82,.35)"); grd.addColorStop(1,"rgba(0,0,0,0)");
    ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(X(i),Y(p)):ctx.moveTo(X(i),Y(p)));
    ctx.lineTo(X(pts.length-1),H); ctx.lineTo(X(0),H); ctx.closePath(); ctx.fillStyle = grd; ctx.fill();
    ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(X(i),Y(p)):ctx.moveTo(X(i),Y(p)));
    ctx.strokeStyle = up?"#22C55E":"#F04452"; ctx.lineWidth = 4; ctx.lineJoin="round"; ctx.stroke();
  }catch(e){}
}


/* --- IG-style trader profile (replaces renderTraderProfile) --- */
function igProfileHTML(t){
  const copyingThis = copyState.on && copyState.host === t.id;
  return ''+
  '<div class="ig-head">'+
    '<div class="avatar xl" style="background:linear-gradient(135deg,'+t.g[0]+','+t.g[1]+')">'+t.ini+
    (t.live?'<span class="trader-live">LIVE</span>':'')+'</div>'+
    '<div class="ig-id"><b>'+esc(t.name)+(t.kycVerified?' ✓':'')+'</b><span class="handle">'+esc(t.handle)+'</span>'+
    '<p class="ig-bio">'+esc(t.bio)+'</p></div>'+
  '</div>'+
  '<div class="ig-actions">'+
    (t.you
      ? '<button class="ghost-btn" id="tprofEdit">Edit profile</button>'
      : '<button class="'+(t.following?"ghost-btn":"primary-btn")+'" id="tprofFollow">'+(t.following?"Following":"Follow")+'</button>')+
    (t.live?'<button class="watch-live-btn" id="tprofWatch"><span class="live-pill"><i></i>LIVE</span> Watch now</button>':'')+
    (t.live?'<button class="ghost-btn" id="tprofCopy">📋 Copy</button>':'')+
    (t.you?'':'<button class="ghost-btn" id="tprofMsg">Message</button>')+
  '</div>'+
  (copyingThis?'<div><span class="copying-chip">📋 Copying '+esc(t.handle)+' · '+copyState.lots.toFixed(2)+' lots</span></div>':'')+
  '<div class="ig-stats">'+
    '<div class="ig-stat"><b class="num">'+(t.posts?t.posts.length:0)+'</b><span>Posts</span></div>'+
    '<div class="ig-stat"><b class="num">'+fmtK(t.followers)+'</b><span>Followers</span></div>'+
    '<div class="ig-stat"><b class="num">'+fmtK(t.followingN)+'</b><span>Following</span></div>'+
    '<div class="ig-stat"><b class="num">'+t.win+'%</b><span>Win rate</span></div>'+
  '</div>'+
  '<div class="ig-tabs" id="tprofTabs">'+
    '<button class="ig-tab active" data-ttab="posts">Posts</button>'+
    '<button class="ig-tab" data-ttab="reels">Reels</button>'+
    '<button class="ig-tab" data-ttab="trades">Trades</button>'+
  '</div>'+
  '<div id="tprofTab-posts"></div>'+
  '<div id="tprofTab-reels" hidden></div>'+
  '<div id="tprofTab-trades" hidden></div>';
}
function renderTraderProfile(id){
  const t = TRADERS.find(x=>x.id===id); if(!t) return;
  const body = $("tprofBody");
  body.innerHTML = igProfileHTML(t);
  /* tabs */
  $("tprofTabs").addEventListener("click", e=>{
    const b = e.target.closest("[data-ttab]"); if(!b) return;
    body.querySelectorAll(".ig-tab").forEach(x=>x.classList.toggle("active", x===b));
    ["posts","reels","trades"].forEach(k=>{ $("tprofTab-"+k).hidden = (k!==b.dataset.ttab); });
  });
  renderTprofPosts(t); renderTprofReels(t); renderTprofTrades(t);
  /* actions */
  const fw = $("tprofFollow");
  if(fw) fw.addEventListener("click", ()=>{
    t.following = !t.following; t.followers += t.following?1:-1;
    renderTraderProfile(t.id); renderTraders();
  });
  const w = $("tprofWatch");
  if(w) w.addEventListener("click", ()=>{ closeTraderProfile(); watchTraderLive(t.id); });
  const cp = $("tprofCopy");
  if(cp) cp.addEventListener("click", ()=>{ closeTraderProfile(); openCopyModal(t.id); });
  const mg = $("tprofMsg");
  if(mg) mg.addEventListener("click", ()=>toast("Messaging is demo — chat coming soon"));
  const ed = $("tprofEdit");
  if(ed) ed.addEventListener("click", ()=>{ closeTraderProfile(); goTab("profile"); });
}
function renderTprofPosts(t){
  const el = $("tprofTab-posts"); if(!el) return;
  if(!t.posts || !t.posts.length){ el.innerHTML = '<div class="empty">No posts yet.</div>'; return; }
  el.innerHTML = '<div class="post-grid">'+t.posts.map(p=>
    '<button class="post-tile" data-post="'+p.id+'">'+
      '<canvas width="300" height="300"></canvas>'+
      '<div class="pt-meta"><b>'+esc(p.sym)+'</b><span class="'+(p.pl>=0?"up":"dn")+'">'+(p.pl>=0?"+":"")+fmt$(p.pl)+'</span></div>'+
    '</button>').join("")+'</div>';
  el.querySelectorAll(".post-tile").forEach((tile,i)=>{
    const p = t.posts[i];
    drawSpark(tile.querySelector("canvas"), p.seed, p.pl>=0);
    tile.addEventListener("click", ()=>openPostDetail(t, p));
  });
}
function openPostDetail(t, p){
  const body = $("tprofBody");
  body.innerHTML = '<button class="ghost-btn sm back-btn" id="postDetailBack">‹ Back to profile</button><div id="postDetailWrap"></div>';
  $("postDetailWrap").appendChild(postCard(p));
  $("postDetailBack").addEventListener("click", ()=>renderTraderProfile(t.id));
  $("tprofBody").scrollTop = 0;
}
function renderTprofReels(t){
  const el = $("tprofTab-reels"); if(!el) return;
  if(!t.reels || !t.reels.length){ el.innerHTML = '<div class="empty">No reels yet.</div>'; return; }
  el.innerHTML = '<div class="reel-grid">'+t.reels.map(r=>
    '<button class="reel-tile" data-reel="'+r.id+'" style="--g1:'+t.g[0]+';--g2:'+t.g[1]+'">'+
      '<span class="rt-play"><i>▶</i></span>'+
      '<span class="rt-meta"><b>'+esc(r.title)+'</b><span>▶ '+esc(r.views)+'</span></span>'+
    '</button>').join("")+'</div>';
  el.querySelectorAll(".reel-tile").forEach(tile=>{
    tile.addEventListener("click", ()=>{
      const r = t.reels.find(x=>x.id===tile.dataset.reel);
      openReel(t, r);
    });
  });
}
function renderTprofTrades(t){
  const el = $("tprofTab-trades"); if(!el) return;
  el.innerHTML =
    '<div class="card"><div class="sec-head" style="margin-bottom:8px"><h3>Equity curve</h3><span class="fine">Demo · 12 months</span></div>'+
    '<canvas class="eq-canvas" id="tprofEq" width="640" height="240"></canvas></div>'+
    '<div class="sec-head"><h3>Monthly P/L</h3></div>'+
    '<div class="card"><div class="mchart">'+monthlyBars(t.monthly)+'</div><div class="mchart-x"><span>Jan</span><span>Dec</span></div></div>'+
    '<div class="sec-head"><h3>Recent trades</h3><span class="fine">Demo</span></div>'+
    '<div class="card ttrades">'+ (t.trades.length ? t.trades.map(tr=>
      '<div class="ttrade"><b>'+tr.s+'</b><span class="dir '+(tr.d==="BUY"?"buy":"sell")+'">'+tr.d+'</span>'+
      '<b class="num '+plClass(tr.pl)+'">'+fmt$(tr.pl)+'</b></div>').join("") : '<div class="empty">No trades yet.</div>') +'</div>';
  drawEquity($("tprofEq"), t.monthly);
}

/* --- reel viewer --- */
let reelTimer = null, reelRAF = 0;
function openReel(t, r){
  $("reelTrader").textContent = t.handle + (t.live?" · LIVE":"");
  $("reelTitle").innerHTML = esc(r.title) +
    (r.desc ? '<span class="reel-desc">'+esc(r.desc)+'</span>' : "") +
    (r.tags && r.tags.length ? '<span class="reel-tags">'+r.tags.map(esc).join(" ")+'</span>' : "");
  $("reelLikeN").textContent = fmtK(r.likes);
  $("reelComN").textContent = fmtK(r.commentsN || (r.comments?r.comments.length:0) || Math.round(r.likes/9));
  $("reelLike").classList.toggle("liked", !!r.liked);
  $("reelLike").onclick = ()=>{
    r.liked = !r.liked; r.likes += r.liked?1:-1;
    $("reelLikeN").textContent = fmtK(r.likes);
    $("reelLike").classList.toggle("liked", r.liked);
    if(r.liked) floatHeart();
  };
  $("reelComment").onclick = ()=>openReelComments(t, r);
  $("reelShare").onclick = ()=>{ shareReel(r); };
  $("reelView").hidden = false;
  document.body.classList.add("lock-scroll");
  /* uploaded device video plays natively; seeded reels use the animated chart canvas */
  const vid = $("reelVideo"), cv = $("reelCanvas");
  if(r.videoUrl){
    cancelAnimationFrame(reelRAF);
    cv.hidden = true; vid.hidden = false;
    vid.src = r.videoUrl;
    vid.play().catch(()=>{});
    $("reelProg").style.width = "100%";
    return;
  }
  vid.pause(); vid.removeAttribute("src"); vid.hidden = true; cv.hidden = false;
  /* animated chart canvas */
  const ctx = cv.getContext("2d");
  const rnd = mulberry32(r.seed*331+7);
  const pts = []; let v = 0.45;
  for(let i=0;i<60;i++){ v += (rnd()-0.44)*0.1; v = Math.max(.1, Math.min(.9, v)); pts.push(v); }
  const dur = 9000; let start = performance.now();
  cancelAnimationFrame(reelRAF);
  (function frame(now){
    if($("reelView").hidden) return;
    const el = Math.min(1, (now-start)/dur);
    const W = cv.width, H = cv.height;
    const grd = ctx.createLinearGradient(0,0,W,H);
    grd.addColorStop(0, t.g[0]); grd.addColorStop(1, "#060A13");
    ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 2;
    for(let g=1;g<5;g++){ ctx.beginPath(); ctx.moveTo(0,H*g/5); ctx.lineTo(W,H*g/5); ctx.stroke(); }
    const n = Math.max(2, Math.floor(pts.length*el));
    ctx.beginPath();
    for(let i=0;i<n;i++){ const x = 30+i*(W-60)/(pts.length-1), y = H*0.72-pts[i]*H*0.5; i?ctx.lineTo(x,y):ctx.moveTo(x,y); }
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 6; ctx.lineJoin = "round"; ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.font = "700 34px "+getComputedStyle(document.body).fontFamily;
    ctx.fillText(t.handle, 30, H-160);
    ctx.font = "400 26px "+getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = "rgba(255,255,255,.75)";
    wrapText(ctx, r.title, 30, H-116, W-200, 30);
    $("reelProg").style.width = (el*100)+"%";
    if(el>=1){ start = performance.now(); }
    reelRAF = requestAnimationFrame(frame);
  })(start);
}
function wrapText(ctx, text, x, y, maxW, lh){
  const words = text.split(" "); let line = "";
  for(const w of words){ const t = line+w+" ";
    if(ctx.measureText(t).width > maxW && line){ ctx.fillText(line, x, y); line = w+" "; y += lh; }
    else line = t; }
  ctx.fillText(line, x, y);
}
function closeReel(){
  cancelAnimationFrame(reelRAF);
  const vid = $("reelVideo"); if(vid){ vid.pause(); vid.hidden = true; }
  $("reelView").hidden = true;
  document.body.classList.remove("lock-scroll");
}
function shareReel(r){
  const txt = "Reel: "+r.title+" (demo)";
  if(navigator.share){ navigator.share({ title:"Trading Community", text:txt }).catch(()=>{}); }
  else if(navigator.clipboard){ navigator.clipboard.writeText(txt).then(()=>toast("Link copied (demo)")).catch(()=>toast("Share — demo")); }
  else toast("Share — demo");
}
/* reel comments (simple bottom-sheet style list inside viewer) */
function openReelComments(t, r){
  if(!r.comments){
    r.comments = [
      { n:"Sara Malik", t:"This is exactly how I read liquidity too 🔥", time:"12m" },
      { n:"Arjun Mehta", t:"Tried this on BTC, worked twice this week", time:"34m" },
      { n:"Lena K", t:"Saving this one 📌", time:"1h" }
    ];
  }
  const body = $("tprofBody"); /* reuse profile overlay if open? no — dedicated sheet */
  closeReel();
  openSheetComments("Reel · "+r.title, r.comments, (txt)=>{
    r.comments.push({ n:"You", t:txt, time:"now" });
    $("reelComN").textContent = fmtK(r.comments.length);
  });
}
/* generic comment sheet used by reels */
function openSheetComments(title, comments, onAdd){
  let sheet = $("commentSheet");
  if(!sheet){
    sheet = document.createElement("div");
    sheet.id = "commentSheet";
    sheet.innerHTML =
      '<div class="backdrop" id="csBackdrop"></div>'+
      '<div class="sheet"><div class="sheet-head"><h3 id="csTitle"></h3>'+
      '<button class="icon-btn" id="csX" aria-label="Close"><span class="ic" data-icon="x"></span></button></div>'+
      '<div class="comment-list" id="csList"></div>'+
      '<div class="chat-bar"><input class="field" id="csInput" placeholder="Add a comment…" maxlength="140">'+
      '<button class="icon-btn primary" id="csSend" aria-label="Send"><span class="ic" data-icon="send"></span></button></div></div>';
    document.body.appendChild(sheet);
    $("csX").addEventListener("click", closeSheetComments);
    $("csBackdrop").addEventListener("click", closeSheetComments);
  }
  $("csTitle").textContent = title;
  const render = ()=>{
    $("csList").innerHTML = comments.map(c=>
      '<div class="comment"><b>'+esc(c.n)+'</b><span>'+esc(c.t)+'</span></div>').join("") ||
      '<div class="empty">No comments yet.</div>';
  };
  render();
  $("csSend").onclick = ()=>{
    const v = $("csInput").value.trim(); if(!v) return;
    onAdd(v); $("csInput").value = ""; render();
  };
  injectIcons();
  sheet.hidden = false;
}
function closeSheetComments(){ const s = $("commentSheet"); if(s) s.hidden = true; }


/* --- copy trading v2: warning modal + lot-size choice + simulated mirror --- */
let copyState = { on:false, host:null, lots:0.10, pendingHost:null };
let copyLotSel = 0.10;
function copyHostHandle(){ const t = TRADERS.find(x=>x.id===copyState.host); return t?t.handle:"@host"; }
function openCopyModal(hostId){
  const t = TRADERS.find(x=>x.id===hostId); if(!t || t.you){ if(t&&t.you) toast("That's you — demo"); return; }
  copyState.pendingHost = t.id;
  setCopyLots(0.10);
  $("copyWarnHost").textContent = t.name+" ("+t.handle+")";
  const a = activeAcct();
  $("copyWarnAcct").textContent = a.broker+" "+a.type+" · "+a.login;
  $("copyModal").hidden = false;
}
function closeCopyModal(){ $("copyModal").hidden = true; }
function setCopyLots(v){
  copyLotSel = Math.min(5, Math.max(0.01, Math.round(v*100)/100));
  $("copyLotVal").textContent = copyLotSel.toFixed(2);
}
function startCopy(){
  const t = TRADERS.find(x=>x.id===copyState.pendingHost); if(!t) return;
  copyState.on = true; copyState.host = t.id; copyState.lots = copyLotSel;
  paintCopyUI(); renderCopyStatus(); closeCopyModal();
  toast("Copying "+t.handle+" at "+copyState.lots.toFixed(2)+" lots — demo, no real orders");
}
function stopCopy(){
  copyState.on = false; copyState.host = null;
  paintCopyUI(); renderCopyStatus();
  toast("Copy-trading OFF — copied positions stay open until you close them");
}
function paintCopyUI(){
  const sw = $("copySwitch"); if(!sw) return;
  sw.classList.toggle("on", copyState.on);
  sw.setAttribute("aria-pressed", copyState.on?"true":"false");
  const chip = $("copyChip");
  if(chip){ chip.hidden = !copyState.on; if(copyState.on) chip.textContent = "📋 Copying "+copyHostHandle(); }
}
function copiedOpen(){ return state.open.filter(p=>p.copy); }
function copiedPL(){
  return copiedOpen().reduce((s,p)=>{
    const pr = px(p.sym), cur = p.dir==="BUY"?pr.bid:pr.ask;
    return s + (p.dir==="BUY"?(cur-p.entry):(p.entry-cur))*meta(p.sym).perPoint*p.lots;
  }, 0);
}
function renderCopyStatus(){
  const card = $("copyStatusCard"); if(!card) return;
  if(!copyState.on){ card.hidden = true; return; }
  const cps = copiedOpen(), pl = copiedPL();
  card.hidden = false;
  card.innerHTML =
    '<b>📋 Copy-trading ON</b>'+
    '<p>Mirroring <b>'+esc(copyHostHandle())+'</b> at '+copyState.lots.toFixed(2)+' lots · '+
    cps.length+' copied position'+(cps.length===1?"":"s")+' · '+
    '<b class="num '+plClass(pl)+'">'+fmt$(pl)+'</b> <span class="demo-tag">Demo</span></p>'+
    '<button class="danger-btn sm" id="copyStopBtn">Stop copying</button>';
  $("copyStopBtn").addEventListener("click", stopCopy);
}
function mirrorHostTrade(dir, at){
  /* called when the host takes a trade while copy is on — demo simulation */
  if(!copyState.on) return;
  if(copiedOpen().length >= 8) return;
  state.open.push({ id:"cp"+Date.now()+Math.floor(Math.random()*999),
    sym:"XAUUSD", dir, entry:at, lots:copyState.lots, copy:{ from:copyHostHandle() } });
  renderPositions();
  if(Math.random()<0.22){
    const cp = copiedOpen()[0];
    if(cp){ const pr = px(cp.sym); closePosition(cp, cp.dir==="BUY"?pr.bid:pr.ask, "Copy close"); }
  }
}


/* --- multi-account system: demo + live accounts, switchable --- */
let ACCOUNTS = [
  { id:"a1", broker:"Exness",  type:"demo", login:"58102436", server:"Exness-MT5Real", balance:10000, open:[], pending:[], history:[] },
  { id:"a2", broker:"Vantage", type:"live", login:"90213345", server:"Vantage-MT5",     balance:2500,  open:[], pending:[], history:[] }
];
let activeAcctId = "a1";
function activeAcct(){ return ACCOUNTS.find(a=>a.id===activeAcctId) || ACCOUNTS[0]; }
function switchAccount(id){
  if(id===activeAcctId){ closeAcctSheet(); return; }
  const cur = activeAcct();
  cur.balance = state.balance; cur.open = state.open; cur.pending = state.pending; cur.history = state.history;
  activeAcctId = id;
  const a = activeAcct();
  state.balance = a.balance; state.open = a.open; state.pending = a.pending; state.history = a.history;
  renderAcctUI(); renderPositions(); renderCopyStatus(); closeAcctSheet();
  toast("Switched to "+a.broker+" "+a.type+" · "+a.login+" — demo");
}
function renderAcctUI(){
  const a = activeAcct();
  $("acctName").textContent = a.broker;
  $("acctType").textContent = (a.type==="live"?"Live":"Demo")+" · "+a.login;
  $("acctDot").className = "acct-dot "+a.type;
  $("profAcctName").textContent = a.broker+" · "+(a.type==="live"?"Live":"Demo");
  $("profAcctDot").className = "acct-dot "+a.type;
  renderAccount();
}
function renderAcctSheet(){
  const list = $("acctList"); list.innerHTML = "";
  ACCOUNTS.forEach(a=>{
    const r = document.createElement("button");
    r.className = "acct-row"+(a.id===activeAcctId?" active":"");
    r.innerHTML = '<span class="acct-dot '+a.type+'"></span>'+
      '<span class="a-info"><b>'+esc(a.broker)+'</b><span>'+esc(a.login)+' · '+esc(a.server)+'</span></span>'+
      '<span class="acct-type-pill '+a.type+'">'+a.type.toUpperCase()+'</span>';
    r.addEventListener("click", ()=>switchAccount(a.id));
    list.appendChild(r);
  });
}
function openAcctSheet(){ renderAcctSheet(); $("acctSheet").hidden = false; $("acctBackdrop").hidden = false; }
function closeAcctSheet(){ $("acctSheet").hidden = true; $("acctBackdrop").hidden = true; }
let amType = "demo";
function openAcctModal(){
  const sel = $("amBroker");
  if(!sel.options.length) BROKERS.forEach(b=>{ const o = document.createElement("option"); o.textContent = b.name; sel.appendChild(o); });
  $("acctModal").hidden = false;
}
function closeAcctModal(){ $("acctModal").hidden = true; }

/* --- KYC verification (demo flow) --- */
let kyc = { status:"unverified", name:"", dob:"", country:"" };
try{ const k = JSON.parse(localStorage.getItem("tc_kyc_v1")||"null"); if(k && k.status) kyc = k; }catch(e){}
function saveKyc(){ try{ localStorage.setItem("tc_kyc_v1", JSON.stringify(kyc)); }catch(e){} }
function renderKyc(){
  const st = $("kycStatus"), lb = $("kycLabel");
  if(!st) return;
  st.className = "kyc-status "+kyc.status;
  st.textContent = kyc.status==="verified" ? "Verified ✓" : kyc.status==="pending" ? "Pending review" : "Not verified";
  if(lb) lb.textContent = kyc.status==="verified" ? "Identity verified" : "Verify identity";
  const you = TRADERS.find(t=>t.id==="you"); if(you) you.kycVerified = (kyc.status==="verified");
}
function openKyc(){
  renderKycBody(); $("kycView").hidden = false;
}
function closeKyc(){ $("kycView").hidden = true; }
function kycStep(n, title, desc, inner, done){
  return '<div class="kyc-step'+(done?" done":"")+'"><span class="kyc-n">'+(done?"✓":n)+'</span>'+
    '<div class="k-info"><b>'+title+'</b><p>'+desc+'</p>'+inner+'</div></div>';
}
function renderKycBody(){
  const b = $("kycBody");
  if(kyc.status==="pending"){
    b.innerHTML = '<div class="card" style="text-align:center;padding:32px 20px"><div class="warn-ic" style="background:rgba(245,166,35,.12);color:#F5A623">…</div>'+
      '<h3>Under review</h3><p class="modal-sub">Our demo team is checking your documents.<br>This usually takes a few minutes.</p></div>';
    return;
  }
  if(kyc.status==="verified"){
    b.innerHTML = '<div class="card" style="text-align:center;padding:32px 20px"><div class="warn-ic" style="background:var(--green-soft);color:var(--green)">✓</div>'+
      '<h3>Identity verified</h3><p class="modal-sub">Verified as <b>'+esc(kyc.name||"Alex Trader")+'</b><br><span class="demo-tag">Demo verification</span></p></div>';
    return;
  }
  b.innerHTML =
    '<p class="modal-sub" style="margin-bottom:12px">Verify once to unlock withdrawals, higher limits and the verified badge. <span class="demo-tag">Demo</span></p>'+
    kycStep(1, "Personal details", "As on your ID document.",
      '<label class="fld-label">Full name<input class="field" id="kycName" value="'+esc(kyc.name)+'" placeholder="Alex Trader"></label>'+
      '<label class="fld-label">Date of birth<input class="field" id="kycDob" type="date" value="'+esc(kyc.dob)+'"></label>'+
      '<label class="fld-label">Country<input class="field" id="kycCountry" value="'+esc(kyc.country)+'" placeholder="United Arab Emirates"></label>',
      !!(kyc.name && kyc.dob))+
    kycStep(2, "ID document", "Passport or national ID — front and back.",
      '<div class="doc-upload"><button class="doc-btn" id="kycDocF">📄 Front<br><small>tap to upload</small></button>'+
      '<button class="doc-btn" id="kycDocB">📄 Back<br><small>tap to upload</small></button></div>'+
      '<input type="file" id="kycFileF" accept="image/*" hidden><input type="file" id="kycFileB" accept="image/*" hidden>',
      !!(kyc.docF && kyc.docB))+
    kycStep(3, "Selfie", "Take a clear selfie in good light.",
      '<div class="doc-upload"><button class="doc-btn" id="kycSelfie">🤳 Take selfie<br><small>tap to upload</small></button></div>'+
      '<input type="file" id="kycFileS" accept="image/*" capture="user" hidden>',
      !!kyc.selfie)+
    '<button class="primary-btn" id="kycSubmit">Submit for verification</button>'+
    '<p class="fine" style="text-align:center">Demo — files never leave your device.</p>';
  $("kycDocF").addEventListener("click", ()=>$("kycFileF").click());
  $("kycDocB").addEventListener("click", ()=>$("kycFileB").click());
  $("kycSelfie").addEventListener("click", ()=>$("kycFileS").click());
  [["kycFileF","kycDocF","docF"],["kycFileB","kycDocB","docB"],["kycFileS","kycSelfie","selfie"]].forEach(([fi,btn,key])=>{
    $(fi).addEventListener("change", ()=>{
      const f = $(fi).files[0]; if(!f) return;
      kyc[key] = f.name; saveKyc();
      $(btn).classList.add("has"); $(btn).innerHTML = "✓ "+esc(f.name.length>18?f.name.slice(0,16)+"…":f.name);
    });
  });
  $("kycSubmit").addEventListener("click", ()=>{
    kyc.name = $("kycName").value.trim(); kyc.dob = $("kycDob").value; kyc.country = $("kycCountry").value.trim();
    if(!kyc.name || !kyc.dob){ toast("Add your name and date of birth first"); return; }
    if(!kyc.docF || !kyc.docB){ toast("Upload front and back of your ID"); return; }
    if(!kyc.selfie){ toast("Add a selfie to finish"); return; }
    kyc.status = "pending"; saveKyc(); renderKyc(); renderKycBody();
    toast("Documents submitted — demo review started");
    setTimeout(()=>{
      if(kyc.status!=="pending") return;
      kyc.status = "verified"; saveKyc(); renderKyc(); renderKycBody();
      toast("Identity verified ✓ — demo");
    }, 6000);
  });
}

/* --- Classes / LMS: free + paid private rooms --- */
const COURSES = [
  { id:"c1", title:"Price Action Mastery", sub:"6 lessons · English", price:0, emoji:"📈", g:["#2F80FF","#1B5FD6"], edu:"daud",
    desc:"Read raw price like a pro: market structure, liquidity grabs and entries without a single indicator.",
    lessons:[
      { t:"Market structure in 15 minutes", dur:"14:20", type:"video", body:"Structure is the skeleton of every move: higher highs and higher lows for uptrend, lower highs and lower lows for downtrend. In this lesson you learn to mark swing points on any timeframe and spot the moment structure breaks — that break is where most of my entries come from." },
      { t:"Liquidity: where the stops live", dur:"18:45", type:"video", body:"Price hunts liquidity. Equal highs, equal lows, session highs and round numbers are magnets. You will learn to wait for the sweep — the fake breakout that grabs stops — and enter on the reversal instead of chasing the breakout like the crowd." },
      { t:"My NFP gold scalp, step by step", dur:"22:10", type:"video", body:"A full replay of a news-day scalp on XAUUSD: pre-news levels, the spread widening trap, the sweep of Asia low, and the entry with a 6-point stop. Includes the checklist I run before every red-news event." },
      { t:"Entries: limit vs market", dur:"11:32", type:"article", body:"Market orders feel decisive but cost you spread and slippage. Limit orders at pre-marked zones get you better fills and force patience. Rule: if the zone is gone, the trade is gone — never chase more than 20% past your level." },
      { t:"Backtesting this strategy (demo)", dur:"16:05", type:"video", body:"How I backtested 200 setups of this playbook: win rate 61%, average win 1.8R, average loss 1R. You get the exact spreadsheet template and the rules for logging — because a strategy you cannot measure is a hobby, not an edge." },
      { t:"Putting it together: your playbook", dur:"13:48", type:"article", body:"Write your one-page playbook: setup, entry trigger, stop rule, two take-profit targets, and the sessions you trade. Trade only that page for 30 days. Then review the data, not your feelings." }
    ],
    materials:[
      { name:"PA cheatsheet.pdf", kind:"PDF", size:"1.2 MB", body:"PRICE ACTION CHEATSHEET (demo)\n\n1. Trend = HH/HL or LH/LL — nothing else.\n2. Liquidity sits above equal highs, below equal lows.\n3. Enter on the sweep, not the breakout.\n4. Stop beyond the sweep wick, never beyond hope.\n5. Two targets: first at 1.5R, runner with trailing stop.\n6. Max 2% risk per trade. Max 3 trades per session." },
      { name:"Backtest template.csv", kind:"CSV", size:"4 KB", body:"date,symbol,setup,entry,stop,tp1,tp2,result,r_multiple,notes (demo file — 200 rows in the full version)" }
    ] },
  { id:"c2", title:"Gold Scalping — Private Room", sub:"6 lessons · private", price:5, emoji:"🥇", g:["#F5A623","#B26A00"], edu:"daud", enrolled:false,
    desc:"My private scalping room: exact gold entries, live session recordings, and every strategy PDF I trade from. One-time $5 entry — recordings stay yours forever.",
    lessons:[
      { t:"Welcome + room rules", dur:"6:12", type:"video", body:"Welcome to the private room. Rules: risk 1% max per scalp, no trading during the first 5 minutes after red news, and post every trade in the room journal. I review journals every Sunday." },
      { t:"The London sweep setup", dur:"24:40", type:"video", body:"The highest-probability scalp I know: Asia range marked, London sweeps one side, M5 displacement back inside, enter on the retest. Full replay of 11 live examples with entries, stops and targets drawn." },
      { t:"Spread & session traps", dur:"17:25", type:"video", body:"Why most scalpers bleed out: spread widening at rollover, fake liquidity at round numbers, and chasing after the move. Includes my session filter — I only scalp 07:00–11:00 and 13:30–16:30 GMT." },
      { t:"Live recording: +$184 NFP scalp", dur:"31:02", type:"video", body:"Uncut recording of the NFP scalp from my profile: audio commentary, order entries, the moment I almost moved my stop (and why I didn't). Raw and unedited." },
      { t:"Journaling like a professional", dur:"12:18", type:"article", body:"The journal template I use: screenshot, setup tag, emotional state 1–5, R-multiple. Review weekly. Your edge is hiding in your journal, not in another indicator." },
      { t:"Graduation: your 30-day plan", dur:"9:44", type:"article", body:"30 days, one setup, max 3 scalps a day. Hit 55%+ win rate at 1.5R average and you graduate to 2% risk. The plan, the tracker and the rules — all in the materials below." }
    ],
    materials:[
      { name:"Gold playbook.pdf", kind:"PDF", size:"2.4 MB", body:"GOLD SCALPING PLAYBOOK (demo)\n\nSetup: London sweep of Asia range.\nEntry: M5 displacement + retest of swept level.\nStop: 8–12 points beyond sweep wick.\nTargets: TP1 +18 points, TP2 runner.\nRisk: 1% per scalp. Max 3 per session.\nSessions: London open + New York open only." },
      { name:"Session filter guide.pdf", kind:"PDF", size:"800 KB", body:"SESSION FILTER (demo)\n\nTrade: 07:00–11:00 GMT, 13:30–16:30 GMT.\nAvoid: rollover 21:00–22:00 GMT, first 5 min after red news.\nSpread rule: skip if spread > 35 points on gold." },
      { name:"Journal template.xlsx", kind:"XLSX", size:"96 KB", body:"Journal columns: date, session, setup, entry, stop, tp1, tp2, R, emotion (1–5), screenshot link, notes. (demo preview)" }
    ] },
  { id:"c3", title:"Risk Management Bootcamp", sub:"5 lessons · English", price:0, emoji:"🛡", g:["#22C55E","#166534"], edu:"sara",
    desc:"The unsexy skill that keeps you in the game: position sizing, drawdown rules and the math of survival.",
    lessons:[
      { t:"Position sizing without tears", dur:"15:30", type:"video", body:"Lots = (risk $) / (stop in points × $ per point). One formula, worked examples for gold, EURUSD and BTC. Includes the calculator I keep open on every trading day." },
      { t:"The 2% rule and drawdown math", dur:"13:12", type:"video", body:"Lose 50% and you need 100% to come back. The math of drawdown is brutal, which is why the 2% rule exists. We simulate 100-trade sequences so you feel it before you live it." },
      { t:"Daily loss limits that work", dur:"10:44", type:"article", body:"Set a daily stop: -3% and screens off. No 'one more trade'. The traders who survive are not the ones with the best entries — they are the ones with the best exits from bad days." },
      { t:"Correlated risk: the hidden killer", dur:"12:56", type:"video", body:"Long gold, long silver and short USDJPY is one trade wearing three costumes. Learn to count portfolio heat and cap total open risk at 6%." },
      { t:"Building your risk plan", dur:"11:20", type:"article", body:"One page: risk per trade, max daily loss, max open risk, sessions traded, setups allowed. Sign it. This page is your boss now." }
    ],
    materials:[
      { name:"Risk plan template.pdf", kind:"PDF", size:"640 KB", body:"RISK PLAN (demo)\n\nRisk per trade: 1–2%.\nMax daily loss: 3% → screens off.\nMax open risk: 6%.\nSessions: London + New York.\nSetups allowed: max 2." }
    ] }
];
let courseProg = {};
try{ courseProg = JSON.parse(localStorage.getItem("tc_prog_v1")||"{}"); }catch(e){ courseProg = {}; }
function saveProg(){ try{ localStorage.setItem("tc_prog_v1", JSON.stringify(courseProg)); }catch(e){} }
function courseDoneCount(c){ return c.lessons.filter((_,i)=>courseProg[c.id+":"+i]).length; }
function renderCourses(){
  const list = $("courseList"); if(!list) return;
  list.innerHTML = "";
  COURSES.forEach(c=>{
    const done = courseDoneCount(c), pct = Math.round(done/c.lessons.length*100);
    const edu = TRADERS.find(t=>t.id===c.edu);
    const card = document.createElement("button");
    card.className = "course-card";
    card.innerHTML =
      '<div class="course-thumb" style="--g1:'+c.g[0]+';--g2:'+c.g[1]+'">'+c.emoji+'</div>'+
      '<div class="c-info"><b>'+esc(c.title)+'</b>'+
      '<span class="c-sub">'+esc(c.sub)+' · by '+(edu?esc(edu.name):"")+'</span>'+
      '<div class="prog"><i style="width:'+pct+'%"></i></div>'+
      '<span class="prog-lbl">'+(c.price? '<b class="num" style="color:var(--blue)">$'+c.price+'</b> · private' : '<b style="color:var(--green)">FREE</b>')+' · '+done+'/'+c.lessons.length+' lessons</span></div>';
    card.addEventListener("click", ()=>openCourse(c.id));
    list.appendChild(card);
  });
}
function courseLocked(c){ return c.price>0 && !c.enrolled; }
function openCourse(id){
  const c = COURSES.find(x=>x.id===id); if(!c) return;
  const edu = TRADERS.find(t=>t.id===c.edu);
  const locked = courseLocked(c);
  $("courseViewTitle").textContent = c.title;
  const body = $("courseBody");
  body.innerHTML =
    '<div class="course-thumb" style="--g1:'+c.g[0]+';--g2:'+c.g[1]+';width:96px;height:96px;font-size:40px;margin-bottom:12px">'+c.emoji+'</div>'+
    '<h3 style="margin:0 0 6px">'+esc(c.title)+'</h3>'+
    '<p class="modal-sub" style="text-align:left;margin:0 0 10px">'+esc(c.desc)+'</p>'+
    (edu?'<button class="trader-mini" data-tprof="'+edu.id+'"><span class="avatar sm" style="background:linear-gradient(135deg,'+edu.g[0]+','+edu.g[1]+')">'+edu.ini+'</span><span><b>'+esc(edu.name)+'</b><span class="handle">'+esc(edu.handle)+' · '+fmtK(edu.followers)+' followers</span></span></button>':"")+
    '<div class="sec-head"><h3>Lessons</h3><span class="fine">'+courseDoneCount(c)+'/'+c.lessons.length+' done</span></div>'+
    '<div id="lessonList"></div>'+
    '<div class="sec-head"><h3>Materials</h3><span class="fine">'+(locked?"🔒 join to unlock":"demo files")+'</span></div>'+
    '<div id="matList"></div>'+
    (locked?'<button class="primary-btn" id="joinClassBtn" style="margin-top:12px">Join private class — $'+c.price+'</button>'+
      '<p class="fine" style="text-align:center">One-time entry · recordings + PDFs stay yours · <span class="demo-tag">Demo checkout</span></p>':"");
  const ll = $("lessonList");
  c.lessons.forEach((l,i)=>{
    const done = !!courseProg[c.id+":"+i];
    const row = document.createElement("button");
    row.className = "lesson-row"+(done?" done":"");
    row.innerHTML = '<span class="lesson-n">'+(done?"✓":(locked?"🔒":(i+1)))+'</span>'+
      '<span class="l-info"><b>'+esc(l.t)+'</b><span>'+l.type+' · '+l.dur+'</span></span>';
    row.addEventListener("click", ()=>{
      if(locked){ toast("Join the private class to unlock lessons"); return; }
      openLesson(c, i);
    });
    ll.appendChild(row);
  });
  const ml = $("matList");
  if(locked){
    ml.innerHTML = '<div class="empty">🔒 '+c.materials.length+' files unlock after joining.</div>';
  }else{
    c.materials.forEach(m=>{
      const row = document.createElement("button");
      row.className = "lesson-row";
      row.innerHTML = '<span class="lesson-n">📄</span><span class="l-info"><b>'+esc(m.name)+'</b><span>'+m.kind+' · '+m.size+'</span></span>';
      row.addEventListener("click", ()=>openMaterial(m));
      ml.appendChild(row);
    });
  }
  const jb = $("joinClassBtn");
  if(jb) jb.addEventListener("click", ()=>openPaySheet(c));
  $("courseView").hidden = false;
}
function openLesson(c, i){
  const l = c.lessons[i];
  $("courseViewTitle").textContent = "Lesson "+(i+1);
  const body = $("courseBody");
  const done = !!courseProg[c.id+":"+i];
  body.innerHTML =
    '<button class="ghost-btn sm back-btn" id="lessonBack">‹ Back to course</button>'+
    '<div class="lesson-video"><i>▶</i></div>'+
    '<h3 style="margin:0 0 4px">'+esc(l.t)+'</h3>'+
    '<p class="modal-sub" style="text-align:left;margin:0 0 12px">'+l.type+' · '+l.dur+' · <span class="demo-tag">Demo</span></p>'+
    '<div class="lesson-body"><p>'+esc(l.body)+'</p></div>'+
    '<button class="'+(done?"ghost-btn":"primary-btn")+'" id="lessonDone" style="margin-top:14px">'+(done?"✓ Completed — tap to undo":"Mark as complete")+'</button>';
  $("lessonBack").addEventListener("click", ()=>openCourse(c.id));
  $("lessonDone").addEventListener("click", ()=>{
    if(courseProg[c.id+":"+i]) delete courseProg[c.id+":"+i]; else courseProg[c.id+":"+i] = 1;
    saveProg(); renderCourses(); openLesson(c, i);
  });
}
function openMaterial(m){
  $("courseViewTitle").textContent = m.name;
  $("courseBody").innerHTML =
    '<button class="ghost-btn sm back-btn" id="matBack">‹ Back</button>'+
    '<div class="card"><div class="sec-head"><h3>'+esc(m.name)+'</h3><span class="fine">'+m.kind+' · '+m.size+' · demo</span></div>'+
    '<pre style="white-space:pre-wrap;font:inherit;font-size:13.5px;line-height:1.6;margin:0">'+esc(m.body)+'</pre></div>';
  $("matBack").addEventListener("click", ()=>{ $("courseView").hidden = true; });
}
/* demo checkout for paid classes — real payments need the backend phase */
function openPaySheet(c){
  $("courseViewTitle").textContent = "Join class";
  $("courseBody").innerHTML =
    '<div class="card" style="text-align:center">'+
    '<div class="course-thumb" style="--g1:'+c.g[0]+';--g2:'+c.g[1]+';margin:0 auto 12px">'+c.emoji+'</div>'+
    '<h3 style="margin:0 0 4px">'+esc(c.title)+'</h3>'+
    '<p class="modal-sub">One-time entry · <b class="num">$'+c.price+'</b></p></div>'+
    '<label class="fld-label">Card number<input class="field num" id="payCard" value="4242 4242 4242 4242" inputmode="numeric"></label>'+
    '<div style="display:flex;gap:10px">'+
    '<label class="fld-label" style="flex:1">Expiry<input class="field num" value="12/28"></label>'+
    '<label class="fld-label" style="flex:1">CVC<input class="field num" value="123" inputmode="numeric"></label></div>'+
    '<button class="primary-btn" id="payGo">Pay $'+c.price+'</button>'+
    '<p class="fine" style="text-align:center">Demo checkout — no real charge.<br>The class itself is run by the educator; the app stays free.</p>';
  $("payGo").addEventListener("click", ()=>{
    $("payGo").disabled = true; $("payGo").textContent = "Processing…";
    setTimeout(()=>{
      c.enrolled = true; renderCourses(); openCourse(c.id);
      toast("Welcome to "+c.title+" — recordings unlocked");
    }, 1500);
  });
}


/* --- tiktok-style live hearts --- */
function floatHeart(){
  const layer = $("liveHearts"); if(!layer) return;
  const s = document.createElement("span");
  s.className = "f-heart";
  s.textContent = "♥";
  s.style.left = (8+Math.random()*80)+"%";
  s.style.setProperty("--dx", (Math.random()*90-45)+"px");
  s.style.color = ["#F04452","#F5A623","#2F80FF","#22C55E","#B678F0"][Math.floor(Math.random()*5)];
  s.style.fontSize = (16+Math.random()*16)+"px";
  layer.appendChild(s);
  setTimeout(()=>s.remove(), 2300);
}

/* --- watch-trader-live: viewer sees the host's cam exactly as the host placed it --- */
let watchingHost = null;
function watchTraderLive(tid){
  const t = TRADERS.find(x=>x.id===tid); if(!t) return;
  watchingHost = t;
  goTab("live");
  if(window.restoreFaceCam) restoreFaceCam(); /* same layout the host customized */
  paintWatchMode();
  toast("Watching "+t.handle+" live — demo");
}
function paintWatchMode(){
  const t = watchingHost, bar = $("watchBar");
  const cam = $("faceCam");
  if(!t){
    if(bar) bar.hidden = true;
    if(cam){ cam.classList.remove("viewer"); }
    const tag = $("faceCamTag"); if(tag) tag.hidden = true;
    renderLiveNow();
    return;
  }
  if(bar){
    bar.hidden = false;
    $("watchBarTxt").innerHTML = "👁 Watching <b>"+esc(t.handle)+"</b> live <span class='demo-tag'>Demo</span>";
  }
  if(cam){ cam.classList.add("viewer"); }
  const tag = $("faceCamTag"); if(tag){ tag.hidden = false; tag.textContent = t.handle; }
  renderLiveNow();
}
function stopWatching(){ watchingHost = null; paintWatchMode(); }

/* --- v16: live-now strip (who's live) + all-reels hub in the Live section --- */
function renderLiveNow(){
  const el = $("liveNowStrip"); if(!el) return;
  let html = "";
  if(youLive.active){
    html += '<button class="ln-item you" data-ln="you"><span class="ln-av" style="--g1:#2F80FF;--g2:#1B5FD6">AT</span><span class="ln-live">LIVE</span><span class="ln-name">You</span></button>';
  }
  TRADERS.filter(t=>!t.you && t.live).forEach(t=>{
    const watching = watchingHost && watchingHost.id===t.id;
    html += '<button class="ln-item'+(watching?' watching':'')+'" data-ln="'+t.id+'"><span class="ln-av" style="--g1:'+t.g[0]+';--g2:'+t.g[1]+'">'+t.ini+'</span><span class="ln-live">LIVE</span><span class="ln-name">'+esc(t.name.split(" ")[0])+'</span></button>';
  });
  if(!html) html = '<span class="ln-empty">No one is live right now — be the first.</span>';
  el.innerHTML = html;
  el.querySelectorAll(".ln-item").forEach(b=>b.addEventListener("click", ()=>{
    const id = b.dataset.ln;
    if(id==="you"){ goTab("live"); return; }
    if(watchingHost && watchingHost.id===id) stopWatching(); else watchTraderLive(id);
  }));
}
function allReels(){
  const out = [];
  TRADERS.forEach(t=>{ (t.reels||[]).forEach(r=>out.push({ t, r })); });
  return out.sort((a,b)=>(b.r.likes||0)-(a.r.likes||0));
}
function renderReelsHub(){
  const g = $("reelsHubGrid"); if(!g) return;
  const items = allReels().filter(({r})=>r.visibility!=="private");
  const c = $("reelsHubCount"); if(c) c.textContent = items.length + " reels";
  g.innerHTML = items.map(({t,r})=>
    '<button class="reel-tile" data-reel="'+r.id+'" data-tid="'+t.id+'" style="--g1:'+t.g[0]+';--g2:'+t.g[1]+'">'+
    '<span class="rt-play"><i>▶</i></span>'+
    '<span class="rt-handle">'+esc(t.handle)+'</span>'+
    '<span class="rt-meta"><b>'+esc(r.title)+'</b><span>▶ '+esc(r.views||"0")+'</span></span></button>').join("");
  g.querySelectorAll(".reel-tile").forEach(tile=>tile.addEventListener("click", ()=>{
    const t = TRADERS.find(x=>x.id===tile.dataset.tid); if(!t) return;
    const r = (t.reels||[]).find(x=>x.id===tile.dataset.reel); if(!r) return;
    openReel(t, r);
  }));
}

/* --- quick one-tap buy/sell on the chart (uses ticket lots + type) --- */
function quickTrade(dir){
  state.dir = dir; syncDir(); execute();
}

/* --- post a trading idea straight from the chart --- */
let ideaDir = "BUY";
function openIdeaSheet(){
  const pr = px(state.sym);
  ideaDir = "BUY";
  $("ideaDirSeg").querySelectorAll(".seg-btn").forEach(b=>b.classList.toggle("active", b.dataset.dir==="BUY"));
  $("ideaMeta").innerHTML = '<b>'+esc(state.sym)+'</b><span>'+esc(state.tf)+' · ref <b class="num">'+fmtP(state.sym, pr.bid)+'</b></span><span class="demo-tag">Demo</span>';
  $("ideaBody").value = "";
  $("ideaWin").value = ""; $("ideaN").value = "";
  $("btOut").textContent = "No backtest yet";
  $("ideaSheet").hidden = false; $("ideaBackdrop").hidden = false;
}
function closeIdeaSheet(){ $("ideaSheet").hidden = true; $("ideaBackdrop").hidden = true; }
function runQuickBacktest(){
  /* simulated EMA 9/21 cross backtest over generated candles — honest demo numbers */
  const seed = state.sym.split("").reduce((a,c)=>a+c.charCodeAt(0),0) + state.tf.length*13;
  const rnd = mulberry32(seed*97+5);
  const closes = []; let p = 100;
  for(let i=0;i<300;i++){ p += (rnd()-0.485)*2.2; closes.push(p); }
  const ema = (arr,per)=>{ const k = 2/(per+1); let e = arr[0]; return arr.map(v=>{ e = v*k+e*(1-k); return e; }); };
  const fast = ema(closes,9), slow = ema(closes,21);
  let wins = 0, n = 0;
  for(let i=22;i<closes.length-5;i++){
    const up = fast[i-1]<=slow[i-1] && fast[i]>slow[i];
    const dn = fast[i-1]>=slow[i-1] && fast[i]<slow[i];
    if(up||dn){ n++; const win = up ? closes[i+5]>closes[i] : closes[i+5]<closes[i]; if(win) wins++; }
  }
  const wr = n ? Math.round(wins/n*100) : 0;
  $("ideaWin").value = wr; $("ideaN").value = n;
  $("btOut").textContent = "EMA 9/21 cross · "+n+" signals · "+wr+"% win — simulated, not real data";
  toast("Backtest complete — simulated");
}
function publishIdea(){
  const body = $("ideaBody").value.trim();
  if(!body){ toast("Write your strategy first"); return; }
  const pr = px(state.sym);
  const win = parseInt($("ideaWin").value, 10), n = parseInt($("ideaN").value, 10);
  MOCK_POSTS.unshift({ id:"p"+Date.now(), tid:"you", time:"now", likes:0, liked:false, body,
    comments:[], idea:{ sym:state.sym, tf:state.tf, dir:ideaDir, price:pr.bid,
      win:isNaN(win)?0:win, n:isNaN(n)?0:n } });
  /* your post also lands on your profile */
  const you = TRADERS.find(t=>t.id==="you");
  if(you) you.posts.unshift({ id:"p"+Date.now(), tid:"you", time:"now", likes:0, liked:false, body,
    comments:[], sym:state.sym, dir:ideaDir, pl:0, seed:Math.floor(Math.random()*999),
    idea:{ sym:state.sym, tf:state.tf, dir:ideaDir, price:pr.bid, win:isNaN(win)?0:win, n:isNaN(n)?0:n } });
  renderPosts(); renderProfPosts(); renderHomeIdeas(); closeIdeaSheet();
  toast("Idea published to the community — demo");
}

/* --- own profile tabs --- */
function renderProfPosts(){
  const el = $("profPosts"); if(!el) return;
  const you = TRADERS.find(t=>t.id==="you");
  const mine = MOCK_POSTS.filter(p=>p.tid==="you");
  el.innerHTML = "";
  if(!mine.length){ el.innerHTML = '<div class="empty">No posts yet — share your first idea from the Trade tab.</div>'; return; }
  mine.forEach(p=>el.appendChild(postCard(p)));
  injectIcons();
}
function renderProfReels(){
  const el = $("profReels"); if(!el) return;
  const you = TRADERS.find(t=>t.id==="you");
  el.innerHTML = '<button class="ghost-btn wide new-reel-btn" id="newReelBtn"><span class="ic xs" data-icon="plus"></span> Upload reel</button><div id="profReelGrid"></div>';
  const g = $("profReelGrid");
  if(!you.reels.length){ g.innerHTML = '<div class="empty">No reels yet.</div>'; }
  else{
    g.innerHTML = '<div class="reel-grid">'+you.reels.map(r=>
      '<button class="reel-tile" data-reel="'+r.id+'" style="--g1:'+you.g[0]+';--g2:'+you.g[1]+'">'+
      (r.visibility==="private"?'<span class="rt-priv">Private</span>':"")+
      '<span class="rt-play"><i>▶</i></span><span class="rt-meta"><b>'+esc(r.title)+'</b><span>▶ '+esc(r.views)+'</span></span></button>').join("")+'</div>';
    g.querySelectorAll(".reel-tile").forEach(tile=>tile.addEventListener("click", ()=>{
      const r = you.reels.find(x=>x.id===tile.dataset.reel); openReel(you, r);
    }));
  }
  $("newReelBtn").addEventListener("click", triggerReelUpload);
  injectIcons();
}

/* --- reel upload from profile (device video file; demo, stays local) --- */
let pendingReelFile = null, pendingReelVis = "public";
function triggerReelUpload(){
  const inp = $("reelFileInput"); if(!inp) return;
  inp.value = "";
  inp.click();
}
function cleanFileName(n){
  return (n||"").replace(/\.[a-z0-9]+$/i,"").replace(/[_-]+/g," ").trim().slice(0,80) || "My new reel";
}
function parseTags(s){
  return (s||"").split(/[\s,]+/).map(t=>t.trim()).filter(Boolean)
    .map(t=>t[0]==="#"?t:"#"+t).filter((t,i,a)=>a.indexOf(t)===i).slice(0,12);
}
$("reelVisSeg").querySelectorAll(".seg-btn").forEach(b=>b.addEventListener("click", ()=>{
  $("reelVisSeg").querySelectorAll(".seg-btn").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  pendingReelVis = b.dataset.vis;
}));
$("reelFileInput").addEventListener("change", ()=>{
  const f = $("reelFileInput").files && $("reelFileInput").files[0];
  if(!f) return;
  pendingReelFile = f;
  pendingReelVis = "public";
  $("reelVisSeg").querySelectorAll(".seg-btn").forEach(x=>x.classList.toggle("active", x.dataset.vis==="public"));
  $("reelTitleInput").value = cleanFileName(f.name);
  $("reelDescInput").value = "";
  $("reelTagsInput").value = "";
  const pv = $("reelUploadPreview");
  pv.src = URL.createObjectURL(f); pv.muted = true; pv.play().catch(()=>{});
  $("reelTitleModal").hidden = false;
});
function hideReelUpload(){
  $("reelTitleModal").hidden = true; pendingReelFile = null;
  const pv = $("reelUploadPreview"); if(pv){ pv.pause(); pv.removeAttribute("src"); }
}
$("reelTitleBg").addEventListener("click", hideReelUpload);
$("reelTitleCancel").addEventListener("click", hideReelUpload);
$("reelTitleSave").addEventListener("click", ()=>{
  if(!pendingReelFile) return;
  const title = ($("reelTitleInput").value || "").trim().slice(0,80) || cleanFileName(pendingReelFile.name);
  const desc = ($("reelDescInput").value || "").trim().slice(0,300);
  const tags = parseTags($("reelTagsInput").value);
  const you = TRADERS.find(t=>t.id==="you");
  you.reels.unshift({ id:"you-r"+Date.now(), title, desc, tags, visibility:pendingReelVis,
    views:"0", likes:0, liked:false, seed:Math.floor(Math.random()*999),
    videoUrl:URL.createObjectURL(pendingReelFile) });
  pendingReelFile = null;
  const pv = $("reelUploadPreview"); pv.pause(); pv.removeAttribute("src");
  $("reelTitleModal").hidden = true;
  renderProfReels(); renderReelsHub();
  toast("Reel uploaded — demo");
});
function renderProfTrades(){
  /* history + brokers already render via existing renderBrokers()/history; ensure equity */
  const el = $("profTrades"); if(!el) return;
  if(!$("profEq")){
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = '<div class="sec-head" style="margin-bottom:8px"><h3>Your equity</h3><span class="fine">Demo</span></div><canvas class="eq-canvas" id="profEq" width="640" height="240"></canvas>';
    el.prepend(card);
  }
  const you = TRADERS.find(t=>t.id==="you");
  drawEquity($("profEq"), you.monthly);
}

/* --- boot wiring for v15 --- */
function bootV15(){
  /* copy modal */
  $("copyModalX").addEventListener("click", closeCopyModal);
  $("copyModalBg").addEventListener("click", closeCopyModal);
  $("copyCancel").addEventListener("click", closeCopyModal);
  $("copyAccept").addEventListener("click", startCopy);
  $("copyLotMinus").addEventListener("click", ()=>setCopyLots(copyLotSel-0.01));
  $("copyLotPlus").addEventListener("click", ()=>setCopyLots(copyLotSel+0.01));
  paintCopyUI(); renderCopyStatus();
  /* accounts */
  $("acctSwitch").addEventListener("click", openAcctSheet);
  $("profAcctBtn").addEventListener("click", openAcctSheet);
  $("acctSheetX").addEventListener("click", closeAcctSheet);
  $("acctBackdrop").addEventListener("click", closeAcctSheet);
  $("acctAdd").addEventListener("click", ()=>{ closeAcctSheet(); openAcctModal(); });
  $("acctModalX").addEventListener("click", closeAcctModal);
  $("acctModalBg").addEventListener("click", closeAcctModal);
  $("amTypeSeg").addEventListener("click", e=>{
    const b = e.target.closest("[data-atype]"); if(!b) return;
    amType = b.dataset.atype;
    $("amTypeSeg").querySelectorAll(".seg-btn").forEach(x=>x.classList.toggle("active", x===b));
    $("amLiveWarn").hidden = (amType!=="live");
  });
  $("amGo").addEventListener("click", ()=>{
    const login = $("amLogin").value.trim();
    if(!login){ toast("Enter the account login number"); return; }
    const broker = $("amBroker").value || "Exness";
    const b = BROKERS.find(x=>x.name===broker) || BROKERS[0];
    ACCOUNTS.push({ id:"a"+Date.now(), broker, type:amType, login,
      server:$("amServer").value.trim()||b.server,
      balance: amType==="live"?1000:10000, open:[], pending:[], history:[] });
    closeAcctModal(); renderAcctSheet();
    switchAccount(ACCOUNTS[ACCOUNTS.length-1].id);
  });
  renderAcctUI();
  /* KYC */
  $("kycRow").addEventListener("click", openKyc);
  /* profile settings rows */
  $("setThemeRow").addEventListener("click", ()=>setTheme(theme()==="dark"?"light":"dark"));
  $("setAlertsRow").addEventListener("click", ()=>{ goTab("trade"); setTimeout(()=>{ $("alertsCard").scrollIntoView({behavior:"smooth", block:"center"}); }, 60); });
  $("kycBack").addEventListener("click", closeKyc);
  renderKyc();
  /* courses */
  $("courseBack").addEventListener("click", ()=>{ $("courseView").hidden = true; });
  renderCourses();
  /* reels */
  $("reelClose").addEventListener("click", closeReel);
  /* hearts */
  $("heartBtn").addEventListener("click", ()=>{ floatHeart(); setTimeout(floatHeart, 120); });
  /* watch mode */
  $("watchLeave").addEventListener("click", stopWatching);
  /* cam: viewers can't move the host's camera */
  const cam = $("faceCam");
  cam.addEventListener("pointerdown", e=>{ if(cam.classList.contains("viewer")) e.stopImmediatePropagation(); }, true);
  /* quick trade */
  $("qtBuy").addEventListener("click", ()=>quickTrade("buy"));
  $("qtSell").addEventListener("click", ()=>quickTrade("sell"));
  /* idea sheet */
  $("shareIdeaBtn").addEventListener("click", openIdeaSheet);
  $("ideaX").addEventListener("click", closeIdeaSheet);
  $("ideaBackdrop").addEventListener("click", closeIdeaSheet);
  $("ideaDirSeg").addEventListener("click", e=>{
    const b = e.target.closest("[data-dir]"); if(!b) return;
    ideaDir = b.dataset.dir;
    $("ideaDirSeg").querySelectorAll(".seg-btn").forEach(x=>x.classList.toggle("active", x===b));
  });
  $("btRun").addEventListener("click", runQuickBacktest);
  $("ideaPublish").addEventListener("click", publishIdea);
  /* own profile tabs */
  $("profTabs").addEventListener("click", e=>{
    const b = e.target.closest("[data-ptab]"); if(!b) return;
    $("profTabs").querySelectorAll(".ptab").forEach(x=>x.classList.toggle("active", x===b));
    const k = b.dataset.ptab;
    $("profPosts").hidden = (k!=="posts");
    $("profReels").hidden = (k!=="reels");
    $("profTrades").hidden = (k!=="trades");
    if(k==="reels") renderProfReels();
    if(k==="trades"){ renderProfTrades(); renderBrokers(); renderHistory($("profHistory")); }
  });
  renderProfPosts();
  /* stop watching when going live yourself */
  const gl = $("goLiveBtn");
  if(gl) gl.addEventListener("click", ()=>setTimeout(stopWatching, 50));
}

/* ================= v19 REWORK: unified Home, discover search, edit profile ================= */

/* ---------------- HOME FEED ---------------- */
function renderHome(){
  const h = new Date().getHours();
  const greet = h<5 ? "Up late" : h<12 ? "Good morning" : h<17 ? "Good afternoon" : "Good evening";
  const you = TRADERS.find(t=>t.you);
  $("homeHello").textContent = greet + (you ? ", " + you.name.split(" ")[0] : "");
  renderHomeLive(); renderHomeReels(); renderHomeIdeas(); renderHomeTraders();
}
function renderHomeLive(){
  const el = $("homeLiveStrip"); if(!el) return;
  let html = "";
  if(youLive.active){
    html += '<button class="ln-item you" data-ln="you"><span class="ln-av" style="--g1:#2F80FF;--g2:#1B5FD6">'+esc((TRADERS.find(t=>t.you)||{ini:"AT"}).ini)+'</span><span class="ln-live">LIVE</span><span class="ln-name">You</span></button>';
  }
  TRADERS.filter(t=>!t.you && t.live).forEach(t=>{
    const watching = watchingHost && watchingHost.id===t.id;
    html += '<button class="ln-item'+(watching?' watching':'')+'" data-ln="'+t.id+'"><span class="ln-av" style="--g1:'+t.g[0]+';--g2:'+t.g[1]+'">'+t.ini+'</span><span class="ln-live">LIVE</span><span class="ln-name">'+esc(t.name.split(" ")[0])+'</span></button>';
  });
  if(!html) html = '<span class="ln-empty">No one is live right now — be the first.</span>';
  el.innerHTML = html;
  el.querySelectorAll(".ln-item").forEach(b=>b.addEventListener("click", ()=>{
    const id = b.dataset.ln;
    if(id==="you"){ goTab("live"); return; }
    if(watchingHost && watchingHost.id===id) stopWatching(); else watchTraderLive(id);
  }));
}
function renderHomeReels(){
  const row = $("homeReelsRow"); if(!row) return;
  const items = allReels().filter(({r})=>r.visibility!=="private").slice(0,8);
  if(!items.length){ row.innerHTML = '<span class="ln-empty">No reels yet — upload the first.</span>'; return; }
  row.innerHTML = items.map(({t,r})=>
    '<button class="reel-tile" data-reel="'+r.id+'" data-tid="'+t.id+'" style="--g1:'+t.g[0]+';--g2:'+t.g[1]+'">'+
    '<span class="rt-play"><i>▶</i></span>'+
    '<span class="rt-handle">'+esc(t.handle)+'</span>'+
    '<span class="rt-meta"><b>'+esc(r.title)+'</b><span>▶ '+esc(r.views||"0")+'</span></span></button>').join("");
  row.querySelectorAll(".reel-tile").forEach(tile=>tile.addEventListener("click", ()=>{
    const t = TRADERS.find(x=>x.id===tile.dataset.tid); if(!t) return;
    const r = (t.reels||[]).find(x=>x.id===tile.dataset.reel); if(!r) return;
    openReel(t, r);
  }));
}
function renderHomeIdeas(){
  const el = $("homeIdeas"); if(!el) return;
  const ideas = MOCK_POSTS.filter(p=>p.idea).slice(0,4);
  if(!ideas.length){ el.innerHTML = '<div class="empty">No ideas yet — post one from the chart.</div>'; return; }
  el.innerHTML = "";
  ideas.forEach(p=>{
    const t = traderOf(p), d = p.idea;
    const c = document.createElement("article");
    c.className = "idea-card";
    c.innerHTML =
      '<div class="idea-top"><span class="avatar sm" style="background:linear-gradient(135deg,'+t.g[0]+','+t.g[1]+')">'+t.ini+'</span>'+
      '<div class="idea-who"><b>'+esc(t.name)+'</b><span>'+esc(t.handle)+' · '+esc(p.time)+'</span></div>'+
      '<span class="idea-dir '+(d.dir==="BUY"?"buy":"sell")+'">'+esc(d.dir)+'</span></div>'+
      '<p class="idea-body">'+esc(p.body)+'</p>'+
      '<div class="idea-foot"><span><b class="num">'+esc(d.sym)+'</b> · '+esc(d.tf)+'</span>'+
      (d.n?'<span>Backtest <b class="num">'+d.win+'%</b> / '+d.n+'</span>':'')+
      '<button class="idea-like'+(p.liked?" liked":"")+'" data-like="'+p.id+'" aria-pressed="'+p.liked+'">♥ <b class="num">'+p.likes+'</b></button></div>';
    el.appendChild(c);
  });
}
function renderHomeTraders(){
  const el = $("homeTraders"); if(!el) return;
  const top = TRADERS.filter(t=>!t.you).slice().sort((a,b)=>b.followers-a.followers).slice(0,6);
  el.innerHTML = top.map(t=>
    '<button class="ht-card" data-tprof="'+t.id+'">'+
    '<span class="avatar" style="background:linear-gradient(135deg,'+t.g[0]+','+t.g[1]+')">'+t.ini+
    (t.live?'<span class="trader-live">LIVE</span>':'')+'</span>'+
    '<b>'+esc(t.name)+'</b><span class="handle">'+esc(t.handle)+'</span>'+
    '<span class="tstat">'+fmtK(t.followers)+' followers · '+t.win+'% win</span></button>').join("");
}
/* home quick actions + see-all links */
$("homePostIdea").addEventListener("click", openIdeaSheet);
$("homeUploadReel").addEventListener("click", triggerReelUpload);
$("homeGoLive").addEventListener("click", ()=>{ goTab("live"); setTimeout(()=>$("goLiveBtn").click(), 80); });
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click", ()=>goTab(b.dataset.goto)));
/* keep the home live strip fresh whenever the live strip re-renders */
const _renderLiveNow = renderLiveNow;
renderLiveNow = function(){ _renderLiveNow(); renderHomeLive(); };

/* ---------------- TRADERS DISCOVER SEARCH ---------------- */
$("traderSearch").addEventListener("input", ()=>renderTraders());
const _renderTraders = renderTraders;
renderTraders = function(){
  const q = ($("traderSearch") && $("traderSearch").value || "").trim().toLowerCase();
  if(!q){ _renderTraders(); return; }
  const list = $("traderList"); list.innerHTML = "";
  const rows = TRADERS.slice().sort((a,b)=>lbValue(b)-lbValue(a))
    .filter(t=>t.name.toLowerCase().includes(q) || t.handle.toLowerCase().includes(q));
  if(!rows.length){ list.innerHTML = '<div class="empty">No traders match "'+esc(q)+'".</div>'; return; }
  rows.forEach((t,i)=>{
    const c = document.createElement("div");
    c.className = "trader-card lb-row";
    c.dataset.tprof = t.id;
    c.innerHTML =
      rankBadge(i)+
      '<div class="avatar" style="background:linear-gradient(135deg,'+t.g[0]+','+t.g[1]+')">'+t.ini+
      (t.live ? '<span class="trader-live">LIVE</span>' : '') + '</div>'+
      '<div class="lb-info" data-tprof="'+t.id+'"><b>'+esc(t.name)+' <span class="handle">'+esc(t.handle)+'</span></b>'+
      '<span class="tstat">'+fmtK(t.followers)+' followers · '+t.win+'% win</span></div>'+
      '<div class="lb-stat">'+lbStat(t)+'</div>'+
      '<button class="follow-btn'+(t.following?" following":"")+'" data-follow="'+t.id+'">'+(t.following?"Following":"Follow")+'</button>';
    list.appendChild(c);
  });
};

/* ---------------- EDIT PROFILE (Instagram-style) ---------------- */
let epPhotoURL = null;
function epInitials(nm){ return (nm||"A").trim().split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase(); }
function renderEpPrev(){
  const el = $("epAvatarPrev");
  el.innerHTML = epPhotoURL ? '<img src="'+epPhotoURL+'" alt="Profile photo">' : esc(epInitials($("epName").value));
}
function openEditProfile(){
  const you = TRADERS.find(t=>t.you); if(!you) return;
  $("epName").value = you.name || "";
  $("epHandle").value = you.handle || "";
  $("epBio").value = you.bio || "";
  epPhotoURL = you.photo || null;
  renderEpPrev();
  $("editProfileModal").hidden = false;
  injectIcons();
}
function closeEditProfile(){ $("editProfileModal").hidden = true; }
function saveEditProfile(){
  const you = TRADERS.find(t=>t.you); if(!you) return;
  const name = $("epName").value.trim() || "Alex Trader";
  let handle = $("epHandle").value.trim() || "@alextrader";
  if(handle[0] !== "@") handle = "@" + handle;
  const bio = $("epBio").value.trim();
  you.name = name; you.handle = handle; you.bio = bio;
  you.ini = epInitials(name); you.photo = epPhotoURL;
  $("profName").textContent = name;
  $("profHandle").textContent = handle;
  $("profBio").textContent = bio || "—";
  const av = epPhotoURL ? '<img src="'+epPhotoURL+'" alt="">' : esc(you.ini);
  $("profAvatar").innerHTML = av;
  $("avatarBtn").innerHTML = av;
  $("sideAvatar").innerHTML = av;
  $("sideName").textContent = name;
  renderYouCard(); renderHome(); renderTraders();
  closeEditProfile();
  toast("Profile updated — demo");
}
$("editProfileBtn").addEventListener("click", openEditProfile);
$("profAvatarBtn").addEventListener("click", openEditProfile);
$("editProfileX").addEventListener("click", closeEditProfile);
$("editProfileBg").addEventListener("click", closeEditProfile);
$("epCancel").addEventListener("click", closeEditProfile);
$("epSave").addEventListener("click", saveEditProfile);
$("epName").addEventListener("input", renderEpPrev);
$("epPhotoBtn").addEventListener("click", ()=>$("epPhotoInput").click());
$("epPhotoInput").addEventListener("change", e=>{
  const f = e.target.files && e.target.files[0]; if(!f) return;
  if(epPhotoURL && epPhotoURL.indexOf("blob:")===0) URL.revokeObjectURL(epPhotoURL);
  epPhotoURL = URL.createObjectURL(f);
  renderEpPrev();
});

/* ---------------- INIT — straight into the terminal, no login ---------------- */
function bootApp(){
injectIcons();
renderWatchlist();
renderAlerts();
renderPoll();
renderPosts();
renderTraders();
renderYouCard();
renderBrokers();
renderPositions();
renderDepth(true);
renderTape(true);
setSymbol("XAUUSD");
setTheme((()=>{ try{ return localStorage.getItem("tc_theme_v1")==="light" ? "light" : "dark"; }catch(e){ return "dark"; } })());
renderTicketTick();
renderAccount();
renderLiveNow();
renderReelsHub();
renderHome();
try{ bootV15(); }catch(err){ console.error("[v15] boot failed:", err); }
setInterval(tick, 700); /* engine starts BEFORE the chart: a chart failure must never stall the app */
/* self-hosted candle chart — fully isolated: deferred sizing + internal try/catch */
try{ buildMainChart(); }catch(err){ console.error("[chart] buildMainChart threw:", err); }
}

/* ---- TEMPORARY demo password gate (Dawood 2026-09-26): 223219 ----
   Client-side only — keeps casual visitors out of the demo. Not real security. */
(function(){
  var PASS = "223219", KEY = "tc_demo_pass_v1", booted = false;
  function start(){ if(booted) return; booted = true; bootApp(); }
  function unlocked(){ try{ return sessionStorage.getItem(KEY) === PASS; }catch(e){ return false; } }
  var lock = document.getElementById("tcLock");
  if(unlocked()){ if(lock) lock.hidden = true; start(); return; }
  if(lock) lock.hidden = false;
  function go(){
    var v = (document.getElementById("tcPass").value || "").trim();
    if(v === PASS){
      try{ sessionStorage.setItem(KEY, PASS); }catch(e){}
      if(lock) lock.hidden = true;
      start();
    }else{
      var er = document.getElementById("tcPassErr");
      if(er) er.hidden = false;
      var inp = document.getElementById("tcPass");
      if(inp){ inp.value = ""; inp.focus(); }
    }
  }
  document.getElementById("tcPassGo").addEventListener("click", go);
  document.getElementById("tcPass").addEventListener("keydown", function(e){ if(e.key === "Enter") go(); });
  setTimeout(function(){ var inp = document.getElementById("tcPass"); if(inp) inp.focus(); }, 300);
})();

})();

/* ================= INDICATORS (real-time, computed on chart candles) =================
   The mostly-used set with industry-standard defaults. Overlay indicators draw on
   the price chart; oscillators get their own synced panes below it. Values are real
   whenever the chart holds real candles (gold + crypto via CoinGecko). */
const IND_DEFS = [
  { id:"emaFast", name:"EMA",        color:"#2F80FF", params:[["p1","Period"]],      def:{on:true,  p1:9} },
  { id:"emaSlow", name:"EMA",        color:"#F59E0B", params:[["p1","Period"]],      def:{on:true,  p1:21} },
  { id:"sma50",   name:"SMA",        color:"#94A3B8", params:[["p1","Period"]],      def:{on:false, p1:50} },
  { id:"sma200",  name:"SMA",        color:"#A855F7", params:[["p1","Period"]],      def:{on:false, p1:200} },
  { id:"bb",      name:"Bollinger",  color:"#22C55E", params:[["p1","Length"],["p2","Mult"]], def:{on:false, p1:20, p2:2} },
  { id:"rsi",     name:"RSI",        color:"#A855F7", params:[["p1","Period"]],      def:{on:true,  p1:14}, pane:true },
  { id:"macd",    name:"MACD",       color:"#2F80FF", params:[["p1","Fast"],["p2","Slow"],["p3","Signal"]], def:{on:true, p1:12, p2:26, p3:9}, pane:true },
  { id:"stoch",   name:"Stochastic", color:"#F59E0B", params:[["p1","%K"],["p2","%K smooth"],["p3","%D"]], def:{on:false, p1:14, p2:3, p3:3}, pane:true },
  { id:"atr",     name:"ATR",        color:"#EF4444", params:[["p1","Period"]],      def:{on:false, p1:14}, pane:true }
];
const IND_KEY = "tc_inds_v1";
function loadIndCfg(){
  let saved = {};
  try{ saved = JSON.parse(localStorage.getItem(IND_KEY) || "{}"); }catch(e){}
  const cfg = {};
  IND_DEFS.forEach(d=>{ cfg[d.id] = Object.assign({}, d.def, saved[d.id] || {}); });
  return cfg;
}
let indCfg = loadIndCfg();
function saveIndCfg(){ try{ localStorage.setItem(IND_KEY, JSON.stringify(indCfg)); }catch(e){} }

/* --- math (standard definitions) --- */
function indSMA(vals, p){
  const out = new Array(vals.length).fill(null); let sum = 0;
  for(let i=0;i<vals.length;i++){ sum += vals[i];
    if(i >= p) sum -= vals[i-p];
    if(i >= p-1) out[i] = sum/p; }
  return out;
}
function indEMA(vals, p){
  const out = new Array(vals.length).fill(null), k = 2/(p+1);
  let e = null;
  for(let i=0;i<vals.length;i++){ e = e === null ? vals[i] : vals[i]*k + e*(1-k);
    if(i >= p-1) out[i] = e; }
  return out;
}
function indRSI(closes, p){
  const out = new Array(closes.length).fill(null);
  if(closes.length <= p) return out;
  let g = 0, l = 0;
  for(let i=1;i<=p;i++){ const d = closes[i]-closes[i-1]; if(d>0) g+=d; else l-=d; }
  g/=p; l/=p;
  out[p] = l === 0 ? 100 : 100 - 100/(1+g/l);
  for(let i=p+1;i<closes.length;i++){
    const d = closes[i]-closes[i-1];
    g = (g*(p-1) + Math.max(d,0))/p; l = (l*(p-1) + Math.max(-d,0))/p;
    out[i] = l === 0 ? 100 : 100 - 100/(1+g/l);
  }
  return out;
}
function indMACD(closes, fast, slow, sig){
  const ef = indEMA(closes, fast), es = indEMA(closes, slow);
  const line = closes.map((_,i)=> (ef[i]===null||es[i]===null) ? null : ef[i]-es[i]);
  const lineVals = [], lineIdx = [];
  line.forEach((v,i)=>{ if(v!==null){ lineVals.push(v); lineIdx.push(i); } });
  const sigRaw = indEMA(lineVals, sig);
  const signal = new Array(closes.length).fill(null);
  sigRaw.forEach((v,j)=>{ if(v!==null) signal[lineIdx[j]] = v; });
  const hist = closes.map((_,i)=> (line[i]===null||signal[i]===null) ? null : line[i]-signal[i]);
  return { line, signal, hist };
}
function indBB(closes, p, mult){
  const mid = indSMA(closes, p), up = new Array(closes.length).fill(null), lo = new Array(closes.length).fill(null);
  for(let i=p-1;i<closes.length;i++){
    let m = 0; for(let j=i-p+1;j<=i;j++) m += closes[j]; m/=p;
    let v = 0; for(let j=i-p+1;j<=i;j++) v += (closes[j]-m)*(closes[j]-m); v/=p;
    const sd = Math.sqrt(v);
    up[i] = mid[i] + mult*sd; lo[i] = mid[i] - mult*sd;
  }
  return { mid, up, lo };
}
function indStoch(bars, k, ks, d){
  const hk = new Array(bars.length).fill(null);
  for(let i=k-1;i<bars.length;i++){
    let h=-Infinity, l=Infinity;
    for(let j=i-k+1;j<=i;j++){ if(bars[j].high>h)h=bars[j].high; if(bars[j].low<l)l=bars[j].low; }
    hk[i] = h === l ? 50 : 100*(bars[i].close-l)/(h-l);
  }
  const kVals=[], kIdx=[];
  hk.forEach((v,i)=>{ if(v!==null){ kVals.push(v); kIdx.push(i); } });
  const dRaw = indSMA(kVals, ks), pctK = new Array(bars.length).fill(null), pctD = new Array(bars.length).fill(null);
  dRaw.forEach((v,j)=>{ if(v!==null) pctK[kIdx[j]] = v; });
  const k2=[], k2i=[];
  pctK.forEach((v,i)=>{ if(v!==null){ k2.push(v); k2i.push(i); } });
  indSMA(k2, d).forEach((v,j)=>{ if(v!==null) pctD[k2i[j]] = v; });
  return { k:pctK, d:pctD };
}
function indATR(bars, p){
  const out = new Array(bars.length).fill(null);
  if(bars.length <= p) return out;
  const trs = [];
  for(let i=1;i<bars.length;i++){
    const h=bars[i].high, l=bars[i].low, pc=bars[i-1].close;
    trs.push(Math.max(h-l, Math.abs(h-pc), Math.abs(l-pc)));
  }
  let a = trs.slice(0,p).reduce((x,y)=>x+y,0)/p;
  out[p] = a;
  for(let i=p+1;i<bars.length;i++) a = out[i] = (a*(p-1)+trs[i-1])/p;
  return out;
}
function seriesData(bars, vals){
  const d = [];
  for(let i=0;i<bars.length;i++) if(vals[i] !== null && isFinite(vals[i])) d.push({ time:bars[i].time, value:+vals[i].toFixed(6) });
  return d;
}
function levelLine(bars, v){
  return bars.map(b=>({ time:b.time, value:v }));
}

/* ---- indicator rendering: overlays on price chart, oscillators in synced panes ---- */
let indOverlaySeries = [];
const indPanes = {};
let indSyncBound = false, lastIndBars = -1;
function clearIndOverlays(){
  if(!lw.chart) return;
  indOverlaySeries.forEach(s=>{ try{ lw.chart.removeSeries(s); }catch(e){} });
  indOverlaySeries = [];
}
function indSubLabel(def){
  const c = indCfg[def.id];
  if(def.id === "macd") return "("+c.p1+","+c.p2+","+c.p3+")";
  if(def.id === "bb") return "("+c.p1+","+c.p2+")";
  if(def.id === "stoch") return "("+c.p1+","+c.p2+","+c.p3+")";
  return "("+c.p1+")";
}
function ensureIndPane(def){
  if(indPanes[def.id]) return indPanes[def.id];
  const host = $("indPanes"); if(!host || !LW()) return null;
  const wrap = document.createElement("div");
  wrap.className = "ind-pane";
  wrap.innerHTML = '<div class="ind-pane-head"><b>'+def.name+'</b><span class="ind-pane-sub">'+indSubLabel(def)+'</span><span class="ind-val num"></span></div><div class="ind-host"></div>';
  host.appendChild(wrap);
  const el = wrap.querySelector(".ind-host");
  const chart = LW().createChart(el, Object.assign({ width:el.clientWidth || 300, height:104 }, lwTheme(), {
    timeScale:{ borderVisible:false }, rightPriceScale:{ borderVisible:false }
  }));
  const P = { wrap, chart, series:{}, valEl:wrap.querySelector(".ind-val") };
  indPanes[def.id] = P;
  new ResizeObserver(()=>{ const w = el.clientWidth; if(w) chart.resize(w, 104); }).observe(el);
  return P;
}
function dropIndPane(id){
  const P = indPanes[id]; if(!P) return;
  try{ P.chart.remove(); }catch(e){}
  if(P.wrap.parentNode) P.wrap.parentNode.removeChild(P.wrap);
  delete indPanes[id];
}
/* Compute all indicator datasets (cheap: 240 bars). Rendering reuses series and
   only pushes the newest point per tick; a full rebuild happens on symbol/TF/
   settings change or when a new bar opens. */
let indSig = "", indBuilt = null;
function computeIndData(){
  const bars = lw.bars, closes = bars.map(b=>b.close), L = LW();
  const overlays = [], panes = {};
  IND_DEFS.forEach(def=>{
    const c = indCfg[def.id];
    if(!c.on) return;
    const p1 = Math.max(2, +c.p1 || def.def.p1);
    if(!def.pane){
      if(def.id === "bb"){
        const r = indBB(closes, p1, Math.max(0.5, +c.p2 || 2));
        overlays.push({ color:"rgba(34,197,94,0.55)", width:1, data:seriesData(bars, r.up) });
        overlays.push({ color:def.color, width:1, data:seriesData(bars, r.mid) });
        overlays.push({ color:"rgba(239,68,68,0.55)", width:1, data:seriesData(bars, r.lo) });
      }else{
        const fn = def.id.indexOf("ema") === 0 ? indEMA : indSMA;
        overlays.push({ color:def.color, width:def.id === "emaFast" ? 2 : 1, data:seriesData(bars, fn(closes, p1)) });
      }
      return;
    }
    const items = [];
    const line = (color, w, data)=>items.push({ kind:"line", color, width:w || 1, data });
    const hband = v=>items.push({ kind:"band", value:v, data:levelLine(bars, v) });
    let valTxt = "", valCls = "";
    if(def.id === "rsi"){
      const v = indRSI(closes, p1);
      line(def.color, 2, seriesData(bars, v)); hband(70); hband(30);
      const lv = v.filter(x=>x !== null).pop();
      valTxt = lv != null ? "RSI "+lv.toFixed(1) : "—";
      valCls = lv > 70 ? "down" : lv < 30 ? "up" : "";
    }else if(def.id === "macd"){
      const r = indMACD(closes, p1, Math.max(p1+1, +c.p2 || 26), Math.max(2, +c.p3 || 9));
      items.push({ kind:"hist", data:bars.map((b,i)=> r.hist[i]===null ? null :
        { time:b.time, value:+r.hist[i].toFixed(6), color:r.hist[i]>=0 ? "rgba(34,197,94,0.55)" : "rgba(239,68,68,0.55)" }).filter(Boolean) });
      line("#2F80FF", 2, seriesData(bars, r.line));
      line("#F59E0B", 1, seriesData(bars, r.signal));
      const lv = r.hist.filter(x=>x !== null).pop();
      valTxt = lv != null ? "Hist "+(lv>=0?"+":"")+lv.toFixed(4) : "—";
      valCls = lv !== undefined && lv < 0 ? "down" : "up";
    }else if(def.id === "stoch"){
      const r = indStoch(bars, p1, Math.max(1, +c.p2 || 3), Math.max(2, +c.p3 || 9));
      line("#2F80FF", 2, seriesData(bars, r.k));
      line("#F59E0B", 1, seriesData(bars, r.d));
      hband(80); hband(20);
      const lv = r.k.filter(x=>x !== null).pop();
      valTxt = lv != null ? "%K "+lv.toFixed(1) : "—";
    }else if(def.id === "atr"){
      const v = indATR(bars, p1);
      line(def.color, 1, seriesData(bars, v));
      const lv = v.filter(x=>x !== null).pop();
      valTxt = lv != null ? "ATR "+fmtP(state.sym, lv) : "—";
    }
    panes[def.id] = { def, items, valTxt, valCls };
  });
  return { overlays, panes };
}
function fullRebuildInd(data){
  const L = LW();
  clearIndOverlays();
  data.overlays.forEach(o=>{
    const s = lw.chart.addLineSeries({ color:o.color, lineWidth:o.width, priceLineVisible:false, lastValueVisible:false, crosshairMarkerVisible:false });
    s.setData(o.data); indOverlaySeries.push(s);
  });
  Object.keys(indPanes).forEach(id=>{ if(!data.panes[id]) dropIndPane(id); });
  Object.values(data.panes).forEach(pd=>{
    const P = ensureIndPane(pd.def); if(!P) return;
    Object.values(P.series).forEach(s=>{ try{ P.chart.removeSeries(s); }catch(e){} });
    P.series = {};
    pd.items.forEach((it,i)=>{
      let s;
      if(it.kind === "hist") s = P.chart.addHistogramSeries({ priceLineVisible:false, lastValueVisible:false });
      else if(it.kind === "band") s = P.chart.addLineSeries({ color:"rgba(148,163,184,0.45)", lineWidth:1, lineStyle:L.LineStyle.Dashed, priceLineVisible:false, lastValueVisible:false, crosshairMarkerVisible:false });
      else s = P.chart.addLineSeries({ color:it.color, lineWidth:it.width, priceLineVisible:false, lastValueVisible:false, crosshairMarkerVisible:false });
      s.setData(it.data); P.series["s"+i] = s;
    });
    P.valEl.textContent = pd.valTxt;
    P.valEl.className = "ind-val num " + pd.valCls;
    P.wrap.querySelector(".ind-pane-sub").textContent = indSubLabel(pd.def);
    try{
      const r = lw.chart.timeScale().getVisibleLogicalRange();
      if(r) P.chart.timeScale().setVisibleLogicalRange(r);
    }catch(e){}
  });
  indBuilt = { overlays:indOverlaySeries.slice(), panes:{} };
  Object.keys(data.panes).forEach(id=>{
    if(indPanes[id]) indBuilt.panes[id] = { P:indPanes[id], series:Object.values(indPanes[id].series) };
  });
}
function renderIndicators(){
  if(!lw.chart || !LW() || !lw.bars || lw.bars.length < 10) return;
  const sig = state.sym+"|"+state.tf+"|"+lw.bars.length+"|"+JSON.stringify(indCfg);
  const data = computeIndData();
  if(sig !== indSig || !indBuilt){
    fullRebuildInd(data);
    indSig = sig;
    renderIndReadout();
    return;
  }
  const lastOf = d => d.length ? d[d.length-1] : null;
  indBuilt.overlays.forEach((s,i)=>{
    const d = data.overlays[i]; const pt = d && lastOf(d.data);
    if(pt){ try{ s.update(pt); }catch(e){} }
  });
  Object.keys(indBuilt.panes).forEach(id=>{
    const b = indBuilt.panes[id], pd = data.panes[id];
    if(!pd) return;
    b.series.forEach((s,i)=>{
      const it = pd.items[i]; const pt = it && lastOf(it.data);
      if(pt){ try{ s.update(pt); }catch(e){} }
    });
    b.P.valEl.textContent = pd.valTxt;
    b.P.valEl.className = "ind-val num " + pd.valCls;
  });
  renderIndReadout();
}
/* ---- neutral indicator readings (describe only — never trading signals) ---- */
function lastVal(arr){ for(let i = arr.length-1; i >= 0; i--) if(arr[i] !== null && arr[i] !== undefined && isFinite(arr[i])) return arr[i]; return null; }
function renderIndReadout(){
  const host = $("indReadout"); if(!host || !lw.bars || lw.bars.length < 10) return;
  const bars = lw.bars, closes = bars.map(b=>b.close), close = closes[closes.length-1];
  const rows = [];
  const emaF = indCfg.emaFast.on ? lastVal(indEMA(closes, Math.max(2, +indCfg.emaFast.p1 || 9))) : null;
  const emaS = indCfg.emaSlow.on ? lastVal(indEMA(closes, Math.max(2, +indCfg.emaSlow.p1 || 21))) : null;
  if(emaF !== null && emaS !== null){
    const d = (emaF-emaS)/emaS*100;
    rows.push(["EMA "+indCfg.emaFast.p1+"/"+indCfg.emaSlow.p1,
      d > 0.05 ? "Fast above slow — short-term trend up" : d < -0.05 ? "Fast below slow — short-term trend down" : "Fast and slow overlapping — trend flat"]);
  }else if(emaF !== null){
    rows.push(["EMA "+indCfg.emaFast.p1, close > emaF ? "Price above the EMA" : close < emaF ? "Price below the EMA" : "Price on the EMA"]);
  }
  const sma50 = indCfg.sma50.on ? lastVal(indSMA(closes, Math.max(2, +indCfg.sma50.p1 || 50))) : null;
  const sma200 = indCfg.sma200.on ? lastVal(indSMA(closes, Math.max(2, +indCfg.sma200.p1 || 200))) : null;
  if(sma50 !== null && sma200 !== null){
    rows.push(["SMA 50/200", sma50 > sma200 ? "50 above 200 — long-term trend up" : sma50 < sma200 ? "50 below 200 — long-term trend down" : "50 and 200 overlapping — trend flat"]);
  }else{
    const one = sma50 !== null ? ["SMA "+indCfg.sma50.p1, sma50] : sma200 !== null ? ["SMA "+indCfg.sma200.p1, sma200] : null;
    if(one) rows.push([one[0], close > one[1] ? "Price above the SMA" : close < one[1] ? "Price below the SMA" : "Price on the SMA"]);
  }
  if(indCfg.bb.on){
    const r = indBB(closes, Math.max(2, +indCfg.bb.p1 || 20), Math.max(0.5, +indCfg.bb.p2 || 2));
    const up = lastVal(r.up), lo = lastVal(r.lo);
    if(up !== null && lo !== null && up > lo){
      const pos = (close-lo)/(up-lo);
      rows.push(["Bollinger", pos > 0.85 ? "Price near the upper band" : pos < 0.15 ? "Price near the lower band" : "Price inside the bands"]);
    }
  }
  if(indCfg.rsi.on){
    const v = lastVal(indRSI(closes, Math.max(2, +indCfg.rsi.p1 || 14)));
    if(v !== null) rows.push(["RSI "+v.toFixed(1), v > 70 ? "Overbought zone" : v < 30 ? "Oversold zone" : "Neutral"]);
  }
  if(indCfg.macd.on){
    const r = indMACD(closes, Math.max(2, +indCfg.macd.p1 || 12), Math.max(3, +indCfg.macd.p2 || 26), Math.max(2, +indCfg.macd.p3 || 9));
    const h = lastVal(r.hist);
    if(h !== null) rows.push(["MACD", h > 0 ? "Histogram positive — bullish momentum" : h < 0 ? "Histogram negative — bearish momentum" : "Histogram flat — momentum neutral"]);
  }
  if(indCfg.stoch.on){
    const r = indStoch(bars, Math.max(2, +indCfg.stoch.p1 || 14), Math.max(1, +indCfg.stoch.p2 || 3), Math.max(2, +indCfg.stoch.p3 || 9));
    const k = lastVal(r.k);
    if(k !== null) rows.push(["Stochastic "+k.toFixed(1), k > 80 ? "Overbought zone" : k < 20 ? "Oversold zone" : "Neutral"]);
  }
  if(indCfg.atr.on){
    const v = lastVal(indATR(bars, Math.max(2, +indCfg.atr.p1 || 14)));
    if(v !== null) rows.push(["ATR "+fmtP(state.sym, v), "Current volatility range"]);
  }
  if(!rows.length){ host.hidden = true; host.innerHTML = ""; return; }
  host.hidden = false;
  host.innerHTML = '<div class="ir-head"><span class="ic xs" data-icon="info"></span><b>What the indicators show</b></div>' +
    rows.map(r=>'<div class="ir-row"><span>'+esc(r[0])+'</span><b>'+esc(r[1])+'</b></div>').join("") +
    '<div class="ir-fine">Readings describe the indicator only — not trading advice.</div>';
  injectIcons();
}
function bindIndSync(){
  if(indSyncBound || !lw.chart) return;
  indSyncBound = true;
  lw.chart.timeScale().subscribeVisibleLogicalRangeChange(r=>{
    if(!r) return;
    Object.values(indPanes).forEach(P=>{ try{ P.chart.timeScale().setVisibleLogicalRange(r); }catch(e){} });
  });
}

/* ---- indicator settings sheet ---- */
function buildIndSheet(){
  const list = $("indList"); if(!list) return;
  list.innerHTML = IND_DEFS.map(def=>{
    const c = indCfg[def.id];
    const params = def.params.map(([k,label])=>
      '<label class="ind-param"><span>'+label+'</span><input type="number" class="field num" data-ind="'+def.id+'" data-pk="'+k+'" value="'+c[k]+'" min="2" max="500" step="1"></label>').join("");
    return '<div class="ind-row"><label class="switch"><input type="checkbox" data-ind-toggle="'+def.id+'"'+(c.on?" checked":"")+'><span class="sw"></span></label>'+
      '<span class="ind-dot" style="background:'+def.color+'"></span>'+
      '<span class="ind-name">'+def.name+' <span class="fine">'+indSubLabel(def)+'</span></span>'+
      '<span class="ind-params">'+params+'</span></div>';
  }).join("");
  list.querySelectorAll("[data-ind-toggle]").forEach(t=>t.addEventListener("change", ()=>{
    indCfg[t.dataset.indToggle].on = t.checked; saveIndCfg(); renderIndicators();
  }));
  list.querySelectorAll("[data-ind]").forEach(inp=>inp.addEventListener("change", ()=>{
    const v = Math.max(2, Math.min(500, +inp.value || 0));
    if(v >= 2){ indCfg[inp.dataset.ind][inp.dataset.pk] = v; saveIndCfg(); buildIndSheet(); renderIndicators(); }
  }));
}

/* ---- market status + data badges ---- */
function updateDataBadges(){
  const s = state.sym, open = mktOpen(s);
  const pill = $("mktPill");
  if(pill){
    pill.className = "mkt-pill " + (open ? "open" : "closed");
    pill.innerHTML = "<i></i>" + (open ? "LIVE" : "MARKET CLOSED");
  }
  const badge = $("dataBadge");
  if(badge){
    const kind = state.live[s];
    const age = quoteAge(s);
    const ageTxt = age ? " · "+age : "";
    if(!open){
      badge.className = "data-badge sim";
      badge.textContent = "Frozen · last price";
    }else if(kind === "live"){
      badge.className = "data-badge live";
      badge.textContent = "Real-time"+ageTxt;
    }else if(kind === "daily"){
      badge.className = "data-badge sim";
      badge.textContent = "Daily indicative"+ageTxt;
    }else{
      badge.className = "data-badge sim";
      badge.textContent = "Simulated";
    }
  }
  const note = $("mktNote");
  if(note) note.hidden = open;
  /* PAXG proxy honesty: XAUUSD here tracks the PAXG gold token, not a broker feed */
  const px = $("proxyNote");
  if(px) px.hidden = (s !== "XAUUSD");
  const inl = $("indDataNote");
  if(inl){
    const kind = state.live[s];
    inl.textContent = state.dataReal[s]
      ? "Computed live on real market candles."
      : "Computed on simulated history — price feed is " +
        (kind === "live" ? "real-time." : kind === "daily" ? "a daily indicative anchor." : "simulated.");
  }
}
/* wire the indicator UI (elements exist: script runs at end of body) */
(function initIndUI(){
  const b = $("indBtn"); if(b) b.addEventListener("click", ()=>{ buildIndSheet(); $("indSheetWrap").hidden = false; updateDataBadges(); });
  const bg = $("indSheetBg"); if(bg) bg.addEventListener("click", ()=>{ $("indSheetWrap").hidden = true; });
  const x = $("indSheetX"); if(x) x.addEventListener("click", ()=>{ $("indSheetWrap").hidden = true; });
  bindIndSync();
  updateDataBadges(); /* paint market-open/closed + real-time/simulated state on first load */
})();
