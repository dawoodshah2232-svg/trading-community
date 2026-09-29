/* ============================================================
   Trading Community — trading terminal (FULL REBUILD)
   *** EVERYTHING IS MOCK / SIMULATED ***
   Random-walk price engine, mock fills, mock brokers, mock
   chat/feed/alerts. No real market data, no real broker, no
   real auth. The chart is self-hosted on Lightweight Charts
   v5.2.1 (vendored) and fed by the same simulated engine below —
   there is no external chart provider anymore.
   ============================================================ */
(function(){
"use strict";

/* DOM helpers — declared first: top-level code below calls them during load */
const $ = id => document.getElementById(id);
const $$ = (sel, root) => Array.from((root||document).querySelectorAll(sel));

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
  chart:'<path d="M3 17l5-6 4 4 6-8"/><path d="M18 7h-4M21 7v4"/>',
  fib:'<path d="M4 5h16M4 10h16M4 15h16M4 20h16"/><path d="M12 5v15" stroke-dasharray="2 2"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  bank:'<path d="M4 10l8-6 8 6"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/><path d="M4 20h16"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5h.01"/>',
  heart:'<path d="M12 20.5s-7.6-4.8-9.4-9.3C1.3 7.9 3.5 5 6.7 5c2 0 3.8 1.2 5.3 3.1C13.5 6.2 15.3 5 17.3 5c3.2 0 5.4 2.9 4.1 6.2-1.8 4.5-9.4 9.3-9.4 9.3z"/>',
  comment:'<path d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v8a2.5 2.5 0 01-2.5 2.5H9l-5 4.5z"/>',
  share:'<path d="M12 3.5V14"/><path d="M8 7.5l4-4 4 4"/><path d="M5 12.5V19a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 19v-6.5"/>',
  bulb:'<path d="M9.5 18h5"/><path d="M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.9c.7.5 1.5 1.2 1.5 2.1h4c0-.9.8-1.6 1.5-2.1A6 6 0 0012 3z"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 5H4.5a.5.5 0 00-.5.6C4.2 8 6 9.5 8 9.7M16 5h3.5a.5.5 0 01.5.6C19.8 8 18 9.5 16 9.7"/><path d="M12 13v4M8.5 20h7M10 17h4"/>',
  grad:'<path d="M2.5 9L12 5l9.5 4L12 13z"/><path d="M6.5 10.8V15c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-4.2"/><path d="M21.5 9v5"/>',
  gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8"/>',
  chat:'<path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7a2.5 2.5 0 01-2.5 2.5H9l-5 4z"/>',
  wallet:'<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><path d="M16.5 14.5h.01"/>',
  eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  expand:'<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>',
  chevL:'<path d="M14.5 6L8.5 12l6 6"/>',
  dots:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  like:'<path d="M7 11.5V20H4a1 1 0 01-1-1v-7.5a1 1 0 011-1zm2 8.5l4.5-9c.8-1.6 3-2 4.4-1l-1.6 4H20a2 2 0 012 2.4l-1.2 5.6A2 2 0 0118.8 20z"/>',
  share:'<path d="M12 3l7 7h-4v6h-6v-6H5z"/><path d="M5 13v7h14v-7"/>',
  bookmark:'<path d="M7 4h10a1 1 0 011 1v15l-6-4-6 4V5a1 1 0 011-1z"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"/><circle cx="9" cy="9.5" r="1"/><circle cx="15" cy="9.5" r="1"/>',
  /* v25.13: growth */
  cal:'<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M4 10.5h16M8 3.5V8M16 3.5V8"/>',
  download:'<path d="M12 3.5V14"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M4 20.5h16"/>',
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
  ttype:"market", dir:"buy", lots:0.10, tpslOn:true,
  lev:500,
  prices:{}, hist:{}, depth:{},
  open:[], pending:[], history:[],
  alerts:[], alertSeq:1, orderSeq:1,
  notifs:[], notifSeq:1,
  balance:START_BALANCE,
  liveBuilt:false, voted:null
};
SYM_ORDER.forEach(s=>{
  const m = SYMBOLS[s];
  state.prices[s] = { bid:m.base, ask:m.base+m.spread, chg:m.chg };
  state.hist[s] = [m.base];
});

/* ---- v25.13: achievements (demo) ---- */
const ACH_KEY = "tc_achieve_v1";
const ACH_DEFS = [
  { id:"first_trade", ic:"🚀", name:"First trade", desc:"Placed your first demo trade" },
  { id:"first_win", ic:"💰", name:"First win", desc:"Closed a winning demo trade" },
  { id:"streak3", ic:"🔥", name:"Win streak ×3", desc:"3 winning trades in a row" },
  { id:"wins5", ic:"⭐", name:"5 wins", desc:"5 winning demo trades total" },
  { id:"first_copy", ic:"🪞", name:"First copy", desc:"Started copying a trader" },
  { id:"depositor", ic:"💳", name:"Funded", desc:"Made a demo deposit" },
  { id:"early", ic:"🌅", name:"Early adopter", desc:"Joined the demo early" }
];
let achState = { unlocked:{}, wins:0, streak:0 };
try{ const s = JSON.parse(localStorage.getItem(ACH_KEY)||"null"); if(s) achState = Object.assign(achState, s); }catch(e){}
function saveAch(){ try{ localStorage.setItem(ACH_KEY, JSON.stringify(achState)); }catch(e){} }
function unlockAch(id){
  if(achState.unlocked[id]) return;
  const d = ACH_DEFS.find(x=>x.id===id); if(!d) return;
  achState.unlocked[id] = Date.now(); saveAch();
  toast(d.ic+" Achievement: "+d.name+" — demo");
  pushNotif("trophy", "Achievement unlocked", d.ic+" "+d.name+" — "+d.desc);
  renderAchievements();
}
function renderAchievements(){
  const el = $("achieveRow"); if(!el) return;
  el.innerHTML = ACH_DEFS.map(d=>{
    const un = achState.unlocked[d.id];
    return '<div class="ach'+(un?" un":"")+'" title="'+esc(d.desc)+'"><span>'+d.ic+'</span><b>'+esc(d.name)+'</b></div>';
  }).join("");
}
/* ---- v25.13: daily login streak (demo) ---- */
const STREAK_KEY = "tc_streak_v1";
function bumpStreak(){
  let s = {}; try{ s = JSON.parse(localStorage.getItem(STREAK_KEY)||"{}"); }catch(e){}
  const today = new Date().toISOString().slice(0,10);
  if(s.last === today){ paintStreak(s.days||1); return s.days||1; }
  const y = new Date(Date.now()-864e5).toISOString().slice(0,10);
  s.days = (s.last === y) ? (s.days||0)+1 : 1;
  s.last = today;
  try{ localStorage.setItem(STREAK_KEY, JSON.stringify(s)); }catch(e){}
  const bonus = { 3:25, 7:75, 30:250 }[s.days];
  if(bonus){
    state.balance += bonus; saveTrades();
    toast("🔥 "+s.days+"-day streak! +"+fmt$(bonus)+" demo bonus");
    pushNotif("flame", s.days+"-day streak", "Demo bonus "+fmt$(bonus)+" added — keep it up");
  }
  paintStreak(s.days);
  return s.days;
}
function paintStreak(days){
  const el = $("streakPill"); if(!el) return;
  el.hidden = false; el.textContent = "🔥 "+days;
}
function trackTradeClosed(pl){
  if(pl > 0){
    achState.wins++; achState.streak++;
    unlockAch("first_win");
    if(achState.streak >= 3) unlockAch("streak3");
    if(achState.wins >= 5) unlockAch("wins5");
  }else{
    achState.streak = 0;
  }
  saveAch();
}
/* ---------------- PERSISTENCE (v25.13) ---------------- */
/* Trades, price alerts and broker links survive reloads.
   Everything remains demo/simulated. */
const TRADES_KEY = "tc_trades_v1", ALERTS_KEY = "tc_alerts_v1", BROKERS_KEY = "tc_brokers_v1";
const APP_VERSION = "25.20";
function paintVersion(){
  const s = $("setVerLine"); if(s) s.textContent = "Trading Community · demo build · v"+APP_VERSION;
  const p = $("profVerLine"); if(p) p.textContent = "v"+APP_VERSION+" · demo build";
}
function saveTrades(){
  try{
    localStorage.setItem(TRADES_KEY, JSON.stringify({
      open: state.open, pending: state.pending,
      history: state.history.slice(-200),
      balance: state.balance, orderSeq: state.orderSeq
    }));
  }catch(e){}
}
function loadTrades(){
  try{
    const d = JSON.parse(localStorage.getItem(TRADES_KEY) || "null");
    if(!d) return;
    if(Array.isArray(d.open)) state.open = d.open;
    if(Array.isArray(d.pending)) state.pending = d.pending;
    if(Array.isArray(d.history)) state.history = d.history;
    if(typeof d.balance === "number" && isFinite(d.balance)) state.balance = d.balance;
    if(typeof d.orderSeq === "number" && d.orderSeq > 0) state.orderSeq = d.orderSeq;
  }catch(e){}
}
function saveAlerts(){
  try{ localStorage.setItem(ALERTS_KEY, JSON.stringify({ alerts: state.alerts, seq: state.alertSeq })); }catch(e){}
}
function loadAlerts(){
  try{
    const d = JSON.parse(localStorage.getItem(ALERTS_KEY) || "null");
    if(!d) return;
    if(Array.isArray(d.alerts)) state.alerts = d.alerts;
    if(typeof d.seq === "number" && d.seq > 0) state.alertSeq = d.seq;
  }catch(e){}
}
function saveBrokers(){
  try{ localStorage.setItem(BROKERS_KEY, JSON.stringify(BROKERS.filter(b=>b.connected).map(b=>b.name))); }catch(e){}
}
function loadBrokers(){
  try{
    /* v25.13: custom brokers added via the Add Broker form */
    const custom = JSON.parse(localStorage.getItem("tc_brokers_custom_v1") || "[]");
    custom.forEach(b=>{
      if(!BROKERS.some(x=>x.name===b.name))
        BROKERS.push({ name:b.name, sub:b.sub||"MT4 / MT5", g:["#64748b","#334155"], ini:b.name.slice(0,2).toUpperCase(), connected:false, custom:true });
    });
    const names = JSON.parse(localStorage.getItem(BROKERS_KEY) || "[]");
    BROKERS.forEach(b=>{ if(names.indexOf(b.name) >= 0) b.connected = true; });
  }catch(e){}
}

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
      if(d && d.usd > 0){
        if(mktOpen(s)) anchorPrice(s, d.usd, d.usd_24h_change, full, "live");
        else state.quoteAt[s] = Date.now(); /* market closed: price stays frozen, but record the fresh check honestly */
      }
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

/* ---------------- NOTIFICATIONS CENTER ---------------- */
function pushNotif(icon, title, body, onTap){
  state.notifs.unshift({ id:"n"+(state.notifSeq++), icon, title, body, time:"now", unread:true, onTap:onTap||null });
  updateNotifDot();
  if(!$("notifSheet").hidden) renderNotifs();
}
function updateNotifDot(){
  const d = $("alertDot"); if(d) d.hidden = !state.notifs.some(n=>n.unread);
}
function renderNotifs(){
  const list = $("notifList"); if(!list) return;
  if(!state.notifs.length){
    list.innerHTML = '<div class="notif-empty">You are all caught up.</div>';
    return;
  }
  list.innerHTML = "";
  state.notifs.forEach(n=>{
    const r = document.createElement("button");
    r.className = "notif-row" + (n.unread ? " unread" : "");
    r.innerHTML =
      '<span class="notif-ic"><span class="ic" data-icon="'+n.icon+'"></span></span>'+
      '<span class="notif-tx"><b>'+esc(n.title)+'</b><span>'+esc(n.body)+'</span></span>'+
      '<span class="notif-time">'+esc(n.time)+'</span>'+
      (n.unread ? '<span class="notif-dot"></span>' : '');
    r.addEventListener("click", ()=>{
      n.unread = false; updateNotifDot(); renderNotifs();
      closeNotifSheet();
      if(n.onTap) setTimeout(n.onTap, 80);
    });
    list.appendChild(r);
  });
  injectIcons();
}
function openNotifSheet(){
  renderNotifs();
  $("backdrop").hidden = false;
  $("notifSheet").hidden = false;
}
function closeNotifSheet(){
  $("notifSheet").hidden = true;
  if($("symbolSheet").hidden) $("backdrop").hidden = true;
}
/* seed demo notifications */
state.notifs.push(
  { id:"n"+(state.notifSeq++), icon:"live", title:"@alikhantfx is live", body:"London scalps — XAUUSD live trading started 12 min ago", time:"12m", unread:true, onTap:()=>goTab("live") },
  { id:"n"+(state.notifSeq++), icon:"community", title:"New follower", body:"@saramalik started following you", time:"1h", unread:true, onTap:null },
  { id:"n"+(state.notifSeq++), icon:"heart", title:"Post liked", body:"@cryptonadeem and 23 others liked your XAUUSD idea", time:"3h", unread:true, onTap:null },
  { id:"n"+(state.notifSeq++), icon:"bell", title:"Welcome", body:"Price alerts, new followers and live streams will appear here", time:"1d", unread:false, onTap:null }
);
updateNotifDot();

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
  const tns = $("themeNameSide"); if(tns) tns.textContent = t === "dark" ? "Dark" : "Light";
  const stn = $("setThemeName"); if(stn) stn.textContent = t === "dark" ? "Dark" : "Light";
  try{ localStorage.setItem("tc_theme_v1", t); }catch(e){}
  applyChartTheme(); /* recolor the self-hosted chart */
}
$("themeBtn").addEventListener("click", ()=>setTheme(theme()==="dark"?"light":"dark"));
const tts = $("themeToggleSide"); if(tts) tts.addEventListener("click", ()=>setTheme(theme()==="dark"?"light":"dark"));
const stt = $("setThemeToggle"); if(stt) stt.addEventListener("click", ()=>setTheme(theme()==="dark"?"light":"dark"));
const snt = $("setNotifToggle");
if(snt) snt.addEventListener("click", ()=>{ const sw = snt.querySelector(".switch"); const on = !sw.classList.contains("on"); sw.classList.toggle("on", on); snt.setAttribute("aria-pressed", on); toast(on?"Notifications on — demo":"Notifications off — demo"); });
const srd = $("setResetDemo");
if(srd) srd.addEventListener("click", ()=>{ if(confirm("Reset all demo data and reload?")){ try{ localStorage.clear(); }catch(e){} location.reload(); } });
const rpu = $("reelsPageUpload"); if(rpu) rpu.addEventListener("click", ()=>triggerReelUpload());
const ipp = $("ideasPagePost"); if(ipp) ipp.addEventListener("click", ()=>{ if(typeof openIdeaSheet==="function") openIdeaSheet(); else toast("Posting — demo"); });
const bpa = $("brokersPageAdd"); if(bpa) bpa.addEventListener("click", openBrokerSheet);
document.querySelectorAll("#lbPeriodPills [data-lbperiod]").forEach(b=>b.addEventListener("click", ()=>{
  document.querySelectorAll("#lbPeriodPills .ppill").forEach(x=>x.classList.toggle("active", x===b));
  lbPeriod = b.dataset.lbperiod; renderCommunityTraders();
}));

/* ---------------- TABS ---------------- */
function goTab(tab){
  /* Reels tab: straight into the full-screen viewer at a random reel — no list screen */
  if(tab === "reels"){ openRandomReel(); return; }
  document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  const scr = $("screen-"+tab);
  if(!scr){ console.warn("[goTab] no screen for tab:", tab); return; }
  scr.classList.add("active");
  document.body.dataset.tab = tab;
  document.querySelector(".content").scrollTop = 0;
  if(tab==="live" && !state.liveBuilt){ state.liveBuilt = true; buildLive(); }
  if(tab!=="live" && state.liveBuilt) stopCamera(); /* stop face-cam tracks off the live tab */
  if(tab==="trade"){ try{ buildMainChart(); }catch(e){} } /* chart may have failed at boot while this tab was hidden — retry now that it has real dimensions */
  if(tab==="community" && !$("communityTraders").innerHTML){ try{ renderCommunityTraders(); }catch(e){} }
  if(tab==="leaderboard" && !$("leaderboardPageList").innerHTML){ try{ renderCommunityTraders(); }catch(e){} }
  if(tab==="portfolio"){ try{ renderPortfolio(); }catch(e){} }
}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click", ()=>goTab(b.dataset.tab)));

/* ---------------- GLOBAL SEARCH (desktop topbar + home) ---------------- */
function attachSearch(inputId, dropId){
  const input = $(inputId), drop = $(dropId);
  if(!input || !drop) return;
  input.addEventListener("input", ()=>runGlobalSearch(input, drop, input.value));
  input.addEventListener("keydown", e=>{ if(e.key==="Escape") drop.hidden = true; });
}
function runGlobalSearch(input, drop, q){
  q = (q||"").trim().toLowerCase();
  if(q.length < 2){ drop.hidden = true; drop.innerHTML = ""; return; }
  const tHits = TRADERS.filter(t=>(t.name+" "+t.handle).toLowerCase().includes(q)).slice(0,4);
  const sHits = SYM_ORDER.filter(s=>s.toLowerCase().includes(q) || (SYMBOLS[s].name||"").toLowerCase().includes(q)).slice(0,4);
  if(!tHits.length && !sHits.length){
    drop.innerHTML = '<div class="gs-empty">No results for &ldquo;'+esc(q)+'&rdquo;</div>';
    drop.hidden = false; return;
  }
  let h = "";
  tHits.forEach(t=>{
    h += '<button class="gs-row" data-gs-t="'+t.id+'">'+avImg(t,"sm")+
         '<span class="gs-tx"><b>'+esc(t.name)+'</b><span class="fine">'+esc(t.handle)+' · Trader</span></span></button>';
  });
  sHits.forEach(s=>{
    h += '<button class="gs-row" data-gs-s="'+s+'"><span class="gs-sym num">'+s+'</span>'+
         '<span class="gs-tx"><b>'+esc(SYMBOLS[s].name||s)+'</b><span class="fine">Symbol · tap to trade</span></span></button>';
  });
  drop.innerHTML = h; drop.hidden = false;
  drop.querySelectorAll("[data-gs-t]").forEach(b=>b.addEventListener("click", ()=>{
    drop.hidden = true; input.value = ""; openTraderProfile(b.dataset.gsT);
  }));
  drop.querySelectorAll("[data-gs-s]").forEach(b=>b.addEventListener("click", ()=>{
    drop.hidden = true; input.value = ""; setSymbol(b.dataset.gsS); goTab("trade");
  }));
}
document.addEventListener("click", e=>{
  document.querySelectorAll(".gsearch-drop").forEach(d=>{
    if(!d.hidden && !e.target.closest(".appbar-search") && !e.target.closest(".mh-search")) d.hidden = true;
  });
});
$("avatarBtn").addEventListener("click", ()=>goTab("profile"));
$("bellBtn").addEventListener("click", openNotifSheet);
$("notifX").addEventListener("click", closeNotifSheet);
$("notifReadAll").addEventListener("click", ()=>{
  state.notifs.forEach(n=>n.unread=false);
  updateNotifDot(); renderNotifs();
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
  checkCopyGuard();
  renderWatchlistTick();
  renderSheetTick(); /* live prices inside the open asset picker */
  renderHeaderTick();
  renderDepth();
  renderTapeTick();
  renderTicketTick();
  renderPositionsTick();
  renderCopiersTick(); /* play-money copier numbers stay live */
  renderAccount();
  updateChartTick(); /* roll the self-hosted candle chart forward */
  if(++tickCount % 7 === 0){ renderYouCard(); updateDataBadges(); } /* your presence card, ~5s */
  if(lw.bars.length !== lastIndBars || tickCount % 9 === 0) renderIndicators(); /* keep indicators live */
  if(replay.active && (state.sym!==replay.sym || state.tf!==replay.tf)) stopReplay(); /* symbol/tf switch exits replay */
  checkReminders(); /* scheduled-live reminder check */
  renderLivePosStrip(); /* host demo positions under the live stage */
  if(tickCount % 42 === 0) renderUpcoming(); /* refresh upcoming countdowns ~30s */
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

/* trade symbol strip (desktop) */
function renderDeskSymStrip(){
  const el = $("deskSymStrip"); if(!el) return;
  const syms = ["XAUUSD","EURUSD","GBPUSD","BTCUSD","US30"];
  el.innerHTML = syms.filter(s=>SYMBOLS[s]).map(s=>{
    const pr = px(s), chg = SYMBOLS[s].chg || 0, up = chg >= 0;
    return '<button class="dss-chip'+(state.sym===s?" active":"")+'" data-dss="'+s+'">'+
      '<b>'+s+'</b><span class="num">'+fmtP(s, pr.bid)+'</span>'+
      '<span class="num '+(up?"pl-pos":"pl-neg")+'">'+(up?"+":"")+chg.toFixed(2)+'%</span></button>';
  }).join("")+'<button class="dss-add" id="dssAdd" aria-label="Add symbol">+</button>';
  el.querySelectorAll("[data-dss]").forEach(b=>b.addEventListener("click", ()=>setSymbol(b.dataset.dss)));
  const add = $("dssAdd"); if(add) add.addEventListener("click", ()=>toast("Add symbol — demo"));
}
const _setSymbolOrig = setSymbol;
setSymbol = function(s){ _setSymbolOrig(s); renderDeskSymStrip(); };
function setSymbol(s){
  if(!SYMBOLS[s]) return;
  state.sym = s;
  $("symName").textContent = s;
  $("symTitle").textContent = s;
  $("lgSym").textContent = s; /* legend must follow immediately, even if the chart failed to build */
  $("symSub").textContent = meta(s).name + " · " + meta(s).ex;
  document.querySelectorAll(".wl-item").forEach(el=>{
    const cur = el.dataset.sym === s;
    el.classList.toggle("current", cur);
    el.setAttribute("aria-selected", cur ? "true" : "false");
  });
  refreshMainData(); /* regenerate candles for the new symbol */
  renderDepth(true); renderTape(true);
  renderHeaderTick(); renderTicketTick(); calcSize();
  updateDataBadges(); /* market open/closed + real-time/simulated state */
  $("tPrice").value = "";
  /* suggest TP/SL like the reference ticket when the fields are empty */
  try{
    const tp = $("tpPrice"), sl = $("slPrice"), pr = px(s);
    if(tp && !tp.value) tp.value = fmtP(s, pr.ask * 1.004);
    if(sl && !sl.value) sl.value = fmtP(s, pr.bid * 0.996);
  }catch(e){}
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
  const sc = $("symChg");
  if(sc){
    const abs = Math.abs(pr.bid * pr.chg / 100);
    sc.textContent = (pr.chg>=0?"+":"−") + abs.toFixed(2) + " (" + (pr.chg>=0?"+":"") + pr.chg.toFixed(2) + "%)";
    sc.className = "sym-chg num " + (pr.chg>=0 ? "pl-pos" : "pl-neg");
  }
}
$("symPicker").addEventListener("click", ()=>{
  sheetQuery = ""; $("sheetSearch").value = ""; /* fresh search each open */
  renderSymbolSheet(); openSheet();
});
function openSheet(){ $("backdrop").hidden = false; $("symbolSheet").hidden = false; }
function closeSheet(){ $("backdrop").hidden = true; $("symbolSheet").hidden = true; }
$("backdrop").addEventListener("click", ()=>{ closeSheet(); closeNotifSheet(); closeMoneySheet(); closeGiftSheet(); closeSchedSheet(); closePollSheet(); closeInviteSheet(); });
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

/* ---------------- SELF-HOSTED CHART — Lightweight Charts v5.2.1 ----------------
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
      fontSize: 11,
      attributionLogo: false
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
  lw.candles = lw.chart.addSeries(LW().CandlestickSeries, lwCandleOpts());
  lw.volume = lw.chart.addSeries(LW().HistogramSeries, { priceScaleId:"vol", priceFormat:{ type:"volume" } });
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
  if(data && data.bars.length > 30){ real = true; bars = data.bars; vols = []; /* CoinGecko total_volumes is not true per-candle volume — hidden for honesty */ }
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
  if(replayActive()){ updateLegend(replay.bars[replay.idx]); return; }
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
    lw.liveCandles = lw.liveChart.addSeries(LW().CandlestickSeries, lwCandleOpts());
    lw.liveBars = genBars("XAUUSD", "5m").bars;
    lw.liveCandles.setData(lw.liveBars);
    lw.liveChart.timeScale().scrollToRealTime();
    new ResizeObserver(()=>{ if(lw.liveChart && host.clientWidth) lw.liveChart.resize(host.clientWidth, host.clientHeight); }).observe(host);
    /* Stage background chart — same XAUUSD 5m feed, rendered behind the live stage (FaceTime layout) */
    const stg = $("tvChartStage");
    if(stg && !lw.stageChart){
      stg.innerHTML = "";
      lw.stageChart = LW().createChart(stg, Object.assign({ width:stg.clientWidth||300, height:stg.clientHeight||300 }, lwTheme()));
      lw.stageCandles = lw.stageChart.addSeries(LW().CandlestickSeries, lwCandleOpts());
      lw.stageCandles.setData(lw.liveBars);
      lw.stageChart.timeScale().scrollToRealTime();
      new ResizeObserver(()=>{ if(lw.stageChart && stg.clientWidth) lw.stageChart.resize(stg.clientWidth, stg.clientHeight); }).observe(stg);
    }
  }catch(err){ console.error("[chart] live init failed:", err); chartErr(host, "Chart failed to start."); }
}

/* Called from the 700ms price engine tick: rolls the live candle forward */
function updateChartTick(){
  if(!replayActive() && lw.candles && lw.bars.length){ /* replay mode freezes the live candle feed */
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
      if(lw.stageCandles) lw.stageCandles.update(last);
    }else{
      last.close = p; if(p>last.high) last.high = p; if(p<last.low) last.low = p;
      lw.liveCandles.update(last);
      if(lw.stageCandles) lw.stageCandles.update(last);
    }
  }
}

