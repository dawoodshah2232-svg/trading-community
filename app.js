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
  search:'<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5L16 16"/>'
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
    pr.bid += (m.base - pr.bid)*0.002 + (Math.random()-0.5)*2*m.vol;
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
  if(++tickCount % 7 === 0) renderYouCard(); /* your presence card, ~5s */
}
let tickCount = 0;

/* ---------------- WATCHLIST ---------------- */
function renderWatchlist(){
  const list = $("watchList"); list.innerHTML = "";
  watchOrder().forEach(s=>{
    const b = document.createElement("button");
    b.className = "wl-item" + (s===state.sym ? " current" : "");
    b.dataset.sym = s; b.setAttribute("role","option");
    b.setAttribute("aria-selected", s===state.sym ? "true" : "false");
    b.innerHTML = '<span class="wl-sym">'+(isFav(s)?'<span class="ic xs wl-star" data-icon="star"></span>':"")+'<b>'+s+'</b></span>'+
      '<span class="wl-px"><span class="num" data-wl-px="'+s+'">—</span><br>'+
      '<span class="chg num" data-wl-chg="'+s+'">—</span></span>';
    b.addEventListener("click", ()=>setSymbol(s));
    list.appendChild(b);
  });
  injectIcons(); /* star markers */
  renderWatchlistTick();
}
function renderWatchlistTick(){
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
    row.addEventListener("click", ()=>{ setSymbol(s); closeSheet(); });
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

function buildMainChart(){
  const host = $("tvChart");
  if(!host || !LW()){
    if(host) host.innerHTML = '<div class="lw-err">Chart library failed to load.<br>Check your connection and reload.</div>';
    return;
  }
  host.innerHTML = "";
  lw.chart = LW().createChart(host, Object.assign({ width:host.clientWidth||300, height:host.clientHeight||340 }, lwTheme()));
  lw.candles = lw.chart.addCandlestickSeries(lwCandleOpts());
  lw.volume = lw.chart.addHistogramSeries({ priceScaleId:"vol", priceFormat:{ type:"volume" } });
  lw.chart.priceScale("vol").applyOptions({ scaleMargins:{ top:0.84, bottom:0 } });
  refreshMainData();
  lw.chart.subscribeCrosshairMove(onMainCrosshair);
  new ResizeObserver(()=>{ if(lw.chart && host.clientWidth) lw.chart.resize(host.clientWidth, host.clientHeight); }).observe(host);
}
function refreshMainData(){
  if(!lw.candles) return;
  const d = genBars(state.sym, state.tf);
  lw.bars = d.bars; lw.vols = d.vols;
  lw.candles.setData(d.bars);
  lw.volume.setData(d.vols);
  lw.chart.timeScale().scrollToRealTime();
  $("lgSym").textContent = state.sym;
  $("lgTF").textContent = state.tf;
  updateLegend(d.bars[d.bars.length-1]);
}
function applyChartTheme(){
  if(!LW()) return;
  if(lw.chart) lw.chart.applyOptions(lwTheme());
  if(lw.liveChart) lw.liveChart.applyOptions(lwTheme());
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
  host.innerHTML = "";
  lw.liveChart = LW().createChart(host, Object.assign({ width:host.clientWidth||300, height:host.clientHeight||300 }, lwTheme()));
  lw.liveCandles = lw.liveChart.addCandlestickSeries(lwCandleOpts());
  lw.liveBars = genBars("XAUUSD", "5m").bars;
  lw.liveCandles.setData(lw.liveBars);
  lw.liveChart.timeScale().scrollToRealTime();
  new ResizeObserver(()=>{ if(lw.liveChart && host.clientWidth) lw.liveChart.resize(host.clientWidth, host.clientHeight); }).observe(host);
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
  state.history.push({ sym:p.sym, dir:p.dir, lots:p.lots, entry:p.entry, exit, pl });
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
    const mb = p.mirror
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
      '<span class="pos-lots">'+h.lots.toFixed(2)+' lots</span></div>'+
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
  this.classList.toggle("on");
  this.setAttribute("aria-pressed", this.classList.contains("on") ? "true" : "false");
  toast(this.classList.contains("on") ? "Copy-trading ON — demo only, no real orders" : "Copy-trading OFF");
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
function stopCamera(){
  if(camStream){ try{ camStream.getTracks().forEach(t=>t.stop()); }catch(e){} camStream = null; }
  const v = $("faceCamVideo");
  if(v){ v.srcObject = null; v.hidden = true; }
  const e = $("faceCamEmpty"); if(e) e.hidden = false;
  const b = $("camToggleBtn"); if(b) b.textContent = "Enable camera";
}
async function enableCamera(){
  if(camStream) return;
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    toast("Camera unavailable — showing placeholder (demo)"); return;
  }
  try{
    /* front camera on phones, default webcam on laptops */
    camStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"user" }, audio:false });
    const v = $("faceCamVideo");
    v.srcObject = camStream; v.hidden = false;
    $("faceCamEmpty").hidden = true;
    $("camToggleBtn").textContent = "Stop camera";
    toast("Camera on — preview only, nothing is streamed (demo)");
  }catch(err){
    toast("Camera unavailable — showing placeholder (demo)");
  }
}
$("camToggleBtn").addEventListener("click", e=>{ e.stopPropagation(); camOn() ? stopCamera() : enableCamera(); });

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
  toast("You are LIVE — demo broadcast, nothing really streams");
}
function endLive(){
  if(!youLive.active) return;
  youLive.active = false;
  clearInterval(youLive.timerId); youLive.timerId = null;
  $("goLiveBtn").hidden = false;
  $("youLiveBar").hidden = true;
  stopCamera();
  const card = $("youLiveCard"); if(card) card.remove();
  toast("Live ended — demo");
}
$("goLiveBtn").addEventListener("click", startLive);
$("endLiveBtn").addEventListener("click", endLive);

