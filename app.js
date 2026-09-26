/* ============================================================
   Trading Community — app logic (BEST-UI pass)
   MOCK / SIMULATED: auth, price engine (random walk), order
   execution, P/L, brokers, mirror latency, community, chat.
   REAL: TradingView chart widget (needs internet).
   No real money, no real broker connection.
   ============================================================ */
(function(){
"use strict";

/* ---------------- icons ----------------
   Uniform handcrafted set: 1.8px strokes, round caps/joins,
   drawn to read clearly at 22px. */
const ICONS = {
  trade: '<path d="M7 4v13"/><path d="M7 7.5h4"/><path d="M7 11.5h4"/><path d="M5 4h4"/><path d="M5 17h4"/><path d="M17 7v13"/><path d="M17 10.5h4"/><path d="M17 14.5h4"/><path d="M15 7h4"/><path d="M15 20h4"/>',
  positions: '<path d="m12 2 9 4.9-9 4.9-9-4.9z"/><path d="m3 11.9 9 4.9 9-4.9"/><path d="m3 16.8 9 4.9 9-4.9"/>',
  live: '<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>',
  community: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  profile: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  heart: '<path d="M19.8 5.1a5 5 0 0 0-7.1 0L12 5.8l-.7-.7a5 5 0 0 0-7.1 7.1l.7.7L12 20l7.1-7.1.7-.7a5 5 0 0 0 0-7.1z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  chevR: '<path d="m9 6 6 6-6 6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  theme: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" style="fill:currentColor;stroke:none"/>'
};
document.querySelectorAll(".ic[data-icon]").forEach(elm => {
  const svg = ICONS[elm.dataset.icon];
  if (svg) elm.innerHTML = '<svg viewBox="0 0 24 24">' + svg + '</svg>';
});

/* ---------------- MOCK SYMBOL UNIVERSE ---------------- */
const SYMBOLS = {
  XAUUSD: { tv:"OANDA:XAUUSD",    base:2652.40, digits:2, spread:0.25,  vol:0.85,  perPoint:100,    contract:100,    chg:0.42 },
  EURUSD: { tv:"OANDA:EURUSD",    base:1.08420, digits:5, spread:0.00012, vol:0.00026, perPoint:100000, contract:100000, chg:-0.11 },
  GBPUSD: { tv:"OANDA:GBPUSD",    base:1.29740, digits:5, spread:0.00018, vol:0.00032, perPoint:100000, contract:100000, chg:0.23 },
  USDJPY: { tv:"OANDA:USDJPY",    base:149.820, digits:3, spread:0.015,  vol:0.042,  perPoint:667,     contract:100000, chg:-0.31 },
  BTCUSD: { tv:"BITSTAMP:BTCUSD", base:97420,   digits:0, spread:18,     vol:95,     perPoint:1,      contract:1,      chg:1.84 },
  ETHUSD: { tv:"BITSTAMP:ETHUSD", base:3420.5,  digits:1, spread:1.4,    vol:6.2,    perPoint:10,     contract:10,     chg:2.12 },
  US30:   { tv:"DJ:DJI",         base:42150,   digits:0, spread:2.4,    vol:13,     perPoint:5,      contract:1,      chg:0.35 },
  NAS100: { tv:"NASDAQ:NDX",     base:19280.5, digits:1, spread:1.6,    vol:8.5,    perPoint:5,      contract:1,      chg:0.62 }
};
const SYM_ORDER = ["XAUUSD","EURUSD","GBPUSD","USDJPY","BTCUSD","ETHUSD","US30","NAS100"];
const TF_MAP = { "1m":"1", "5m":"5", "15m":"15", "1H":"60", "4H":"240", "1D":"D" };
const LEVERAGE = 100;
const START_EQUITY = 10000;

/* ---------------- STATE (all mock) ---------------- */
const state = {
  sym:"XAUUSD", tf:"1m", lots:0.10,
  prices:{}, hist:{},
  open:[], pending:[], history:[],
  realized:0, orderSeq:1,
  liveBuilt:false
};
SYM_ORDER.forEach(s => {
  const m = SYMBOLS[s];
  state.prices[s] = { bid:m.base, ask:m.base + m.spread, chg:m.chg };
  state.hist[s] = [m.base];
});
/* seed mock pending + history */
state.pending = [
  { id:"p1", sym:"XAUUSD", dir:"BUY",  type:"Buy Limit", lots:0.20, price:2640.00 },
  { id:"p2", sym:"BTCUSD", dir:"SELL", type:"Sell Stop", lots:0.05, price:98200 }
];
state.history = [
  { sym:"XAUUSD", dir:"BUY",  lots:0.10, entry:2648.20, exit:2652.45, pl:42.50 },
  { sym:"EURUSD", dir:"SELL", lots:0.25, entry:1.08620,  exit:1.08695, pl:-18.75 },
  { sym:"BTCUSD", dir:"BUY",  lots:0.02, entry:96100,    exit:96880,  pl:15.60 }
];

/* Mock brokers — simulated connections only */
const BROKERS = [
  { name:"Exness",     ini:"EX", g:["#2F80FF","#1B5FD6"], server:"Exness-MT5Real",            connected:false },
  { name:"Vantage",    ini:"VA", g:["#22C55E","#15803D"], server:"VantageInternational-Live", connected:false },
  { name:"IC Markets", ini:"IC", g:["#5B8DEF","#2B4A8A"], server:"ICMarkets-Live",            connected:false },
  { name:"XM",         ini:"XM", g:["#B678F0","#5E2B8A"], server:"XMGlobal-MT5",              connected:false },
  { name:"OctaFX",     ini:"OC", g:["#F59E0B","#B45309"], server:"OctaFX-Live",               connected:false },
  { name:"FBS",        ini:"FB", g:["#10B981","#065F46"], server:"FBS-Real",                  connected:false }
];

/* Mock community influencers — demo content */
const MOCK_TRADERS = [
  { name:"Marcus Cole", handle:"@marcus_fx",     followers:"128K", winRate:"74%", live:true,  g:["#F04452","#B91C1C"] },
  { name:"Ava Chen",    handle:"@ava_trades",    followers:"96K",  winRate:"71%", live:false, g:["#2F80FF","#1B5FD6"] },
  { name:"Omar Farouk", handle:"@omar.gold",     followers:"84K",  winRate:"69%", live:false, g:["#22C55E","#15803D"] },
  { name:"Sofia Rossi", handle:"@sofia_signals", followers:"61K",  winRate:"68%", live:false, g:["#B678F0","#6D28D9"] }
];
const follows = {};

/* ---------------- HELPERS ---------------- */
const $ = id => document.getElementById(id);
const meta = s => SYMBOLS[s];
const px = s => state.prices[s];
const fmtP = (s,v) => v.toFixed(meta(s).digits);
const fmt$ = v => (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString("en-US",{minimumFractionDigits:2, maximumFractionDigits:2});
const plClass = v => v >= 0 ? "pl-pos" : "pl-neg";
const initials = n => n.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();

let toastTimer = null;
function toast(msg){
  const t = $("toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

/* P/L of an open mock position at current mock prices */
function positionPL(p){
  const pr = px(p.sym);
  const closePx = p.dir === "BUY" ? pr.bid : pr.ask;
  const diff = p.dir === "BUY" ? (closePx - p.entry) : (p.entry - closePx);
  return diff * meta(p.sym).perPoint * p.lots;
}
function openPL(){ return state.open.reduce((a,p) => a + positionPL(p), 0); }
function equity(){ return START_EQUITY + state.realized + openPL(); }

/* ---------------- THEME ---------------- */
function theme(){ return document.documentElement.dataset.theme || "dark"; }
function setTheme(t){
  document.documentElement.dataset.theme = t;
  try{ localStorage.setItem("tc_theme_v1", t); }catch(e){}
  $("themeNameSide").textContent = t === "dark" ? "Dark" : "Light";
  $("themeNameRow").textContent = t === "dark" ? "Dark" : "Light";
  loadTV("tvChart", meta(state.sym).tv, TF_MAP[state.tf]);
  if (state.liveBuilt) loadTV("tvChartLive", SYMBOLS.XAUUSD.tv, "5");
}
$("themeBtn").addEventListener("click", () => setTheme(theme() === "dark" ? "light" : "dark"));
$("themeToggleSide").addEventListener("click", () => setTheme(theme() === "dark" ? "light" : "dark"));
$("themeRowBtn").addEventListener("click", () => setTheme(theme() === "dark" ? "light" : "dark"));

/* ---------------- AUTH (mock) ---------------- */
let authMode = "signin";
function showView(name){
  $("view-splash").classList.toggle("active", name === "splash");
  $("view-auth").classList.toggle("active", name === "auth");
  $("view-app").classList.toggle("active", name === "app");
}
function setAuthMode(mode){
  authMode = mode;
  const up = mode === "signup";
  $("authTitle").textContent = up ? "Create your account" : "Welcome back";
  $("authNameWrap").hidden = !up;
  $("authPassWrap").hidden = !up;
  $("authEmailGo").textContent = up ? "Sign up" : "Continue";
  $("authToggle").innerHTML = up
    ? 'Already have an account? <b>Log in</b>'
    : 'New to Trading Community? <b>Create account</b>';
  $("authErr").hidden = true;
}
function finishAuth(user, isNew){
  try{ localStorage.setItem("tc_session_v1", JSON.stringify(user)); }catch(e){}
  const handle = "@" + user.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  $("profName").textContent = user.name;
  $("profHandle").textContent = handle;
  $("profAvatar").textContent = initials(user.name);
  $("sideName").textContent = user.name;
  $("sideEmail").textContent = user.email;
  $("sideAvatar").textContent = initials(user.name);
  $("avatarBtn").textContent = initials(user.name);
  showView("app");
  updateBrokerPrompt();
  if (isNew) toast("Welcome, " + user.name.split(" ")[0] + " — demo");
}
function validEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function authError(msg){
  $("authErr").textContent = msg; $("authErr").hidden = false;
}
$("authEmailGo").addEventListener("click", () => {
  const name = $("authName").value.trim();
  let email = $("authEmail").value.trim();
  if (!validEmail(email)) email = "demo.trader@example.com"; // demo: never block entry
  const display = (authMode === "signup" && name.length >= 2) ? name
    : email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  finishAuth({ name: display, email: email, via: "email" }, true); // mock sign-in
});
$("authToggle").addEventListener("click", () => setAuthMode(authMode === "signup" ? "signin" : "signup"));
function socialLogin(label){
  toast("Continue with " + label + " — demo"); // mock: no real OAuth
  finishAuth({ name: "Alex Trader", email: "alex.trader@example.com", via: label.toLowerCase() }, true);
}
$("btnGoogle").addEventListener("click", () => socialLogin("Google"));
$("btnFacebook").addEventListener("click", () => socialLogin("Facebook"));
$("btnApple").addEventListener("click", () => socialLogin("Apple"));
function logout(){
  try{ localStorage.removeItem("tc_session_v1"); }catch(e){}
  showView("auth"); setAuthMode("signin");
}
$("logoutBtn").addEventListener("click", logout);
$("logoutSide").addEventListener("click", logout);

/* ---------------- TABS ---------------- */
function goTab(tab){
  document.querySelectorAll("[data-tab]").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $("screen-" + tab).classList.add("active");
  document.querySelector(".content").scrollTop = 0;
  if (tab === "live" && !state.liveBuilt){ state.liveBuilt = true; buildLive(); }
}
document.querySelectorAll("[data-tab]").forEach(b =>
  b.addEventListener("click", () => goTab(b.dataset.tab)));
$("avatarBtn").addEventListener("click", () => goTab("profile"));
$("bellBtn").addEventListener("click", () => toast("Price alerts — demo"));

/* ---------------- PRICE ENGINE (simulated random walk) ---------------- */
function tick(){
  SYM_ORDER.forEach(s => {
    const m = meta(s), pr = px(s);
    pr.bid += (m.base - pr.bid) * 0.002 + (Math.random() - 0.5) * 2 * m.vol;
    pr.ask = pr.bid + m.spread;
    pr.chg += (Math.random() - 0.5) * 0.02;
    const h = state.hist[s]; h.push(pr.bid); if (h.length > 140) h.shift();
  });
  renderTradeTick();
  renderPositionsTick();
  drawFallbacks();
}
function renderTradeTick(){
  const s = state.sym, pr = px(s);
  const hp = $("hdrPrice");
  const prev = hp.textContent;
  hp.textContent = fmtP(s, pr.bid);
  hp.classList.remove("tick-up", "tick-down");
  void hp.offsetWidth;
  hp.classList.add(pr.bid >= parseFloat(prev.replace(/,/g, "")) || prev === "—" ? "tick-up" : "tick-down");
  const c = $("hdrChg");
  c.textContent = (pr.chg >= 0 ? "+" : "") + pr.chg.toFixed(2) + "%";
  c.className = "chg num " + (pr.chg >= 0 ? "up" : "down");
  $("bidPx").textContent = fmtP(s, pr.bid);
  $("askPx").textContent = fmtP(s, pr.ask);
  $("spreadVal").textContent = fmtP(s, meta(s).spread);
  const margin = state.lots * meta(s).contract * pr.ask / LEVERAGE;
  $("marginVal").textContent = fmt$(margin);
  const risk = 20 * Math.pow(10, -meta(s).digits) * meta(s).perPoint * state.lots;
  $("riskLine").innerHTML = "Est. risk at 20 pt stop: <b>" + fmt$(risk) + "</b>";
}

/* ---------------- SYMBOL SHEET ---------------- */
function openSheet(){ $("backdrop").hidden = false; $("symbolSheet").hidden = false; }
function closeSheet(){ $("backdrop").hidden = true; $("symbolSheet").hidden = true; }
$("symPicker").addEventListener("click", () => { renderSymbolList(); openSheet(); });
$("backdrop").addEventListener("click", closeSheet);
function renderSymbolList(){
  const list = $("symbolList"); list.innerHTML = "";
  SYM_ORDER.forEach(s => {
    const pr = px(s);
    const b = document.createElement("button");
    b.className = "sym-row" + (s === state.sym ? " current" : "");
    b.innerHTML = "<b>" + s + '</b><span class="sp num">' + fmtP(s, pr.bid) + "</span>" +
      '<span class="sc num ' + (pr.chg >= 0 ? "up" : "down") + '">' +
      (pr.chg >= 0 ? "+" : "") + pr.chg.toFixed(2) + "%</span>";
    b.addEventListener("click", () => { setSymbol(s); closeSheet(); });
    list.appendChild(b);
  });
}
function setSymbol(s){
  state.sym = s;
  $("symName").textContent = s;
  loadTV("tvChart", meta(s).tv, TF_MAP[state.tf]);
  renderTradeTick();
}

/* ---------------- TRADINGVIEW (real embed) + canvas fallback ---------------- */
function loadTV(containerId, tvSymbol, interval){
  const host = $(containerId);
  if (!host) return;
  host.innerHTML = "";
  if (typeof TradingView === "undefined"){ showFallback(containerId); return; }
  try{
    const dark = theme() === "dark";
    new TradingView.widget({
      container_id: containerId,
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      theme: dark ? "dark" : "light",
      style: "1",
      locale: "en",
      hide_side_toolbar: false,
      allow_symbol_change: false,
      backgroundColor: dark ? "rgba(10, 15, 28, 1)" : "rgba(255, 255, 255, 1)",
      gridColor: dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"
    });
    hideFallback(containerId);
  }catch(e){ showFallback(containerId); }
}
function fbIds(containerId){
  return containerId === "tvChart"
    ? { canvas:"fallbackChart", note:"chartNote" }
    : { canvas:"fallbackChartLive", note:null };
}
function showFallback(containerId){
  const f = fbIds(containerId);
  $(f.canvas).hidden = false;
  if (f.note) $(f.note).hidden = false;
}
function hideFallback(containerId){
  const f = fbIds(containerId);
  $(f.canvas).hidden = true;
  if (f.note) $(f.note).hidden = true;
}
function drawFallback(containerId, canvasId){
  const cv = $(canvasId);
  if (!cv || cv.hidden) return;
  const h = state.hist[containerId === "tvChart" ? state.sym : "XAUUSD"];
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth, ht = cv.clientHeight;
  if (!w || !ht) return;
  if (cv.width !== Math.round(w * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(ht * dpr); }
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, ht);
  const min = Math.min.apply(null, h), max = Math.max.apply(null, h), rng = (max - min) || 1;
  const up = h[h.length - 1] >= h[0];
  ctx.strokeStyle = up ? "#22C55E" : "#F04452"; ctx.lineWidth = 2;
  ctx.beginPath();
  h.forEach((v, i) => {
    const x = i / (h.length - 1) * w, y = ht - ((v - min) / rng) * (ht - 16) - 8;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
  ctx.lineTo(w, ht); ctx.lineTo(0, ht); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, ht);
  g.addColorStop(0, up ? "rgba(34,197,94,.25)" : "rgba(240,68,82,.25)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fill();
}
function drawFallbacks(){
  drawFallback("tvChart", "fallbackChart");
  if (state.liveBuilt) drawFallback("tvChartLive", "fallbackChartLive");
}
$("tfBar").addEventListener("click", e => {
  const b = e.target.closest(".tf"); if (!b) return;
  document.querySelectorAll(".tf").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  state.tf = b.dataset.tf;
  loadTV("tvChart", meta(state.sym).tv, TF_MAP[state.tf]);
});

/* ---------------- TRADE TICKET ---------------- */
function setLots(v){
  state.lots = Math.min(50, Math.max(0.01, Math.round(v * 100) / 100));
  $("lotVal").textContent = state.lots.toFixed(2);
  renderTradeTick();
}
$("lotMinus").addEventListener("click", () => setLots(state.lots - 0.01));
$("lotPlus").addEventListener("click", () => setLots(state.lots + 0.01));

function mirrorBadge(p){
  return p.mirror
    ? '<div class="mirror-badge"><span class="mdot"></span>Mirrored to ' + p.mirror.broker + " · " + p.mirror.ms + "ms</div>"
    : '<div class="mirror-badge demo"><span class="mdot"></span>Demo fill — connect a broker to mirror</div>';
}
function execute(dir){
  const s = state.sym, pr = px(s);
  const entry = dir === "BUY" ? pr.ask : pr.bid;
  const linked = BROKERS.filter(b => b.connected);
  const mirror = linked.length
    ? { broker: linked[0].name, ms: 40 + Math.round(Math.random() * 100) } // simulated 40–140ms
    : null;
  state.open.push({ id:"o" + (state.orderSeq++), sym:s, dir:dir, lots:state.lots,
                    entry:entry, time:new Date(), mirror:mirror });
  renderPositions();
  goTab("positions");
  document.querySelector('[data-ptab="open"]').click();
  toast(mirror
    ? "Mirrored to " + mirror.broker + " · " + mirror.ms + "ms — demo"
    : "Demo fill — connect a broker to mirror");
}
$("buyBtn").addEventListener("click", () => execute("BUY"));
$("sellBtn").addEventListener("click", () => execute("SELL"));

/* ---------------- POSITIONS ---------------- */
$("posTabs").addEventListener("click", e => {
  const b = e.target.closest("[data-ptab]"); if (!b) return;
  document.querySelectorAll("#posTabs .subtab").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  const t = b.dataset.ptab;
  $("posOpen").hidden = t !== "open";
  $("posPending").hidden = t !== "pending";
  $("posHistory").hidden = t !== "history";
});
function renderPositions(){
  /* open */
  const open = $("posOpen"); open.innerHTML = "";
  $("openCount").textContent = state.open.length;
  const badge = $("posBadge"), badgeSide = $("posBadgeSide");
  badge.hidden = !state.open.length; badge.textContent = state.open.length;
  badgeSide.hidden = !state.open.length; badgeSide.textContent = state.open.length;
  if (!state.open.length)
    open.innerHTML = '<div class="empty">No open positions.<br>Place a trade from the Trade tab.</div>';
  state.open.forEach(p => {
    const card = document.createElement("div");
    card.className = "pos-card"; card.dataset.pid = p.id;
    card.innerHTML =
      '<div class="pos-top"><span class="pos-sym">' + p.sym + "</span>" +
      '<span class="dir ' + (p.dir === "BUY" ? "buy" : "sell") + '">' + p.dir + "</span>" +
      '<span class="pos-lots num">' + p.lots.toFixed(2) + ' lots</span>' +
      '<button class="pos-close" data-close="' + p.id + '" aria-label="Close">×</button></div>' +
      '<div class="pos-grid">' +
      '<div class="pos-col"><span>Entry</span><b class="num">' + fmtP(p.sym, p.entry) + "</b></div>" +
      '<div class="pos-col"><span>Current</span><b class="num" data-cur="' + p.id + '">—</b></div>' +
      '<div class="pos-col"><span>P/L</span><b class="num" data-pl="' + p.id + '">—</b></div>' +
      "</div>" + mirrorBadge(p);
    open.appendChild(card);
  });
  /* pending */
  const pend = $("posPending"); pend.innerHTML = "";
  $("pendCount").textContent = state.pending.length;
  if (!state.pending.length) pend.innerHTML = '<div class="empty">No pending orders.</div>';
  state.pending.forEach(o => {
    const card = document.createElement("div");
    card.className = "pos-card";
    card.innerHTML =
      '<div class="pos-top"><span class="pos-sym">' + o.sym + "</span>" +
      '<span class="dir ' + (o.dir === "BUY" ? "buy" : "sell") + '">' + o.type.toUpperCase() + "</span>" +
      '<span class="pos-lots num">' + o.lots.toFixed(2) + ' lots</span>' +
      '<button class="pos-close" data-cancel="' + o.id + '" aria-label="Cancel">×</button></div>' +
      '<div class="pos-grid"><div class="pos-col"><span>Trigger</span><b class="num">' + fmtP(o.sym, o.price) + "</b></div>" +
      '<div class="pos-col"><span>Current</span><b class="num">' + fmtP(o.sym, px(o.sym).bid) + "</b></div></div>";
    pend.appendChild(card);
  });
  /* history (positions tab + profile) */
  renderHistory($("posHistory"));
  renderHistory($("profHistory"));
  $("eqVal").textContent = fmt$(equity());
}
function renderHistory(box){
  box.innerHTML = "";
  if (!state.history.length){ box.innerHTML = '<div class="empty">No closed trades yet.</div>'; return; }
  state.history.slice().reverse().forEach(h => {
    const d = document.createElement("div");
    d.className = "pos-card";
    d.innerHTML =
      '<div class="pos-top"><span class="pos-sym">' + h.sym + "</span>" +
      '<span class="dir ' + (h.dir === "BUY" ? "buy" : "sell") + '">' + h.dir + "</span>" +
      '<span class="pos-lots num">' + h.lots.toFixed(2) + " lots</span></div>" +
      '<div class="pos-grid">' +
      '<div class="pos-col"><span>Entry</span><b class="num">' + fmtP(h.sym, h.entry) + "</b></div>" +
      '<div class="pos-col"><span>Exit</span><b class="num">' + fmtP(h.sym, h.exit) + "</b></div>" +
      '<div class="pos-col"><span>P/L</span><b class="num ' + plClass(h.pl) + '">' + fmt$(h.pl) + "</b></div>" +
      "</div>";
    box.appendChild(d);
  });
}
/* live-tick P/L updates without full re-render */
function renderPositionsTick(){
  state.open.forEach(p => {
    const pr = px(p.sym);
    const curEl = document.querySelector('[data-cur="' + p.id + '"]');
    const plEl = document.querySelector('[data-pl="' + p.id + '"]');
    if (curEl) curEl.textContent = fmtP(p.sym, p.dir === "BUY" ? pr.bid : pr.ask);
    if (plEl){ const v = positionPL(p); plEl.textContent = fmt$(v); plEl.className = "num " + plClass(v); }
  });
  if (state.open.length) $("eqVal").textContent = fmt$(equity());
}
/* close / cancel via delegation */
document.addEventListener("click", e => {
  const c = e.target.closest("[data-close]");
  if (c){
    const i = state.open.findIndex(p => p.id === c.dataset.close);
    if (i > -1){
      const p = state.open[i];
      const pr = px(p.sym);
      const exit = p.dir === "BUY" ? pr.bid : pr.ask;
      const pl = positionPL(p);
      state.realized += pl;
      state.history.push({ sym:p.sym, dir:p.dir, lots:p.lots, entry:p.entry, exit:exit, pl:pl });
      state.open.splice(i, 1);
      renderPositions();
      toast("Closed " + p.sym + " " + fmt$(pl) + " — demo");
    }
    return;
  }
  const x = e.target.closest("[data-cancel]");
  if (x){
    state.pending = state.pending.filter(o => o.id !== x.dataset.cancel);
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
  loadTV("tvChartLive", SYMBOLS.XAUUSD.tv, "5");
  restoreFaceCam();
  for (let i = 0; i < 3; i++) pushFeed();
  MOCK_CHAT.slice(0, 6).forEach(m => addChat(m[0], m[1], false));
  setInterval(() => { // mock viewer drift
    viewers = Math.max(1800, viewers + Math.round((Math.random() - 0.48) * 60));
    $("viewerCount").textContent = viewers.toLocaleString("en-US");
  }, 3000);
  setInterval(() => pushFeed(), 6000);
  setInterval(() => {
    const m = MOCK_CHAT[chatIdx++ % MOCK_CHAT.length];
    addChat(m[0], m[1], false);
  }, 8000);
}
function pushFeed(){
  const pr = px("XAUUSD");
  const dir = Math.random() > 0.45 ? "BUY" : "SELL";
  const lots = (Math.random() * 0.4 + 0.05).toFixed(2);
  const at = dir === "BUY" ? pr.ask : pr.bid;
  const feed = $("liveFeed");
  const d = document.createElement("div");
  d.className = "feed-item";
  const now = new Date();
  d.innerHTML = '<span class="dir ' + (dir === "BUY" ? "buy" : "sell") + '">' + dir + "</span>" +
    "<b>" + lots + " XAUUSD @ " + fmtP("XAUUSD", at) + "</b>" +
    '<span class="t">' + String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0") + "</span>";
  feed.prepend(d);
  while (feed.children.length > 6) feed.lastChild.remove();
}
function addChat(user, text, me){
  const box = $("liveChat");
  const d = document.createElement("div");
  d.className = "chat-msg" + (me ? " me" : "");
  const b = document.createElement("b"); b.textContent = user;
  d.appendChild(b); d.appendChild(document.createTextNode(text));
  box.appendChild(d);
  while (box.children.length > 30) box.firstChild.remove();
  box.scrollTop = box.scrollHeight;
}
$("chatSend").addEventListener("click", sendChat);
$("chatInput").addEventListener("keydown", e => { if (e.key === "Enter") sendChat(); });
function sendChat(){
  const inp = $("chatInput"), v = inp.value.trim();
  if (!v) return;
  addChat("You", v, true); inp.value = "";
  setTimeout(() => { // mock replies
    const replies = [["PipQueen","facts"],["GoldHunter","+1 on that"],["MarcusFX","lets gooo"]];
    const r = replies[Math.floor(Math.random() * replies.length)];
    addChat(r[0], r[1], false);
  }, 1400);
}
$("copySwitch").addEventListener("click", function(){
  this.classList.toggle("on");
  toast(this.classList.contains("on")
    ? "Copy-trading ON — mock only, no real orders"
    : "Copy-trading OFF");
});

/* draggable + resizable face-cam, position persisted */
(function(){
  const cam = $("faceCam"), wrap = $("liveChartWrap"), grip = $("fcResize");
  const KEY = "tc_facecam_v1";
  let drag = null, resizing = false;

  window.restoreFaceCam = function(){
    try{
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && saved.w){
        cam.style.left = saved.x + "px"; cam.style.top = saved.y + "px";
        cam.style.right = "auto"; cam.style.bottom = "auto";
        cam.style.width = saved.w + "px"; cam.style.height = saved.h + "px";
        return;
      }
    }catch(e){}
    cam.style.right = "10px"; cam.style.bottom = "10px";
  };
  function save(){
    try{
      localStorage.setItem(KEY, JSON.stringify({
        x: cam.offsetLeft, y: cam.offsetTop,
        w: cam.offsetWidth, h: cam.offsetHeight
      }));
    }catch(e){}
  }
  function clamp(){
    const wr = wrap.getBoundingClientRect();
    const x = Math.min(Math.max(0, cam.offsetLeft), Math.max(0, wr.width - cam.offsetWidth));
    const y = Math.min(Math.max(0, cam.offsetTop), Math.max(0, wr.height - cam.offsetHeight));
    cam.style.left = x + "px"; cam.style.top = y + "px";
    cam.style.right = "auto"; cam.style.bottom = "auto";
  }
  cam.addEventListener("pointerdown", e => {
    if (e.target === grip) return;
    drag = { dx: e.clientX - cam.offsetLeft, dy: e.clientY - cam.offsetTop };
    try{ cam.setPointerCapture(e.pointerId); }catch(err){}
  });
  grip.addEventListener("pointerdown", e => {
    e.stopPropagation();
    resizing = true;
    drag = { sx: e.clientX, sy: e.clientY, w: cam.offsetWidth, h: cam.offsetHeight };
    try{ grip.setPointerCapture(e.pointerId); }catch(err){}
  });
  cam.addEventListener("pointermove", e => {
    if (!drag) return;
    if (resizing){
      const w = Math.min(220, Math.max(64, drag.w + (e.clientX - drag.sx)));
      const h = Math.min(300, Math.max(80, drag.h + (e.clientY - drag.sy)));
      cam.style.width = w + "px"; cam.style.height = h + "px"; clamp();
    }else{
      const wr = wrap.getBoundingClientRect();
      cam.style.left = (e.clientX - wr.left - drag.dx) + "px";
      cam.style.top = (e.clientY - wr.top - drag.dy) + "px";
      cam.style.right = "auto"; cam.style.bottom = "auto"; clamp();
    }
  });
  ["pointerup","pointercancel"].forEach(ev => cam.addEventListener(ev, () => {
    if (drag) save();
    drag = null; resizing = false;
  }));
})();

/* ---------------- COMMUNITY ---------------- */
function renderTraders(){
  $("traderCards").innerHTML = MOCK_TRADERS.map((t, i) =>
    '<div class="trader-card"' + (t.live ? ' data-live="1" role="button" tabindex="0" title="Watch live"' : "") + ">" +
      '<div class="avatar sm" style="--g1:' + t.g[0] + ";--g2:" + t.g[1] + '">' + initials(t.name) + "</div>" +
      '<div class="t-info"><b>' + t.name +
        (t.live ? '<span class="trader-live-badge"><span class="dot"></span>LIVE</span>' : "") + "</b>" +
        "<span>" + t.handle + "</span>" +
        '<div class="t-stats"><span><b>' + t.followers + "</b> followers</span><span><b>" + t.winRate + "</b> win rate</span></div>" +
      "</div>" +
      '<button class="follow-btn' + (follows[i] ? " following" : "") + '" data-follow="' + i + '">' +
        (follows[i] ? "Following" : "Follow") + "</button>" +
    "</div>").join("");
}
renderTraders();
$("traderCards").addEventListener("click", e => {
  const f = e.target.closest("[data-follow]");
  if (f){
    const i = +f.dataset.follow;
    follows[i] = !follows[i];
    renderTraders();
    toast((follows[i] ? "Following " : "Unfollowed ") + MOCK_TRADERS[i].name + " — demo");
    return;
  }
  if (e.target.closest("[data-live]")) goTab("live");
});
$("traderCards").addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.matches("[data-live]")) goTab("live");
});

/* sentiment poll — one vote, persisted */
const POLL_KEY = "tc_poll_v1";
let poll = { buy:7693, sell:4715, voted:null };
try{
  const s = JSON.parse(localStorage.getItem(POLL_KEY) || "null");
  if (s && s.voted) poll = s;
}catch(e){}
function renderPoll(){
  const total = poll.buy + poll.sell;
  const bp = Math.round(poll.buy / total * 100), sp = 100 - bp;
  $("pollBuyFill").style.width = bp + "%";
  $("pollSellFill").style.width = sp + "%";
  $("pollBuyPct").textContent = bp + "%";
  $("pollSellPct").textContent = sp + "%";
  $("pollVotes").textContent = total.toLocaleString("en-US") + " votes";
  if (poll.voted) $("pollBtns").classList.add("voted");
}
function vote(side){
  if (poll.voted){ toast("You already voted — demo"); return; }
  poll[side]++; poll.voted = side;
  try{ localStorage.setItem(POLL_KEY, JSON.stringify(poll)); }catch(e){}
  renderPoll();
  toast("Vote counted: " + side.toUpperCase() + " — demo");
}
$("pollBuy").addEventListener("click", () => vote("buy"));
$("pollSell").addEventListener("click", () => vote("sell"));

const MOCK_POSTS = [
  { name:"Daud", handle:"@daudtradefx · 12m", ini:"DR", g:["#2F80FF","#1B5FD6"],
    body:"NFP Friday: expecting a hot print. DXY strength = gold pullback first, then dip-buy into 2640 liquidity. Not financial advice — sharing my read.",
    likes:214, liked:false },
  { name:"Sara Malik", handle:"@saramalik · 1h", ini:"SM", g:["#B678F0","#5E2B8A"],
    body:"EURUSD swept Asia lows and reclaimed 1.0840. If London holds above, targeting 1.0890. Invalidation: M15 close back below the lows.",
    likes:96, liked:false },
  { name:"Arjun Rao", handle:"@arjunfx · 3h", ini:"AR", g:["#5B8DEF","#2B4A8A"],
    body:"BTC funding neutral, spot bid on every dip. 98k is the line in the sand — lose it and I stand aside. Trade the plan, not the feeling.",
    likes:158, liked:false }
];
function renderPosts(){
  const list = $("postList"); list.innerHTML = "";
  MOCK_POSTS.forEach((p, i) => {
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML =
      '<div class="post-head"><div class="avatar sm" style="--g1:' + p.g[0] + ";--g2:" + p.g[1] + '">' + p.ini + "</div>" +
      "<div><b>" + p.name + "</b><span>" + p.handle + "</span></div></div>" +
      '<div class="post-body"></div>' +
      '<button class="like-btn' + (p.liked ? " liked" : "") + '" data-like="' + i + '">' +
      '<svg viewBox="0 0 24 24">' + ICONS.heart + "</svg> " +
      '<span class="num">' + (p.likes + (p.liked ? 1 : 0)) + "</span></button>";
    c.querySelector(".post-body").textContent = p.body;
    list.appendChild(c);
  });
}
$("postList").addEventListener("click", e => {
  const b = e.target.closest("[data-like]"); if (!b) return;
  const p = MOCK_POSTS[+b.dataset.like];
  p.liked = !p.liked;
  renderPosts();
});

/* ---------------- PROFILE: BROKERS ---------------- */
function renderBrokers(){
  const list = $("brokerList"); list.innerHTML = "";
  BROKERS.forEach((b, i) => {
    const r = document.createElement("div");
    r.className = "broker-row";
    r.innerHTML =
      '<div class="broker-ic" style="--g1:' + b.g[0] + ";--g2:" + b.g[1] + '">' + b.ini +
        (b.connected ? '<span class="conn-dot"></span>' : "") + "</div>" +
      "<div><b>" + b.name + "</b><span>" + (b.connected ? "Live link · demo" : "Trade & copy trading") + "</span></div>" +
      '<button class="conn-btn' + (b.connected ? " connected" : "") + '" data-broker="' + i + '">' +
        (b.connected ? "Connected" : "Connect") + "</button>";
    list.appendChild(r);
  });
}
$("brokerList").addEventListener("click", e => {
  const btn = e.target.closest("[data-broker]");
  if (!btn) return;
  const i = +btn.dataset.broker;
  if (BROKERS[i].connected){ toast(BROKERS[i].name + " already linked — demo"); return; }
  openBrokerModal(i);
});
$("addBroker").addEventListener("click", () => toast("Add your broker — demo"));

/* broker login modal — simulated connection */
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
  $("brokerModal").hidden = false;
}
function closeBrokerModal(){ $("brokerModal").hidden = true; brokerTarget = null; }
$("brokerModalX").addEventListener("click", closeBrokerModal);
$("brokerModalBg").addEventListener("click", closeBrokerModal);
$("brokerConnectGo").addEventListener("click", () => {
  if (brokerTarget === null) return;
  // demo: connect instantly, whatever is typed (or nothing at all)
  const go = $("brokerConnectGo");
  go.disabled = true;
  go.innerHTML = '<span class="spinner"></span>Connecting…';
  setTimeout(() => { // simulated ~1.5s handshake
    BROKERS[brokerTarget].connected = true;
    toast(BROKERS[brokerTarget].name + " connected — demo");
    closeBrokerModal(); renderBrokers(); updateBrokerPrompt();
  }, 1500);
});

/* broker prompt card — first sign-in nudge */
function updateBrokerPrompt(){
  let dismissed = null;
  try{ dismissed = localStorage.getItem("tc_broker_prompt_v1"); }catch(e){}
  $("brokerPrompt").hidden = !!(dismissed || BROKERS.some(b => b.connected));
}
$("brokerPromptX").addEventListener("click", () => {
  try{ localStorage.setItem("tc_broker_prompt_v1", "1"); }catch(e){}
  $("brokerPrompt").hidden = true;
});
$("brokerPromptGo").addEventListener("click", () => {
  try{ localStorage.setItem("tc_broker_prompt_v1", "1"); }catch(e){}
  $("brokerPrompt").hidden = true;
  goTab("profile");
});

/* ---------------- INIT ---------------- */
const savedTheme = (() => { try{ return localStorage.getItem("tc_theme_v1"); }catch(e){ return null; } })();
setAuthMode("signin");
renderPoll();
renderPosts();
renderTraders();
renderBrokers();
renderPositions();
setTheme(savedTheme === "light" ? "light" : "dark");
renderTradeTick();
setInterval(tick, 700);

// Entry flow: splash -> login. Any credentials work in this demo;
// test account: demo@trading.community / demo1234 (pre-filled).
const savedSession = (() => { try{ return localStorage.getItem("tc_session_v1"); }catch(e){ return null; } })();
if (savedSession){
  try{ finishAuth(JSON.parse(savedSession), false); }
  catch(e){ showView("auth"); }
}else{
  showView("splash");
  setTimeout(() => showView("auth"), 1400);
}

})();