/* ---------------- REPLAY MODE (demo — steps through historical candles, nothing live) ---------------- */
const replay = { active:false, sym:null, tf:null, bars:[], vols:[], idx:0, playing:false, speed:1, timer:null };
const REPLAY_N = 120, REPLAY_SPEEDS = [1,2,4];
function replayActive(){ return replay.active && replay.sym===state.sym; }
function replayCursorPrice(){ const b = replay.bars[replay.idx]; return b ? b.close : null; }
function replayPx(s){
  const c = replayCursorPrice(); if(c==null || !isFinite(c)) return px(s);
  const sp = (meta(s).spread||0)/2;
  return { bid:c-sp, ask:c+sp };
}
function replaySlice(){ return replay.bars.slice(0, replay.idx+1); }
function startReplay(){
  if(replay.active) return;
  if(!lw.candles || lw.bars.length < 10){ toast("Chart not ready — open the Trade tab first"); return; }
  replay.sym = state.sym; replay.tf = state.tf;
  replay.bars = lw.bars.slice(-REPLAY_N);
  replay.vols = (lw.vols||[]).slice(-REPLAY_N);
  replay.idx = Math.min(30, replay.bars.length-2);
  replay.active = true; replay.playing = false; replay.speed = 1;
  lw.candles.setData(replaySlice());
  try{ lw.volume.setData(replay.vols.slice(0, replay.idx+1)); }catch(e){}
  try{ lw.chart.timeScale().scrollToPosition(replay.idx, false); }catch(e){}
  $("replayBar").hidden = false;
  $("replayBtn").classList.add("on");
  $("rpPlay").textContent = "▶";
  renderReplayBar();
  toast("Replay mode — demo, "+replay.bars.length+" historical candles");
}
function stopReplay(){
  if(!replay.active) return;
  replay.active = false; replay.playing = false;
  if(replay.timer){ clearInterval(replay.timer); replay.timer = null; }
  $("replayBar").hidden = true;
  $("replayBtn").classList.remove("on");
  if(lw.candles && lw.bars.length){
    lw.candles.setData(lw.bars);
    try{ lw.volume.setData(lw.vols||[]); }catch(e){}
    try{ lw.chart.timeScale().scrollToRealTime(); }catch(e){}
    updateLegend(lw.bars[lw.bars.length-1]);
  }
  renderTicketTick();
  toast("Replay off — back to live prices");
}
function renderReplayBar(){
  const c = $("rpCount"); if(c) c.textContent = (replay.idx+1)+" / "+replay.bars.length;
  const s = $("rpSpeed"); if(s) s.textContent = replay.speed+"x";
  const b = replay.bars[replay.idx];
  if(b){ updateLegend(b); renderTicketTick(); }
}
function stepReplay(d){
  if(!replay.active) return;
  replay.idx = Math.max(0, Math.min(replay.bars.length-1, replay.idx+d));
  const b = replay.bars[replay.idx];
  if(lw.candles && b){
    if(d>0) lw.candles.update(b); else lw.candles.setData(replaySlice());
    const v = replay.vols[replay.idx];
    try{ if(v){ if(d>0) lw.volume.update(v); else lw.volume.setData(replay.vols.slice(0, replay.idx+1)); } }catch(e){}
  }
  renderReplayBar();
  if(replay.idx >= replay.bars.length-1 && replay.playing){ setReplayPlay(false); toast("Replay finished — demo"); }
}
function setReplayPlay(on){
  if(!replay.active) return;
  replay.playing = on;
  if(replay.timer){ clearInterval(replay.timer); replay.timer = null; }
  if(on){
    if(replay.idx >= replay.bars.length-1) replay.idx = 0;
    replay.timer = setInterval(()=>stepReplay(1), Math.round(900/replay.speed));
  }
  $("rpPlay").textContent = on ? "⏸" : "▶";
}
function cycleReplaySpeed(){
  if(!replay.active) return;
  const i = (REPLAY_SPEEDS.indexOf(replay.speed)+1)%REPLAY_SPEEDS.length;
  replay.speed = REPLAY_SPEEDS[i];
  if(replay.playing) setReplayPlay(true);
  renderReplayBar();
}
$("replayBtn").addEventListener("click", ()=> replay.active ? stopReplay() : startReplay());
$("rpBack").addEventListener("click", ()=>{ setReplayPlay(false); stepReplay(-1); });
$("rpPlay").addEventListener("click", ()=>setReplayPlay(!replay.playing));
$("rpFwd").addEventListener("click", ()=>{ setReplayPlay(false); stepReplay(1); });
$("rpSpeed").addEventListener("click", cycleReplaySpeed);
$("rpExit").addEventListener("click", stopReplay);

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
$("lotPresets").addEventListener("click", e=>{
  const b = e.target.closest("[data-lot]"); if(!b) return;
  setLots(parseFloat(b.dataset.lot));
  document.querySelectorAll("#lotPresets button").forEach(x=>x.classList.toggle("on", x===b));
});
$("tpslToggle").addEventListener("click", ()=>{
  state.tpslOn = !state.tpslOn;
  $("tpslToggle").setAttribute("aria-pressed", state.tpslOn ? "true" : "false");
  $("tpslSwitch").classList.toggle("on", state.tpslOn);
  $("tpslWrap").hidden = !state.tpslOn;
  renderTicketTick();
});
["tPrice","tpPrice","slPrice"].forEach(id=>$(id).addEventListener("input", renderTicketTick));
/* ---- v25.13: position size calculator (demo, educational) ---- */
function calcSize(){
  const out = $("calcLots"); if(!out) return;
  const riskPct = parseFloat($("calcRisk").value), slDist = parseFloat($("calcSL").value);
  const s = state.sym, m = meta(s);
  if(isNaN(riskPct) || isNaN(slDist) || riskPct<=0 || slDist<=0 || !m || !m.perPoint){
    out.textContent = "—"; return;
  }
  const riskAmt = equity() * riskPct/100;
  const lots = riskAmt / (slDist * m.perPoint);
  out.textContent = lots > 0 ? Math.max(0.01, Math.floor(lots*100)/100).toFixed(2)+" lots" : "—";
}
["calcRisk","calcSL"].forEach(id=>{ const el = $(id); if(el) el.addEventListener("input", calcSize); });

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
  const s = state.sym, pr = replayActive() ? replayPx(s) : px(s); /* ticket follows the replay cursor */
  const tkS = $("tkSym"); if(tkS) tkS.textContent = s;
  const tkSS = $("tkSymSub"); if(tkSS) tkSS.textContent = meta(s).name;
  const tkP = $("tkPx"); if(tkP) tkP.textContent = fmtP(s, pr.bid);
  const tkC = $("tkChg"); if(tkC){ const chg = SYMBOLS[s].chg||0, up = chg>=0;
    tkC.textContent = (up?"+":"")+chg.toFixed(2)+"%"; tkC.className = "num "+(up?"pl-pos":"pl-neg"); }
  $("buyPx").textContent = fmtP(s, pr.ask);
  $("sellPx").textContent = fmtP(s, pr.bid);
  $("estMargin").textContent = fmt$(estMarginSafe());
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
    const rp = replayActive();
    const pr = rp ? replayPx(s) : px(s); /* demo orders during replay fill at the cursor price */
    const entry = dir==="BUY" ? pr.ask : pr.bid;
    const lb = linkedBroker();
    state.open.push({
      id:"o"+(state.orderSeq++), sym:s, dir, lots, entry, tp, sl,
      time:new Date(),
      mirror: lb ? { broker: lb.name, ms: 40 + Math.round(Math.random()*100) } : null
    });
    renderPositions();
    saveTrades();
    const ot = document.querySelector('#posTabs [data-ptab="open"]'); if(ot) ot.click();
    toast(lb ? "Market "+dir+" filled · Mirrored to "+lb.name+" — demo"
             : "Market "+dir+" "+lots.toFixed(2)+" "+s+" filled"+(rp?" at replay price":"")+" — demo");
  }else{
    const price = parseFloat($("tPrice").value);
    if(isNaN(price) || price<=0){ toast("Enter a valid "+state.ttype+" price — demo"); $("tPrice").focus(); return; }
    const type = (dir==="BUY" ? "Buy " : "Sell ") + (state.ttype==="limit" ? "Limit" : "Stop");
    state.pending.push({ id:"p"+(state.orderSeq++), sym:s, dir, type, lots, price, tp, sl });
    renderPositions();
    saveTrades();
    const ot = document.querySelector('#posTabs [data-ptab="open"]'); if(ot) ot.click();
    toast(type+" placed @ "+fmtP(s,price)+" — fills when price reaches it");
  }
  unlockAch("first_trade");
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
  if(filled.length){ renderPositions(); saveTrades(); }
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
  updateNotifDot();
  if(!state.alerts.length){
    list.innerHTML = '<div class="alerts-empty fine">No alerts yet. Tap “New alert” to get notified when a price crosses your level.</div>';
    return;
  }
  state.alerts.forEach(a=>{
    const r = document.createElement("div");
    r.className = "alert-row" + (a.triggered ? " triggered" : "");
    const IND_LABEL = { rsi_over:"RSI crosses above 70", rsi_under:"RSI crosses below 30", ema_cross_up:"Price crosses above EMA 21", ema_cross_down:"Price crosses below EMA 21" };
    const desc = IND_LABEL[a.cond] ? a.sym+" · "+IND_LABEL[a.cond]
      : a.sym+" "+(a.cond==="above"?"≥":"≤")+" "+fmtP(a.sym,a.price);
    r.innerHTML = '<span class="ic" data-icon="'+(a.triggered?"check":"bell")+'"></span>'+
      '<div><b class="num">'+esc(desc)+'</b>'+
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
  const cond = $("afCond").value;
  const isInd = cond.indexOf("rsi_")===0 || cond.indexOf("ema_")===0;
  const price = parseFloat($("afPrice").value);
  if(!isInd && (isNaN(price) || price<=0)){ toast("Enter a valid alert price — demo"); return; }
  state.alerts.push({ id:"a"+(state.alertSeq++), sym:$("afSym").value, cond, price:isInd?null:price, triggered:false });
  $("alertForm").hidden = true; $("afPrice").value = "";
  renderAlerts(); saveAlerts();
  toast("Alert created — demo");
});
document.addEventListener("click", e=>{
  const d = e.target.closest("[data-adel]"); if(!d) return;
  state.alerts = state.alerts.filter(a=>a.id!==d.dataset.adel);
  renderAlerts(); saveAlerts();
  toast("Alert deleted — demo");
});
/* v25.13: RSI(14)/EMA(21) snapshot for indicator alerts, from cached tick history */
function alertIndVals(sym){
  const h = state.hist[sym] || [];
  if(h.length < 25) return null;
  return { rsi: lastVal(indRSI(h, 14)), ema: lastVal(indEMA(h, 21)), price: h[h.length-1] };
}
function checkAlerts(){
  let hit = false;
  const IND_LABEL = { rsi_over:"RSI > 70", rsi_under:"RSI < 30", ema_cross_up:"Price ×↑ EMA21", ema_cross_down:"Price ×↓ EMA21" };
  state.alerts.forEach(a=>{
    if(a.triggered) return;
    /* v25.13: indicator alerts (RSI / EMA cross), evaluated on the live tick */
    if(IND_LABEL[a.cond]){
      const iv = alertIndVals(a.sym);
      if(iv){
        const prev = a.indPrev || {};
        let sig = false;
        if(a.cond==="rsi_over") sig = iv.rsi!==null && iv.rsi>70 && !(prev.rsi>70);
        if(a.cond==="rsi_under") sig = iv.rsi!==null && iv.rsi<30 && !(prev.rsi<30);
        if(a.cond==="ema_cross_up") sig = iv.ema!==null && iv.price>iv.ema && prev.aboveEma===false;
        if(a.cond==="ema_cross_down") sig = iv.ema!==null && iv.price<iv.ema && prev.aboveEma===true;
        a.indPrev = { rsi:iv.rsi, aboveEma: iv.ema!==null ? iv.price>iv.ema : null };
        if(sig){
          a.triggered = true; hit = true;
          toast("Alert: "+a.sym+" "+IND_LABEL[a.cond]);
          pushNotif("bell", "Indicator alert", a.sym+" "+IND_LABEL[a.cond]+" — tap to view", ()=>{ goTab("trade"); });
        }
      }
      return;
    }
    const bid = px(a.sym).bid;
    if((a.cond==="above" && bid>=a.price) || (a.cond==="below" && bid<=a.price)){
      a.triggered = true; hit = true;
      toast("Alert triggered: "+a.sym+" "+(a.cond==="above"?"≥":"≤")+" "+fmtP(a.sym,a.price));
      pushNotif("bell", "Price alert triggered", a.sym+" "+(a.cond==="above"?"≥":"≤")+" "+fmtP(a.sym,a.price)+" — tap to view", ()=>{ goTab("trade"); setTimeout(()=>{ $("alertsCard").scrollIntoView({behavior:"smooth", block:"center"}); }, 60); });
    }
  });
  if(hit){ renderAlerts(); saveAlerts(); }
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
  state.history.push({ id:"h"+(state.orderSeq++), sym:p.sym, dir:p.dir, lots:p.lots,
    entry:p.entry, exit, pl, time:new Date().toISOString(), reason:reason||null, copy:p.copy||null });
  state.open = state.open.filter(x=>x.id!==p.id);
  saveTrades();
  trackTradeClosed(pl);
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
  const trades = state.history.filter(h=>!h.cash);
  if(!trades.length){ el.innerHTML = '<div class="empty">No closed trades yet.</div>'; return; }
  if(journalView){ renderJournalView(el, trades); return; }
  trades.slice().reverse().forEach(h=>{
    const d = document.createElement("div");
    d.className = "pos-card";
    d.innerHTML =
      '<div class="pos-top"><span class="pos-sym">'+h.sym+'</span>'+
      '<span class="dir '+(h.dir==="BUY"?"buy":"sell")+'">'+h.dir+'</span>'+
      '<span class="pos-lots">'+h.lots.toFixed(2)+' lots</span>'+
      '<button class="hist-note" data-jnote="'+h.id+'" aria-label="Journal note">✎</button></div>'+
      (h.copy?'<div class="copy-badge">📋 copied</div>':"")+
      '<div class="pos-grid">'+
      '<div class="pos-col"><span>Entry</span><b>'+fmtP(h.sym,h.entry)+'</b></div>'+
      '<div class="pos-col"><span>Exit</span><b>'+fmtP(h.sym,h.exit)+'</b></div>'+
      '<div class="pos-col"><span>P/L</span><b class="'+plClass(h.pl)+'">'+fmt$(h.pl)+'</b></div>'+
      '</div>';
    el.appendChild(d);
  });
}
/* v25.13: trade journal — notes + star ratings per closed trade, persisted in tc_journal_v1 */
const JOURNAL_KEY = "tc_journal_v1";
let journal = {};
try{ journal = JSON.parse(localStorage.getItem(JOURNAL_KEY) || "{}") || {}; }catch(e){ journal = {}; }
function saveJournal(){ try{ localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal)); }catch(e){} }
let journalView = false, jnoteId = null, jnoteStars = 0;
function journalEntry(hid){ return journal[hid] || { note:"", stars:0 }; }
function starRow(sel){
  let s = "";
  for(let i=1;i<=5;i++) s += '<button class="jstar'+(i<=sel?" on":"")+'" data-star="'+i+'" aria-label="Rate '+i+' of 5 stars">★</button>';
  return s;
}
function renderJournalView(el, trades){
  trades.slice().reverse().forEach(h=>{
    const e = journalEntry(h.id);
    const d = document.createElement("div");
    d.className = "card jcard";
    d.innerHTML =
      '<div class="jcard-top"><b>'+h.sym+'</b>'+
      '<span class="dir '+(h.dir==="BUY"?"buy":"sell")+'">'+h.dir+'</span>'+
      '<b class="num '+plClass(h.pl)+'">'+fmt$(h.pl)+'</b>'+
      '<button class="ghost-btn sm jnote-edit" data-jnote="'+h.id+'">✎ Note</button></div>'+
      '<div class="jstars ro">'+starRow(e.stars||0).replace(/data-star/g,"data-rstar")+'</div>'+
      (e.note?'<p class="jnote-txt"></p>':'<p class="fine">No note yet — tap ✎ to add one.</p>');
    if(e.note) d.querySelector(".jnote-txt").textContent = e.note;
    el.appendChild(d);
  });
}
function openJournalSheet(hid){
  jnoteId = hid; const e = journalEntry(hid); jnoteStars = e.stars || 0;
  const h = state.history.find(x=>x.id===hid);
  $("jnoteMeta").textContent = h ? (h.sym+" "+h.dir+" · "+fmt$(h.pl)) : "";
  $("jnoteStars").innerHTML = starRow(jnoteStars);
  $("jnoteText").value = e.note || "";
  $("jnoteSheet").hidden = false; $("jnoteBackdrop").hidden = false;
}
function closeJournalSheet(){ $("jnoteSheet").hidden = true; $("jnoteBackdrop").hidden = true; jnoteId = null; }
function toggleJournalView(){
  journalView = !journalView;
  document.querySelectorAll(".journal-toggle").forEach(b=>b.classList.toggle("on", journalView));
  renderPositions(); renderPortfolio();
}
document.addEventListener("click", e=>{
  const jn = e.target.closest("[data-jnote]");
  if(jn){ openJournalSheet(jn.dataset.jnote); return; }
  const st = e.target.closest("[data-star]");
  if(st && jnoteId){ jnoteStars = +st.dataset.star; $("jnoteStars").innerHTML = starRow(jnoteStars); return; }
  const jt = e.target.closest(".journal-toggle");
  if(jt){ toggleJournalView(); return; }
  const bs = e.target.closest("[data-slot]");
  if(bs){
    const s = mentorSlots()[+bs.dataset.slot];
    if(s && bookTrader){
      bookings.push({ traderId:bookTrader.id, traderName:bookTrader.name, slot:s.label, credits:s.credits, bookedAt:Date.now() });
      saveBookings(); const bt = bookTrader; closeBookSheet();
      renderTraderProfile(bt.id);
      toast("Booked "+s.label+" — demo");
    }
    return;
  }
});
$("jnoteX").addEventListener("click", closeJournalSheet);
$("jnoteBackdrop").addEventListener("click", closeJournalSheet);
$("jnoteSave").addEventListener("click", ()=>{
  if(!jnoteId) return;
  journal[jnoteId] = { note:$("jnoteText").value.trim(), stars:jnoteStars };
  saveJournal(); closeJournalSheet();
  renderPositions(); renderPortfolio();
  toast("Note saved — demo");
});
$("bookX").addEventListener("click", closeBookSheet);
$("bookBackdrop").addEventListener("click", closeBookSheet);
/* v25.13: 1-on-1 mentorship booking — demo credits, persisted in tc_bookings_v1 */
const BOOK_KEY = "tc_bookings_v1";
let bookings = [];
try{ bookings = JSON.parse(localStorage.getItem(BOOK_KEY) || "[]") || []; }catch(e){ bookings = []; }
if(!Array.isArray(bookings)) bookings = [];
function saveBookings(){ try{ localStorage.setItem(BOOK_KEY, JSON.stringify(bookings)); }catch(e){} }
function isBooked(tid){ return bookings.some(b=>b.traderId===tid); }
let bookTrader = null;
function mentorSlots(){
  const out = [], times = ["10:00","14:00","18:00"], now = new Date();
  for(let d=1; d<=2 && out.length<6; d++){
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate()+d);
    const label = d===1 ? "Tomorrow" : dt.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
    times.forEach(tm=>{ if(out.length<6) out.push({ label:label+" "+tm, credits:50 }); });
  }
  return out;
}
function openBookSheet(t){
  bookTrader = t;
  $("bookTitle").textContent = "Book 1-on-1 with " + t.name;
  $("bookSub").textContent = isBooked(t.id)
    ? "You already have a demo booking with this trader — pick another slot."
    : "Pick a demo time slot. Paid in demo credits — no real payment.";
  $("bookSlots").innerHTML = mentorSlots().map((s,i)=>
    '<button class="book-slot" data-slot="'+i+'"><b>'+esc(s.label)+'</b><span class="num">50 credits · demo</span></button>').join("");
  $("bookSheet").hidden = false; $("bookBackdrop").hidden = false;
}
function closeBookSheet(){ $("bookSheet").hidden = true; $("bookBackdrop").hidden = true; bookTrader = null; }
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
      renderPositions(); renderPortfolio();
    }
    return;
  }
  const x = e.target.closest("[data-cancel]");
  if(x){
    state.pending = state.pending.filter(o=>o.id!==x.dataset.cancel);
    renderPositions(); renderPortfolio();
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
  renderMyRecs(); /* my session recordings (demo) */
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
  const you = TRADERS.find(t=>t.you), nm = you ? you.name : "You";
  if(youLive.active && myLiveId){
    MQ.publish(MQ_NS+"live/"+myLiveId+"/chat", {from:myDeviceId, name:nm, text:v, ts:Date.now()});
    addChat("You", ": "+v, true);
  }else if(watchingRemote){
    MQ.publish(MQ_NS+"live/"+watchingRemote.liveId+"/chat", {from:myDeviceId, name:nm, text:v, ts:Date.now()});
    addChat("You", ": "+v, true);
  }else addChat("You", v, true);
  inp.value = "";
}
$("copySwitch").addEventListener("click", function(){
  if(copyState.on) stopCopy();
  else openCopyModal("daud"); /* the demo live room hosts @alikhantfx */
});

/* draggable + resizable face-cam, position persisted */
(function(){
  const cam = $("faceCam"), grip = $("fcResize");
  const stage = ()=>cam.parentElement; /* the live stage (.lv-video) — cam is dragged inside it */
  const KEY = "tc_facecam_v1";
  let drag = null, resizing = false, lastTap = 0, tapMoved = false;
  window.restoreFaceCam = function(){
    try{
      const saved = JSON.parse(localStorage.getItem(KEY)||"null");
      if(saved && saved.w){
        cam.style.left = saved.x+"px"; cam.style.top = saved.y+"px";
        cam.style.right = "auto"; cam.style.bottom = "auto";
        cam.style.width = saved.w+"px"; cam.style.height = saved.h+"px";
      }else{
        cam.style.right = "10px"; cam.style.top = "52px"; cam.style.bottom = "auto";
      }
      if(saved && saved.layout){ liveLayoutCur = saved.layout; liveSetup.layout = saved.layout; }
    }catch(e){}
    applyLiveLayout(liveLayoutCur);
  };
  function save(){
    try{
      localStorage.setItem(KEY, JSON.stringify({ x:cam.offsetLeft, y:cam.offsetTop, w:cam.offsetWidth, h:cam.offsetHeight, layout:liveLayoutCur }));
    }catch(e){}
  }
  window.__saveFaceCam = save;
  const SNAP = 24; /* snap-to-corners/edges threshold, px */
  function clamp(){
    const st = stage(); if(!st) return;
    const wr = st.getBoundingClientRect();
    let x = Math.min(Math.max(0, cam.offsetLeft), Math.max(0, wr.width - cam.offsetWidth));
    let y = Math.min(Math.max(0, cam.offsetTop), Math.max(0, wr.height - cam.offsetHeight));
    if(x < SNAP) x = 0; else if(wr.width - cam.offsetWidth - x < SNAP) x = Math.max(0, wr.width - cam.offsetWidth);
    if(y < SNAP) y = 0; else if(wr.height - cam.offsetHeight - y < SNAP) y = Math.max(0, wr.height - cam.offsetHeight);
    cam.style.left = x+"px"; cam.style.top = y+"px";
    cam.style.right = "auto"; cam.style.bottom = "auto";
  }
  const CAM_SIZES = [ {w:76,h:96}, {w:124,h:156}, {w:180,h:226} ]; /* small → medium → large */
  function cycleCamSize(){
    let i = CAM_SIZES.findIndex(s=>Math.abs(s.w - cam.offsetWidth) < 14);
    i = (i+1) % CAM_SIZES.length;
    cam.style.width = CAM_SIZES[i].w+"px"; cam.style.height = CAM_SIZES[i].h+"px";
    clamp(); save();
    toast("Camera size: "+["small","medium","large"][i]+" — demo");
  }
  cam.addEventListener("pointerdown", e=>{
    if(e.target===grip || (e.target.closest && e.target.closest("button"))) return; /* let buttons tap */
    drag = { dx: e.clientX - cam.offsetLeft, dy: e.clientY - cam.offsetTop };
    tapMoved = false;
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
      const wr = stage().getBoundingClientRect();
      cam.style.left = (e.clientX - wr.left - drag.dx)+"px";
      cam.style.top = (e.clientY - wr.top - drag.dy)+"px";
      cam.style.right = "auto"; cam.style.bottom = "auto";
      tapMoved = true;
      clamp();
    }
  });
  ["pointerup","pointercancel"].forEach(ev=>cam.addEventListener(ev, ()=>{
    if(drag && !resizing && !tapMoved){ /* double-tap cycles camera size */
      const now = Date.now();
      if(now - lastTap < 350){ cycleCamSize(); lastTap = 0; }
      else lastTap = now;
    }
    if(drag) save();
    drag = null; resizing = false; tapMoved = false;
  }));
})();

/* ---------------- GO-LIVE STUDIO: layout presets (demo) ---------------- */
const LAYOUTS = [
  { id:"pip", label:"Picture-in-picture" },
  { id:"full", label:"Full camera" },
  { id:"split", label:"Split" },
  { id:"chartfocus", label:"Chart focus" }
];
let liveLayoutCur = "pip";
const HOST_LAYOUTS = { daud:"split", sara:"pip", arjun:"chartfocus" }; /* simulated host studio choices */
function applyLiveLayout(name){
  if(LAYOUTS.every(l=>l.id!==name)) name = "pip";
  liveLayoutCur = name;
  const sc = $("screen-live");
  if(sc){ LAYOUTS.forEach(l=>sc.classList.remove("layout-"+l.id)); sc.classList.add("layout-"+name); }
  if(window.__saveFaceCam) window.__saveFaceCam(); /* persist inside tc_facecam_v1 */
}
function renderLsLayoutChips(){
  const el = $("lsLayoutChips"); if(!el) return;
  el.innerHTML = LAYOUTS.map(l=>'<button class="ls-chip'+(liveSetup.layout===l.id?" on":"")+'" data-ly="'+l.id+'">'+l.label+'</button>').join("");
  el.querySelectorAll("[data-ly]").forEach(b=>b.addEventListener("click", ()=>{
    liveSetup.layout = b.dataset.ly; renderLsLayoutChips();
  }));
}

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
let camHasAudio = false;
async function enableCamera(withAudio){
  if(camStream && (!withAudio || camHasAudio)) return;
  if(camStream) stopCamera(); /* re-acquire when audio is newly required */
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    toast("Camera not supported here — showing placeholder"); return;
  }
  try{
    /* front camera preferred on phones (ideal, not required), default webcam on laptops */
    camStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ ideal:"user" } }, audio:!!withAudio });
    camHasAudio = !!withAudio;
    paintCamUI(true);
    for(const v of camVideoEls()){ try{ await v.play(); }catch(e){ /* mobile browsers need the explicit play() call */ } }
    toast(withAudio ? "Camera + mic on — you're broadcasting" : "Camera on");
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
const liveSetup = { sym:"XAUUSD", title:"", bg:"none", layout:"pip" };
const BG_OPTIONS = [
  { id:"none",   label:"None" },
  { id:"blur",   label:"Blur" },
  { id:"remove", label:"Remove" },
  { id:"desk",   label:"Desk" },
  { id:"city",   label:"City night" },
  { id:"studio", label:"Studio" },
  { id:"charts", label:"Charts" }
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
  const ls = bg ? bg.closest(".ls-cam") : null;
  if(ls) ls.classList.toggle("vid-blur", liveSetup.bg==="blur"); /* REAL blur on the preview video element */
}
/* live face-cam background: "Blur" blurs the video element itself (not just an overlay) */
function applyFaceCamBg(bg){
  const fbg = $("faceCamBg"); if(fbg) fbg.className = "cam-bg bg-"+bg;
  const fc = $("faceCam"); if(fc) fc.classList.toggle("vid-blur", bg==="blur");
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
  renderLsLayoutChips();
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

/* ================= LIVE WORKSTREAM: gifting · scheduled lives · guest · polls · Q&A (all demo) ================= */

/* ---------------- LIVE GIFTING (demo coins — no real value, nothing is purchased) ---------------- */
const GIFTS = [
  { emoji:"🌹", name:"Rose", coins:1 },
  { emoji:"☕", name:"Coffee", coins:5 },
  { emoji:"🚀", name:"Rocket", coins:10 },
  { emoji:"💎", name:"Diamond", coins:25 },
  { emoji:"👑", name:"Crown", coins:50 },
  { emoji:"🏆", name:"Trophy", coins:100 }
];
const GIFT_QTY = [1, 5, 10];
const gifters = {}; /* hostId -> { name: coins } — in-memory per stream */
let giftSel = 0, giftQty = 1;
function curHostId(){ return watchingHost ? watchingHost.id : (youLive.active ? "you" : "daud"); }
function openGiftSheet(){
  giftSel = 0; giftQty = 1; renderGiftGrid();
  $("backdrop").hidden = false; $("giftSheet").hidden = false;
}
function closeGiftSheet(){
  $("giftSheet").hidden = true;
  if($("symbolSheet").hidden && $("notifSheet").hidden) $("backdrop").hidden = true;
}
function renderGiftGrid(){
  const g = $("giftGrid"); if(!g) return;
  g.innerHTML = GIFTS.map((gf,i)=>'<button class="gift-card'+(i===giftSel?" sel":"")+'" data-gift="'+i+'">'+
    '<span class="gift-emoji">'+gf.emoji+'</span><b>'+gf.name+'</b><span class="num">'+gf.coins+' coins</span></button>').join("");
  g.querySelectorAll("[data-gift]").forEach(b=>b.addEventListener("click", ()=>{ giftSel = +b.dataset.gift; renderGiftGrid(); }));
  const q = $("giftQtyRow"); if(q){
    q.innerHTML = GIFT_QTY.map(n=>'<button class="ls-chip'+(n===giftQty?" on":"")+'" data-qty="'+n+'">x'+n+'</button>').join("");
    q.querySelectorAll("[data-qty]").forEach(b=>b.addEventListener("click", ()=>{ giftQty = +b.dataset.qty; renderGiftGrid(); }));
  }
}
function floatGift(emoji, coins){
  const layer = $("liveHearts"); if(!layer) return;
  const s = document.createElement("span");
  s.className = "f-gift";
  s.style.left = (12+Math.random()*70)+"%";
  s.style.setProperty("--dx", (Math.random()*80-40)+"px");
  s.innerHTML = '<b>'+emoji+'</b><i class="num">+'+coins+'</i>';
  layer.appendChild(s);
  setTimeout(()=>s.remove(), 2400);
}
function sendGift(){
  const gf = GIFTS[giftSel], total = gf.coins*giftQty;
  const hid = curHostId();
  gifters[hid] = gifters[hid] || {};
  gifters[hid]["You"] = (gifters[hid]["You"]||0) + total;
  for(let i=0;i<Math.min(giftQty,5);i++) setTimeout(()=>floatGift(gf.emoji, total), i*140);
  closeGiftSheet();
  renderGiftTop();
  toast("Sent "+gf.emoji+" x"+giftQty+" — "+total+" demo coins · no real value");
}
function renderGiftTop(){
  const el = $("giftTop"); if(!el) return;
  const map = gifters[curHostId()] || {};
  const top = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,3);
  if(!top.length){ el.hidden = true; el.innerHTML = ""; return; }
  el.hidden = false;
  el.innerHTML = '<span class="gt-label">Top gifters <i>demo coins · no real value</i></span>' +
    top.map(([name, coins], i)=>'<span class="gt-chip'+(i===0?" first":"")+'">'+(i===0?"👑 ":"")+esc(name)+
      ' <b class="num">'+coins+'</b></span>').join("");
}