/* live card published to the TOP of the Community tab while you are live */
function renderYouLiveCard(){
  if(!youLive.active) return;
  let card = $("youLiveCard");
  if(!card){
    card = document.createElement("div");
    card.className = "card you-live-card";
    card.id = "youLiveCard";
    const sc = $("screen-community");
    sc.insertBefore(card, sc.firstChild);
  }
  const plCls = youLive.pl>=0 ? "pl-pos" : "pl-neg";
  const plTxt = (youLive.pl>=0?"+$":"−$")+Math.abs(youLive.pl).toFixed(2);
  card.innerHTML =
    '<div class="yl-top"><span class="live-pill"><i></i>LIVE</span>'+
    '<span class="pair-badge">XAUUSD</span>'+
    '<span class="yl-viewers num">'+youLive.viewers.toLocaleString("en-US")+' watching</span></div>'+
    '<div class="yl-main"><div class="avatar">DR</div>'+
    '<div><b>Daud is live now</b><span class="tstat">Today <b class="'+plCls+'">'+plTxt+'</b> · XAUUSD scalps</span></div>'+
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
    c.innerHTML =
      rankBadge(i)+
      '<div class="avatar" style="background:linear-gradient(135deg,'+t.g[0]+','+t.g[1]+')">'+t.ini+
      (t.live ? '<span class="trader-live">LIVE</span>' : '') + '</div>'+
      '<div class="lb-info" data-tprof="'+t.id+'"><b>'+esc(t.name)+' <span class="handle">'+esc(t.handle)+'</span></b>'+
      '<span class="tstat">'+fmtK(t.followers)+' followers · '+t.win+'% win</span></div>'+
      '<div class="lb-stat">'+lbStat(t)+'</div>'+
      '<button class="follow-btn'+(t.following?" following":"")+'" data-follow="'+t.id+'">'+(t.following?"Following":"Follow")+'</button>';
    if(t.live) c.querySelector(".avatar").addEventListener("click", ()=>goTab("live"));
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
/* tap a trader identity -> full profile view */
document.addEventListener("click", e=>{
  const el = e.target.closest("[data-tprof]"); if(!el) return;
  openTraderProfile(el.dataset.tprof);
});

/* --- trader profile overlay --- */
function monthlyBars(m){
  const max = Math.max.apply(null, m.map(v=>Math.abs(v)).concat([1]));
  return m.map(v=>{
    const h = Math.max(6, Math.round(Math.abs(v)/max*56));
    return '<div class="mb"><i class="'+(v>=0?"pos":"neg")+'" style="height:'+h+'px"></i></div>';
  }).join("");
}
function renderTraderProfile(id){
  const t = TRADERS.find(x=>x.id===id); if(!t) return;
  const body = $("tprofBody");
  const posts = MOCK_POSTS.filter(p=>p.tid===t.id);
  body.innerHTML =
    '<div class="tprof-head">'+
      '<div class="avatar xl" style="background:linear-gradient(135deg,'+t.g[0]+','+t.g[1]+')">'+t.ini+
      (t.live?'<span class="trader-live">LIVE</span>':'')+'</div>'+
      '<div class="tprof-id"><b>'+esc(t.name)+'</b><span class="handle">'+esc(t.handle)+'</span>'+
      '<p class="tprof-bio">'+esc(t.bio)+'</p></div>'+
      '<button class="follow-btn'+(t.following?" following":"")+'" data-follow="'+t.id+'">'+(t.following?"Following":"Follow")+'</button>'+
    '</div>'+
    (t.live?'<button class="watch-live-btn" id="tprofWatch"><span class="live-pill"><i></i>LIVE</span> Watch '+esc(t.name)+' trade now</button>':'')+
    '<div class="tprof-stats">'+
      '<div class="tstat-cell"><b class="num">'+t.win+'%</b><span>Win rate</span></div>'+
      '<div class="tstat-cell"><b class="num '+plClass(t.pl)+'">'+fmt$(t.pl)+'</b><span>Total P/L</span></div>'+
      '<div class="tstat-cell"><b class="num">'+fmtK(t.followers)+'</b><span>Followers</span></div>'+
      '<div class="tstat-cell"><b class="num">'+t.followingN+'</b><span>Following</span></div>'+
    '</div>'+
    '<div class="sec-head"><h3>Monthly P/L</h3><span class="fine">Demo · last 12 months</span></div>'+
    '<div class="card"><div class="mchart">'+monthlyBars(t.monthly)+'</div>'+
    '<div class="mchart-x"><span>Jan</span><span>Dec</span></div></div>'+
    '<div class="sec-head"><h3>Recent trades</h3><span class="fine">Demo</span></div>'+
    '<div class="card ttrades">'+ t.trades.map(tr=>
      '<div class="ttrade"><b>'+tr.s+'</b><span class="dir '+(tr.d==="BUY"?"buy":"sell")+'">'+tr.d+'</span>'+
      '<b class="num '+plClass(tr.pl)+'">'+fmt$(tr.pl)+'</b></div>').join("") +'</div>'+
    '<div class="sec-head"><h3>Posts</h3></div>'+
    (posts.length ? '<div id="tprofPosts"></div>' : '<div class="empty">No posts yet.</div>');
  if(t.live){
    const w = $("tprofWatch");
    if(w) w.addEventListener("click", ()=>{ closeTraderProfile(); goTab("live"); });
  }
  if(posts.length){
    const pl = $("tprofPosts");
    posts.forEach(p=>pl.appendChild(postCard(p)));
  }
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
  c.querySelector(".post-body").textContent = p.body;
  renderComments(p);
  injectIcons();
  return c;
}
function renderComments(p){
  const box = $("cm-"+p.id); if(!box) return;
  box.innerHTML = p.comments.map(cm=>
    '<div class="comment"><b>'+esc(cm.n)+'</b><span class="ctime">'+esc(cm.time)+'</span><p></p></div>'
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
  MOCK_POSTS.unshift({ id:"p"+Date.now(), tid:"daud", time:"now", likes:0, liked:false, body:v, comments:[] });
  inp.value = "";
  renderPosts();
  toast("Posted — demo");
});
$("composerInput").addEventListener("keydown", e=>{ if(e.key==="Enter") $("composerPost").click(); });

/* ---------------- PROFILE + BROKERS ---------------- */
const BROKERS = [
  { name:"Exness",     sub:"MT4 / MT5",            g:["#2F80FF","#1B5FD6"], ini:"EX", server:"Exness-MT5Real", connected:false },
  { name:"Vantage",    sub:"MT4 / MT5",            g:["#22C55E","#166534"], ini:"VA", server:"Vantage-MT5",     connected:false },
  { name:"IC Markets", sub:"MT4 / MT5 · cTrader",  g:["#5B8DEF","#2B4A8A"], ini:"IC", server:"ICMarkets-MT5",  connected:false },
  { name:"XM",         sub:"MT4 / MT5",            g:["#B678F0","#5E2B8A"], ini:"XM", server:"XM-MT5",          connected:false },
  { name:"OctaFX",     sub:"MT4 / MT5",            g:["#F5A623","#B26A00"], ini:"OC", server:"OctaFX-MT5",      connected:false },
  { name:"FBS",        sub:"MT4 / MT5",            g:["#F04452","#8A1F28"], ini:"FB", server:"FBS-MT5",         connected:false }
];
function renderBrokers(){
  const list = $("brokerList"); list.innerHTML = "";
  BROKERS.forEach((b,i)=>{
    const r = document.createElement("div");
    r.className = "broker-row";
    r.innerHTML =
      '<div class="broker-ic" style="--g1:'+b.g[0]+';--g2:'+b.g[1]+'">'+b.ini+'</div>'+
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
  $("brokerModalIc").textContent = b.ini;
  $("brokerModalIc").style.setProperty("--g1", b.g[0]);
  $("brokerModalIc").style.setProperty("--g2", b.g[1]);
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

/* ---------------- INIT — straight into the terminal, no login ---------------- */
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
buildMainChart(); /* self-hosted candle chart, after theme is set */
renderTicketTick();
renderAccount();
setInterval(tick, 700);

})();