/* ---------------- SCHEDULED LIVES + REMINDERS (demo — local to this device) ---------------- */
const SCHED_KEY = "tc_scheduled_v1", REM_KEY = "tc_reminders_v1";
function loadSched(){
  try{ const a = JSON.parse(localStorage.getItem(SCHED_KEY)||"null"); if(Array.isArray(a)) return a; }catch(e){}
  return null;
}
function saveSched(a){ try{ localStorage.setItem(SCHED_KEY, JSON.stringify(a)); }catch(e){} }
function loadRem(){ try{ return JSON.parse(localStorage.getItem(REM_KEY)||"{}")||{}; }catch(e){ return {}; } }
function saveRem(o){ try{ localStorage.setItem(REM_KEY, JSON.stringify(o)); }catch(e){} }
function seedSched(){
  if(loadSched()) return;
  const now = Date.now();
  saveSched([
    { id:"seed-ak", title:"London open scalps", at:new Date(now+2*3600e3+14*60e3).toISOString(), host:"Ali Khan", ini:"AK", g:["#2F80FF","#1B5FD6"] },
    { id:"seed-sm", title:"CPI reaction — live breakdown", at:new Date(now+26*3600e3).toISOString(), host:"Sara Malik", ini:"SM", g:["#B678F0","#5E2B8A"] }
  ]);
}
function fmtCountdown(ms){
  if(ms < 0) return "starting";
  const m = Math.floor(ms/60000), h = Math.floor(m/60), d = Math.floor(h/24);
  if(d>0) return "in "+d+"d "+(h%24)+"h";
  if(h>0) return "in "+h+"h "+(m%60)+"m";
  return "in "+Math.max(m,1)+"m";
}
function upcomingEvents(){
  const now = Date.now();
  return (loadSched()||[]).filter(e=>e && e.at && (new Date(e.at).getTime() > now-15*60e3))
    .sort((a,b)=>new Date(a.at).getTime()-new Date(b.at).getTime());
}
function renderUpcoming(){
  const el = $("upcomingLives"); if(!el) return;
  const rem = loadRem();
  const evs = upcomingEvents();
  if(!evs.length){ el.innerHTML = '<p class="fine">No upcoming lives scheduled.</p>'; return; }
  el.innerHTML = evs.map(e=>{
    const at = new Date(e.at).getTime(), on = !!rem[e.id];
    const dt = new Date(e.at).toLocaleString("en-GB",{ weekday:"short", hour:"2-digit", minute:"2-digit", day:"numeric", month:"short" });
    return '<div class="up-card">'+
      '<span class="up-av" style="--g1:'+(e.g?e.g[0]:"#2F80FF")+';--g2:'+(e.g?e.g[1]:"#1B5FD6")+'">'+esc(e.ini||"•")+'</span>'+
      '<span class="up-tx"><b>'+esc(e.title)+'</b><span class="fine">'+esc(e.host||"")+' · '+esc(dt)+'</span></span>'+
      '<span class="up-when num">'+fmtCountdown(at-Date.now())+'</span>'+
      '<button class="remind-btn'+(on?" on":"")+'" data-rem="'+e.id+'">'+(on?"✓ Remind me":"Remind me")+'</button>'+
      (e.host==="You" ? '<button class="up-x" data-updel="'+e.id+'" aria-label="Cancel scheduled live">✕</button>' : "")+
    '</div>';
  }).join("");
  el.querySelectorAll("[data-rem]").forEach(b=>b.addEventListener("click", ()=>{
    const r = loadRem(), id = b.dataset.rem;
    if(r[id]) delete r[id]; else r[id] = true;
    saveRem(r); renderUpcoming();
    toast(r[id] ? "Reminder set — demo" : "Reminder off — demo");
  }));
  el.querySelectorAll("[data-updel]").forEach(b=>b.addEventListener("click", ()=>{
    saveSched((loadSched()||[]).filter(e=>e.id!==b.dataset.updel));
    renderUpcoming(); toast("Scheduled live cancelled — demo");
  }));
}
function openSchedSheet(){
  const d = new Date(Date.now()+2*3600e3), pad = n=>String(n).padStart(2,"0");
  $("schedAt").value = d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes());
  $("schedTitle").value = "";
  $("backdrop").hidden = false; $("schedSheet").hidden = false;
}
function closeSchedSheet(){
  $("schedSheet").hidden = true;
  if($("symbolSheet").hidden && $("notifSheet").hidden) $("backdrop").hidden = true;
}
function saveSchedForm(){
  const title = ($("schedTitle").value||"").trim().slice(0,60) || "My live stream";
  const v = $("schedAt").value, at = v ? new Date(v) : null;
  if(!at || isNaN(at.getTime()) || at.getTime() < Date.now()-60e3){ toast("Pick a future date & time — demo"); return; }
  const list = loadSched()||[];
  list.push({ id:"u"+Date.now(), title, at:at.toISOString(), host:"You", ini:"YOU", g:["#2F80FF","#1B5FD6"] });
  saveSched(list); closeSchedSheet(); renderUpcoming();
  toast("Live scheduled — demo");
}
const remFired = new Set();
function checkReminders(){
  const rem = loadRem();
  if(!Object.keys(rem).length) return;
  const now = Date.now();
  (loadSched()||[]).forEach(e=>{
    if(!e || !rem[e.id] || remFired.has(e.id)) return;
    const at = new Date(e.at).getTime();
    if(at-now <= 2*60e3 && at-now > -5*60e3){
      remFired.add(e.id);
      toast("📅 "+e.title+" is starting soon — demo");
      pushNotif("bell", "Live starting soon", e.title+" · "+(e.host||"")+" — demo", ()=>goTab("live"));
    }
  });
}

/* ---------------- MULTI-GUEST LIVE (demo — simulated co-host tile, in-memory) ---------------- */
let liveGuest = null;
const GUEST_POOL = [
  { name:"Sara Malik", ini:"SM", g:["#B678F0","#5E2B8A"] },
  { name:"CryptoNadeem", ini:"CN", g:["#5B8DEF","#2B4A8A"] },
  { name:"Ayesha", ini:"AY", g:["#22C55E","#15803D"] },
  { name:"Omar", ini:"OM", g:["#F5A623","#B45309"] },
  { name:"Priya", ini:"PR", g:["#F04452","#B91C1C"] },
  { name:"Khalid", ini:"KH", g:["#2F80FF","#1B5FD6"] }
];
function openInviteSheet(){
  const el = $("inviteList"); if(!el) return;
  const pool = GUEST_POOL.filter(g=>!liveGuest || g.name!==liveGuest.name);
  el.innerHTML = pool.map((g,i)=>
    '<div class="invite-row"><span class="avatar inv-av" style="--g1:'+g.g[0]+';--g2:'+g.g[1]+'">'+g.ini+'</span>'+
    '<span class="invite-tx"><b>'+esc(g.name)+'</b><span class="fine">Viewer · wants to join</span></span>'+
    '<button class="primary-btn sm" data-invite="'+i+'">Invite</button></div>').join("");
  el.querySelectorAll("[data-invite]").forEach(b=>b.addEventListener("click", ()=>inviteGuest(pool[+b.dataset.invite])));
  $("backdrop").hidden = false; $("inviteSheet").hidden = false;
}
function closeInviteSheet(){
  $("inviteSheet").hidden = true;
  if($("symbolSheet").hidden && $("notifSheet").hidden) $("backdrop").hidden = true;
}
function inviteGuest(g){
  if(!g) return;
  liveGuest = g; closeInviteSheet(); renderGuestTile();
  toast(g.name+" joined as co-host — demo");
}
function removeGuest(){
  liveGuest = null; renderGuestTile();
  toast("Co-host removed — demo");
}
function renderGuestTile(){
  const tile = $("guestCam"); if(!tile) return;
  const sc = $("screen-live");
  if(!liveGuest){ tile.hidden = true; if(sc) sc.classList.remove("has-guest"); return; }
  tile.hidden = false;
  if(sc) sc.classList.add("has-guest");
  tile.innerHTML =
    '<div class="gc-grad"></div>'+
    '<span class="gc-av" style="--g1:'+liveGuest.g[0]+';--g2:'+liveGuest.g[1]+'">'+liveGuest.ini+'</span>'+
    '<span class="gc-name">'+esc(liveGuest.name)+'</span>'+
    '<span class="gc-tag">Guest · demo</span>'+
    '<button class="gc-x" id="guestX" aria-label="Remove guest">✕</button>';
  $("guestX").addEventListener("click", e=>{ e.stopPropagation(); removeGuest(); });
}

/* ---------------- LIVE POLLS (demo — in-memory, auto-closes after 60s) ---------------- */
let livePoll = null;
function openPollSheet(){
  $("backdrop").hidden = false; $("pollSheet").hidden = false;
}
function closePollSheet(){
  $("pollSheet").hidden = true;
  if($("symbolSheet").hidden && $("notifSheet").hidden) $("backdrop").hidden = true;
}
function launchPoll(){
  const q = ($("pollQ").value||"").trim().slice(0,80) || "XAUUSD up or down next?";
  const a = ($("pollOptA").value||"").trim().slice(0,24) || "Up";
  const b = ($("pollOptB").value||"").trim().slice(0,24) || "Down";
  if(livePoll) endPollSilent();
  livePoll = { q, opts:[{label:a, votes:3},{label:b, votes:2}], voted:-1, endsAt:Date.now()+60000, closed:false, timer:null, sim:null };
  livePoll.timer = setInterval(()=>{
    if(!livePoll) return;
    if(Date.now() >= livePoll.endsAt) endPoll(); else renderPollCard();
  }, 1000);
  livePoll.sim = setInterval(()=>{ /* simulated viewer votes — demo */
    if(!livePoll || livePoll.closed) return;
    livePoll.opts[Math.floor(Math.random()*2)].votes++;
    renderPollCard();
  }, 2200);
  closePollSheet(); renderPollCard();
  toast("Poll is live — demo");
}
function endPollSilent(){
  if(!livePoll) return;
  if(livePoll.timer) clearInterval(livePoll.timer);
  if(livePoll.sim) clearInterval(livePoll.sim);
  livePoll = null; renderPollCard();
}
function endPoll(){
  if(!livePoll || livePoll.closed) return;
  livePoll.closed = true;
  if(livePoll.timer) clearInterval(livePoll.timer);
  if(livePoll.sim) clearInterval(livePoll.sim);
  renderPollCard();
  toast("Poll ended — demo");
  setTimeout(()=>{ if(livePoll && livePoll.closed){ livePoll = null; renderPollCard(); } }, 12000);
}
function votePoll(i){
  if(!livePoll || livePoll.closed || livePoll.voted>=0) return;
  livePoll.voted = i; livePoll.opts[i].votes++;
  renderPollCard();
}
function renderPollCard(){
  const w = $("livePollWrap"); if(!w) return;
  if(!livePoll){ w.innerHTML = ""; return; }
  const p = livePoll, total = p.opts[0].votes + p.opts[1].votes;
  const secs = p.closed ? 0 : Math.max(0, Math.ceil((p.endsAt-Date.now())/1000));
  w.innerHTML = '<div class="poll-card">'+
    '<div class="poll-head"><b>📊 '+esc(p.q)+'</b><span class="demo-tag">Demo</span></div>'+
    '<div class="poll-timer num">'+(p.closed ? "Poll ended" : "Ends in "+secs+"s")+'</div>'+
    p.opts.map((o,i)=>{
      const pct = total ? Math.round(o.votes/total*100) : 0;
      const mine = p.voted===i, dis = p.closed || p.voted>=0;
      return '<button class="poll-opt'+(mine?" mine":"")+'" data-vote="'+i+'"'+(dis?" disabled":"")+'>'+
        '<span class="poll-bar" style="width:'+pct+'%"></span>'+
        '<span class="poll-tx"><b>'+esc(o.label)+'</b><span class="num">'+pct+'% · '+o.votes+' votes'+(mine?" · you":"")+'</span></span></button>';
    }).join("")+
    (youLive.active && !p.closed ? '<button class="ghost-btn sm" id="pollEnd">End poll</button>' : "")+
  '</div>';
  w.querySelectorAll("[data-vote]").forEach(b=>b.addEventListener("click", ()=>votePoll(+b.dataset.vote)));
  const pe = $("pollEnd"); if(pe) pe.addEventListener("click", endPoll);
}

/* ---------------- LIVE Q&A QUEUE (demo — in-memory per stream) ---------------- */
let qaSeeded = false;
const qaList = [];
function seedQa(){
  if(qaSeeded) return; qaSeeded = true;
  const now = Date.now();
  const t = m=>{ const d = new Date(now-m*60000); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); };
  qaList.push(
    { name:"fxnoob", text:"How do you set your stop loss on gold?", time:t(9), answered:false },
    { name:"Ayesha", text:"Which session is best for XAUUSD scalps?", time:t(5), answered:false },
    { name:"pipmaster", text:"Do you use fixed lot size or risk %?", time:t(2), answered:false }
  );
}
function renderQa(){
  seedQa();
  const row = q=>'<div class="qa-item'+(q.answered?" done":"")+'"><span class="qa-tx"><b>'+esc(q.name)+'</b><span>'+esc(q.text)+'</span></span>'+
    '<span class="qa-time num">'+esc(q.time)+'</span>'+
    (q.answered ? '<span class="qa-done">✓</span>' : '<button class="qa-check" data-qa="'+qaList.indexOf(q)+'" aria-label="Mark answered">✓</button>')+'</div>';
  const open = qaList.filter(q=>!q.answered), done = qaList.filter(q=>q.answered);
  $("qaList").innerHTML = open.length ? open.map(row).join("") : '<p class="fine">No open questions — ask one below.</p>';
  $("qaAnsweredHead").hidden = !done.length;
  $("qaAnswered").innerHTML = done.map(row).join("");
  document.querySelectorAll("[data-qa]").forEach(b=>b.addEventListener("click", ()=>{
    qaList[+b.dataset.qa].answered = true; renderQa(); toast("Marked as answered — demo");
  }));
}
function sendQa(){
  const inp = $("qaInput"), v = inp.value.trim().slice(0,140);
  if(!v) return;
  const d = new Date();
  qaList.unshift({ name:"You", text:v, time:String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"), answered:false });
  inp.value = ""; renderQa();
}

/* ---------------- LIVE POSITIONS STRIP (demo positions under the live stage) ---------------- */
let hostSimPos = [];
function startHostSimPositions(t){
  hostSimPos = (t.trades||[]).slice(0,4).map((tr,i)=>{
    const s = tr.s, pr = px(s), dir = tr.d;
    const entry = dir==="BUY" ? pr.ask*(1-0.0004*(i+1)) : pr.bid*(1+0.0004*(i+1));
    return { id:"hs"+i, sym:s, dir, lots:+(0.05*(i+1)).toFixed(2), entry, tp:null, sl:null };
  });
}
function stopHostSim(){ hostSimPos = []; }
function renderLivePosStrip(){
  const el = $("livePosStrip"); if(!el) return;
  const live = youLive.active || watchingHost;
  if(!live){ el.hidden = true; return; }
  const list = youLive.active ? state.open : hostSimPos;
  if(!list.length){ el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = '<span class="lps-label">demo positions</span>' + list.slice(0,6).map(p=>{
    const v = positionPL(p);
    return '<span class="lps-chip"><b>'+esc(p.sym)+'</b><i class="dir '+(p.dir==="BUY"?"buy":"sell")+'">'+p.dir+'</i>'+
      '<span class="num '+plClass(v)+'">'+fmt$(v)+'</span></span>';
  }).join("");
}

/* host-only live controls (invite / poll / layout switcher) */
function syncHostControls(){
  const host = youLive.active;
  ["inviteBtn","pollBtn"].forEach(id=>{ const el = $(id); if(el) el.hidden = !host; });
  const ll = $("liveLayoutBtn"); if(ll) ll.hidden = !host;
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
  $("screen-live").classList.add("you-live"); /* face cam auto-drops to compact PiP */
  applyFaceCamBg(liveSetup.bg);
  applyLiveLayout(liveSetup.layout);
  syncHostControls();
  renderGiftTop();
  renderLiveNow(); renderHomeLiveRow();
  enableCamera(true); /* camera + mic for the real broadcast; fails gracefully to the placeholder */
  presenceStart(); rtcHostStart();
  if(myLiveId) MQ.subscribe(MQ_NS+"live/"+myLiveId+"/chat", onLiveChatMsg);
  youLive.timerId = setInterval(()=>{
    youLive.viewers = Math.max(50, youLive.viewers + Math.round((Math.random()-0.47)*24));
    youLive.pl += (Math.random()-0.48)*8;
    const realN = rtcViewerCount();
    $("youViewers").textContent = (realN>0 ? realN : youLive.viewers).toLocaleString("en-US");
    $("youTimer").textContent = fmtClock(Date.now()-youLive.startT);
    const plEl = $("youPL");
    plEl.textContent = (youLive.pl>=0?"+$":"−$")+Math.abs(youLive.pl).toFixed(2);
    plEl.className = "num "+(youLive.pl>=0?"pl-pos":"pl-neg");
    renderYouLiveCard();
  }, 1000);
  renderYouLiveCard();
  showLiveHint();
  toast("You are LIVE");
}
function endLive(){
  if(!youLive.active) return;
  youLive.active = false;
  clearInterval(youLive.timerId); youLive.timerId = null;
  $("goLiveBtn").hidden = false;
  $("youLiveBar").hidden = true;
  $("screen-live").classList.remove("you-live"); /* restore your face-cam size/position */
  saveMyRecording(); /* session saved to My recordings (demo) */
  applyFaceCamBg("none");
  applyLiveLayout("pip");
  syncHostControls();
  if(liveGuest){ liveGuest = null; renderGuestTile(); }
  endPollSilent();
  presenceEnd(); rtcHostStop(); stopRemoteWatch();
  renderLiveNow(); renderHomeLiveRow();
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
  startCountdown(); /* 3-2-1 then live */
});
$("liveHintOk").addEventListener("click", ()=>{ $("liveHint").hidden = true; clearTimeout(liveHintTimer); });

/* ================= v25.20: REAL CROSS-DEVICE LIVE (MQTT presence + WebRTC P2P) ================= */
/* Transport: public MQTT broker over secure WebSocket — no account, no backend server.
   Demo-grade but REAL: presence heartbeats, live chat and WebRTC signaling ride MQTT.
   Test override: ?mq=ws://127.0.0.1:9001 */
const MQ_BROKER = (function(){
  try{ const q = new URLSearchParams(location.search).get("mq"); if(q) return q; }catch(e){}
  return "wss://broker.emqx.io:8084/mqtt";
})();
const MQ_NS = "tfx/v1/";
const DEV_KEY = "tc_dev_v1";
let myDeviceId = null;
try{ myDeviceId = localStorage.getItem(DEV_KEY); }catch(e){}
if(!myDeviceId){ myDeviceId = "d"+Math.random().toString(36).slice(2,10); try{ localStorage.setItem(DEV_KEY, myDeviceId); }catch(e){} }

/* ---- minimal MQTT 3.1.1 client over WebSocket (binary frames, QoS 0) ---- */
function mqEncStr(s){
  const b = new TextEncoder().encode(s), o = new Uint8Array(2+b.length);
  o[0] = b.length>>8; o[1] = b.length&255; o.set(b, 2); return o;
}
function mqEncLen(n){
  const o = [];
  do{ let d = n%128; n >>= 7; if(n>0) d |= 0x80; o.push(d); }while(n>0);
  return new Uint8Array(o);
}
function mqConcat(parts){
  let n = 0; parts.forEach(p=>n+=p.length);
  const o = new Uint8Array(n); let at = 0;
  parts.forEach(p=>{ o.set(p, at); at += p.length; });
  return o;
}
function mqPacket(fixedHeader, body){ return mqConcat([new Uint8Array([fixedHeader]), mqEncLen(body.length), body]); }
const MQ = {
  ws:null, connected:false, subs:{}, buf:new Uint8Array(0),
  nextId:1, pingTimer:null, retryTimer:null, backoff:1500,
  onOpen:[], onClose:[],
  connect(){
    if(this.ws && (this.ws.readyState===0 || this.ws.readyState===1)) return;
    let ws;
    try{ ws = new WebSocket(MQ_BROKER); }catch(e){ this.scheduleRetry(); return; }
    ws.binaryType = "arraybuffer";
    this.ws = ws;
    ws.onopen = ()=>{
      const body = mqConcat([
        new Uint8Array([0x00,0x04,0x4D,0x51,0x54,0x54,0x04,0x02,0x00,0x1E]),
        mqEncStr("tfx-"+myDeviceId+"-"+Math.random().toString(36).slice(2,8))
      ]);
      ws.send(mqPacket(0x10, body));
    };
    ws.onmessage = (e)=>{ this.feed(new Uint8Array(e.data)); };
    ws.onclose = ()=>{ this.onDisc(); };
    ws.onerror = ()=>{ try{ ws.close(); }catch(_){} };
  },
  onDisc(){
    const was = this.connected;
    this.connected = false;
    clearInterval(this.pingTimer); this.pingTimer = null;
    if(was) this.onClose.forEach(fn=>{ try{fn();}catch(_){} });
    this.scheduleRetry();
  },
  scheduleRetry(){
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(()=>this.connect(), this.backoff);
    this.backoff = Math.min(this.backoff*1.6, 30000);
  },
  feed(chunk){
    const b = new Uint8Array(this.buf.length+chunk.length);
    b.set(this.buf, 0); b.set(chunk, this.buf.length); this.buf = b;
    for(;;){
      if(this.buf.length<2) return;
      let i = 1, mul = 1, rem = 0, ok = false;
      for(let k=0;k<4;k++){
        if(i>=this.buf.length) return;
        const d = this.buf[i++];
        rem += (d&127)*mul; mul *= 128;
        if(!(d&128)){ ok = true; break; }
      }
      if(!ok) return;
      if(this.buf.length < i+rem) return;
      const type = this.buf[0]>>4, flags = this.buf[0]&0x0F, payload = this.buf.slice(i, i+rem);
      this.buf = this.buf.slice(i+rem);
      this.handle(type, flags, payload);
    }
  },
  handle(type, flags, p){
    if(type===2){ /* CONNACK */
      if(p.length>=2 && p[1]===0){
        this.connected = true; this.backoff = 1500;
        Object.keys(this.subs).forEach(t=>this.subRaw(t));
        this.onOpen.forEach(fn=>{ try{fn();}catch(_){} });
        clearInterval(this.pingTimer);
        this.pingTimer = setInterval(()=>{ try{ this.ws.send(new Uint8Array([0xC0,0x00])); }catch(_){} }, 20000);
      } else this.scheduleRetry();
      return;
    }
    if(type===3){ /* PUBLISH qos0 */
      if(p.length<2) return;
      const tl = (p[0]<<8)|p[1];
      if(p.length<2+tl) return;
      const topic = new TextDecoder().decode(p.slice(2, 2+tl));
      const data = p.slice(2+tl);
      let msg = null;
      try{ msg = JSON.parse(new TextDecoder().decode(data)); }catch(_){ return; }
      Object.keys(this.subs).forEach(sub=>{
        if(mqTopicMatch(sub, topic)) this.subs[sub].forEach(cb=>{ try{cb(topic, msg);}catch(_){} });
      });
      return;
    }
    /* 9 SUBACK, 13 PINGRESP: ignored */
  },
  subRaw(topic){
    const id = this.nextId++;
    const body = mqConcat([new Uint8Array([id>>8, id&255]), mqEncStr(topic), new Uint8Array([0])]);
    try{ this.ws.send(mqPacket(0x82, body)); }catch(_){}
  },
  subscribe(topic, cb){
    (this.subs[topic] = this.subs[topic] || []).push(cb);
    if(this.connected) this.subRaw(topic);
  },
  publish(topic, obj, retain){
    if(!this.connected) return;
    let bytes;
    try{ bytes = new TextEncoder().encode(JSON.stringify(obj)); }catch(_){ return; }
    const body = mqConcat([mqEncStr(topic), bytes]);
    try{ this.ws.send(mqPacket(0x30 | (retain?1:0), body)); }catch(_){}
  }
};
function mqTopicMatch(sub, topic){
  const s = sub.split("/"), t = topic.split("/");
  for(let i=0;i<s.length;i++){
    if(s[i]==="#") return true;
    if(t[i]===undefined) return false;
    if(s[i]!=="+" && s[i]!==t[i]) return false;
  }
  return s.length===t.length;
}

/* ---- live presence (who's actually live on another device) ---- */
const remoteLives = {}; /* liveId -> presence payload */
let myLiveId = null, presenceTimer = null, pruneTimer = null;
function mqInit(){
  MQ.subscribe(MQ_NS+"live/+/state", onPresenceMsg);
  MQ.connect();
  pruneTimer = setInterval(pruneLives, 10000);
  window.addEventListener("beforeunload", ()=>{ try{ presenceEnd(); }catch(_){} });
}
function onPresenceMsg(topic, msg){
  const parts = topic.split("/");
  const liveId = parts[3];
  if(!msg || msg.status==="ended" || liveId===myLiveId){ delete remoteLives[liveId]; }
  else if(msg.v===1){ remoteLives[liveId] = msg; }
  renderHomeLiveRow(); renderLiveNow();
  if(watchingRemote && !remoteLives[watchingRemote.liveId]){
    toast("That live ended"); stopRemoteWatch();
  }
}
function pruneLives(){
  const now = Date.now(); let changed = false;
  for(const k in remoteLives){ if(now-(remoteLives[k].ts||0)>45000){ delete remoteLives[k]; changed = true; } }
  if(changed){ renderHomeLiveRow(); renderLiveNow(); }
  if(watchingRemote && !remoteLives[watchingRemote.liveId]){ toast("That live ended"); stopRemoteWatch(); }
}
function presencePayload(){
  const you = TRADERS.find(t=>t.you) || {};
  return { v:1, liveId:myLiveId, device:myDeviceId,
    name:you.name||"Trader", handle:you.handle||"", ini:you.ini||"TR",
    g:you.g||["#2F80FF","#1B5FD6"],
    title:liveSetup.title||"", sym:liveSetup.sym||"XAUUSD",
    ts:Date.now(), viewers:rtcViewerCount() };
}
function presenceStart(){
  myLiveId = myDeviceId+"-"+Date.now().toString(36);
  MQ.publish(MQ_NS+"live/"+myLiveId+"/state", presencePayload(), true);
  clearInterval(presenceTimer);
  presenceTimer = setInterval(()=>{ if(youLive.active) MQ.publish(MQ_NS+"live/"+myLiveId+"/state", presencePayload(), true); }, 15000);
}
function presenceEnd(){
  if(myLiveId) MQ.publish(MQ_NS+"live/"+myLiveId+"/state", {status:"ended", ts:Date.now()}, true);
  clearInterval(presenceTimer); presenceTimer = null; myLiveId = null;
}

/* ---- go-live countdown: 3 · 2 · 1 · LIVE ---- */
let cdTimers = [];
function startCountdown(){
  const ov = $("liveCountdown"), num = $("cdNum"), sub = $("cdSub");
  cdTimers.forEach(clearTimeout); cdTimers = [];
  ov.hidden = false; sub.textContent = "Going live…"; num.classList.remove("go");
  enableCamera(true); /* warm up camera + mic during the countdown */
  const seq = ["3","2","1"];
  seq.forEach((s, i)=>{
    cdTimers.push(setTimeout(()=>{
      num.textContent = s;
      num.style.animation = "none"; void num.offsetWidth; num.style.animation = "";
    }, i*850));
  });
  cdTimers.push(setTimeout(()=>{
    num.textContent = "LIVE"; num.classList.add("go");
    num.style.animation = "none"; void num.offsetWidth; num.style.animation = "";
    sub.textContent = "You're on air";
  }, seq.length*850));
  cdTimers.push(setTimeout(()=>{ ov.hidden = true; startLive(); }, seq.length*850+750));
}

/* ---- TikTok-style live circles on the Home top ---- */
function fmtViewers(n){ n = +n||0; return n>=1000 ? (n/1000).toFixed(1).replace(/\.0$/,"")+"K" : String(n); }
function renderHomeLiveRow(){
  const el = $("homeLiveRow"); if(!el) return;
  const you = TRADERS.find(t=>t.you) || {};
  const items = [];
  if(youLive.active) items.push({kind:"you", id:"you", name:"You", ini:you.ini||"YOU", g:you.g});
  Object.values(remoteLives).forEach(info=>items.push({kind:"remote", id:info.liveId, name:info.name, ini:info.ini, g:info.g, viewers:info.viewers}));
  TRADERS.filter(t=>!t.you && t.live).forEach(t=>items.push({kind:"demo", id:t.id, name:String(t.name).split(" ")[0], ini:t.ini, g:t.g}));
  el.hidden = !items.length;
  el.innerHTML = items.map(it=>
    '<button class="lc-item" data-kind="'+it.kind+'" data-id="'+esc(it.id)+'">'+
    '<span class="lc-ring'+(it.kind==="you"?" you":"")+'"><span class="lc-av" style="--g1:'+(it.g?it.g[0]:"#2F80FF")+';--g2:'+(it.g?it.g[1]:"#1B5FD6")+'">'+esc(String(it.ini||"?").slice(0,2))+'</span><span class="lc-live">LIVE</span></span>'+
    '<span class="lc-name">'+esc(it.kind==="you" ? "You" : String(it.name).split(" ")[0])+'</span>'+
    (it.viewers!=null ? '<span class="lc-viewers num">'+fmtViewers(it.viewers)+'</span>' : "")+
    '</button>').join("");
  el.querySelectorAll(".lc-item").forEach(b=>b.addEventListener("click", ()=>{
    const k = b.dataset.kind, id = b.dataset.id;
    if(k==="you"){ goTab("live"); }
    else if(k==="remote"){ watchRemoteLive(id); }
    else if(watchingHost && watchingHost.id===id){ stopWatching(); }
    else watchTraderLive(id);
  }));
}

/* ---- WebRTC: host side (broadcast your camera to real viewers) ---- */
const rtcHost = { pcs:{} };
function rtcViewerCount(){ return Object.keys(rtcHost.pcs).length; }
function rtcHostStart(){
  if(!myLiveId || !window.RTCPeerConnection) return;
  MQ.subscribe(MQ_NS+"live/"+myLiveId+"/sig/host", onHostSig);
}
function onHostSig(topic, msg){
  if(!msg || !msg.t) return;
  if(msg.t==="join" && msg.offer && msg.viewerId) hostAnswer(msg.viewerId, msg.offer);
  else if(msg.t==="ice" && msg.from && msg.candidate){
    const pc = rtcHost.pcs[msg.from];
    if(pc) pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(()=>{});
  }
  else if(msg.t==="bye" && msg.from) hostDrop(msg.from);
}
async function hostAnswer(viewerId, offer){
  hostDrop(viewerId);
  let pc;
  try{ pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]}); }
  catch(e){ return; }
  rtcHost.pcs[viewerId] = pc;
  try{
    if(camStream) camStream.getTracks().forEach(tr=>pc.addTrack(tr, camStream));
    pc.onicecandidate = e=>{
      if(e.candidate && e.candidate.candidate) MQ.publish(MQ_NS+"live/"+myLiveId+"/sig/"+viewerId,
        {t:"ice", from:"host", to:viewerId, candidate:e.candidate.toJSON()});
    };
    pc.onconnectionstatechange = ()=>{
      const st = pc.connectionState;
      if(st==="failed" || st==="closed") hostDrop(viewerId);
      else if(st==="disconnected") setTimeout(()=>{ if(pc.connectionState==="disconnected") hostDrop(viewerId); }, 15000);
    };
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const ans = await pc.createAnswer();
    await pc.setLocalDescription(ans);
    MQ.publish(MQ_NS+"live/"+myLiveId+"/sig/"+viewerId, {t:"answer", to:viewerId, sdp:pc.localDescription});
  }catch(err){ hostDrop(viewerId); }
}
function hostDrop(viewerId){
  const pc = rtcHost.pcs[viewerId];
  if(pc){ try{ pc.close(); }catch(_){} delete rtcHost.pcs[viewerId]; }
}
function rtcHostStop(){ Object.keys(rtcHost.pcs).forEach(hostDrop); }

/* ---- WebRTC: viewer side (watch a real live from another device) ---- */
let watchingRemote = null; /* {liveId, info, pc, viewerId} */
async function watchRemoteLive(liveId){
  const info = remoteLives[liveId];
  if(!info){ toast("That live just ended"); return; }
  stopWatching(); stopRemoteWatch();
  if(!window.RTCPeerConnection){ toast("Live video not supported on this device"); return; }
  const viewerId = myDeviceId;
  const pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
  watchingRemote = {liveId, info, pc, viewerId};
  const rv = $("remoteVideo");
  pc.ontrack = e=>{
    if(rv){ rv.srcObject = e.streams[0]; rv.hidden = false; try{ rv.play(); }catch(_){} }
  };
  pc.onicecandidate = e=>{
    if(e.candidate && e.candidate.candidate) MQ.publish(MQ_NS+"live/"+liveId+"/sig/host",
      {t:"ice", from:viewerId, to:"host", candidate:e.candidate.toJSON()});
  };
  pc.onconnectionstatechange = ()=>{
    if(pc.connectionState==="failed"){ toast("Couldn't connect to that live"); stopRemoteWatch(); }
  };
  MQ.subscribe(MQ_NS+"live/"+liveId+"/sig/"+viewerId, onViewerSig);
  MQ.subscribe(MQ_NS+"live/"+liveId+"/chat", onLiveChatMsg);
  try{
    pc.addTransceiver("video", {direction:"recvonly"});
    pc.addTransceiver("audio", {direction:"recvonly"});
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    MQ.publish(MQ_NS+"live/"+liveId+"/sig/host", {t:"join", viewerId, offer:pc.localDescription});
  }catch(err){ toast("Couldn't connect to that live"); stopRemoteWatch(); return; }
  goTab("live");
  paintRemoteWatch();
  toast("Watching "+info.name+" live");
}
function onViewerSig(topic, msg){
  if(!watchingRemote || !msg || !msg.t) return;
  const pc = watchingRemote.pc;
  if(msg.t==="answer" && msg.sdp) pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)).catch(()=>{});
  else if(msg.t==="ice" && msg.candidate) pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(()=>{});
}
function onLiveChatMsg(topic, msg){
  if(!msg || !msg.text || msg.from===myDeviceId) return;
  addChat(msg.name||"Trader", ": "+String(msg.text).slice(0,140), false);
}
function paintRemoteWatch(){
  const info = watchingRemote.info, bar = $("watchBar");
  if(bar){
    bar.hidden = false;
    $("watchBarTxt").innerHTML = '🔴 Watching <b>'+esc(info.name)+'</b> live <span class="live-pill sm">LIVE</span>';
  }
  const sl = $("screen-live"); if(sl) sl.classList.add("watching-remote");
  const cam = $("faceCam"); if(cam) cam.style.display = "none";
  const tag = $("faceCamTag"); if(tag) tag.hidden = true;
  renderLiveNow(); renderHomeLiveRow();
}
function stopRemoteWatch(){
  if(!watchingRemote) return;
  try{ MQ.publish(MQ_NS+"live/"+watchingRemote.liveId+"/sig/host", {t:"bye", from:watchingRemote.viewerId}); }catch(_){}
  try{ watchingRemote.pc.close(); }catch(_){}
  watchingRemote = null;
  const rv = $("remoteVideo"); if(rv){ try{ rv.srcObject = null; }catch(_){} rv.hidden = true; }
  const sl = $("screen-live"); if(sl) sl.classList.remove("watching-remote");
  const cam = $("faceCam"); if(cam) cam.style.display = "";
  const bar = $("watchBar"); if(bar) bar.hidden = true;
  renderLiveNow(); renderHomeLiveRow();
}

/* ---------------- MY SESSION RECORDINGS (demo) ---------------- */
const MYREC_KEY = "tc_my_recordings_v1";
function myRecs(){
  try{ return JSON.parse(localStorage.getItem(MYREC_KEY)||"[]"); }catch(e){ return []; }
}
function saveMyRecording(){
  if(!youLive.startT) return;
  const rec = {
    title: liveSetup.title || (liveSetup.sym + " · Live scalps"),
    sym: liveSetup.sym,
    dur: fmtClock(Date.now()-youLive.startT),
    at: new Date().toISOString().slice(0,10)
  };
  const arr = [rec].concat(myRecs()).slice(0,20);
  try{ localStorage.setItem(MYREC_KEY, JSON.stringify(arr)); }catch(e){}
  renderMyRecs();
  toast("Recording saved — demo");
}
function renderMyRecs(){
  const el = $("myRecStrip"); if(!el) return;
  const arr = myRecs();
  if(!arr.length){ el.hidden = true; el.innerHTML = ""; return; }
  el.hidden = false;
  el.innerHTML = '<div class="myrec-head"><b>My session recordings</b><span class="demo-tag">Demo</span></div>' +
    arr.map(r=>'<div class="myrec-row"><span class="myrec-play">▶</span>'+
      '<div class="myrec-info"><b>'+esc(r.title)+'</b><span>'+esc(r.sym)+' · '+esc(r.dur)+' · '+esc(r.at)+'</span></div></div>').join("");
}

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
    '<div class="yl-main">'+avImg(TRADERS.find(t=>t.you)||{ini:"YOU",g:["#2F80FF","#1B5FD6"]})+
    '<div><b>'+esc(liveSetup.title || (liveSetup.sym+" · Live scalps"))+'</b><span class="tstat">Today <b class="'+plCls+'">'+plTxt+'</b> · '+liveSetup.sym+' scalps</span></div>'+
    '<button class="primary-btn sm" id="youLiveWatch">Watch</button></div>'+
    '<p class="fine">Demo broadcast — viewers and profit are simulated.</p>';
  $("youLiveWatch").addEventListener("click", ()=>goTab("live"));
}

/* ---------------- COMMUNITY (social) ---------------- */
const TRADERS = [
  { id:"daud", ret:284.5, name:"Ali Khan", handle:"@alikhantfx", ini:"AK", pic:"https://randomuser.me/api/portraits/men/32.jpg", g:["#2F80FF","#1B5FD6"],
    bio:"XAUUSD scalper · London session · 8 yrs trading", following:false, followers:48200, followingN:312,
    win:67, pl:4210, live:true,
    trades:[ {s:"XAUUSD",d:"BUY",pl:184.20},{s:"EURUSD",d:"SELL",pl:96.40},{s:"BTCUSD",d:"BUY",pl:-58.10} ] },
  { id:"sara", ret:187.2, name:"Sara Malik", handle:"@saramalik", ini:"SM", pic:"https://randomuser.me/api/portraits/women/44.jpg", g:["#B678F0","#5E2B8A"],
    bio:"FX swing trader · fundamentals + technicals", following:false, followers:21700, followingN:428,
    win:61, pl:2980, live:false,
    trades:[ {s:"EURUSD",d:"BUY",pl:142.80},{s:"GBPUSD",d:"BUY",pl:88.20},{s:"USDJPY",d:"SELL",pl:-34.50} ] },
  { id:"arjun", ret:142.1, name:"CryptoNadeem", handle:"@cryptonadeem", ini:"CN", pic:"https://randomuser.me/api/portraits/men/45.jpg", g:["#5B8DEF","#2B4A8A"],
    bio:"Crypto + indices · risk-first, always", following:false, followers:15300, followingN:196,
    win:58, pl:2140, live:false,
    trades:[ {s:"BTCUSD",d:"BUY",pl:212.60},{s:"NAS100",d:"SELL",pl:74.30},{s:"ETHUSD",d:"BUY",pl:-41.20} ] },
  { id:"lena", ret:118.6, name:"Nadia Trades", handle:"@nadiatrades", ini:"NT", pic:"https://randomuser.me/api/portraits/women/68.jpg", g:["#22C55E","#166534"],
    bio:"Gold & silver specialist · patient entries", following:false, followers:9800, followingN:154,
    win:64, pl:1875, live:false,
    trades:[ {s:"XAUUSD",d:"SELL",pl:118.90},{s:"XAGUSD",d:"BUY",pl:62.40},{s:"XAUUSD",d:"BUY",pl:-28.70} ] },
  { id:"hassan", ret:96.4, name:"FX_Hassan", handle:"@fx_hassan", ini:"FH", pic:"https://randomuser.me/api/portraits/men/54.jpg", g:["#F0A05B","#8A4A1B"],
    bio:"Intraday FX · London & New York", following:false, followers:9300, followingN:188,
    win:59, pl:1620, live:false,
    trades:[ {s:"GBPUSD",d:"BUY",pl:96.20},{s:"EURUSD",d:"SELL",pl:54.80},{s:"USDJPY",d:"BUY",pl:-22.40} ] },
  { id:"zeeshan", ret:84.2, name:"Zeeshan", handle:"@zeeshanfx", ini:"ZK", pic:"https://randomuser.me/api/portraits/men/67.jpg", g:["#5BC8F0","#1B5F8A"],
    bio:"Scalper · gold & indices", following:false, followers:4100, followingN:96,
    win:57, pl:1180, live:false,
    trades:[ {s:"XAUUSD",d:"BUY",pl:72.40},{s:"NAS100",d:"SELL",pl:48.10},{s:"XAUUSD",d:"SELL",pl:-18.90} ] },
  { id:"baba", ret:72.1, name:"ForexBaba", handle:"@forexbaba", ini:"FB", pic:"https://randomuser.me/api/portraits/men/75.jpg", g:["#B6F05B","#4A8A1B"],
    bio:"Swing trader · majors & crosses", following:false, followers:6900, followingN:142,
    win:55, pl:940, live:false,
    trades:[ {s:"EURUSD",d:"BUY",pl:64.20},{s:"AUDUSD",d:"SELL",pl:38.60},{s:"GBPUSD",d:"BUY",pl:-15.30} ] },
  { id:"malik", ret:64.3, name:"Malik FX", handle:"@malikfx", ini:"MF", pic:"https://randomuser.me/api/portraits/men/22.jpg", g:["#F05B8A","#8A1B4A"],
    bio:"Crypto scalps · BTC & ETH", following:false, followers:3800, followingN:88,
    win:54, pl:720, live:false,
    trades:[ {s:"BTCUSD",d:"BUY",pl:88.40},{s:"ETHUSD",d:"SELL",pl:32.10},{s:"BTCUSD",d:"SELL",pl:-24.60} ] },
];
/* ---- ADMIN OVERRIDES (admin.html writes these keys; applied first, before any render) ---- */
try{
  const tEdit = JSON.parse(localStorage.getItem("tc_traders_edit_v1")||"[]");
  if(Array.isArray(tEdit)) tEdit.forEach(o=>{ const t = TRADERS.find(x=>x.id===o.id); if(t) Object.assign(t, o); });
  const tAdd = JSON.parse(localStorage.getItem("tc_traders_add_v1")||"[]");
  if(Array.isArray(tAdd)) tAdd.forEach(o=>{ if(o && o.id && !TRADERS.find(x=>x.id===o.id)) TRADERS.push(o); });
  const tHide = JSON.parse(localStorage.getItem("tc_traders_hide_v1")||"[]");
  if(Array.isArray(tHide)) for(let i=TRADERS.length-1;i>=0;i--) if(tHide.indexOf(TRADERS[i].id)>=0) TRADERS.splice(i,1);
}catch(e){}
const fmtK = n => n>=1000 ? (n/1000).toFixed(1).replace(/\.0$/,"")+"k" : String(n);
/* avatar with photo (falls back to initials if the photo fails) —
   the initial sits underneath; the photo absolutely covers it so it can never peek out */
function avImg(t, cls, extra){
  const c = "avatar" + (cls ? " " + cls : "");
  const g = ' style="background:linear-gradient(135deg,'+t.g[0]+','+t.g[1]+')"';
  const img = t.pic ? '<img src="'+t.pic+'" alt="" loading="lazy" onerror="this.remove()">' : "";
  return '<div class="'+c+'"'+g+'><span class="av-ini">'+t.ini+'</span>'+img+(extra||"")+'</div>';
}
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
      avImg(t, "", (t.live ? '<span class="trader-live">LIVE</span>' : ''))+
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
    avImg(TRADERS.find(t=>t.you)||{ini:"YOU",g:["#2F80FF","#1B5FD6"]})+
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
    comments:[ {n:"Nadia Trades", t:"That 98k level held beautifully.", time:"2h"}, {n:"Ali Khan", t:"Patience pays.", time:"1h"} ] },
];
function traderOf(p){ return TRADERS.find(t=>t.id===p.tid) || TRADERS[0]; }
function postCard(p){
  const t = traderOf(p);
  const c = document.createElement("div");
  c.className = "card post";
  c.innerHTML =
    '<div class="post-head"><div class="post-id" data-tprof="'+t.id+'">'+avImg(t)+
    '<div><b>'+esc(t.name)+'</b><span>'+esc(t.handle)+' · '+p.time+'</span></div></div>'+
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
  ["postList","communityPosts"].forEach(id=>{
    const list = $(id); if(!list) return;
    list.innerHTML = "";
    MOCK_POSTS.forEach(p=>list.appendChild(postCard(p)));
  });
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

/* v25.13: weekly demo contest — deterministic seeded P/L per trader + ISO week */
function isoWeekNum(){
  const d = new Date(); d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - w1) / 864e5 - 3 + ((w1.getDay() + 6) % 7)) / 7);
}
function weeklyPL(t){
  const r = mulberry32(hashSeed(t.id + ":" + new Date().getFullYear() + "W" + isoWeekNum()));
  const base = Math.max(60, (t.pl || 800) / 20);
  return Math.round((r()*2 - 0.9) * base * (1.25 - (t.win || 55) / 200));
}
function renderContest(){
  const el = $("contestRows"); if(!el) return;
  try{ const cfg = JSON.parse(localStorage.getItem("tc_contest_v1")||"null");
    if(cfg && cfg.prize){ const s = $("contestSub"); if(s) s.textContent = cfg.prize; }
  }catch(e){}
  const youT = TRADERS.find(t=>t.you) || { name:"You", ini:"AT", g:["#2F80FF","#1B5FD6"] };
  const rows = TRADERS.filter(t=>!t.you).map(t=>({ t, pl:weeklyPL(t), you:false }));
  rows.push({ t:youT, pl:Math.round(yourTodayPL()), you:true });
  rows.sort((a,b)=>b.pl-a.pl);
  el.innerHTML = rows.map((r,i)=>
    '<div class="rank-row'+(r.you?' you-row':'')+'">'+
    '<span class="rank-n'+(i<3?' medal-'+(i+1):'')+'">'+(i+1)+'</span>'+
    '<span class="rank-id">'+avImg(r.t,"sm")+
    '<span><b>'+(r.you?"You":esc(r.t.name))+'</b><span class="fine">this week · demo</span></span></span>'+
    '<span class="rank-val num '+(r.pl>=0?"pl-pos":"pl-neg")+'">'+(r.pl>=0?"+":"−")+'$'+Math.abs(r.pl).toLocaleString("en-US")+'</span>'+
    '</div>').join("");
}

/* v25.13: owner announcements — pinned at the top of the Community screen */
const OWNER_POSTS = [
  { id:"ann1", tag:"Contest", time:"2h",
    body:"Welcome to the Trading Community demo! Our first Weekly Demo Contest is now live — climb the leaderboard with your demo P/L. Prizes will be announced soon. Everything here is simulated — good luck, traders!" },
  { id:"ann2", tag:"Analysis", time:"5h",
    body:"NFP Friday: expecting a hot print on the headline number, but watch wage growth — a soft print there could spark a fast reversal in gold. My plan: wait for the spike, fade the exhaustion. Full breakdown in the live session. Not financial advice — demo community." }
];
function getOwnerPosts(){
  /* admin.html writes tc_announce_v1 — checked first so owner posts update live on this device */
  try{ const o = JSON.parse(localStorage.getItem("tc_announce_v1")||"null"); if(Array.isArray(o) && o.length) return o; }catch(e){}
  return OWNER_POSTS;
}
function renderOwnerPosts(){
  const el = $("ownerAnnounce"); if(!el) return;
  const posts = getOwnerPosts();
  el.innerHTML = '<div class="announce-head"><span>📌</span><b>Announcements</b><span class="demo-tag">Demo</span></div>' +
    posts.map(p=>
      '<div class="card announce-card">'+
      '<div class="announce-top"><span class="owner-tag">Owner</span><span class="verified">✓</span>'+
      '<span class="fine">'+esc(p.time||"now")+' · '+esc(p.tag||"Update")+'</span></div>'+
      '<p class="announce-body"></p></div>').join("");
  el.querySelectorAll(".announce-body").forEach((b,i)=>{ b.textContent = posts[i].body||""; });
}

/* ---------------- COMMUNITY SCREEN ---------------- */
let communityTab = "traders", lbPeriod = "30D";
function periodJitter(id, period){
  let h = 0; const s = id + period;
  for(let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) >>> 0;
  return 0.85 + (h % 30) / 100; /* deterministic 0.85–1.14 */
}
function renderCommunityTraders(){
  const lists = [$("communityTraders"), $("leaderboardPageList")].filter(Boolean);
  if(!lists.length) return;
  const rows = TRADERS.filter(t=>!t.you).slice()
    /* v25.13: approved Verified Pro traders get a small leaderboard rank boost (render-only, demo) */
    .sort((a,b)=> (b.ret*periodJitter(b.id,lbPeriod)+verifyBoost(b.handle)) - (a.ret*periodJitter(a.id,lbPeriod)+verifyBoost(a.handle)));
  lists.forEach(list=>{
    list.innerHTML = "";
    rows.forEach((t,i)=>{
      const r = document.createElement("div");
      r.className = "rank-row";
      r.innerHTML =
        '<span class="rank-n'+(i<3?' medal-'+(i+1):'')+'">'+(i+1)+'</span>'+
        '<button class="rank-id" data-tprof="'+t.id+'">'+avImg(t,"sm")+
        '<span><b>'+esc(t.name)+(typeof verifiedSet==="function"&&verifiedSet().has(String(t.handle||"").toLowerCase())?' <span class="verified" title="Verified Pro · demo">✓</span>':'')+'</b><span class="fine">'+fmtK(t.followers)+' followers</span></span></button>'+
        '<span class="rank-val num pl-pos">+'+(t.ret*periodJitter(t.id,lbPeriod)).toFixed(1)+'%</span>'+
        '<button class="copy-btn" data-copytrader="'+t.id+'">Copy</button>';
      list.appendChild(r);
    });
  });
  injectIcons();
}
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-copytrader]"); if(!b) return;
  e.stopPropagation();
  openCopyModal(b.dataset.copytrader);
});
$("communityTabs").addEventListener("click", e=>{
  const b = e.target.closest("[data-ctab]"); if(!b) return;
  communityTab = b.dataset.ctab;
  document.querySelectorAll("#communityTabs .ctab").forEach(x=>x.classList.toggle("active", x===b));
  ["traders","feed","ideas","reels"].forEach(t=>{
    const p = $("cpage-"+t); if(!p) return;
    p.hidden = t !== communityTab;
    p.classList.toggle("active", t === communityTab);
  });
});
$("periodPills").addEventListener("click", e=>{
  const b = e.target.closest("[data-period]"); if(!b) return;
  lbPeriod = b.dataset.period;
  document.querySelectorAll("#periodPills .ppill").forEach(x=>x.classList.toggle("active", x===b));
  renderCommunityTraders();
});
/* desktop community composer */
function publishDeskPost(){
  const inp = $("composerDeskInput"); if(!inp) return;
  const v = inp.value.trim(); if(!v){ toast("Write something first"); return; }
  MOCK_POSTS.unshift({ id:"p"+Date.now(), tid:"you", time:"now", likes:0, liked:false, body:v, comments:[] });
  inp.value = "";
  renderPosts();
  toast("Posted — demo");
}
$("composerDeskPost").addEventListener("click", publishDeskPost);
$("composerDeskInput").addEventListener("keydown", e=>{ if(e.key==="Enter") publishDeskPost(); });

/* ---------------- PORTFOLIO SCREEN ---------------- */
function pfSetVisible(hidden){
  const b = $("pfBalance"), s = $("pfBalanceSub");
  [b,s].forEach(el=>{ if(el) el.classList.toggle("masked", hidden); });
}
$("pfEye").addEventListener("click", ()=>{
  const b = $("pfBalance");
  pfSetVisible(!b.classList.contains("masked"));
});
function renderPfSpark(){
  const svg = $("pfSpark"); if(!svg) return;
  const m = TRADERS[0].monthly, max = Math.max(...m), min = Math.min(...m);
  const pts = m.map((v,i)=>[ (i/(m.length-1)*200).toFixed(1), (44 - (v-min)/(max-min)*40).toFixed(1) ]);
  const d = "M"+pts.map(p=>p.join(",")).join(" L");
  svg.innerHTML = '<path d="'+d+' L200,48 L0,48 Z" fill="rgba(255,255,255,.18)"/><path d="'+d+'" fill="none" stroke="#fff" stroke-width="2"/>';
}
function symIcon(sym){
  const m = { XAUUSD:"🪙", XAGUSD:"⚪", BTCUSD:"₿", ETHUSD:"Ξ", EURUSD:"🇪🇺", GBPUSD:"🇬🇧",
    USDJPY:"🇯🇵", USDCHF:"🇨🇭", USDCAD:"🇨🇦", AUDUSD:"🇦🇺", NZDUSD:"🇳🇿",
    US30:"🇺🇸", NAS100:"🇺🇸", SPX500:"🇺🇸", USOIL:"🛢️", UKOIL:"🛢️" };
  return m[sym] || esc(String(sym).slice(0,1));
}
function posPct(p){
  const pr = px(p.sym);
  const diff = p.dir==="BUY" ? pr.bid - p.entry : p.entry - pr.ask;
  return p.entry ? diff/p.entry*100 : 0;
}
const PF_EMPTY_CTA = '<div class="empty">{msg}<br><button class="primary-btn empty-cta" data-goto="trade">Start Trading</button></div>';
function renderPortfolio(){
  /* sync money from the account engine */
  const eq = equity(), m = usedMargin();
  const set = (id,v)=>{ const el=$(id); if(el) el.textContent = v; };
  set("pfBalance", fmt$(eq)); set("pfEquity", fmt$(eq));
  const opl = openPL();
  const pct = eq ? (opl/eq*100) : 0;
  set("pfBalanceSub", (pct>=0?"+":"")+pct.toFixed(2)+"% · "+(opl>=0?"+":"")+fmt$(opl)+" today");
  set("pfFree", fmt$(eq - m)); set("pfMargin", fmt$(m));
  set("pfOvBalance", fmt$(eq));
  const ovPL = $("pfOvPL"); if(ovPL){ ovPL.textContent = fmt$(opl); ovPL.className = "num "+plClass(opl); }
  set("pfOvOpen", state.open.length);
  set("pfOvLevel", m > 0.01 ? (eq/m*100).toFixed(1)+"%" : "—");
  renderPfSpark();
  /* positions */
  const pc = $("pfPosCount"); if(pc) pc.textContent = state.open.length;
  const pl = $("pfPositions");
  if(pl){
    pl.innerHTML = "";
    if(!state.open.length) pl.innerHTML = PF_EMPTY_CTA.replace("{msg}", "No open positions yet.");
    state.open.forEach(p=>{
      const pr = px(p.sym), plv = positionPL(p), pct = posPct(p);
      const pctTxt = (pct>=0?"+":"")+pct.toFixed(2)+"%";
      const r = document.createElement("div");
      r.className = "pf-pos-row";
      r.innerHTML =
        '<span class="pf-sym-ic">'+symIcon(p.sym)+'</span>'+
        '<span class="pf-pos-mid"><b>'+p.sym+' <span class="dir '+(p.dir==="BUY"?"buy":"sell")+'">'+p.dir+'</span></b>'+
        '<span class="fine num">'+fmtP(p.sym,p.entry)+' → '+fmtP(p.sym, p.dir==="BUY"?pr.bid:pr.ask)+' · '+p.lots.toFixed(2)+' lots</span></span>'+
        '<span class="pf-pos-pl"><b class="num '+plClass(plv)+'">'+fmt$(plv)+'</b>'+
        '<span class="pf-pct num '+plClass(pct)+'">'+pctTxt+'</span>'+
        '<button class="link-btn" data-close="'+p.id+'">Close</button></span>';
      pl.appendChild(r);
    });
  }
  renderHistory($("pfHistory"));
  /* pending orders */
  const po = $("pfOrders");
  if(po){
    po.innerHTML = "";
    if(!state.pending.length) po.innerHTML = PF_EMPTY_CTA.replace("{msg}", "No pending orders.");
    state.pending.forEach(o=>{
      const r = document.createElement("div");
      r.className = "pf-pos-row";
      r.innerHTML =
        '<span class="pf-sym-ic">'+symIcon(o.sym)+'</span>'+
        '<span class="pf-pos-mid"><b>'+o.sym+' <span class="dir '+(o.dir==="BUY"?"buy":"sell")+'">'+esc(o.type.toUpperCase())+'</span></b>'+
        '<span class="fine num">Trigger '+fmtP(o.sym,o.price)+' · '+o.lots.toFixed(2)+' lots</span></span>'+
        '<span class="pf-pos-pl"><button class="link-btn" data-cancel="'+o.id+'">Cancel</button></span>';
      po.appendChild(r);
    });
  }
  /* transactions: deposits + closed trades */
  const pt = $("pfTxns");
  if(pt){
    pt.innerHTML = "";
    const txns = state.history.slice().reverse().map(h=>(
      h.cash
        ? { t:h.reason||"Cash movement", v:h.pl, time:h.time||"", tag:h.pl>=0?"deposit":"withdraw" }
        : { t:"Closed "+h.sym+" "+h.dir, v:h.pl, time:h.time||"", sym:h.sym }
    ));
    txns.unshift({ t:"Demo account funded", v:0, time:"", tag:"deposit" });
    if(!txns.length) pt.innerHTML = '<div class="empty">No transactions yet.</div>';
    txns.forEach(x=>{
      const r = document.createElement("div");
      r.className = "pf-pos-row";
      r.innerHTML =
        '<span class="pf-sym-ic '+(x.tag==="deposit"?"dep":x.tag==="withdraw"?"wd":"")+'">'+(x.tag==="deposit"?"+":x.tag==="withdraw"?"−":symIcon(x.sym||""))+'</span>'+
        '<span class="pf-pos-mid"><b>'+esc(x.t)+'</b>'+(x.time?'<span class="fine">'+esc(x.time)+'</span>':"")+'</span>'+
        '<b class="num '+plClass(x.v)+'">'+fmt$(x.v)+'</b>';
      pt.appendChild(r);
    });
  }
}
$("pfTabs").addEventListener("click", e=>{
  const b = e.target.closest("[data-pftab]"); if(!b) return;
  document.querySelectorAll("#pfTabs .ptab").forEach(x=>x.classList.toggle("active", x===b));
  ["positions","history","orders","txns"].forEach(t=>{
    const p = $("ppage-"+t); if(!p) return;
    p.hidden = t !== b.dataset.pftab;
    p.classList.toggle("active", t === b.dataset.pftab);
  });
});
$("pfCloseAll").addEventListener("click", ()=>{
  if(!state.open.length){ toast("No open positions — demo"); return; }
  state.open.slice().forEach(p=>{
    const pr = px(p.sym);
    closePosition(p, p.dir==="BUY" ? pr.bid : pr.ask, null);
  });
  renderPositions(); renderPortfolio();
  toast("All positions closed — demo");
});
/* ---- v25.13: deposit / withdraw sheet (simulated demo funds) ---- */
let moneyMode = "deposit";
function openMoneySheet(mode){
  moneyMode = mode;
  $("moneyTitle").textContent = mode==="deposit" ? "Deposit funds" : "Withdraw funds";
  $("moneyGo").textContent = mode==="deposit" ? "Deposit" : "Withdraw";
  $("moneyAmt").value = "";
  $("backdrop").hidden = false; $("moneySheet").hidden = false;
  injectIcons();
  setTimeout(()=>{ const i=$("moneyAmt"); if(i) i.focus(); }, 80);
}
function closeMoneySheet(){
  $("moneySheet").hidden = true;
  if($("notifSheet").hidden && $("symbolSheet").hidden) $("backdrop").hidden = true;
}
$("moneyX").addEventListener("click", closeMoneySheet);
$("moneyPresets").addEventListener("click", e=>{
  const b = e.target.closest("[data-amt]"); if(!b) return;
  $("moneyAmt").value = b.dataset.amt;
});
$("moneyGo").addEventListener("click", ()=>{
  const amt = Math.round(parseFloat($("moneyAmt").value)*100)/100;
  if(isNaN(amt) || amt <= 0){ toast("Enter a valid amount — demo"); return; }
  if(moneyMode==="withdraw" && amt > state.balance){ toast("Insufficient demo funds"); return; }
  state.balance += moneyMode==="deposit" ? amt : -amt;
  state.history.push({ id:"h"+(state.orderSeq++), sym:"USD", dir:moneyMode==="deposit"?"DEPOSIT":"WITHDRAW",
    lots:0, entry:0, exit:0, pl:moneyMode==="deposit"?amt:-amt, time:new Date().toISOString(),
    reason:moneyMode==="deposit"?"Demo deposit":"Demo withdrawal", cash:true });
  saveTrades(); renderPortfolio(); renderAccount();
  closeMoneySheet();
  if(moneyMode==="deposit") unlockAch("depositor");
  toast((moneyMode==="deposit"?"Deposited ":"Withdrew ")+fmt$(amt)+" — demo");
});
/* ---- v25.13: fullscreen landscape chart with ticket slide-over (demo) ---- */
function setChartFs(on){
  document.body.classList.toggle("chart-fs", on);
  document.body.classList.remove("ticket-open");
  $("chartFsBar").hidden = !on;
  if(on) toast("Rotate your phone for a landscape chart — demo");
}
$("chartFsBtn").addEventListener("click", ()=>setChartFs(true));
$("chartFsClose").addEventListener("click", ()=>setChartFs(false));
$("chartFsTicket").addEventListener("click", ()=>document.body.classList.toggle("ticket-open"));
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && document.body.classList.contains("chart-fs")) setChartFs(false); });
const aiKeyInput = $("aiKeyInput");
if(aiKeyInput){
  aiKeyInput.value = localStorage.getItem("tc_ai_key_v1") || "";
  aiKeyInput.addEventListener("change", ()=>{
    try{ localStorage.setItem("tc_ai_key_v1", aiKeyInput.value.trim()); }catch(e){}
    toast("AI key saved on this device — demo");
  });
}
$("aiX").addEventListener("click", ()=>{ $("aiSheet").hidden = true; });
$("pfAiReview").addEventListener("click", async ()=>{
  const key = (localStorage.getItem("tc_ai_key_v1")||"").trim();
  if(!key){ toast("Paste your AI API key in Settings first — demo"); goTab("settings"); return; }
  const weekAgo = Date.now() - 7*864e5;
  const week = state.history.filter(h=>!h.cash && h.time && new Date(h.time).getTime() >= weekAgo);
  if(!week.length){ toast("No closed trades this week — demo"); return; }
  $("aiBody").innerHTML = '<p class="fine">Asking your AI for a review of '+week.length+' trades…</p>';
  $("aiSheet").hidden = false;
  const net = week.reduce((a,h)=>a+h.pl, 0), wins = week.filter(h=>h.pl>0).length;
  const summary = "You are a trading coach. Review these SIMULATED demo trades from the past week:\n" +
    week.map(h=>h.sym+" "+h.dir+" "+h.lots+" lots, entry "+h.entry+", exit "+h.exit+", P/L "+(+h.pl).toFixed(2)).join("\n") +
    "\nTotals: "+week.length+" trades, "+wins+" wins, net "+net.toFixed(2)+
    ". Reply with exactly 3 short bullet-point improvements, plain text, no disclaimers.";
  try{
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "Authorization":"Bearer "+key },
      body: JSON.stringify({ model:"gpt-4o-mini", messages:[{ role:"user", content:summary }], max_tokens:400 })
    });
    if(!r.ok) throw new Error("HTTP "+r.status);
    const j = await r.json();
    const txt = j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : "No feedback returned.";
    $("aiBody").innerHTML = '<p class="fine">Based on '+week.length+' closed trades ('+wins+' wins, '+fmt$(net)+' net) — demo:</p><div class="ai-text">'+esc(txt).replace(/\n/g,"<br>")+'</div>';
  }catch(e){
    $("aiBody").innerHTML = '<p class="fine">AI review failed — check your key and connection, then try again.</p>';
  }
});
$("pfExportCsv").addEventListener("click", ()=>{
  const rows = [["id","symbol","direction","lots","entry","exit","pl","time","reason"]];
  state.history.filter(h=>!h.cash).forEach(h=>
    rows.push([h.id, h.sym, h.dir, h.lots, h.entry, h.exit, (+h.pl).toFixed(2), h.time||"", h.reason||""]));
  const csv = rows.map(r=>r.map(v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"').join(",")).join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "demo-trade-history.csv";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
  toast("History exported — demo CSV");
});
/* ---- v25.13: share P/L card (canvas → Web Share / download / text fallback) ---- */
function plCardCanvas(){
  const W = 1080, H = 1350, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const dark = theme()==="dark";
  const g = c.createLinearGradient(0,0,W,H);
  if(dark){ g.addColorStop(0,"#0B1526"); g.addColorStop(1,"#060A13"); }
  else { g.addColorStop(0,"#0E2A52"); g.addColorStop(1,"#0B1526"); }
  c.fillStyle = g; c.fillRect(0,0,W,H);
  c.fillStyle = "#22C55E"; c.font = "700 44px -apple-system, Helvetica, Arial, sans-serif";
  c.fillText("◈ Trade.FlexSpot", 70, 110);
  c.fillStyle = "rgba(255,255,255,.65)"; c.font = "400 32px -apple-system, Helvetica, Arial, sans-serif";
  c.fillText("My demo trading", 70, 165);
  const eq = equity(), opl = openPL(), hist = state.history.filter(h=>!h.cash);
  const totPL = hist.reduce((a,h)=>a+(h.pl||0),0) + opl;
  const wins = hist.filter(h=>h.pl>0).length;
  c.fillStyle = "#fff"; c.font = "400 34px -apple-system, Helvetica, Arial, sans-serif";
  c.fillText("Total P/L (demo)", 70, 300);
  c.fillStyle = totPL>=0 ? "#22C55E" : "#F04452";
  c.font = "800 110px -apple-system, Helvetica, Arial, sans-serif";
  c.fillText((totPL>=0?"+":"")+fmt$(totPL), 70, 410);
  c.fillStyle = "rgba(255,255,255,.75)"; c.font = "400 34px -apple-system, Helvetica, Arial, sans-serif";
  const stats = [["Equity", fmt$(eq)], ["Open trades", String(state.open.length)],
                 ["Closed trades", String(hist.length)], ["Win rate", hist.length?Math.round(wins/hist.length*100)+"%":"—"]];
  stats.forEach((s,i)=>{
    const y = 520 + i*110;
    c.fillStyle = "rgba(255,255,255,.55)"; c.fillText(s[0], 70, y);
    c.fillStyle = "#fff"; c.font = "700 40px -apple-system, Helvetica, Arial, sans-serif";
    c.fillText(s[1], 70, y+48); c.font = "400 34px -apple-system, Helvetica, Arial, sans-serif";
  });
  c.fillStyle = "rgba(255,255,255,.45)"; c.font = "400 30px -apple-system, Helvetica, Arial, sans-serif";
  c.fillText("Simulated demo account — not real trading.", 70, H-120);
  c.fillText("trade.flexspot.lol", 70, H-70);
  return cv;
}
$("pfDeposit").addEventListener("click", ()=>openMoneySheet("deposit"));
$("pfWithdraw").addEventListener("click", ()=>openMoneySheet("withdraw"));
$("pfShare").addEventListener("click", ()=>{
  const cv = plCardCanvas();
  const text = "My demo trading P/L: "+fmt$(state.history.filter(h=>!h.cash).reduce((a,h)=>a+(h.pl||0),0)+openPL())+" (simulated — trade.flexspot.lol)";
  const done = ()=>toast("P/L card shared — demo");
  if(cv.toBlob){
    cv.toBlob(blob=>{
      const file = new File([blob], "demo-pl-card.png", { type:"image/png" });
      if(navigator.canShare && navigator.canShare({ files:[file] })){
        navigator.share({ files:[file], title:"My demo P/L" }).then(done).catch(()=>{});
      }else{
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = "demo-pl-card.png"; a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
        toast("P/L card downloaded — demo");
      }
    }, "image/png");
  }else if(navigator.share){
    navigator.share({ title:"My demo P/L", text }).then(done).catch(()=>{});
  }else if(navigator.clipboard){
    navigator.clipboard.writeText(text).then(()=>toast("P/L copied — share it anywhere")).catch(()=>toast("Share — demo"));
  }else toast("Share — demo");
});

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
  ["brokerList","brokersPageList"].forEach(lid=>{
    const list = $(lid); if(!list) return;
    list.innerHTML = "";
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
  });
}
document.addEventListener("click", e=>{
  const btn = e.target.closest("[data-broker]"); if(!btn) return;
  if(!e.target.closest("#brokerList") && !e.target.closest("#brokersPageList")) return;
  const i = +btn.dataset.broker;
  if(BROKERS[i].connected){ toast(BROKERS[i].name+" already linked — demo"); return; }
  openBrokerModal(i);
});
function saveCustomBrokers(){
  try{ localStorage.setItem("tc_brokers_custom_v1", JSON.stringify(BROKERS.filter(b=>b.custom).map(b=>({ name:b.name, sub:b.sub, custom:true })))); }catch(e){}
}
/* ---- v25.13: Add Broker form (demo) ---- */
function openBrokerSheet(){ $("brokerSheet").hidden = false; }
$("brokerX").addEventListener("click", ()=>{ $("brokerSheet").hidden = true; });
$("brkSel").addEventListener("change", ()=>{ $("brkCustomWrap").hidden = $("brkSel").value !== "custom"; });
$("brkSave").addEventListener("click", ()=>{
  let name = $("brkSel").value;
  if(name === "custom"){
    name = $("brkCustom").value.trim();
    if(!name){ toast("Enter the broker name — demo"); return; }
  }
  const acct = $("brkAcct").value.trim();
  if(!acct){ toast("Enter the account number — demo"); return; }
  const label = $("brkLabel").value.trim() || "Demo account";
  const sub = "Acct "+acct+" · "+label;
  let b = BROKERS.find(x=>x.name===name);
  if(!b){
    b = { name, sub, g:["#64748b","#334155"], ini:name.slice(0,2).toUpperCase(), connected:false, custom:true };
    BROKERS.push(b);
  }else b.sub = sub;
  saveCustomBrokers(); saveBrokers(); renderBrokers();
  $("brokerSheet").hidden = true;
  $("brkAcct").value = ""; $("brkLabel").value = ""; $("brkCustom").value = "";
  toast(name+" added — demo");
});
$("addBroker").addEventListener("click", openBrokerSheet);

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
    saveBrokers();
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
      { title:"How I scalp gold on NFP day", views:"12.4k", likes:842, seed:5, videoUrl:"assets/reels/reel-candles-portrait.mp4?v=2" },
      { title:"3 liquidity traps to avoid", views:"8.1k", likes:517, seed:9, videoUrl:"assets/reels/reel-chart-pan.mp4?v=2" }
    ],
    sara:[
      { title:"My swing checklist (5 min)", views:"6.7k", likes:402, seed:13, videoUrl:"assets/reels/reel-trading-chart.mp4?v=2" },
      { title:"Fundamentals + technicals", views:"4.2k", likes:268, seed:17, videoUrl:"assets/reels/reel-market-flow.mp4?v=2" }
    ],
    arjun:[
      { title:"Risk-first crypto entries", views:"9.8k", likes:633, seed:21, videoUrl:"assets/reels/reel-graph-portrait.mp4?v=2" },
      { title:"When I stand aside", views:"5.5k", likes:341, seed:25, videoUrl:"assets/reels/reel-candles-zoom.mp4?v=2" }
    ],
    lena:[
      { title:"Patience: my gold edge", views:"7.3k", likes:489, seed:29, videoUrl:"assets/reels/reel-desk-portrait.mp4?v=2" },
      { title:"Silver range breakout", views:"3.9k", likes:214, seed:33, videoUrl:"assets/reels/reel-forex-portrait.mp4?v=2" }
    ]
  };
  TRADERS.forEach(t=>{
    t.posts = (D[t.id]||[]).map((p,i)=>Object.assign(P(t.id,i+1), p, { tid:t.id, liked:false, comments:[] }));
    t.reels = (R[t.id]||[]).map((r,i)=>Object.assign({ id:t.id+"-r"+(i+1), liked:false }, r));
    t.postCount = t.posts.length;
  });
  /* you, as a trader on the social layer */
  TRADERS.push({ id:"you", name:"Alex Trader", handle:"@alextrader", ini:"AT", pic:"https://randomuser.me/api/portraits/men/22.jpg", g:["#2F80FF","#1B5FD6"],
    bio:"Learning in public · XAUUSD & majors", following:false, followers:1204, followingN:86,
    win:52, pl:0, live:false, you:true,
    monthly:[120,-40,200,90,-60,150,80,210,-30,140,60,110],
    trades:[], posts:[], reels:[], postCount:0 });
})();
/* v25.13: equity curves generated from each trader's stats — seeded PRNG (uses mulberry32 above), deterministic.
   Monthly drift = ret/12 tilts the series; volatility scales with (100 - win), so the
   curve visibly reflects each trader's return and win-rate. Totals ≈ declared net profit. */
function hashSeed(str){
  let h = 2166136261 >>> 0;
  for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function genMonthly(t){
  const rand = mulberry32(hashSeed("mc:"+t.id));
  const drift = (t.ret || 0) / 12;                        /* monthly drift from return */
  const vol = Math.max(0.08, (100 - (t.win || 55)) / 100); /* lower win rate -> choppier */
  const scale = Math.max(80, (t.pl || 800) / 7);          /* trader's typical monthly $ */
  const out = [];
  for(let i=0;i<12;i++){
    const mean = scale * (1 + drift / 50);
    const shock = (rand()*2 - 1) * scale * vol * 1.4;
    out.push(Math.round(mean + shock));
  }
  const sum = out.reduce((a,b)=>a+b, 0);
  const k = (sum !== 0 && (t.pl || 0) !== 0) ? (t.pl / sum) : 1;
  return out.map(v=>Math.round(v * k));
}
TRADERS.forEach(t=>{ t.monthly = genMonthly(t); });

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
  const ret = t.ret != null ? t.ret : 0;
  return ''+
  '<div class="tp-cover"><img src="https://picsum.photos/seed/tpcover-'+t.id+'/800/300" alt="" loading="lazy"><div class="tp-cover-grad"></div></div>'+
  '<div class="tp-head">'+
    '<div class="tp-av">'+avImg(t, "xl", (t.live?'<span class="trader-live">LIVE</span>':''))+'</div>'+
    '<b class="tp-name">'+esc(t.name)+(t.kycVerified?' <span class="verified">✓</span>':'')+(typeof verifiedSet==="function"&&verifiedSet().has(String(t.handle||"").toLowerCase())?' <span class="verified" title="Verified Pro · demo">✓</span>':'')+'</b>'+
    '<span class="handle">'+esc(t.handle)+'</span>'+
    '<span class="tp-role">Pro Trader | Technical Analysis Specialist</span>'+
    '<p class="tp-bio">'+esc(t.bio||'Sharing real trades, analysis and education.')+'</p>'+
    '<div class="tp-badges"><span class="tp-badge"><span class="ic xs" data-icon="trophy"></span> Top Trader</span>'+
    (t.live?'<span class="tp-badge live"><span class="live-pill"><i></i></span> Live Daily</span>':'')+'</div>'+
  '</div>'+
  (copyingThis?'<div class="tp-copying"><span class="copying-chip">📋 Copying '+esc(t.handle)+' · '+copyState.lots.toFixed(2)+' lots</span></div>':'')+
  '<div class="tp-stats">'+
    '<div><b class="num">'+fmtK(t.followers)+'</b><span>Followers</span></div>'+
    '<div><b class="num">'+fmtK(t.followingN||0)+'</b><span>Following</span></div>'+
    '<div><b class="num pl-pos">+'+ret.toFixed(1)+'%</b><span>Total Returns</span></div>'+
    '<div><b class="num">'+t.win+'%</b><span>Win Rate</span></div>'+
  '</div>'+
  '<div class="tp-actions">'+
    (t.you
      ? '<button class="ghost-btn" id="tprofEdit">Edit profile</button>'
      : '<button class="follow-btn sm'+(t.following?" following":"")+'" id="tprofFollow">'+(t.following?"Following":"Follow")+'</button>')+
    (t.live?'<button class="watch-live-btn" id="tprofWatch"><span class="live-pill"><i></i>LIVE</span> Watch now</button>':'')+
    (t.you?'':'<button class="ghost-btn" id="tprofCopy">Copy Trades</button>')+
    (t.you?'':(isBooked(t.id)?'<button class="ghost-btn" id="tprofBook" disabled>✓ Booked</button>':'<button class="ghost-btn" id="tprofBook">Book 1-on-1</button>'))+
    (t.you?'':'<button class="icon-btn" id="tprofMsg" aria-label="More"><span class="ic sm" data-icon="dots"></span></button>')+
  '</div>'+
  '<div class="tp-tabs" id="tprofTabs" role="tablist">'+
    '<button class="tp-tab active" data-ttab="overview" role="tab">Overview</button>'+
    '<button class="tp-tab" data-ttab="trades" role="tab">Trades</button>'+
    '<button class="tp-tab" data-ttab="posts" role="tab">Posts</button>'+
    '<button class="tp-tab" data-ttab="stats" role="tab">Stats</button>'+
  '</div>'+
  '<div id="tprofTab-overview" role="tabpanel"></div>'+
  '<div id="tprofTab-trades" role="tabpanel" hidden></div>'+
  '<div id="tprofTab-posts" role="tabpanel" hidden></div>'+
  '<div id="tprofTab-stats" role="tabpanel" hidden></div>';
}
function renderTprofOverview(t){
  const el = $("tprofTab-overview"); if(!el) return;
  const ret = t.ret != null ? t.ret : 0;
  const trades = t.trades || [];
  const wins = trades.filter(x=>x.pl>0);
  const avg = wins.length ? wins.reduce((a,x)=>a+x.pl,0)/wins.length : 0;
  const worst = trades.length ? Math.min(...trades.map(x=>x.pl)) : 0;
  el.innerHTML =
    '<div class="tp-perf"><span>Performance</span><b class="num pl-pos">+'+ret.toFixed(1)+'%</b></div>'+
    '<div class="period-pills tp-periods" id="tpPeriods">'+
      '<button class="ppill" data-pp="1M">1M</button><button class="ppill" data-pp="3M">3M</button>'+
      '<button class="ppill" data-pp="6M">6M</button><button class="ppill active" data-pp="1Y">1Y</button>'+
      '<button class="ppill" data-pp="All">All</button></div>'+
    '<div class="card tp-chart-card"><canvas class="eq-canvas" id="tprofEq" width="640" height="240"></canvas></div>'+
    '<div class="tp-stat-grid">'+
      '<div><b class="num">'+(1200+ (t.followers%300))+'</b><span>Total Trades</span></div>'+
      '<div><b class="num">'+fmt$(avg)+'</b><span>Avg. Profit</span></div>'+
      '<div><b class="num">'+t.win+'%</b><span>Win Rate</span></div>'+
      '<div><b class="num pl-neg">'+worst.toFixed(1)+'%</b><span>Max Drawdown</span></div>'+
    '</div>'+
    '<div class="tp-extra">'+
      '<div class="tp-extra-card"><h4>Trading Stats</h4>'+
        '<div class="tp-kv"><span>Total Trades</span><b class="num">1,245</b></div>'+
        '<div class="tp-kv"><span>Win Rate</span><b class="num">'+t.win+'%</b></div>'+
        '<div class="tp-kv"><span>Profit Factor</span><b class="num">2.4</b></div>'+
        '<div class="tp-kv"><span>Max Drawdown</span><b class="num pl-neg">8.6%</b></div>'+
        '<div class="tp-kv"><span>Avg. Trade</span><b class="num">12.4 pips</b></div>'+
        '<div class="tp-kv"><span>Avg. Hold Time</span><b class="num">4h 32m</b></div></div>'+
      '<div class="tp-extra-card"><h4>Top Symbols</h4>'+
        [["XAUUSD",42],["EURUSD",18],["GBPUSD",14],["BTCUSD",12],["US30",8],["Others",6]].map(x=>
          '<div class="tp-sym"><b>'+x[0]+'</b><div class="poll-track"><i style="width:'+x[1]+'%"></i></div><span class="num">'+x[1]+'%</span></div>').join("")+
      '</div>'+
    '</div>';
  const cv = $("tprofEq");
  if(cv && typeof drawSpark === "function") drawSpark(cv, (t.monthly||[]).reduce((a,b)=>a+b,0), true);
}
function renderTprofStats(t){
  const el = $("tprofTab-stats"); if(!el) return;
  el.innerHTML =
    '<div class="sec-head"><h3>Monthly P/L</h3><span class="fine">Demo</span></div>'+
    '<div class="card"><div class="mchart">'+monthlyBars(t.monthly)+'</div><div class="mchart-x"><span>Jan</span><span>Dec</span></div></div>'+
    '<div class="tp-stat-grid">'+
      '<div><b class="num">'+fmtK(t.followers)+'</b><span>Followers</span></div>'+
      '<div><b class="num">'+fmt$(t.pl)+'</b><span>Net Profit</span></div>'+
      '<div><b class="num">'+t.win+'%</b><span>Win Rate</span></div>'+
      '<div><b class="num">'+(t.trades||[]).length+'</b><span>Tracked Trades</span></div>'+
    '</div>';
}
function renderTraderProfile(id){
  const t = TRADERS.find(x=>x.id===id); if(!t) return;
  const body = $("tprofBody");
  body.innerHTML = igProfileHTML(t);
  /* tabs */
  $("tprofTabs").addEventListener("click", e=>{
    const b = e.target.closest("[data-ttab]"); if(!b) return;
    body.querySelectorAll(".tp-tab").forEach(x=>x.classList.toggle("active", x===b));
    ["overview","trades","posts","stats"].forEach(k=>{ $("tprofTab-"+k).hidden = (k!==b.dataset.ttab); });
  });
  renderTprofOverview(t); renderTprofPosts(t); renderTprofTrades(t); renderTprofStats(t);
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
  const bk = $("tprofBook");
  if(bk) bk.addEventListener("click", ()=>openBookSheet(t));
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
/* reel feed state lives in reelFeedState (see openReel) */
/* ================= TikTok-style vertical reels feed =================
   Full-screen snap-scroll: swipe up/down through every reel, like TikTok /
   Instagram Reels / YouTube Shorts. Only the active slide plays (video or
   the animated chart canvas); the rest stay paused. Double-tap to like. */
let reelFeedState = { list:[], io:null, active:-1, canvasToken:0 };

/* Tapping the Reels tab opens the full-screen viewer immediately, starting on a
   random reel — the list screen is gone. Closing the viewer lands back on Home. */
function openRandomReel(){
  const items = allReels().filter(x=>x.r.visibility!=="private");
  if(!items.length){ toast("No reels yet"); return; }
  const pick = items[Math.floor(Math.random()*items.length)];
  document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active", b.dataset.tab==="reels"));
  document.body.dataset.tab = "reels";
  openReel(pick.t, pick.r, items);
  const c = $("reelClose");
  if(c) c.onclick = ()=>{ closeReel(); goTab("home"); };
}

function openReel(t, r, list){
  let items = list && list.length ? list : allReels().filter(x=>x.r.visibility!=="private");
  let idx = items.findIndex(x=>x.r.id===r.id);
  if(idx < 0){ items = [{ t, r }]; idx = 0; }
  const view = $("reelView");
  closeReel(); /* silent cleanup of any previous feed */
  view.innerHTML =
    '<div class="reel-feed" id="reelFeed"></div>'+
    '<div class="reel-top"><span class="reel-prog"><i id="reelProg"></i></span>'+
    '<button class="icon-btn" id="reelClose" aria-label="Close"><span class="ic" data-icon="x"></span></button></div>';
  const feed = $("reelFeed");
  items.forEach((it, i)=>feed.appendChild(buildReelSlide(it.t, it.r, i)));
  $("reelClose").onclick = closeReel;
  try{ injectIcons(); }catch(e){}
  view.hidden = false;
  document.body.classList.add("lock-scroll");
  const st = reelFeedState;
  st.list = items; st.active = -1;
  const slides = feed.children;
  if(slides[idx]) feed.scrollTop = slides[idx].offsetTop; /* jump straight to the tapped reel */
  st.io = new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting && e.intersectionRatio >= 0.55) activateReelSlide(+e.target.dataset.i); });
  }, { root:feed, threshold:[0.55] });
  for(let i=0;i<slides.length;i++) st.io.observe(slides[i]);
  activateReelSlide(idx);
}

function buildReelSlide(t, r, i){
  const s = document.createElement("section");
  s.className = "reel-slide"; s.dataset.i = i;
  const comN = r.commentsN || (r.comments ? r.comments.length : 0) || Math.round((r.likes||0)/9);
  s.innerHTML =
    (r.videoUrl
      ? '<video playsinline loop preload="metadata" src="'+esc(r.videoUrl)+'"></video>'
      : '<canvas width="540" height="960"></canvas>')+
    '<div class="reel-side">'+
      '<button class="reel-act rl-like'+(r.liked?" liked":"")+'" aria-label="Like"><span class="ic" data-icon="heart"></span><b class="num">'+fmtK(r.likes||0)+'</b></button>'+
      '<button class="reel-act rl-com" aria-label="Comments"><span class="ic" data-icon="comment"></span><b class="num">'+fmtK(comN)+'</b></button>'+
      '<button class="reel-act rl-share" aria-label="Share"><span class="ic" data-icon="share"></span><b>Share</b></button>'+
    "</div>"+
    '<div class="reel-cap"><b>'+esc(t.handle)+(t.live?" · LIVE":"")+"</b><p>"+esc(r.title)+
      (r.desc ? '<span class="reel-desc">'+esc(r.desc)+"</span>" : "")+
      (r.tags && r.tags.length ? '<span class="reel-tags">'+r.tags.map(esc).join(" ")+"</span>" : "")+
    "</p></div>"+
    (i===0 ? '<div class="reel-dbl-hint">Swipe up for more · double-tap to like</div>' : "");
  const likeBtn = s.querySelector(".rl-like");
  const doLike = ()=>{
    r.liked = !r.liked; r.likes = (r.likes||0) + (r.liked?1:-1);
    likeBtn.querySelector("b").textContent = fmtK(r.likes);
    likeBtn.classList.toggle("liked", r.liked);
  };
  likeBtn.addEventListener("click", e=>{ e.stopPropagation(); doLike(); });
  s.querySelector(".rl-com").addEventListener("click", e=>{ e.stopPropagation(); openReelComments(t, r, s.querySelector(".rl-com b")); });
  s.querySelector(".rl-share").addEventListener("click", e=>{ e.stopPropagation(); shareReel(r); });
  /* double-tap = like, TikTok-style */
  let lastTap = 0;
  s.addEventListener("click", e=>{
    const now = Date.now();
    if(now - lastTap < 320){
      lastTap = 0;
      if(!r.liked) doLike();
      reelHeartBurst(s, e.clientX, e.clientY);
    } else lastTap = now;
  });
  /* a video file that fails (offline/404) falls back to the animated chart canvas */
  const vid = s.querySelector("video");
  if(vid) vid.addEventListener("error", ()=>{
    const cv = document.createElement("canvas"); cv.width = 540; cv.height = 960;
    vid.replaceWith(cv);
    if(reelFeedState.active === i) startReelCanvas(cv, t, r);
  }, { once:true });
  return s;
}

function reelHeartBurst(slide, x, y){
  const rc = slide.getBoundingClientRect();
  const h = document.createElement("div");
  h.className = "reel-float-heart"; h.textContent = "♥";
  h.style.left = Math.max(8, (x || rc.left+rc.width/2) - rc.left - 36) + "px";
  h.style.top = Math.max(8, (y || rc.top+rc.height/2) - rc.top - 36) + "px";
  slide.appendChild(h);
  setTimeout(()=>h.remove(), 950);
}

function activateReelSlide(i){
  const st = reelFeedState;
  if(st.active === i || !st.list[i]) return;
  st.active = i; st.canvasToken++; /* kills any running canvas loop */
  const feed = $("reelFeed"); if(!feed) return;
  const prog = $("reelProg"); if(prog) prog.style.width = "0";
  const slides = feed.children;
  for(let j=0;j<slides.length;j++){
    const s = slides[j], vid = s.querySelector("video"), cv = s.querySelector("canvas");
    if(j === i){
      const it = st.list[j];
      if(vid) playReelVideo(vid);
      else if(cv) startReelCanvas(cv, it.t, it.r);
    } else if(vid){ try{ vid.pause(); }catch(e){} }
  }
}

function playReelVideo(vid){
  vid.muted = false;
  try{
    const pr = vid.play();
    if(pr && pr.catch) pr.catch(()=>{ vid.muted = true; vid.play().catch(()=>{}); });
  }catch(e){ vid.muted = true; try{ vid.play().catch(()=>{}); }catch(_){} }
  const prog = $("reelProg");
  vid.ontimeupdate = ()=>{ if(prog && vid.duration) prog.style.width = (vid.currentTime/vid.duration*100)+"%"; };
}

/* animated chart-canvas reel (seeded reels without a video file) */
function startReelCanvas(cv, t, r){
  const st = reelFeedState, token = ++st.canvasToken, prog = $("reelProg");
  const ctx = cv.getContext("2d");
  const rnd = mulberry32(((r.seed||1)*331+7)>>>0);
  const pts = []; let v = 0.45;
  for(let i=0;i<60;i++){ v += (rnd()-0.44)*0.1; v = Math.max(.1, Math.min(.9, v)); pts.push(v); }
  const dur = 9000, fontFam = getComputedStyle(document.body).fontFamily;
  let t0 = performance.now();
  (function frame(now){
    if(token !== st.canvasToken || $("reelView").hidden) return;
    const el = Math.min(1, (now-t0)/dur);
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
    ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.font = "700 34px "+fontFam;
    ctx.fillText(t.handle, 30, H-160);
    ctx.font = "400 26px "+fontFam;
    ctx.fillStyle = "rgba(255,255,255,.75)";
    wrapText(ctx, r.title, 30, H-116, W-200, 30);
    if(prog) prog.style.width = (el*100)+"%";
    if(el>=1) t0 = performance.now(); /* loop the 9s animation */
    requestAnimationFrame(frame);
  })(t0);
}

function closeReel(){
  const st = reelFeedState;
  st.canvasToken++;
  if(st.io){ st.io.disconnect(); st.io = null; }
  const feed = $("reelFeed");
  if(feed) for(const v of feed.querySelectorAll("video")){ try{ v.pause(); }catch(e){} v.removeAttribute("src"); }
  const view = $("reelView");
  view.innerHTML = ""; view.hidden = true;
  document.body.classList.remove("lock-scroll");
  st.list = []; st.active = -1;
}

function wrapText(ctx, text, x, y, maxW, lh){
  const words = text.split(" "); let line = "";
  for(const w of words){ const t = line+w+" ";
    if(ctx.measureText(t).width > maxW && line){ ctx.fillText(line, x, y); line = w+" "; y += lh; }
    else line = t; }
  ctx.fillText(line, x, y);
}
function shareReel(r){
  const txt = "Reel: "+r.title+" (demo)";
  if(navigator.share){ navigator.share({ title:"Trading Community", text:txt }).catch(()=>{}); }
  else if(navigator.clipboard){ navigator.clipboard.writeText(txt).then(()=>toast("Link copied (demo)")).catch(()=>toast("Share — demo")); }
  else toast("Share — demo");
}
/* reel comments (simple bottom-sheet style list inside viewer) */
function openReelComments(t, r, countEl){
  if(!r.comments){
    r.comments = [
      { n:"Sara Malik", t:"This is exactly how I read liquidity too 🔥", time:"12m" },
      { n:"Arjun Mehta", t:"Tried this on BTC, worked twice this week", time:"34m" },
      { n:"Lena K", t:"Saving this one 📌", time:"1h" }
    ];
  }
  /* the feed stays open behind the sheet (z-210) — no closeReel() */
  openSheetComments("Reel · "+r.title, r.comments, (txt)=>{
    r.comments.push({ n:"You", t:txt, time:"now" });
    if(countEl) countEl.textContent = fmtK(r.comments.length);
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
  setCopyMode("mirror");
  $("guardVal").textContent = copyGuard.maxLossPct + "%";
  $("copyWarnHost").textContent = t.name+" ("+t.handle+")";
  const a = activeAcct();
  document.querySelectorAll(".copyWarnAcct").forEach(el=>{ el.textContent = a.broker+" "+a.type+" · "+a.login; });
  $("copyModal").hidden = false;
}
function closeCopyModal(){ $("copyModal").hidden = true; }
function setCopyLots(v){
  copyLotSel = Math.min(5, Math.max(0.01, Math.round(v*100)/100));
  $("copyLotVal").textContent = copyLotSel.toFixed(2);
}
function startCopy(){
  const t = TRADERS.find(x=>x.id===copyState.pendingHost); if(!t) return;
  closeCopyModal();
  if(copyMode==="mirror"){ openCopier(t.id, copyLotSel); return; }
  copyState.on = true; copyState.host = t.id; copyState.lots = copyLotSel;
  unlockAch("first_copy");
  paintCopyUI(); renderCopyStatus();
  toast("Copying "+t.handle+" at "+copyState.lots.toFixed(2)+" lots — demo, no real orders");
}
document.addEventListener("click", e=>{
  const mp = e.target.closest("[data-copymode]");
  if(mp){ setCopyMode(mp.dataset.copymode); }
});
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
/* ---- v25.13: copy guard — max-loss % auto-stop (demo) ---- */
const COPYGUARD_KEY = "tc_copyguard_v1";
let copyGuard = { maxLossPct: 10, peaks: {} };
try{ const g = JSON.parse(localStorage.getItem(COPYGUARD_KEY)||"null");
  if(g && typeof g.maxLossPct === "number") copyGuard = { maxLossPct: g.maxLossPct, peaks: g.peaks||{} };
}catch(e){}
function saveCopyGuard(){ try{ localStorage.setItem(COPYGUARD_KEY, JSON.stringify(copyGuard)); }catch(e){} }
function setGuardPct(v){
  copyGuard.maxLossPct = Math.min(50, Math.max(5, Math.round(v)));
  $("guardVal").textContent = copyGuard.maxLossPct + "%";
  saveCopyGuard();
}
$("guardMinus").addEventListener("click", ()=>setGuardPct(copyGuard.maxLossPct-5));
$("guardPlus").addEventListener("click", ()=>setGuardPct(copyGuard.maxLossPct+5));
function checkCopyGuard(){
  if(!copyState.on) return;
  const pl = copiedPL();
  const base = Math.max(500, 1000 * copyState.lots);
  if(pl <= -(copyGuard.maxLossPct/100)*base){
    const cps = copiedOpen().slice();
    cps.forEach(p=>{ const pr = px(p.sym); closePosition(p, p.dir==="BUY"?pr.bid:pr.ask, "Copy guard"); });
    copyState.on = false; copyState.host = null;
    paintCopyUI(); renderCopyStatus(); renderPositions();
    toast("Copy guard: max loss "+copyGuard.maxLossPct+"% breached — copying stopped, demo");
    pushNotif("shield", "Copy guard triggered", "Copying auto-stopped at -"+copyGuard.maxLossPct+"% — demo");
  }
}
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


/* ================= v26: MIRROR COPY — play-money copier accounts =================
   *** EVERY FIGURE HERE IS VIRTUAL PLAY MONEY ***
   No broker login, no funding flow, no live order routing anywhere in this mode.
   A copier account mirrors ONE trader's simulated activity entry-for-entry and
   exit-for-exit, with its own $10,000 virtual balance, ranked on the Copiers
   leaderboard tab. */
const MIRROR_KEY = "tc_mirror_v1";
const MIRROR_START = 10000;
let copiers = [];
try{ const s = JSON.parse(localStorage.getItem(MIRROR_KEY)||"null"); if(Array.isArray(s)) copiers = s; }catch(e){ copiers = []; }
function saveCopiers(){ try{ localStorage.setItem(MIRROR_KEY, JSON.stringify(copiers)); }catch(e){} }
const traderById = id => TRADERS.find(t=>t.id===id);
function copierUnrealized(c){
  return c.open.reduce((s,p)=>{
    const pr = px(p.sym), cur = p.dir==="BUY" ? pr.bid : pr.ask;
    return s + (p.dir==="BUY" ? (cur-p.entry) : (p.entry-cur)) * meta(p.sym).perPoint * p.lots;
  }, 0);
}
function copierRealized(c){ return c.history.reduce((s,h)=>s+h.pl, 0); }
function copierTotalPL(c){ return copierRealized(c) + copierUnrealized(c); }
function copierEquity(c){ return c.balance + copierUnrealized(c); }
let copyMode = "mirror"; /* modal choice: "mirror" (play-money copier) or "own" (v2 into own demo acct) */
function setCopyMode(m){
  copyMode = m;
  document.querySelectorAll(".mode-pick").forEach(x=>{
    x.classList.toggle("sel", x.dataset.copymode===m);
    x.setAttribute("aria-checked", x.dataset.copymode===m ? "true" : "false");
  });
  const t = TRADERS.find(x=>x.id===copyState.pendingHost);
  const h = t ? t.handle : "@host";
  const d = $("copyModeDesc");
  if(d) d.innerHTML = m==="mirror"
    ? "A <b>$10,000 play-money</b> copier opens and mirrors <b>"+esc(h)+"</b> entry-for-entry, exit-for-exit."
    : "Every trade "+esc(h)+" takes is <b>automatically mirrored</b> in your demo account at your lot size below.";
  const acc = $("copyAccept");
  if(acc) acc.textContent = m==="mirror" ? "Open $10,000 play-money copier" : "I understand — start copying";
}
function openCopier(traderId, lots){
  const t = traderById(traderId); if(!t || t.you){ if(t&&t.you) toast("That's you — demo"); return; }
  if(copiers.some(c=>c.traderId===traderId)){ toast("Already mirroring "+t.handle+" — play money"); goTab("leaderboard"); setLbTab("copiers"); return; }
  copiers.push({ id:"mc"+Date.now(), traderId, lots:Math.min(5,Math.max(0.01,lots||0.10)),
    balance:MIRROR_START, createdAt:Date.now(), open:[], history:[] });
  saveCopiers(); renderCopiers();
  unlockAch("first_copy");
  toast("Play-money copier opened for "+t.handle+" · $10,000 virtual");
  goTab("leaderboard"); setLbTab("copiers");
}
function stopCopier(id){
  const i = copiers.findIndex(c=>c.id===id); if(i<0) return;
  const c = copiers[i], t = traderById(c.traderId);
  /* settle open positions at current market into the virtual balance */
  c.open.forEach(p=>{
    const pr = px(p.sym), exit = p.dir==="BUY" ? pr.bid : pr.ask;
    const pl = (p.dir==="BUY" ? (exit-p.entry) : (p.entry-exit)) * meta(p.sym).perPoint * p.lots;
    c.balance += pl;
    c.history.push({ sym:p.sym, dir:p.dir, lots:p.lots, entry:p.entry, exit, pl, t:Date.now(), reason:"Copier stopped" });
  });
  copiers.splice(i,1); saveCopiers(); renderCopiers();
  toast("Copier for "+(t?t.handle:"@trader")+" closed · final "+fmt$(c.balance-MIRROR_START)+" play money");
}
/* simulated trader activity: each copied trader "trades" on its own cadence;
   every entry AND exit is mirrored into that trader's copier account at live ticks */
function mirrorEngine(){
  if(!copiers.length) return;
  let changed = false;
  copiers.forEach(c=>{
    const t = traderById(c.traderId); if(!t) return;
    /* v25.13 copy guard: stop the copier + settle if drawdown breaches max loss % */
    const eq = copierEquity(c);
    const pk = Math.max(copyGuard.peaks[c.id] || MIRROR_START, eq);
    copyGuard.peaks[c.id] = pk;
    if(pk > 0 && (pk - eq)/pk*100 >= copyGuard.maxLossPct){
      delete copyGuard.peaks[c.id]; saveCopyGuard();
      stopCopier(c.id);
      toast("Copy guard stopped "+t.handle+" at -"+((pk-eq)/pk*100).toFixed(1)+"% — demo");
      pushNotif("shield", "Copy guard triggered", t.handle+" copier auto-stopped at max loss — demo");
      return;
    }
    /* trader exit: close the oldest mirrored position */
    if(c.open.length && Math.random() < 0.38){
      const p = c.open.shift(), pr = px(p.sym);
      const exit = p.dir==="BUY" ? pr.bid : pr.ask;
      const pl = (p.dir==="BUY" ? (exit-p.entry) : (p.entry-exit)) * meta(p.sym).perPoint * p.lots;
      c.balance += pl;
      c.history.push({ sym:p.sym, dir:p.dir, lots:p.lots, entry:p.entry, exit, pl, t:Date.now(), reason:"Trader exit" });
      changed = true;
    }
    /* trader entry: open a new mirrored position */
    if(c.open.length < 3 && Math.random() < 0.5){
      const syms = (t.trades||[]).map(x=>x.s).filter(s=>SYMBOLS[s] && mktOpen(s));
      const sym = syms.length ? syms[Math.floor(Math.random()*syms.length)] : "XAUUSD";
      const dir = Math.random() > 0.45 ? "BUY" : "SELL", pr = px(sym);
      c.open.push({ id:"mcp"+Date.now()+Math.floor(Math.random()*999), sym, dir,
        entry: dir==="BUY" ? pr.ask : pr.bid, lots:c.lots, t:Date.now() });
      changed = true;
    }
  });
  if(changed){ saveCopiers(); renderCopiers(); }
}
setInterval(mirrorEngine, 12000);
/* leaderboard tabs: traders | copiers */
document.addEventListener("click", e=>{
  const lt = e.target.closest("#lbViewTabs [data-lbtab]");
  if(lt){ setLbTab(lt.dataset.lbtab); }
});
let lbTab = "traders";
function setLbTab(tab){
  lbTab = tab;
  document.querySelectorAll("#lbViewTabs .ctab").forEach(x=>x.classList.toggle("active", x.dataset.lbtab===tab));
  const tp = $("lbTradersPane"), cp = $("lbCopiersPane");
  if(tp) tp.hidden = tab!=="traders";
  if(cp) cp.hidden = tab!=="copiers";
  if(tab==="copiers") renderCopiers(); else renderCommunityTraders();
}
function renderCopiers(){
  const list = $("copierBoardList"); if(!list) return;
  list.innerHTML = "";
  if(!copiers.length){
    list.innerHTML = '<div class="empty">No copier accounts yet.<br>Tap <b>Copy</b> on any trader to open a $10,000 play-money copier.<br>'+
      '<button class="primary-btn empty-cta" data-goto="community">Find traders</button></div>';
    return;
  }
  copiers.slice().sort((a,b)=>copierTotalPL(b)-copierTotalPL(a)).forEach((c,i)=>{
    const t = traderById(c.traderId); if(!t) return;
    const pl = copierTotalPL(c), eq = copierEquity(c);
    const card = document.createElement("div");
    card.className = "copier-card";
    card.innerHTML =
      '<div class="copier-head"><span class="rank-n'+(i<3?' medal-'+(i+1):'')+'">'+(i+1)+'</span>'+avImg(t,"sm")+
      '<span class="copier-id"><b>'+esc(t.handle)+'</b><span class="fine">'+c.lots.toFixed(2)+' lots · '+c.open.length+' open · '+c.history.length+' closed</span></span>'+
      '<span class="play-tag">PLAY MONEY</span></div>'+
      '<div class="copier-nums"><div><span>Virtual equity</span><b class="num" data-mceq="'+c.id+'">'+fmt$(eq)+'</b></div>'+
      '<div><span>Copier P/L</span><b class="num '+plClass(pl)+'" data-mcpl="'+c.id+'">'+(pl>=0?"+":"")+fmt$(pl)+'</b></div>'+
      '<button class="danger-btn sm" data-stopcopier="'+c.id+'">Stop</button></div>'+
      (c.open.length ? '<div class="copier-pos">'+c.open.map(p=>{
        const pr = px(p.sym), cur = p.dir==="BUY"?pr.bid:pr.ask;
        const upl = (p.dir==="BUY"?(cur-p.entry):(p.entry-cur))*meta(p.sym).perPoint*p.lots;
        return '<div class="mc-pos"><span class="dir '+(p.dir==="BUY"?"buy":"sell")+'">'+p.dir+'</span>'+
          '<b>'+p.sym+'</b><span class="num">'+p.lots.toFixed(2)+'</span>'+
          '<span class="num '+plClass(upl)+'" data-mcpos="'+p.id+'">'+(upl>=0?"+":"")+fmt$(upl)+'</span></div>';
      }).join("")+'</div>' : '<div class="fine">Waiting for '+esc(t.handle)+'\'s next trade…</div>');
    list.appendChild(card);
  });
  injectIcons();
}
/* live-tick refresh of visible copier numbers (same pattern as renderPositionsTick) */
function renderCopiersTick(){
  if(lbTab!=="copiers") return;
  copiers.forEach(c=>{
    const eqEl = document.querySelector('[data-mceq="'+c.id+'"]');
    if(eqEl) eqEl.textContent = fmt$(copierEquity(c));
    const pl = copierTotalPL(c);
    const plEl = document.querySelector('[data-mcpl="'+c.id+'"]');
    if(plEl){ plEl.textContent = (pl>=0?"+":"")+fmt$(pl); plEl.className = "num "+plClass(pl); }
    c.open.forEach(p=>{
      const el = document.querySelector('[data-mcpos="'+p.id+'"]'); if(!el) return;
      const pr = px(p.sym), cur = p.dir==="BUY"?pr.bid:pr.ask;
      const upl = (p.dir==="BUY"?(cur-p.entry):(p.entry-cur))*meta(p.sym).perPoint*p.lots;
      el.textContent = (upl>=0?"+":"")+fmt$(upl); el.className = "num "+plClass(upl);
    });
  });
}
document.addEventListener("click", e=>{
  const s = e.target.closest("[data-stopcopier]");
  if(s){ e.stopPropagation(); stopCopier(s.dataset.stopcopier); }
});


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
    ],
    strategies:[
      { name:"Sweep & reverse", sym:"XAUUSD", entry:"Sweep of equal highs/lows + M5 displacement back inside", stop:"Beyond the sweep wick", tp:"TP1 1.5R \u00b7 runner with trailing stop", win:"61% (200 backtested)" },
      { name:"Break-and-retest", sym:"EURUSD", entry:"M15 structure break, limit order at retested level", stop:"Beyond break candle", tp:"TP1 2R \u00b7 TP2 3R", win:"54% (140 backtested)" }
    ],
    trades:[
      { sym:"XAUUSD", side:"BUY", entry:"2,648.10", exit:"2,671.30", r:"+1.9R", when:"NFP Friday", note:"Sweep of Asia low, textbook entry" },
      { sym:"XAUUSD", side:"SELL", entry:"2,699.80", exit:"2,684.20", r:"+1.6R", when:"Wed", note:"Equal highs swept at London open" }
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
    ],
    strategies:[
      { name:"London sweep scalp", sym:"XAUUSD", entry:"Asia range marked \u00b7 London sweeps one side \u00b7 M5 displacement back inside \u00b7 enter on retest", stop:"8\u201312 pts beyond sweep wick", tp:"TP1 +18 pts \u00b7 TP2 runner", win:"68% (112 live)" },
      { name:"NFP spike fade", sym:"XAUUSD", entry:"First 5-min spike into pre-news level, fade the extension", stop:"15 pts", tp:"TP1 +25 pts \u00b7 TP2 +45 pts", win:"61% (47 live)" }
    ],
    trades:[
      { sym:"XAUUSD", side:"BUY", entry:"2,652.40", exit:"2,670.10", r:"+1.8R", when:"NFP Friday", note:"Uncut recording in the lessons \u2014 the +$184 scalp" },
      { sym:"XAUUSD", side:"SELL", entry:"2,701.20", exit:"2,689.55", r:"+1.5R", when:"Tue", note:"Asia high sweep, M5 displacement entry" },
      { sym:"EURUSD", side:"BUY", entry:"1.0842", exit:"1.0798", r:"\u22121.0R", when:"Mon", note:"Stopped \u2014 spread widened at rollover. Logged as my mistake." }
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
    ],
    strategies:[
      { name:"Fixed-fractional sizing", sym:"Any", entry:"Risk $ = balance \u00d7 risk% \u00b7 lots = risk $ \u00f7 (stop pts \u00d7 $ per pt)", stop:"Set by setup, never by feeling", tp:"Minimum 1.5R on every idea", win:"Survival first \u2014 math over hunches" },
      { name:"Daily stop rule", sym:"Any", entry:"Trade the plan until \u22123% day", stop:"\u22123% \u2192 screens off, no exceptions", tp:"Protect the week, not the trade", win:"Drawdown control beats win rate" }
    ],
    trades:[
      { sym:"XAUUSD", side:"BUY", entry:"2,610.00", exit:"2,628.40", r:"+1.5R", when:"Thu", note:"Risked 1% \u2014 textbook, no drama" },
      { sym:"BTCUSD", side:"SELL", entry:"97,400", exit:"96,100", r:"+2.1R", when:"Wed", note:"Correlated risk checked first (no USD longs open)" }
    ] }
];
/* ---- ADMIN OVERRIDES for classes (admin.html writes these keys; applied first) ---- */
try{
  const cEdit = JSON.parse(localStorage.getItem("tc_courses_edit_v1")||"[]");
  if(Array.isArray(cEdit)) cEdit.forEach(o=>{ const c = COURSES.find(x=>x.id===o.id); if(c) Object.assign(c, o); });
  const cAdd = JSON.parse(localStorage.getItem("tc_courses_add_v1")||"[]");
  if(Array.isArray(cAdd)) cAdd.forEach(o=>{ if(o && o.id && !COURSES.find(x=>x.id===o.id)) COURSES.push(o); });
  const cHide = JSON.parse(localStorage.getItem("tc_courses_hide_v1")||"[]");
  if(Array.isArray(cHide)) for(let i=COURSES.length-1;i>=0;i--) if(cHide.indexOf(COURSES[i].id)>=0) COURSES.splice(i,1);
}catch(e){}
let courseProg = {};
try{ courseProg = JSON.parse(localStorage.getItem("tc_prog_v1")||"{}"); }catch(e){ courseProg = {}; }
function saveProg(){ try{ localStorage.setItem("tc_prog_v1", JSON.stringify(courseProg)); }catch(e){} }
function courseDoneCount(c){ return c.lessons.filter((_,i)=>courseProg[c.id+":"+i]).length; }
function renderCourses(){
  ["courseList","homeCourseList","classesPageList","hdCourses"].forEach(lid=>{
    const list = $(lid); if(!list) return;
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
  });
}
let enroll = {};
try{ enroll = JSON.parse(localStorage.getItem("tc_enroll_v1")||"{}"); }catch(e){ enroll = {}; }
function saveEnroll(){ try{ localStorage.setItem("tc_enroll_v1", JSON.stringify(enroll)); }catch(e){} }
function courseLocked(c){ return c.price>0 && !enroll[c.id]; }
let courseTab = "lessons";
const COURSE_TABS = [["lessons","Lessons"],["recordings","Recordings"],["strategies","Strategies"],["trades","Trades"],["materials","Materials"]];
function openCourse(id, tab){
  const c = COURSES.find(x=>x.id===id); if(!c) return;
  courseTab = tab || "lessons";
  const edu = TRADERS.find(t=>t.id===c.edu);
  const locked = courseLocked(c);
  $("courseViewTitle").textContent = c.title;
  const body = $("courseBody");
  body.innerHTML =
    '<div class="course-thumb" style="--g1:'+c.g[0]+';--g2:'+c.g[1]+';width:96px;height:96px;font-size:40px;margin-bottom:12px">'+c.emoji+'</div>'+
    '<h3 style="margin:0 0 6px">'+esc(c.title)+'</h3>'+
    '<p class="modal-sub" style="text-align:left;margin:0 0 10px">'+esc(c.desc)+'</p>'+
    (edu?'<button class="trader-mini" data-tprof="'+edu.id+'">'+avImg(edu, "sm")+'<span><b>'+esc(edu.name)+'</b><span class="handle">'+esc(edu.handle)+' \u00b7 '+fmtK(edu.followers)+' followers</span></span></button>':"")+
    '<div class="ctabs" id="courseTabs"></div>'+
    '<div id="courseTabBody"></div>'+
    (locked?'<button class="primary-btn" id="joinClassBtn" style="margin-top:12px">Join private class \u2014 $'+c.price+'</button>'+
      '<p class="fine" style="text-align:center">One-time entry \u00b7 recordings + strategies + PDFs stay yours \u00b7 <span class="demo-tag">Demo checkout</span></p>':"");
  const tb = $("courseTabs");
  COURSE_TABS.forEach(function(pair){
    const b = document.createElement("button");
    b.className = "ctab"+(courseTab===pair[0]?" active":"");
    b.textContent = pair[1];
    b.addEventListener("click", function(){ openCourse(c.id, pair[0]); });
    tb.appendChild(b);
  });
  renderCourseTab(c, locked);
  const jb = $("joinClassBtn");
  if(jb) jb.addEventListener("click", function(){ openPaySheet(c); });
  $("courseView").hidden = false;
}
function renderCourseTab(c, locked){
  const el = $("courseTabBody");
  if(courseTab==="lessons"){
    const done = courseDoneCount(c);
    el.innerHTML = '<div class="sec-head"><h3>Lessons</h3><span class="fine">'+done+'/'+c.lessons.length+' done</span></div><div id="lessonList"></div>';
    const ll = $("lessonList");
    c.lessons.forEach(function(l,i){
      const d = !!courseProg[c.id+":"+i];
      const row = document.createElement("button");
      row.className = "lesson-row"+(d?" done":"");
      row.innerHTML = '<span class="lesson-n">'+(d?"\u2713":(locked?"\ud83d\udd12":(i+1)))+'</span>'+
        '<span class="l-info"><b>'+esc(l.t)+'</b><span>'+l.type+' \u00b7 '+l.dur+'</span></span>';
      row.addEventListener("click", function(){
        if(locked){ toast("Join the private class to unlock lessons"); return; }
        openLesson(c, i);
      });
      ll.appendChild(row);
    });
  } else if(courseTab==="recordings"){
    const recs = c.lessons.map(function(l,i){ return {l:l,i:i}; }).filter(function(x){ return x.l.type==="video"; });
    el.innerHTML = '<div class="sec-head"><h3>Recordings</h3><span class="fine">'+(locked?"\ud83d\udd12 join to unlock":recs.length+" session videos")+'</span></div><div id="recList"></div>';
    const rl = $("recList");
    if(locked){ rl.innerHTML = '<div class="empty">\ud83d\udd12 Session recordings unlock after joining.</div>'; }
    else recs.forEach(function(x){
      const d = !!courseProg[c.id+":"+x.i];
      const row = document.createElement("button");
      row.className = "lesson-row"+(d?" done":"");
      row.innerHTML = '<span class="lesson-n">\u25b6</span><span class="l-info"><b>'+esc(x.l.t)+'</b><span>recording \u00b7 '+x.l.dur+(d?" \u00b7 \u2713 watched":"")+'</span></span>';
      row.addEventListener("click", function(){ openLesson(c, x.i); });
      rl.appendChild(row);
    });
  } else if(courseTab==="strategies"){
    const ss = c.strategies||[];
    el.innerHTML = '<div class="sec-head"><h3>Strategies</h3><span class="fine">'+(locked?"\ud83d\udd12 join to unlock":ss.length+" playbooks")+'</span></div><div id="stratList"></div>';
    const sl = $("stratList");
    if(locked){ sl.innerHTML = '<div class="empty">\ud83d\udd12 The educator\u2019s strategies unlock after joining.</div>'; }
    else ss.forEach(function(s){
      const d = document.createElement("div");
      d.className = "strat-card";
      d.innerHTML = '<b>'+esc(s.name)+'</b><span class="strat-sym">'+esc(s.sym)+'</span>'+
        '<div class="strat-meta">'+
        '<span>Entry<b>'+esc(s.entry)+'</b></span>'+
        '<span>Stop<b>'+esc(s.stop)+'</b></span>'+
        '<span>Targets<b>'+esc(s.tp)+'</b></span>'+
        '<span>Track record<b>'+esc(s.win)+'</b></span></div>';
      sl.appendChild(d);
    });
  } else if(courseTab==="trades"){
    const ts = c.trades||[];
    el.innerHTML = '<div class="sec-head"><h3>Class trades</h3><span class="fine">'+(locked?"\ud83d\udd12 join to unlock":ts.length+" logged")+'</span></div><div id="ctList"></div>';
    const tl = $("ctList");
    if(locked){ tl.innerHTML = '<div class="empty">\ud83d\udd12 Every trade the educator posts in this class unlocks after joining.</div>'; }
    else ts.forEach(function(t){
      const up = t.r.charAt(0)==="+";
      const row = document.createElement("div");
      row.className = "lesson-row";
      row.innerHTML = '<span class="side-pill '+(t.side==="BUY"?"long":"short")+'">'+t.side+'</span>'+
        '<span class="l-info"><b>'+esc(t.sym)+' <span class="num">'+esc(t.entry)+' \u2192 '+esc(t.exit)+'</span></b>'+
        '<span>'+esc(t.when)+' \u00b7 '+esc(t.note)+'</span></span>'+
        '<b class="num" style="color:'+(up?"var(--green)":"var(--red)")+'">'+esc(t.r)+'</b>';
      tl.appendChild(row);
    });
  } else {
    el.innerHTML = '<div class="sec-head"><h3>Materials</h3><span class="fine">'+(locked?"\ud83d\udd12 join to unlock":"demo files")+'</span></div><div id="matList"></div>';
    const ml = $("matList");
    if(locked){ ml.innerHTML = '<div class="empty">\ud83d\udd12 '+c.materials.length+' files unlock after joining.</div>'; }
    else c.materials.forEach(function(m){
      const row = document.createElement("button");
      row.className = "lesson-row";
      row.innerHTML = '<span class="lesson-n">\ud83d\udcc4</span><span class="l-info"><b>'+esc(m.name)+'</b><span>'+m.kind+' \u00b7 '+m.size+'</span></span>';
      row.addEventListener("click", function(){ openMaterial(m, c); });
      ml.appendChild(row);
    });
  }
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
function openMaterial(m, c){
  $("courseViewTitle").textContent = m.name;
  $("courseBody").innerHTML =
    '<button class="ghost-btn sm back-btn" id="matBack">‹ Back</button>'+
    '<div class="card"><div class="sec-head"><h3>'+esc(m.name)+'</h3><span class="fine">'+m.kind+' · '+m.size+' · demo</span></div>'+
    '<pre style="white-space:pre-wrap;font:inherit;font-size:13.5px;line-height:1.6;margin:0">'+esc(m.body)+'</pre></div>';
  $("matBack").addEventListener("click", ()=>{ if(c) openCourse(c.id, "materials"); else $("courseView").hidden = true; });
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
      enroll[c.id] = 1; saveEnroll(); renderCourses(); openCourse(c.id);
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
  renderGiftTop();
  toast("Watching "+t.handle+" live — demo");
}
function paintWatchMode(){
  const t = watchingHost, bar = $("watchBar");
  const cam = $("faceCam");
  if(!t){
    if(bar) bar.hidden = true;
    if(cam){ cam.classList.remove("viewer"); }
    const tag = $("faceCamTag"); if(tag) tag.hidden = true;
    applyLiveLayout(liveSetup.layout);
    stopHostSim(); syncHostControls(); renderGiftTop();
    renderLiveNow();
    return;
  }
  if(bar){
    bar.hidden = false;
    $("watchBarTxt").innerHTML = "👁 Watching <b>"+esc(t.handle)+"</b> live <span class='demo-tag'>Demo</span>";
  }
  if(cam){ cam.classList.add("viewer"); }
  const tag = $("faceCamTag"); if(tag){ tag.hidden = false; tag.textContent = t.handle; }
  applyLiveLayout(HOST_LAYOUTS[t.id] || "pip"); /* viewer mirrors the host's studio layout — demo */
  startHostSimPositions(t);
  syncHostControls();
  renderLiveNow();
}
function stopWatching(){ watchingHost = null; paintWatchMode(); renderGiftTop(); }

/* --- v16: live-now strip (who's live) + all-reels hub in the Live section --- */
function renderLiveNow(){
  const el = $("liveNowStrip"); if(!el) return;
  let html = "";
  if(youLive.active){
    html += '<button class="ln-item you" data-ln="you"><span class="ln-av" style="--g1:#2F80FF;--g2:#1B5FD6">AT</span><span class="ln-live">LIVE</span><span class="ln-name">You</span></button>';
  }
  Object.values(remoteLives).forEach(info=>{
    const watching = watchingRemote && watchingRemote.liveId===info.liveId;
    html += '<button class="ln-item remote'+(watching?' watching':'')+'" data-ln-remote="'+info.liveId+'"><span class="ln-av" style="--g1:'+(info.g?info.g[0]:"#2F80FF")+';--g2:'+(info.g?info.g[1]:"#1B5FD6")+'">'+esc(String(info.ini||"?").slice(0,2))+'</span><span class="ln-live">LIVE</span><span class="ln-name">'+esc(String(info.name).split(" ")[0])+'</span></button>';
  });
  TRADERS.filter(t=>!t.you && t.live).forEach(t=>{
    const watching = watchingHost && watchingHost.id===t.id;
    html += '<button class="ln-item'+(watching?' watching':'')+'" data-ln="'+t.id+'"><span class="ln-av" style="--g1:'+t.g[0]+';--g2:'+t.g[1]+'">'+t.ini+'</span><span class="ln-live">LIVE</span><span class="ln-name">'+esc(t.name.split(" ")[0])+'</span></button>';
  });
  /* v25.13: scheduled-slot fallback when nobody is live */
  if(!html){
    const top = TRADERS.filter(t=>!t.you).slice().sort((a,b)=>(b.ret||0)-(a.ret||0))[0];
    if(top){
      html = '<button class="ln-slot" id="lnSlot"><span class="ln-av slot" style="--g1:'+top.g[0]+';--g2:'+top.g[1]+'">'+top.ini+'</span>'+
        '<span class="ln-slot-meta"><b>'+esc(top.name)+' · live in ~2h</b><span>XAUUSD London scalps</span></span>'+
        '<span class="ln-remind" id="lnRemind">Remind me</span></button>';
    }else{
      html = '<span class="ln-empty">No one is live right now — be the first.</span>';
    }
  }
  el.innerHTML = html;
  const rm = $("lnRemind");
  if(rm) rm.addEventListener("click", e=>{ e.stopPropagation(); toast("Reminder set — demo"); });
  const sl = $("lnSlot");
  if(sl) sl.addEventListener("click", ()=>{ toast("Reminder set — demo"); });
  el.querySelectorAll(".ln-item").forEach(b=>b.addEventListener("click", ()=>{
    if(b.dataset.lnRemote){ watchRemoteLive(b.dataset.lnRemote); return; }
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
  const grids = ["reelsHubGrid","communityReels","reelsPageGrid"].map(id=>$(id)).filter(Boolean);
  if(!grids.length) return;
  const items = allReels().filter(({r})=>r.visibility!=="private");
  const c = $("reelsHubCount"); if(c) c.textContent = items.length + " reels";
  const html = items.map(({t,r})=>
    '<button class="reel-tile" data-reel="'+r.id+'" data-tid="'+t.id+'" style="--g1:'+t.g[0]+';--g2:'+t.g[1]+'">'+
    (r.videoUrl ? '<video class="rt-video" muted playsinline preload="metadata" src="'+r.videoUrl+'#t=0.1"></video>' : "")+
    '<span class="rt-play"><i>▶</i></span>'+
    '<span class="rt-handle">'+esc(t.handle)+'</span>'+
    '<span class="rt-meta"><b>'+esc(r.title)+'</b><span>▶ '+esc(r.views||"0")+'</span></span></button>').join("");
  grids.forEach(g=>{
    g.innerHTML = html;
    g.querySelectorAll(".reel-tile").forEach(tile=>tile.addEventListener("click", ()=>{
      const t = TRADERS.find(x=>x.id===tile.dataset.tid); if(!t) return;
      const r = (t.reels||[]).find(x=>x.id===tile.dataset.reel); if(!r) return;
      openReel(t, r, items);
    }));
  });
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
      const r = you.reels.find(x=>x.id===tile.dataset.reel); openReel(you, r, you.reels.map(x=>({ t:you, r:x })));
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
  const csAll = $("classesSeeAll"); if(csAll) csAll.addEventListener("click", ()=>goTab("classes"));
  renderCourses();
  /* reels */
  const rc = $("reelClose"); if(rc) rc.addEventListener("click", closeReel);
  /* hearts */
  $("heartBtn").addEventListener("click", ()=>{ floatHeart(); setTimeout(floatHeart, 120); });
  /* --- live workstream: gifting / schedule / invite / poll / qa / layout --- */
  $("giftBtn").addEventListener("click", openGiftSheet);
  $("giftX").addEventListener("click", closeGiftSheet);
  $("giftCancel").addEventListener("click", closeGiftSheet);
  $("giftSend").addEventListener("click", sendGift);
  $("schedLiveBtn").addEventListener("click", openSchedSheet);
  $("schedX").addEventListener("click", closeSchedSheet);
  $("schedCancel").addEventListener("click", closeSchedSheet);
  $("schedSave").addEventListener("click", saveSchedForm);
  seedSched(); renderUpcoming();
  $("inviteBtn").addEventListener("click", openInviteSheet);
  $("inviteX").addEventListener("click", closeInviteSheet);
  $("pollBtn").addEventListener("click", openPollSheet);
  $("pollX").addEventListener("click", closePollSheet);
  $("pollCancel").addEventListener("click", closePollSheet);
  $("pollLaunch").addEventListener("click", launchPoll);
  $("qaSend").addEventListener("click", sendQa);
  $("qaInput").addEventListener("keydown", e=>{ if(e.key==="Enter") sendQa(); });
  const llb2 = $("liveLayoutBtn");
  if(llb2) llb2.addEventListener("click", ()=>{
    const i = (LAYOUTS.findIndex(l=>l.id===liveLayoutCur)+1)%LAYOUTS.length;
    liveSetup.layout = LAYOUTS[i].id;
    applyLiveLayout(liveSetup.layout);
    renderLsLayoutChips();
    toast("Layout: "+LAYOUTS[i].label+" — demo");
  });
  /* live screen: watch-mode wiring */
  const lb = $("liveBack"); if(lb) lb.addEventListener("click", ()=>goTab("home"));
  $("liveTabs").addEventListener("click", e=>{
    const b = e.target.closest("[data-lv]"); if(!b) return;
    document.querySelectorAll("#liveTabs .lv-tab").forEach(x=>x.classList.toggle("active", x===b));
    const desk = window.matchMedia && window.matchMedia("(min-width:1024px)").matches;
    ["chat","ideas","about","qa"].forEach(t=>{
      const p = $("lvPage"+t[0].toUpperCase()+t.slice(1)); if(!p) return;
      const show = desk ? (t==="chat" ? true : t===b.dataset.lv) : t===b.dataset.lv;
      p.hidden = !show;
      p.classList.toggle("active", show);
    });
    if(b.dataset.lv === "about"){ try{ buildLiveChart(); }catch(e){} }
    if(b.dataset.lv === "qa") renderQa();
  });
  const lfb = $("liveFollowBtn");
  if(lfb) lfb.addEventListener("click", ()=>{
    const t = TRADERS.find(x=>x.id==="daud"); if(!t) return;
    t.following = !t.following;
    lfb.textContent = t.following ? "Following" : "Follow";
    lfb.classList.toggle("following", t.following);
    toast(t.following ? "Following Ali Khan — demo" : "Unfollowed — demo");
  });
  const lcb = $("liveCopyBtn2");
  if(lcb) lcb.addEventListener("click", ()=>openCopyModal("daud"));
  const lsb = $("liveShareBtn");
  if(lsb) lsb.addEventListener("click", ()=>{
    const txt = "Live Trading with Ali — XAUUSD live (demo)";
    if(navigator.share){ navigator.share({ title:"Trading Community", text:txt }).catch(()=>{}); }
    else if(navigator.clipboard){ navigator.clipboard.writeText(txt).then(()=>toast("Link copied (demo)")).catch(()=>toast("Share — demo")); }
    else toast("Share — demo");
  });
  const lsv = $("liveSaveBtn");
  if(lsv) lsv.addEventListener("click", ()=>{ lsv.classList.toggle("saved"); toast(lsv.classList.contains("saved") ? "Saved — demo" : "Unsaved — demo"); });
  const ceb = $("chatEmojiBtn");
  if(ceb) ceb.addEventListener("click", ()=>{ const i = $("chatInput"); i.value += "🔥"; i.focus(); });
  const cfb = $("camFlipBtn");
  if(cfb) cfb.addEventListener("click", ()=>toast("Camera options — demo"));
  const lmb = $("liveMoreBtn");
  if(lmb) lmb.addEventListener("click", ()=>toast("Report · Share · Quality — demo"));
  /* watch mode */
  $("watchLeave").addEventListener("click", ()=>{ stopWatching(); stopRemoteWatch(); });
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

/* ---------------- HOME FEED (reference layout) ---------------- */
function renderHomeMktChips(){
  const el = $("homeMktChips"); if(!el) return;
  const syms = ["XAUUSD","EURUSD","BTCUSD"];
  el.innerHTML = syms.map(s=>{
    const m = SYMBOLS[s], pr = px(s);
    const chg = m.chg || 0, up = chg >= 0;
    return '<button class="mkt-chip" data-mkt="'+s+'">'+
      '<span class="mkt-ic">'+esc(s.slice(0,1))+'</span>'+
      '<span class="mkt-tx"><b>'+s+'</b><b class="num">'+fmtP(s, pr.bid)+'</b>'+
      '<span class="num '+(up?"pl-pos":"pl-neg")+'">'+(up?"▲ ":"▼ ")+Math.abs(chg).toFixed(2)+'%</span></span></button>';
  }).join("");
  el.querySelectorAll("[data-mkt]").forEach(b=>b.addEventListener("click", ()=>{
    setSymbol(b.dataset.mkt); goTab("trade");
  }));
}

function renderHomeDesk(){
  const desk = document.querySelector(".home-desk"); if(!desk) return;
  /* hero */
  const hb = $("hdHeroBtn"); if(hb && !hb.dataset.w){ hb.dataset.w = "1"; hb.addEventListener("click", ()=>goTab("live")); }
  const hd = $("hdHero"); if(hd && !hd.dataset.w){ hd.dataset.w = "1"; hd.addEventListener("click", e=>{ if(!e.target.closest("button")) goTab("live"); }); }
  /* reels */
  const reels = allReels().filter(({r})=>r.visibility!=="private").slice(0,4);
  const hr = $("hdReels");
  if(hr) hr.innerHTML = reels.map(({t,r},i)=>
    '<button class="hd-reel" data-hr="'+i+'"><img src="https://picsum.photos/seed/hdreel'+r.id+'/300/420" alt="" loading="lazy">'+
    '<span class="rm-grad"></span><span class="rm-tx"><b>'+esc(r.title||"Reel")+'</b><span>▶ '+esc(r.views||"0")+'</span></span>'+
    '<span class="rm-dur num">0:'+(28+i*7)+'</span></button>').join("");
  if(hr) hr.querySelectorAll("[data-hr]").forEach(b=>b.addEventListener("click", ()=>{
    const {t,r} = reels[+b.dataset.hr]; openReel(t, r, reels);
  }));
  /* top traders */
  const top = TRADERS.filter(t=>!t.you).slice().sort((a,b)=>(b.ret||0)-(a.ret||0)).slice(0,4);
  const ht = $("hdTraders");
  if(ht) ht.innerHTML = top.map((t,i)=>
    '<div class="hd-tr"><span class="rank-n'+(i<3?' medal-'+(i+1):'')+'">'+(i+1)+'</span>'+
    '<button class="rank-id" data-tprof="'+t.id+'">'+avImg(t,"sm")+
    '<span class="hd-tr-id"><b>'+esc(t.name)+'</b><span>'+fmtK(t.followers)+' followers</span></span></button>'+
    '<span class="hd-tr-ret num">+'+t.ret.toFixed(1)+'%</span>'+
    '<button class="copy-btn" data-copytrader="'+t.id+'">Copy</button></div>').join("");
  /* popular ideas */
  const ideas = MOCK_POSTS.filter(p=>p.idea).slice(0,2);
  const hi = $("hdIdeas");
  if(hi) hi.innerHTML = ideas.map(p=>{
    const t = traderOf(p), d = p.idea;
    return '<div class="hd-idea"><div class="hd-idea-top">'+avImg(t,"sm")+
      '<b>'+esc(d.sym)+'</b><span class="dir-tag '+(d.dir==="BUY"?"buy":"sell")+'">'+esc(d.dir)+'</span>'+
      '<span class="likes">♥ <b class="num">'+p.likes.toLocaleString("en-US")+'</b></span></div>'+
      '<p>'+esc(p.body)+'</p>'+
      '<span class="fine">'+esc(t.name)+' · '+esc(p.time)+'</span></div>';
  }).join("");
  /* account card */
  const dep = $("hdDeposit"); if(dep && !dep.dataset.w){ dep.dataset.w="1"; dep.addEventListener("click", ()=>toast("Deposit — demo")); }
  const tn = $("hdTradeNow"); if(tn && !tn.dataset.w){ tn.dataset.w="1"; tn.addEventListener("click", ()=>goTab("trade")); }
  const cv = $("hdSpark");
  if(cv && typeof drawSpark === "function") drawSpark(cv, 4242, true);
  injectIcons();
}
/* ---------------- HOME (reference layout: mobile sections + desktop dashboard) ---------------- */
function renderHome(){
  renderHomeMktChips();
  renderHomeLive(); renderHomeReels(); renderHomeIdeas(); renderHomeTraders();
  renderHomeDesk();
  const hb = $("liveHeroBtn");
  if(hb && !hb.dataset.w){ hb.dataset.w = "1"; hb.addEventListener("click", ()=>goTab("live")); }
  injectIcons();
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
  row.innerHTML = items.map(({t,r})=>{
    let h = 0; for(const c of r.id) h = (h*31 + c.charCodeAt(0)) % 997;
    const dur = "0:" + String(18 + (h % 42)).padStart(2, "0");
    return '<button class="reel-tile" data-reel="'+r.id+'" data-tid="'+t.id+'" style="--g1:'+t.g[0]+';--g2:'+t.g[1]+'">'+
    (r.videoUrl ? '<video class="rt-video" muted playsinline preload="metadata" src="'+r.videoUrl+'#t=0.1"></video>' : "")+
    '<span class="rt-dur">'+dur+'</span>'+
    '<span class="rt-play"><i>▶</i></span>'+
    '<span class="rt-meta"><b>'+esc(r.title)+'</b><span>'+esc(r.views||"0")+' views</span></span></button>';
  }).join("");
  row.querySelectorAll(".reel-tile").forEach(tile=>tile.addEventListener("click", ()=>{
    const t = TRADERS.find(x=>x.id===tile.dataset.tid); if(!t) return;
    const r = (t.reels||[]).find(x=>x.id===tile.dataset.reel); if(!r) return;
    openReel(t, r, items);
  }));
}
function renderHomeIdeas(){
  const targets = ["homeIdeas","communityIdeas","ideasPageList"].map(id=>$(id)).filter(Boolean);
  if(!targets.length) return;
  const ideas = MOCK_POSTS.filter(p=>p.idea).slice(0,4);
  targets.forEach(el=>{
    if(!ideas.length){ el.innerHTML = '<div class="empty">No ideas yet — post one from the chart.</div>'; return; }
    el.innerHTML = "";
  ideas.forEach(p=>{
    const t = traderOf(p), d = p.idea;
    const c = document.createElement("article");
    c.className = "idea-card";
    c.innerHTML =
      '<div class="idea-top">'+avImg(t, "sm")+
      '<div class="idea-who"><b>'+esc(t.name)+'</b><span>'+esc(t.handle)+' · '+esc(p.time)+'</span></div>'+
      '<span class="idea-dir '+(d.dir==="BUY"?"buy":"sell")+'">'+esc(d.dir)+'</span></div>'+
      '<p class="idea-body">'+esc(p.body)+'</p>'+
      '<div class="idea-foot"><span><b class="num">'+esc(d.sym)+'</b> · '+esc(d.tf)+'</span>'+
      (d.n?'<span>Backtest <b class="num">'+d.win+'%</b> / '+d.n+'</span>':'')+
      '<button class="idea-like'+(p.liked?" liked":"")+'" data-like="'+p.id+'" aria-pressed="'+p.liked+'">♥ <b class="num">'+p.likes+'</b></button></div>';
    el.appendChild(c);
    });
  });
}
function renderHomeTraders(){
  const el = $("homeTopTraders"); if(!el) return;
  const top = TRADERS.filter(t=>!t.you).slice().sort((a,b)=>b.followers-a.followers).slice(0,6);
  el.innerHTML = top.map((t,i)=>
    '<div class="tt-card">'+
    '<span class="rank-badge">#'+(i+1)+'</span>'+
    '<button class="tt-id" data-tprof="'+t.id+'">'+avImg(t, "", (t.live?'<span class="trader-live">LIVE</span>':""))+
    '<b>'+esc(t.name)+'</b><span class="handle">'+esc(t.handle)+'</span></button>'+
    '<div class="tcard-stats"><b class="num pl-pos">+'+t.ret.toFixed(1)+'%</b><span>'+fmtK(t.followers)+' followers</span></div>'+
    '<button class="follow-btn sm'+(t.following?" following":"")+'" data-follow="'+t.id+'">'+(t.following?"Following":"Follow")+'</button></div>'
  ).join("");
}
/* home quick actions + see-all links */
["homePostIdea","homeUploadReel","homeGoLive"].forEach(id=>{
  const el = $(id); if(!el) return;
  if(id==="homePostIdea") el.addEventListener("click", openIdeaSheet);
  if(id==="homeUploadReel") el.addEventListener("click", triggerReelUpload);
  if(id==="homeGoLive") el.addEventListener("click", ()=>{ goTab("live"); setTimeout(()=>$("goLiveBtn").click(), 80); });
});
document.addEventListener("click", e=>{
  const g = e.target.closest("[data-goto]");
  if(g){ goTab(g.dataset.goto); return; }
});
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
      avImg(t, "", (t.live ? '<span class="trader-live">LIVE</span>' : ''))+
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
  tcSaveProfile({ name:name, handle:handle, ini:you.ini });
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
renderYouIdentity();
loadTrades(); loadAlerts(); loadBrokers();
injectIcons(); paintVersion();
unlockAch("early"); bumpStreak(); renderAchievements();
document.body.dataset.tab = "home";
/* your photo in the header / sidebar / profile (falls back to initials) */
(function(){
  const you = TRADERS.find(t=>t.you);
  if(!you || !you.pic) return;
  const img = '<img src="'+you.pic+'" alt="" loading="lazy" onerror="this.remove()">';
  ["profAvatar","avatarBtn","sideAvatar"].forEach(id=>{ const el=$(id); if(el && !el.querySelector("img")) el.innerHTML = img + el.innerHTML; });
  const host = TRADERS.find(t=>t.id==="daud");
  if(host && host.pic){
    const la = $("liveAvatar");
    if(la && !la.querySelector("img")) la.innerHTML = '<img src="'+host.pic+'" alt="" loading="lazy" onerror="this.remove()">AK';
  }
})();
renderWatchlist();
renderAlerts();
renderPoll();
renderPosts();
renderTraders();
renderCommunityTraders();
renderContest();
renderOwnerPosts();
attachSearch("globalSearch", "gsearchDrop");
attachSearch("homeSearch", "homeSearchDrop");
renderYouCard();
renderBrokers();
renderPositions();
renderPortfolio();
renderDepth(true);
renderTape(true);
setSymbol("XAUUSD");
setTheme((()=>{ try{ return localStorage.getItem("tc_theme_v1")==="dark" ? "dark" : "light"; }catch(e){ return "dark"; } })());
renderTicketTick();
renderAccount();
renderLiveNow();
renderHomeLiveRow();
try{ mqInit(); }catch(e){}
renderReelsHub();
renderHome();
try{ bootV15(); }catch(err){ console.error("[v15] boot failed:", err); }
setInterval(tick, 700); /* engine starts BEFORE the chart: a chart failure must never stall the app */
/* self-hosted candle chart — fully isolated: deferred sizing + internal try/catch */
try{ buildMainChart(); }catch(err){ console.error("[chart] buildMainChart threw:", err); }
}

/* ---- NAME-ONLY SIGNUP (Dawood 2026-09-27, testing): no password for now ----
   First launch asks for the name only; it becomes the account identity on this
   device (localStorage tc_profile_v1) and is applied to the "you" trader.
   Later: full signup with account types + password. */
function tcProfile(){ try{ return JSON.parse(localStorage.getItem("tc_profile_v1")||"null"); }catch(e){ return null; } }
function tcSaveProfile(p){ try{ localStorage.setItem("tc_profile_v1", JSON.stringify(p)); }catch(e){} }
function tcApplyProfile(p){
  if(!p || !p.name) return;
  var t = TRADERS.find(function(x){ return x.you; });
  if(t){ t.name = p.name; if(p.handle) t.handle = p.handle; if(p.ini) t.ini = p.ini; }
}
/* sync the saved identity into every "you" surface (profile, sidebar, header) */
function renderYouIdentity(){
  var you = TRADERS.find(function(t){ return t.you; }); if(!you) return;
  var pn = $("profName"); if(pn) pn.textContent = you.name;
  var ph = $("profHandle"); if(ph) ph.textContent = you.handle;
  var pb = $("profBio"); if(pb) pb.textContent = you.bio || "—";
  var sn = $("sideName"); if(sn) sn.textContent = you.name;
  if(!you.photo && !you.pic){
    ["profAvatar","avatarBtn","sideAvatar"].forEach(function(id){
      var el = $(id); if(el && !el.querySelector("img")) el.textContent = you.ini;
    });
  }
}
(function(){
  var booted = false;
  function start(){ if(booted) return; booted = true; bootApp(); }
  var lock = document.getElementById("tcLock");
  var p = tcProfile();
  if(p && p.name){ if(lock) lock.hidden = true; tcApplyProfile(p); renderYouIdentity(); start(); return; }
  if(lock) lock.hidden = false;
  function go(){
    var v = (document.getElementById("tcName").value || "").trim().replace(/\s+/g, " ").slice(0, 40);
    if(!v){ var inp0 = document.getElementById("tcName"); if(inp0) inp0.focus(); return; }
    var parts = v.split(" ");
    var ini = (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length-1].charAt(0) : "")).toUpperCase();
    var handle = "@" + v.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20);
    var prof = { name:v, handle:handle, ini:ini };
    tcSaveProfile(prof); tcApplyProfile(prof);
    var t = TRADERS.find(function(x){ return x.you; });
    if(t){ t.pic = null; t.photo = null; } /* fresh account: initials avatar, not the demo stock photo */
    renderYouIdentity();
    if(lock) lock.hidden = true;
    start();
  }
  document.getElementById("tcNameGo").addEventListener("click", go);
  document.getElementById("tcName").addEventListener("keydown", function(e){ if(e.key === "Enter") go(); });
  setTimeout(function(){ var inp = document.getElementById("tcName"); if(inp) inp.focus(); }, 300);
})();
      if(er) er.hidden = false;
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
    const s = lw.chart.addSeries(LW().LineSeries, { color:o.color, lineWidth:o.width, priceLineVisible:false, lastValueVisible:false, crosshairMarkerVisible:false });
    s.setData(o.data); indOverlaySeries.push(s);
  });
  Object.keys(indPanes).forEach(id=>{ if(!data.panes[id]) dropIndPane(id); });
  Object.values(data.panes).forEach(pd=>{
    const P = ensureIndPane(pd.def); if(!P) return;
    Object.values(P.series).forEach(s=>{ try{ P.chart.removeSeries(s); }catch(e){} });
    P.series = {};
    pd.items.forEach((it,i)=>{
      let s;
      if(it.kind === "hist") s = P.chart.addSeries(LW().HistogramSeries, { priceLineVisible:false, lastValueVisible:false });
      else if(it.kind === "band") s = P.chart.addSeries(LW().LineSeries, { color:"rgba(148,163,184,0.45)", lineWidth:1, lineStyle:L.LineStyle.Dashed, priceLineVisible:false, lastValueVisible:false, crosshairMarkerVisible:false });
      else s = P.chart.addSeries(LW().LineSeries, { color:it.color, lineWidth:it.width, priceLineVisible:false, lastValueVisible:false, crosshairMarkerVisible:false });
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
    const ts = state.quoteAt[s] ? new Date(state.quoteAt[s]).toLocaleString() : "";
    let src = kind === "live" ? "CoinGecko" : kind === "daily" ? "open.er-api.com" : "";
    if(!src) src = CG_IDS[s] ? "CoinGecko" : "open.er-api.com"; /* known provider even before first quote */
    if(!open){
      badge.className = "data-badge sim";
      badge.textContent = "Frozen · last price";
      badge.title = ts ? "Last real quote: "+ts+" via "+src : "Market closed — source: "+src;
    }else if(kind === "live"){
      badge.className = "data-badge live";
      badge.textContent = "Real-time"+ageTxt;
      badge.title = "Source: CoinGecko"+(ts ? " · updated "+ts : "");
    }else if(kind === "daily"){
      badge.className = "data-badge sim";
      badge.textContent = "Daily indicative"+ageTxt;
      badge.title = "Source: open.er-api.com"+(ts ? " · updated "+ts : "");
    }else{
      badge.className = "data-badge sim";
      badge.textContent = "Simulated";
      badge.title = "Simulated demo feed — not real market data";
    }
  }
  const note = $("mktNote");
  if(note) note.hidden = open;
  /* PAXG proxy honesty: XAUUSD here tracks the PAXG gold token, not a broker feed */
  const pxNote = $("proxyNote");
  if(pxNote) pxNote.hidden = (s !== "XAUUSD");
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
  const ex = $("indExpand"); if(ex) ex.addEventListener("click", ()=>{ buildIndSheet(); $("indSheetWrap").hidden = false; });
  const csb = $("chartSaveBtn"); if(csb) csb.addEventListener("click", ()=>toast("Chart layout saved — demo"));
  const snb = $("chartSnapBtn"); if(snb) snb.addEventListener("click", ()=>toast("Snapshot copied — demo"));
  document.querySelectorAll("#drawBar .db-btn").forEach(b=>b.addEventListener("click", ()=>{
    document.querySelectorAll("#drawBar .db-btn").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    if(b.dataset.draw!=="cross") toast(b.title+" tool — demo");
  }));
  bindIndSync();
  updateDataBadges(); /* paint market-open/closed + real-time/simulated state on first load */
  /* quick indicator chips under the chart */
  const CHIP_MAP = { ma:["sma50"], ema:["emaFast","emaSlow"], rsi:["rsi"], macd:["macd"], bb:["bb"] };
  function syncIndChips(){
    document.querySelectorAll("#indRow .ind-chip").forEach(c=>{
      const ids = CHIP_MAP[c.dataset.ind] || [];
      const on = ids.length && ids.every(id=>indCfg[id] && indCfg[id].on);
      c.classList.toggle("active", !!on);
    });
  }
  document.querySelectorAll("#indRow .ind-chip").forEach(c=>c.addEventListener("click", ()=>{
    const ids = CHIP_MAP[c.dataset.ind] || [];
    const turnOn = !(ids.length && ids.every(id=>indCfg[id] && indCfg[id].on));
    ids.forEach(id=>{ if(indCfg[id]) indCfg[id].on = turnOn; });
    saveIndCfg(); syncIndChips();
    try{ buildMainChart(); }catch(e){}
  }));
  syncIndChips();
  window.__syncIndChips = syncIndChips;
})();

/* ============================================================
   v25.13: PROP-FIRM CHALLENGE MODE (demo) + DM INBOX (demo)
   Everything simulated — never real money, never real trading.
   ============================================================ */

/* ---------- Prop challenge: track live demo-account equity ---------- */
const PROP_CFG = { target:0.10, ddMax:0.05, start:10000 };
const PROP_KEY = "tc_prop_v1";
function propLoad(){ try{ return JSON.parse(localStorage.getItem(PROP_KEY)) || null; }catch(e){ return null; } }
function propSave(s){ try{ localStorage.setItem(PROP_KEY, JSON.stringify(s)); }catch(e){} }
function propStart(){
  let eq = PROP_CFG.start;
  try{ eq = equity(); }catch(e){}
  propSave({ startEquity:eq, peakEquity:eq, funded:false, failed:false, startedAt:Date.now() });
  renderProp();
  goTab("prop");
}
/* evaluate against the live demo account on each render */
function propEval(){
  const s = propLoad();
  if(!s) return null;
  let eq = s.startEquity;
  try{ eq = equity(); }catch(e){}
  s.peakEquity = Math.max(s.peakEquity || eq, eq);
  const dd = s.peakEquity > 0 ? (s.peakEquity - eq) / s.peakEquity : 0;
  const pnl = s.startEquity > 0 ? (eq - s.startEquity) / s.startEquity : 0;
  if(!s.funded && !s.failed){
    if(dd >= PROP_CFG.ddMax) s.failed = true;
    else if(pnl >= PROP_CFG.target) s.funded = true;
  }
  propSave(s);
  return { s:s, eq:eq, dd:dd, pnl:pnl };
}
function propGaugeSVG(pnlFrac){
  const f = Math.max(0, Math.min(1, pnlFrac));
  const C = 169.65; /* half-circumference of r=54 arc */
  const col = f >= 1 ? "var(--green)" : "var(--blue)";
  return '<svg class="prop-gauge" width="140" height="78" viewBox="0 0 140 78" aria-hidden="true">'
    + '<path d="M16 64 A54 54 0 0 1 124 64" fill="none" stroke="var(--bg-soft)" stroke-width="12" stroke-linecap="round"/>'
    + '<path d="M16 64 A54 54 0 0 1 124 64" fill="none" stroke="'+col+'" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+(C*f).toFixed(1)+' 999"/>'
    + '<text x="70" y="52" text-anchor="middle" font-size="17" font-weight="800" fill="var(--text)">'+(f*10).toFixed(1)+'%</text>'
    + '<text x="70" y="70" text-anchor="middle" font-size="10" fill="var(--faint)">of +10% target</text></svg>';
}
function propRulesHTML(){
  return '<div class="prop-rules">'
    + '<div class="prop-rule"><span class="ic" data-icon="bank"></span><span>Account: <b>$10,000 demo</b> starting equity</span></div>'
    + '<div class="prop-rule"><span class="ic" data-icon="chart"></span><span>Profit target: <b>+10%</b></span></div>'
    + '<div class="prop-rule"><span class="ic" data-icon="shield"></span><span>Max drawdown: <b>\u22125%</b> from peak equity</span></div>'
    + '<div class="prop-rule"><span class="ic" data-icon="info"></span><span>Time limit: <b>none</b></span></div></div>';
}
function syncFundedBadge(){
  const b = $("fundedBadge");
  if(!b) return;
  const s = propLoad();
  b.hidden = !(s && s.funded);
}
function renderProp(){
  const body = $("propBody");
  if(!body) return;
  const r = propEval();
  if(!r){
    body.innerHTML = '<div class="prop-card"><div class="prop-promo-top"><span class="ic" data-icon="trophy"></span><b>Challenge rules</b><span class="demo-tag">Demo</span></div>'
      + propRulesHTML()
      + '<p class="fine prop-note">Tracked against your live demo account equity from the moment you start. Simulated \u2014 no real money, no real funding.</p>'
      + '<button class="primary-btn wide" id="propStartBtn"><span class="ic xs" data-icon="trophy"></span> Start demo challenge</button></div>';
    injectIcons();
    const sb = $("propStartBtn");
    if(sb) sb.addEventListener("click", propStart);
    return;
  }
  const s = r.s, pct = r.pnl*100, ddPct = r.dd*100;
  const cls = s.funded ? "ok" : (s.failed ? "bad" : "run");
  const ic = s.funded ? "check" : (s.failed ? "x" : "live");
  const label = s.funded ? "PASSED \u2014 Funded (demo)" : (s.failed ? "Challenge failed \u2014 demo" : "In progress \u2014 demo");
  const ddFrac = Math.min(1, r.dd / PROP_CFG.ddMax);
  body.innerHTML = '<div class="prop-card"><div class="prop-promo-top"><span class="ic" data-icon="trophy"></span><b>Your challenge</b><span class="demo-tag">Demo</span></div>'
    + '<div class="prop-gauge-wrap">' + propGaugeSVG(r.pnl / PROP_CFG.target)
    + '<div class="prop-gauge-vals"><span class="fine">Equity</span><span class="num">$'+r.eq.toFixed(2)+'</span>'
    + '<span class="'+(pct>=0?"pos":"neg")+'">'+(pct>=0?"+":"")+pct.toFixed(2)+'% P/L</span></div></div>'
    + '<div class="prop-dd"><div class="prop-dd-top"><span>Drawdown <b class="'+(ddPct>0?"neg":"")+'">'+ddPct.toFixed(2)+'%</b></span><span>limit \u22125%</span></div>'
    + '<div class="dd-track"><div class="dd-fill'+(ddFrac>=0.7?" warn":"")+'" style="width:'+(ddFrac*100).toFixed(1)+'%"></div></div></div>'
    + '<div class="prop-status '+cls+'"><span class="ic" data-icon="'+ic+'"></span>'+label+'</div>'
    + (s.failed ? '<button class="primary-btn wide" id="propRetryBtn"><span class="ic xs" data-icon="plus"></span> Retry challenge</button>' : '')
    + '<p class="fine prop-note">Progress and drawdown are measured on your live demo account equity. Breach of \u22125% drawdown fails the challenge; +10% profit passes it. Demo simulation only.</p></div>';
  injectIcons();
  const rb = $("propRetryBtn");
  if(rb) rb.addEventListener("click", propStart);
  syncFundedBadge();
}

/* ---------- DM inbox (demo): simulated replies ---------- */
const DM_KEY = "tc_dm_v1";
let dmOpenTid = null;
const DM_REPLIES = [
  "Good question! I keep my risk per trade under 1% \u2014 boring but it works. (demo reply)",
  "I'm watching XAUUSD into the London session. What's on your radar? (demo reply)",
  "Thanks! Just sharing what I'm learning \u2014 none of this is financial advice. (demo reply)",
  "Patience is the whole game. I wait for my setup and skip everything else. (demo reply)",
  "Check the Classes tab \u2014 there's a lesson that covers exactly this. (demo reply)",
  "Markets are choppy today, so I'm mostly flat and waiting. (demo reply)"
];
function dmLoad(){ try{ const d = JSON.parse(localStorage.getItem(DM_KEY)); if(d && d.threads) return d; }catch(e){} return null; }
function dmSave(d){ try{ localStorage.setItem(DM_KEY, JSON.stringify(d)); }catch(e){} }
function dmNow(){ return Date.now(); }
function dmTimeStr(ts){ return new Date(ts).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }); }
function dmTrader(tid){ return TRADERS.find(function(t){ return t.id === tid; }); }
function dmEnsure(){
  let d = dmLoad();
  if(d) return d;
  const t = dmNow();
  d = { threads:{
    "daud":[
      { from:"daud", text:"Hey! Saw you checking out my profile \u2014 welcome to the community. (demo message)", time:t-7200000 },
      { from:"you", text:"Thanks! How do you usually trade gold around news events?", time:t-7000000 },
      { from:"daud", text:"I mostly sit out the first 5 minutes after big news, then trade the trend. Risk small! (demo reply)", time:t-6900000 }
    ],
    "sara":[
      { from:"sara", text:"Hi! Loved your question in the community chat. (demo message)", time:t-86400000 },
      { from:"sara", text:"I share my swing setups every Sunday \u2014 feel free to ask anything. (demo message)", time:t-86300000 }
    ]},
    unread:{ "sara":2 } };
  dmSave(d);
  return d;
}
function dmUnreadTotal(){
  const d = dmEnsure();
  return Object.keys(d.unread || {}).reduce(function(a,k){ return a + (d.unread[k] || 0); }, 0);
}
function updateDmDot(){
  const el = $("dmDot");
  if(el) el.hidden = dmUnreadTotal() === 0;
}
function renderDmList(){
  const list = $("dmList"), thread = $("dmThread");
  if(!list) return;
  dmOpenTid = null;
  thread.hidden = true; list.hidden = false;
  const d = dmEnsure();
  const ids = Object.keys(d.threads).sort(function(a,b){
    const ma = d.threads[a], mb = d.threads[b];
    return mb[mb.length-1].time - ma[ma.length-1].time;
  });
  if(!ids.length){ list.innerHTML = '<div class="dm-empty">No conversations yet.</div>'; return; }
  list.innerHTML = ids.map(function(tid){
    const t = dmTrader(tid);
    if(!t) return "";
    const msgs = d.threads[tid];
    const last = msgs[msgs.length-1];
    const un = d.unread[tid] || 0;
    return '<button class="dm-row'+(un?" unread":"")+'" data-dmthread="'+tid+'">'
      + avImg(t,"")
      + '<span class="dm-meta"><span class="dm-meta-top"><b>'+esc(t.name)+'</b><span class="dm-time">'+dmTimeStr(last.time)+'</span></span>'
      + '<span class="dm-prev">'+esc((last.from==="you" ? "You: " : "") + last.text)+'</span></span>'
      + (un ? '<span class="dm-cnt">'+un+'</span>' : '')
      + '</button>';
  }).join("");
  injectIcons();
  list.querySelectorAll("[data-dmthread]").forEach(function(b){
    b.addEventListener("click", function(){ openDmThread(b.dataset.dmthread); });
  });
}
function openDmThread(tid){
  const t = dmTrader(tid);
  if(!t) return;
  dmOpenTid = tid;
  const d = dmEnsure();
  d.unread[tid] = 0; dmSave(d); updateDmDot();
  $("dmList").hidden = true;
  const th = $("dmThread"); th.hidden = false;
  $("dmHead").innerHTML = avImg(t,"") + '<b>'+esc(t.name)+'</b><span class="demo-tag">Demo</span>';
  renderDmMsgs();
  injectIcons();
}
function renderDmMsgs(){
  const d = dmEnsure();
  const msgs = d.threads[dmOpenTid] || [];
  const box = $("dmMsgs");
  if(!box) return;
  box.innerHTML = msgs.map(function(m){
    return '<div class="dm-bub '+(m.from==="you"?"me":"them")+'">'+esc(m.text)+'<span class="dm-t">'+dmTimeStr(m.time)+'</span></div>';
  }).join("");
  box.scrollTop = box.scrollHeight;
}
function sendDm(){
  const inp = $("dmInput");
  const txt = inp ? (inp.value || "").trim() : "";
  if(!txt || !dmOpenTid) return;
  const tid = dmOpenTid;
  const d = dmEnsure();
  d.threads[tid].push({ from:"you", text:txt, time:dmNow() });
  dmSave(d);
  inp.value = "";
  renderDmMsgs();
  /* simulated reply in 2-5s */
  const reply = DM_REPLIES[Math.floor(Math.random()*DM_REPLIES.length)];
  setTimeout(function(){
    const dd = dmEnsure();
    if(!dd.threads[tid]) return;
    dd.threads[tid].push({ from:tid, text:reply, time:dmNow() });
    if(dmOpenTid === tid && $("dmThread") && !$("dmThread").hidden){
      dmSave(dd); renderDmMsgs();
    }else{
      dd.unread[tid] = (dd.unread[tid] || 0) + 1; dmSave(dd);
    }
    updateDmDot();
  }, 2000 + Math.random()*3000);
}

/* ---------- v25.13 wiring ---------- */
(function initGrowth(){
  const dmB = $("dmBtn");
  if(dmB) dmB.addEventListener("click", function(){ renderDmList(); goTab("dm"); });
  const hp = $("homePropStart");
  if(hp) hp.addEventListener("click", propStart);
  const sb = $("dmSendBtn");
  if(sb) sb.addEventListener("click", sendDm);
  const di = $("dmInput");
  if(di) di.addEventListener("keydown", function(e){ if(e.key === "Enter") sendDm(); });
  const bb = $("dmBackBtn");
  if(bb) bb.addEventListener("click", renderDmList);
  /* re-render when these screens are reached via delegated data-goto links */
  document.addEventListener("click", function(e){
    const g = e.target.closest("[data-goto]");
    if(!g) return;
    if(g.dataset.goto === "prop") setTimeout(renderProp, 0);
    if(g.dataset.goto === "dm") setTimeout(renderDmList, 0);
  });
  dmEnsure();
  updateDmDot();
  syncFundedBadge();
  renderProp();
})();

/* ============ GROWTH WORKSTREAM (v25.13, demo) ============ */
/* Shared helpers — function declarations so hoisting reaches the leaderboard + trader-profile renders above */
function gStoreGet(k,d){ try{ const v = JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } }
function gStoreSet(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function verifyList(){ const a = gStoreGet("tc_verify_v1", []); return Array.isArray(a) ? a : []; }
function verifiedSet(){ return new Set(verifyList().filter(a=>a.status==="approved").map(a=>String(a.handle||"").toLowerCase())); }
function verifyBoost(h){ return verifiedSet().has(String(h||"").toLowerCase()) ? 50 : 0; }

(function(){
"use strict";

/* ---- central affiliate config — edit broker URLs here ---- */
const AFFILIATES = {
  exness:  { url:"https://www.exness.com/a/demo-placeholder",  label:"Exness"  },
  vantage: { url:"https://www.vantage.com/demo-placeholder",   label:"Vantage" }
};

/* ---------- 1. ECONOMIC CALENDAR (demo schedule) ---------- */
const ECON_EVENTS = [
  {id:"e1",  day:"Tue", date:"09/29", time:"01:30 UTC", ccy:"AUD", title:"RBA meeting minutes",        impact:"med"},
  {id:"e2",  day:"Tue", date:"09/29", time:"14:00 UTC", ccy:"USD", title:"CB Consumer Confidence",     impact:"med"},
  {id:"e3",  day:"Wed", date:"09/30", time:"12:00 UTC", ccy:"EUR", title:"German CPI (prelim)",        impact:"med"},
  {id:"e4",  day:"Wed", date:"09/30", time:"12:15 UTC", ccy:"USD", title:"ADP Non-Farm Employment",    impact:"high"},
  {id:"e5",  day:"Wed", date:"09/30", time:"12:30 UTC", ccy:"USD", title:"GDP — Q2 final",             impact:"med"},
  {id:"e6",  day:"Thu", date:"10/01", time:"11:00 UTC", ccy:"GBP", title:"BoE Gov. Bailey speaks",     impact:"med"},
  {id:"e7",  day:"Thu", date:"10/01", time:"14:00 UTC", ccy:"USD", title:"ISM Manufacturing PMI",      impact:"high"},
  {id:"e8",  day:"Fri", date:"10/02", time:"12:30 UTC", ccy:"USD", title:"Non-Farm Payrolls (NFP)",    impact:"high"},
  {id:"e9",  day:"Fri", date:"10/02", time:"12:30 UTC", ccy:"USD", title:"Unemployment rate",          impact:"high"},
  {id:"e10", day:"Tue", date:"10/06", time:"03:30 UTC", ccy:"AUD", title:"RBA rate decision",          impact:"high"},
  {id:"e11", day:"Wed", date:"10/07", time:"02:00 UTC", ccy:"NZD", title:"RBNZ rate decision",         impact:"high"},
  {id:"e12", day:"Wed", date:"10/07", time:"18:00 UTC", ccy:"USD", title:"FOMC meeting minutes",       impact:"high"},
  {id:"e13", day:"Fri", date:"10/09", time:"12:30 UTC", ccy:"USD", title:"CPI (m/m) — illustrative",  impact:"high"},
  {id:"e14", day:"Fri", date:"10/09", time:"12:30 UTC", ccy:"CAD", title:"Employment change",          impact:"med"}
];
function econReminders(){ const s = gStoreGet("tc_econ_v1", {reminders:[]}); return s.reminders || []; }
function renderEcon(){
  const list = $("econList"); if(!list) return;
  const rem = econReminders();
  list.innerHTML = ECON_EVENTS.map(e=>{
    const on = rem.indexOf(e.id) >= 0;
    return '<div class="econ-row">'+
      '<div class="econ-date"><b>'+e.day+'</b><span>'+e.date+'</span></div>'+
      '<div class="econ-main"><b>'+esc(e.title)+'</b><span class="fine">'+esc(e.ccy)+' · '+esc(e.time)+'</span></div>'+
      '<i class="econ-dot '+e.impact+'" title="'+e.impact+' impact"></i>'+
      '<button class="icon-btn econ-bell'+(on?" on":"")+'" data-econ="'+e.id+'" aria-pressed="'+on+'" aria-label="Reminder">'+
      '<span class="ic sm" data-icon="bell"></span></button></div>';
  }).join("");
  injectIcons();
}
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-econ]"); if(!b) return;
  const id = b.dataset.econ, reminders = econReminders(), i = reminders.indexOf(id);
  if(i >= 0){ reminders.splice(i,1); toast("Reminder off — demo"); }
  else{ reminders.push(id); toast("Reminder set — demo"); }
  gStoreSet("tc_econ_v1", { reminders:reminders });
  renderEcon();
});
renderEcon();

/* ---------- 2. LANGUAGE (EN/AR/HI/UR) ---------- */
const LANGS = {
  en:{ navHome:"Home", navTrade:"Trade", navLive:"Live", navReels:"Reels", navCommunity:"Community", navPortfolio:"Portfolio",
       topTraders:"Top Traders", seeAll:"See All ›", reelsIdeas:"Reels & Trade Ideas", classes:"Classes", upcomingLives:"Upcoming lives",
       watchLive:"Watch Live", startChallenge:"Start demo challenge", viewDashboard:"View dashboard ›",
       installTitle:"Install the app", installBtn:"Install app",
       language:"Language", inviteFriends:"Invite friends", econTitle:"Economic Calendar" },
  ar:{ navHome:"الرئيسية", navTrade:"تداول", navLive:"بث مباشر", navReels:"ريلز", navCommunity:"المجتمع", navPortfolio:"المحفظة",
       topTraders:"أفضل المتداولين", seeAll:"‹ عرض الكل", reelsIdeas:"ريلز وأفكار التداول", classes:"الدروس", upcomingLives:"بثوث قادمة",
       watchLive:"شاهد البث", startChallenge:"ابدأ التحدي التجريبي", viewDashboard:"‹ عرض اللوحة",
       installTitle:"ثبّت التطبيق", installBtn:"تثبيت التطبيق",
       language:"اللغة", inviteFriends:"ادعُ أصدقاءك", econTitle:"التقويم الاقتصادي" },
  hi:{ navHome:"होम", navTrade:"ट्रेड", navLive:"लाइव", navReels:"रील्स", navCommunity:"कम्युनिटी", navPortfolio:"पोर्टफोलियो",
       topTraders:"टॉप ट्रेडर्स", seeAll:"सभी देखें ›", reelsIdeas:"रील्स और ट्रेड आइडिया", classes:"क्लासेस", upcomingLives:"आगामी लाइव",
       watchLive:"लाइव देखें", startChallenge:"डेमो चैलेंज शुरू करें", viewDashboard:"डैशबोर्ड देखें ›",
       installTitle:"ऐप इंस्टॉल करें", installBtn:"ऐप इंस्टॉल करें",
       language:"भाषा", inviteFriends:"दोस्तों को आमंत्रित करें", econTitle:"आर्थिक कैलेंडर" },
  ur:{ navHome:"ہوم", navTrade:"ٹریڈ", navLive:"لائیو", navReels:"ریلز", navCommunity:"کمیونٹی", navPortfolio:"پورٹ فولیو",
       topTraders:"ٹاپ ٹریڈرز", seeAll:"سب دیکھیں ›", reelsIdeas:"ریلز اور ٹریڈ آئیڈیاز", classes:"کلاسز", upcomingLives:"آنے والے لائیو",
       watchLive:"لائیو دیکھیں", startChallenge:"ڈیمو چیلنج شروع کریں", viewDashboard:"ڈیش بورڈ دیکھیں ›",
       installTitle:"ایپ انسٹال کریں", installBtn:"ایپ انسٹال کریں",
       language:"زبان", inviteFriends:"دوستوں کو مدعو کریں", econTitle:"معاشی کیلنڈر" }
};
function applyLang(l){
  const d = LANGS[l] || LANGS.en;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const v = d[el.dataset.i18n];
    if(v != null) el.textContent = v;
  });
  const rtl = (l === "ar" || l === "ur");
  document.documentElement.dir = rtl ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", rtl);
  gStoreSet("tc_lang_v1", l);
}
const langSel = $("langSel");
if(langSel){
  const cur = gStoreGet("tc_lang_v1", "en");
  langSel.value = LANGS[cur] ? cur : "en";
  langSel.addEventListener("change", ()=>{ applyLang(langSel.value); toast("Language updated — demo"); });
  applyLang(langSel.value); /* re-apply on boot */
}

/* ---------- 3. REFERRAL REWARDS ---------- */
function refState(){
  let s = gStoreGet("tc_ref_v1", null);
  if(!s || !s.code){ s = { code:"DEMO-"+Math.random().toString(36).slice(2,6).toUpperCase(), invited:0 }; gStoreSet("tc_ref_v1", s); }
  return s;
}
function renderRef(){
  const s = refState(), link = "https://trade.flexspot.lol/?ref="+s.code;
  ["refLink","refLinkP"].forEach(id=>{ const el=$(id); if(el) el.value = link; });
  ["refCount","refCountP"].forEach(id=>{ const el=$(id); if(el) el.textContent = s.invited; });
}
function copyRef(inputId){
  const el = $(inputId); if(!el || !el.value) return;
  const done = ()=>toast("Invite link copied — demo");
  if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(el.value).then(done, done); }
  else { try{ el.select(); document.execCommand("copy"); }catch(e){} done(); }
}
function simInvite(){
  const s = refState(); s.invited++; gStoreSet("tc_ref_v1", s); renderRef();
  state.balance += 25;
  state.history.push({ id:"h"+(state.orderSeq++), sym:"USD", dir:"DEPOSIT", lots:0, entry:0, exit:0, pl:25,
    time:new Date().toISOString(), reason:"Referral bonus — demo", cash:true });
  saveTrades(); renderPortfolio(); renderAccount(); paintProfileStats();
  toast("Simulated invite — +$25 demo funds");
}
["refCopy","refCopyP"].forEach(id=>{ const b=$(id); if(b) b.addEventListener("click", ()=>copyRef(id==="refCopy"?"refLink":"refLinkP")); });
["refSim","refSimP"].forEach(id=>{ const b=$(id); if(b) b.addEventListener("click", simInvite); });
renderRef();

/* ---------- 4. INSTALL PROMPT ---------- */
let bipEvent = null;
window.addEventListener("beforeinstallprompt", e=>{ e.preventDefault(); bipEvent = e; renderInstallCard(); });
window.addEventListener("appinstalled", ()=>{ gStoreSet("tc_install_v1", true); });
function renderInstallCard(){
  const c = $("installCard"); if(!c) return;
  if(gStoreGet("tc_install_v1", false)){ c.hidden = true; return; }
  c.hidden = false;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent || "");
  const how = $("installHow");
  if(how) how.textContent = bipEvent ? "Ready to install — tap the button below."
    : (ios ? "iPhone: Share → Add to Home Screen" : "Android: menu ⋮ → Add to Home screen");
  const ib = $("installBtn"); if(ib) ib.hidden = !bipEvent;
  injectIcons();
}
const installX = $("installX");
if(installX) installX.addEventListener("click", ()=>{ gStoreSet("tc_install_v1", true); $("installCard").hidden = true; });
const installBtn = $("installBtn");
if(installBtn) installBtn.addEventListener("click", ()=>{
  if(!bipEvent) return;
  bipEvent.prompt();
  bipEvent.userChoice.then(()=>{ gStoreSet("tc_install_v1", true); $("installCard").hidden = true; bipEvent = null; }).catch(()=>{});
});
renderInstallCard();

/* ---------- 5. LEVEL QUIZ ---------- */
const QUIZ = [
  { q:"How long have you been trading?",       opts:[["Just starting",0],["1–2 years",1],["3+ years",2]] },
  { q:"Which markets do you trade?",           opts:[["Haven't traded yet — learning",0],["Forex or crypto",1],["Multiple markets, incl. indices/metals",2]] },
  { q:"How much do you risk per trade?",       opts:[["Not sure yet",0],["1–2% of the account",1],["A fixed % with a written plan",2]] },
  { q:"Your main goal here?",                  opts:[["Learn the basics",0],["Copy good traders",1],["Build a pro setup",2]] }
];
let quizIdx = 0, quizScore = 0;
function quizLevelName(){ return (gStoreGet("tc_level_v1", {}).level) || null; }
function paintQuizLevel(){
  const el = $("quizLevelName"); if(!el) return;
  const l = quizLevelName();
  el.textContent = l ? l.charAt(0).toUpperCase()+l.slice(1)+" · retake anytime" : "Beginner · Intermediate · Pro";
}
function openQuiz(){
  quizIdx = 0; quizScore = 0;
  const sh = $("quizSheet"); if(!sh) return;
  sh.hidden = false; renderQuizQ(); injectIcons();
}
function renderQuizQ(){
  const body = $("quizBody"); if(!body) return;
  const q = QUIZ[quizIdx];
  body.innerHTML =
    '<div class="quiz-prog">'+QUIZ.map((_,j)=>'<i class="'+(j<quizIdx?"done":j===quizIdx?"cur":"")+'"></i>').join("")+'</div>'+
    '<h4 class="quiz-q">'+esc(q.q)+'</h4>'+
    '<div class="quiz-opts">'+q.opts.map((o,j)=>'<button class="quiz-opt" data-qa="'+j+'">'+esc(o[0])+'</button>').join("")+'</div>';
}
function finishQuiz(){
  const level = quizScore <= 2 ? "beginner" : quizScore <= 5 ? "intermediate" : "pro";
  gStoreSet("tc_level_v1", { level:level, ts:Date.now() });
  paintQuizLevel(); applyLevelHome();
  const body = $("quizBody"); if(!body) return;
  const blurb = { beginner:"Education & classes come first — learn the ropes risk-free.",
                  intermediate:"Top traders & copy trading — follow the leaderboard.",
                  pro:"Leaderboard first — your full pro setup is unlocked." }[level];
  body.innerHTML = '<div class="quiz-done"><div class="ob-emoji">'+(level==="pro"?"🏆":level==="intermediate"?"📈":"🎓")+'</div>'+
    '<h4 class="quiz-q">You\'re '+level+' — demo</h4><p class="fine">'+blurb+'<br>Home has been personalized. Retake anytime from Settings.</p>'+
    '<button class="primary-btn wide" id="quizDone">Done</button></div>';
  const d = $("quizDone"); if(d) d.addEventListener("click", ()=>{ $("quizSheet").hidden = true; });
  toast("Level set: "+level+" — demo");
}
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-qa]"); if(!b || !QUIZ[quizIdx]) return;
  quizScore += QUIZ[quizIdx].opts[+b.dataset.qa][1];
  quizIdx++;
  if(quizIdx >= QUIZ.length) finishQuiz(); else renderQuizQ();
});
const quizX = $("quizX");
if(quizX) quizX.addEventListener("click", ()=>{ $("quizSheet").hidden = true; });
const quizRetake = $("quizRetake");
if(quizRetake) quizRetake.addEventListener("click", openQuiz);
paintQuizLevel();
function applyLevelHome(){
  const tr = $("homeSecTraders"), cl = $("homeSecClasses");
  if(!tr || !cl || !tr.parentNode) return;
  const parent = tr.parentNode, l = quizLevelName();
  if(l === "beginner"){ parent.insertBefore(cl, tr); }          /* classes first */
  else if(l === "pro"){ const a = $("homeMktChips"); if(a && a.parentNode===parent) parent.insertBefore(tr, a); } /* traders up */
  else if(l === "intermediate"){ parent.insertBefore(tr, cl); } /* default order */
}
applyLevelHome();

/* ---------- 6. VERIFIED PRO APPLICATIONS ---------- */
function renderVerify(){
  const list = $("verifyList"); if(!list) return;
  const apps = verifyList();
  list.innerHTML = apps.length ? apps.map((a,i)=>
    '<div class="vfy-row"><span class="avatar sm vfy-av">'+esc(String(a.handle).replace("@","").slice(0,2).toUpperCase())+'</span>'+
    '<span class="vfy-tx"><b>'+esc(a.handle)+'</b><span class="fine">'+esc(a.specialty||"—")+' · '+a.status+'</span></span>'+
    (a.status==="pending"
      ? '<span class="vfy-actions"><button class="ghost-btn sm" data-vact="approve" data-vidx="'+i+'">Approve</button>'+
        '<button class="ghost-btn sm" data-vact="reject" data-vidx="'+i+'">Reject</button></span>'
      : '<span class="fine vfy-'+a.status+'">'+(a.status==="approved"?"✓ Approved":"Rejected")+'</span>')+'</div>').join("")
    : '<p class="fine">No applications yet — demo.</p>';
}
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-vact]"); if(!b) return;
  const apps = verifyList(), i = +b.dataset.vidx, a = apps[i]; if(!a) return;
  a.status = b.dataset.vact === "approve" ? "approved" : "rejected";
  gStoreSet("tc_verify_v1", apps); renderVerify();
  try{ renderCommunityTraders(); renderTraders(); }catch(err){}
  try{ if(curTprof && !$("traderProfile").hidden) renderTraderProfile(curTprof); }catch(err){}
  toast(a.handle+(a.status==="approved" ? " approved ✓ — demo" : " rejected — demo"));
});
const vfyApply = $("vfyApply");
if(vfyApply) vfyApply.addEventListener("click", ()=>{
  let h = (($("vfyHandle")||{}).value || "").trim();
  if(!h){ toast("Enter a trading handle — demo"); return; }
  if(h[0] !== "@") h = "@"+h;
  h = h.toLowerCase();
  const apps = verifyList();
  apps.push({ handle:h, specialty:(($("vfySpec")||{}).value||"").trim(), link:(($("vfyLink")||{}).value||"").trim(), status:"pending", ts:Date.now() });
  gStoreSet("tc_verify_v1", apps); renderVerify();
  ["vfyHandle","vfySpec","vfyLink"].forEach(id=>{ const el=$(id); if(el) el.value=""; });
  toast("Application received — demo");
});
renderVerify();
/* remember the open trader profile so approvals can refresh its badge immediately */
let curTprof = null;
const _openTraderProfile = openTraderProfile;
openTraderProfile = function(id){ curTprof = id; return _openTraderProfile(id); };

/* ---------- 7. BROKER AFFILIATE BUTTONS ---------- */
function renderAffiliates(){
  const html = '<div class="set-title">Partner brokers <span class="demo-tag">Demo</span></div>' +
    Object.keys(AFFILIATES).map(k=>{
      const a = AFFILIATES[k];
      return '<a class="aff-btn" href="'+a.url+'" target="_blank" rel="nofollow noopener">'+
        '<span class="aff-ic">'+esc(a.label.slice(0,2).toUpperCase())+'</span>'+
        '<span class="aff-tx"><b>Open demo account — '+esc(a.label)+'</b><span class="fine">affiliate link — demo</span></span>'+
        '<span class="ic xs" data-icon="chev"></span></a>';
    }).join("");
  ["affRow","affSheetRow"].forEach(id=>{ const el=$(id); if(el) el.innerHTML = html; });
  injectIcons();
}
renderAffiliates();

/* ---------- 8. PROFILE STATS FROM DEMO ACTIVITY ---------- */
function paintProfileStats(){
  const tr = state.history.filter(h=>!h.cash);
  const wins = tr.filter(h=>(h.pl||0) > 0).length;
  const set = (id,v)=>{ const el=$(id); if(el) el.textContent = v; };
  set("statWin", tr.length ? Math.round(wins/tr.length*100)+"%" : "—");
  set("statTrades", String(tr.length));
  const pl = tr.reduce((a,h)=>a+(h.pl||0), 0);
  const pe = $("statPL"); if(pe) pe.textContent = (pl>=0?"+":"")+fmt$(pl);
}
const _goTabGrowth = goTab;
goTab = function(t){ _goTabGrowth(t); if(t==="profile"){ try{ paintProfileStats(); }catch(e){} } };
paintProfileStats();

/* ---------- 9. ONBOARDING ---------- */
const OB_SLIDES = [
  { e:"📊", t:"Trade the demo", x:"Buy & sell gold, crypto and forex on a $10,000 virtual account. No real money — ever." },
  { e:"👥", t:"Copy traders",   x:"Follow top traders and mirror their trades with play money on the leaderboard." },
  { e:"📹", t:"Go live",        x:"Stream your trading, share ideas and reels, and grow your own community." }
];
let obIdx = 0, obFinished = false;
function renderOb(){
  const s = OB_SLIDES[obIdx];
  $("obEmoji").textContent = s.e; $("obTitle").textContent = s.t; $("obText").textContent = s.x;
  $("obDots").innerHTML = OB_SLIDES.map((_,j)=>'<i class="'+(j===obIdx?"cur":"")+'"></i>').join("");
  $("obNext").textContent = obIdx === OB_SLIDES.length-1 ? "Get started" : "Next";
}
function showOnboard(){ obIdx = 0; renderOb(); $("onboardWrap").hidden = false; }
function finishOnboard(){
  if(obFinished) return; obFinished = true;
  $("onboardWrap").hidden = true;
  gStoreSet("tc_onboard_v1", true);
  openQuiz(); /* level quiz right after onboarding */
}
const obNext = $("obNext"), obSkip = $("obSkip");
if(obNext) obNext.addEventListener("click", ()=>{ if(obIdx < OB_SLIDES.length-1){ obIdx++; renderOb(); } else finishOnboard(); });
if(obSkip) obSkip.addEventListener("click", finishOnboard);
/* wait for boot (and the demo password gate) before first-run onboarding */
let obPolled = false;
const obTimer = setInterval(()=>{
  if(obPolled) return;
  const lock = $("tcLock");
  if(lock && !lock.hidden) return;
  obPolled = true; clearInterval(obTimer);
  if(!gStoreGet("tc_onboard_v1", false)) setTimeout(showOnboard, 600);
}, 500);

})(); /* close growth IIFE */

})(); /* close main IIFE */
