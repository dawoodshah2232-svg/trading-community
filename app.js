/* ============================================================
   Trading Community — app logic (FULL REBUILD)
   EVERYTHING is mock / simulated: random-walk price engine,
   mock order execution, mock brokers, mock chat/feed.
   No real broker, streaming, auth, or market-data integrations.
   The only real external piece is the TradingView chart widget
   (needs internet); an offline canvas fallback is built in.
   ============================================================ */
(function(){
"use strict";

/* ---------------- MOCK SYMBOL UNIVERSE ---------------- */
const SYMBOLS = {
  XAUUSD: { tv:"OANDA:XAUUSD",   base:2652.40, digits:2, spread:0.25,  vol:0.85,  perPoint:100,    contract:100,    chg:0.42 },
  EURUSD: { tv:"OANDA:EURUSD",   base:1.08420, digits:5, spread:0.00012, vol:0.00026, perPoint:100000, contract:100000, chg:-0.11 },
  GBPUSD: { tv:"OANDA:GBPUSD",   base:1.29740, digits:5, spread:0.00018, vol:0.00032, perPoint:100000, contract:100000, chg:0.23 },
  USDJPY: { tv:"OANDA:USDJPY",   base:149.820, digits:3, spread:0.015,  vol:0.042,  perPoint:667,     contract:100000, chg:-0.31 },
  BTCUSD: { tv:"BITSTAMP:BTCUSD",base:97420,   digits:0, spread:18,     vol:95,     perPoint:1,      contract:1,      chg:1.84 },
  ETHUSD: { tv:"BITSTAMP:ETHUSD",base:3420.5,  digits:1, spread:1.4,    vol:6.2,    perPoint:10,     contract:10,     chg:2.12 },
  US30:   { tv:"DJ:DJI",         base:42150,   digits:0, spread:2.4,    vol:13,     perPoint:5,      contract:1,      chg:0.35 },
  NAS100: { tv:"NASDAQ:NDX",     base:19280.5, digits:1, spread:1.6,    vol:8.5,    perPoint:5,      contract:1,      chg:0.62 },
};
const SYM_ORDER = ["XAUUSD","EURUSD","GBPUSD","USDJPY","BTCUSD","ETHUSD","US30","NAS100"];
const LEVERAGE = 100;
const START_EQUITY = 10000;

/* ---------------- STATE (all mock) ---------------- */
const state = {
  sym:"XAUUSD", tf:"1m", lots:0.10,
  prices:{}, hist:{},
  open:[], pending:[], history:[],
  realized:0, orderSeq:1,
  liveBuilt:false, voted:null,
};
SYM_ORDER.forEach(s=>{
  const m = SYMBOLS[s];
  state.prices[s] = { bid:m.base, ask:m.base+m.spread, chg:m.chg };
  state.hist[s] = [m.base];
});
/* seed mock pending + history */
state.pending = [
  { id:"p1", sym:"XAUUSD", dir:"BUY",  type:"Buy Limit",  lots:0.20, price:2640.00 },
  { id:"p2", sym:"BTCUSD", dir:"SELL", type:"Sell Stop",  lots:0.05, price:98200 },
];
state.history = [
  { sym:"XAUUSD", dir:"BUY",  lots:0.10, entry:2648.20, exit:2652.45, pl:42.50 },
  { sym:"EURUSD", dir:"SELL", lots:0.25, entry:1.08620,  exit:1.08695, pl:-18.75 },
  { sym:"BTCUSD", dir:"BUY",  lots:0.02, entry:96100,    exit:96880,  pl:15.60 },
];

/* ---------------- HELPERS ---------------- */
const $ = id => document.getElementById(id);
const meta = s => SYMBOLS[s];
const px = s => state.prices[s];
const fmtP = (s,v) => v.toFixed(meta(s).digits);
const fmt$ = v => (v<0?"-$":"$") + Math.abs(v).toLocaleString("en-US",{minimumFractionDigits:2, maximumFractionDigits:2});
const plClass = v => v>=0 ? "pl-pos" : "pl-neg";

let toastTimer = null;
function toast(msg){
  const t = $("toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.hidden = true; }, 2200);
}

/* P/L of an open mock position at current mock prices */
function positionPL(p){
  const pr = px(p.sym);
  const closePx = p.dir==="BUY" ? pr.bid : pr.ask;
  const diff = p.dir==="BUY" ? (closePx - p.entry) : (p.entry - closePx);
  return diff * meta(p.sym).perPoint * p.lots;
}
function openPL(){ return state.open.reduce((a,p)=>a+positionPL(p),0); }
function equity(){ return START_EQUITY + state.realized + openPL(); }

/* ---------------- PRICE ENGINE (simulated random walk) ---------------- */
function tick(){
  SYM_ORDER.forEach(s=>{
    const m = meta(s), pr = px(s);
    pr.bid += (m.base - pr.bid)*0.002 + (Math.random()-0.5)*2*m.vol;
    pr.ask = pr.bid + m.spread;
    pr.chg += (Math.random()-0.5)*0.02;
    const h = state.hist[s]; h.push(pr.bid); if(h.length>140) h.shift();
  });
  renderTradeTick();
  renderPositionsTick();
  drawFallbacks();
}
function renderTradeTick(){
  const s = state.sym, pr = px(s);
  $("hdrPrice").textContent = fmtP(s, pr.bid);
  const c = $("hdrChg");
  c.textContent = (pr.chg>=0?"+":"") + pr.chg.toFixed(2) + "%";
  c.className = "chg " + (pr.chg>=0?"up":"down");
  $("bidPx").textContent = fmtP(s, pr.bid);
  $("askPx").textContent = fmtP(s, pr.ask);
  $("spreadVal").textContent = fmtP(s, meta(s).spread);
  const margin = state.lots * meta(s).contract * pr.ask / LEVERAGE;
  $("marginVal").textContent = fmt$(margin);
}

/* ---------------- TAB NAVIGATION ---------------- */
document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    $("screen-"+tab).classList.add("active");
    if(tab==="live" && !state.liveBuilt){ state.liveBuilt = true; buildLive(); }
  });
});
$("avatarBtn").addEventListener("click", ()=>{ document.querySelector('.tab[data-tab="profile"]').click(); });
$("bellBtn").addEventListener("click", ()=>toast("Price alerts — mock in this prototype"));

/* ---------------- SYMBOL PICKER SHEET ---------------- */
function openSheet(){ $("backdrop").hidden = false; $("symbolSheet").hidden = false; }
function closeSheet(){ $("backdrop").hidden = true; $("symbolSheet").hidden = true; }
$("symPicker").addEventListener("click", ()=>{ renderSymbolList(); openSheet(); });
$("backdrop").addEventListener("click", closeSheet);

function renderSymbolList(){
  const list = $("symbolList"); list.innerHTML = "";
  SYM_ORDER.forEach(s=>{
    const pr = px(s);
    const b = document.createElement("button");
    b.className = "sym-row" + (s===state.sym ? " current" : "");
    b.innerHTML = '<b>'+s+'</b><span class="sp">'+fmtP(s,pr.bid)+'</span>'+
      '<span class="sc '+(pr.chg>=0?"up":"down")+'">'+(pr.chg>=0?"+":"")+pr.chg.toFixed(2)+'%</span>';
    b.addEventListener("click", ()=>{ setSymbol(s); closeSheet(); });
    list.appendChild(b);
  });
}
function setSymbol(s){
  state.sym = s;
  $("symName").textContent = s;
  loadTV("tvChart", meta(s).tv, state.tf);
  renderTradeTick();
}

/* ---------------- TRADINGVIEW WIDGETS + CANVAS FALLBACK ---------------- */
function loadTV(containerId, tvSymbol, interval){
  const host = $(containerId);
  host.innerHTML = "";
  if(typeof TradingView === "undefined"){ showFallback(containerId); return; }
  try{
    new TradingView.widget({
      container_id: containerId,
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#0A0F1C",
      hide_side_toolbar: false,
      allow_symbol_change: false,
      backgroundColor: "rgba(5, 8, 15, 1)",
      gridColor: "rgba(255,255,255,0.04)"
    });
    hideFallback(containerId);
  }catch(e){ showFallback(containerId); }
}
function fbIds(containerId){
  return containerId==="tvChart"
    ? { canvas:"fallbackChart", note:"chartNote" }
    : { canvas:"fallbackChartLive", note:null };
}
function showFallback(containerId){
  const f = fbIds(containerId);
  $(f.canvas).hidden = false;
  if(f.note) $(f.note).hidden = false;
}
function hideFallback(containerId){
  const f = fbIds(containerId);
  $(f.canvas).hidden = true;
  if(f.note) $(f.note).hidden = true;
}
/* simple line chart from the simulated tick history */
function drawFallback(containerId, canvasId){
  const cv = $(canvasId);
  if(cv.hidden) return;
  const h = state.hist[containerId==="tvChart" ? state.sym : "XAUUSD"];
  const dpr = window.devicePixelRatio||1;
  const w = cv.clientWidth, ht = cv.clientHeight;
  if(!w || !ht) return;
  if(cv.width!==w*dpr){ cv.width=w*dpr; cv.height=ht*dpr; }
  const ctx = cv.getContext("2d"); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,ht);
  const min = Math.min.apply(null,h), max = Math.max.apply(null,h), rng = (max-min)||1;
  const up = h[h.length-1] >= h[0];
  ctx.strokeStyle = up ? "#22C55E" : "#F04452"; ctx.lineWidth = 2;
  ctx.beginPath();
  h.forEach((v,i)=>{
    const x = i/(h.length-1)*w, y = ht - ((v-min)/rng)*(ht-16) - 8;
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  });
  ctx.stroke();
  ctx.lineTo(w,ht); ctx.lineTo(0,ht); ctx.closePath();
  const g = ctx.createLinearGradient(0,0,0,ht);
  g.addColorStop(0, up?"rgba(34,197,94,.25)":"rgba(240,68,82,.25)");
  g.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fill();
}
function drawFallbacks(){
  drawFallback("tvChart","fallbackChart");
  if(state.liveBuilt) drawFallback("tvChartLive","fallbackChartLive");
}

/* timeframe quick bar */
$("tfBar").addEventListener("click", e=>{
  const b = e.target.closest(".tf"); if(!b) return;
  document.querySelectorAll(".tf").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  state.tf = b.dataset.tf;
  loadTV("tvChart", meta(state.sym).tv, state.tf);
});

/* ---------------- TRADE TICKET ---------------- */
function setLots(v){
  state.lots = Math.min(50, Math.max(0.01, Math.round(v*100)/100));
  $("lotVal").textContent = state.lots.toFixed(2);
  renderTradeTick();
}
$("lotMinus").addEventListener("click", ()=>setLots(state.lots-0.01));
$("lotPlus").addEventListener("click", ()=>setLots(state.lots+0.01));

function execute(dir){
  const s = state.sym, pr = px(s);
  const entry = dir==="BUY" ? pr.ask : pr.bid;
  state.open.push({ id:"o"+(state.orderSeq++), sym:s, dir:dir, lots:state.lots,
                    entry:entry, time:new Date() });
  renderPositions();
  toast(dir+" "+state.lots.toFixed(2)+" "+s+" @ "+fmtP(s,entry)+" — mock fill");
}
$("buyBtn").addEventListener("click", ()=>execute("BUY"));
$("sellBtn").addEventListener("click", ()=>execute("SELL"));

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

function renderPositions(){
  /* open */
  const open = $("posOpen"); open.innerHTML = "";
  $("openCount").textContent = state.open.length;
  const badge = $("posBadge");
  badge.hidden = !state.open.length; badge.textContent = state.open.length;
  if(!state.open.length) open.innerHTML = '<div class="empty">No open positions.<br>Place a trade from the Trade tab.</div>';
  state.open.forEach(p=>{
    const card = document.createElement("div");
    card.className = "pos-card"; card.dataset.pid = p.id;
    card.innerHTML =
      '<div class="pos-top"><span class="pos-sym">'+p.sym+'</span>'+
      '<span class="dir '+(p.dir==="BUY"?"buy":"sell")+'">'+p.dir+'</span>'+
      '<span class="pos-lots">'+p.lots.toFixed(2)+' lots</span>'+
      '<button class="pos-close" data-close="'+p.id+'" aria-label="Close">×</button></div>'+
      '<div class="pos-grid">'+
      '<div class="pos-col"><span>Entry</span><b>'+fmtP(p.sym,p.entry)+'</b></div>'+
      '<div class="pos-col"><span>Current</span><b data-cur="'+p.id+'">—</b></div>'+
      '<div class="pos-col"><span>P/L</span><b data-pl="'+p.id+'">—</b></div>'+
      '</div>';
    open.appendChild(card);
  });
  /* pending */
  const pend = $("posPending"); pend.innerHTML = "";
  $("pendCount").textContent = state.pending.length;
  if(!state.pending.length) pend.innerHTML = '<div class="empty">No pending orders.</div>';
  state.pending.forEach(o=>{
    const card = document.createElement("div");
    card.className = "pos-card";
    card.innerHTML =
      '<div class="pos-top"><span class="pos-sym">'+o.sym+'</span>'+
      '<span class="dir '+(o.dir==="BUY"?"buy":"sell")+'">'+o.type.toUpperCase()+'</span>'+
      '<span class="pos-lots">'+o.lots.toFixed(2)+' lots</span>'+
      '<button class="pos-close" data-cancel="'+o.id+'" aria-label="Cancel">×</button></div>'+
      '<div class="pos-grid"><div class="pos-col"><span>Trigger</span><b>'+fmtP(o.sym,o.price)+'</b></div>'+
      '<div class="pos-col"><span>Current</span><b>'+fmtP(o.sym,px(o.sym).bid)+'</b></div></div>';
    pend.appendChild(card);
  });
  /* history */
  renderHistory($("posHistory"));
  renderHistory($("profHistory"));
  $("eqVal").textContent = fmt$(equity());
}
function renderHistory(el){
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
/* live-tick P/L updates without full re-render */
function renderPositionsTick(){
  state.open.forEach(p=>{
    const pr = px(p.sym);
    const curEl = document.querySelector('[data-cur="'+p.id+'"]');
    const plEl = document.querySelector('[data-pl="'+p.id+'"]');
    if(curEl) curEl.textContent = fmtP(p.sym, p.dir==="BUY"?pr.bid:pr.ask);
    if(plEl){ const v = positionPL(p); plEl.textContent = fmt$(v); plEl.className = plClass(v); }
  });
  if(state.open.length) $("eqVal").textContent = fmt$(equity());
}
/* close / cancel via delegation */
document.addEventListener("click", e=>{
  const c = e.target.closest("[data-close]");
  if(c){
    const i = state.open.findIndex(p=>p.id===c.dataset.close);
    if(i>-1){
      const p = state.open[i];
      const pr = px(p.sym);
      const exit = p.dir==="BUY" ? pr.bid : pr.ask;
      const pl = positionPL(p);
      state.realized += pl;
      state.history.push({ sym:p.sym, dir:p.dir, lots:p.lots, entry:p.entry, exit:exit, pl:pl });
      state.open.splice(i,1);
      renderPositions();
      toast("Closed "+p.sym+" "+fmt$(pl)+" — mock");
    }
    return;
  }
  const x = e.target.closest("[data-cancel]");
  if(x){
    state.pending = state.pending.filter(o=>o.id!==x.dataset.cancel);
    renderPositions();
    toast("Pending order cancelled — mock");
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
  ["trendrider","that wick rejection though"],
];
let chatIdx = 0, viewers = 2412;

function buildLive(){
  loadTV("tvChartLive", SYMBOLS.XAUUSD.tv, "5m");
  restoreFaceCam();
  /* seed feed + chat */
  for(let i=0;i<3;i++) pushFeed(true);
  MOCK_CHAT.slice(0,6).forEach(m=>addChat(m[0], m[1], false));
  /* simulators */
  setInterval(()=>{
    viewers = Math.max(1800, viewers + Math.round((Math.random()-0.48)*60));
    $("viewerCount").textContent = viewers.toLocaleString("en-US");
  }, 3000);
  setInterval(()=>pushFeed(false), 6000);
  setInterval(()=>{
    const m = MOCK_CHAT[chatIdx++ % MOCK_CHAT.length];
    addChat(m[0], m[1], false);
  }, 8000);
}
function pushFeed(seed){
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
      localStorage.setItem(KEY, JSON.stringify({
        x: cam.offsetLeft, y: cam.offsetTop,
        w: cam.offsetWidth, h: cam.offsetHeight
      }));
    }catch(e){}
  }
  function clamp(){
    const wr = wrap.getBoundingClientRect();
    let x = Math.min(Math.max(0, cam.offsetLeft), wr.width - cam.offsetWidth);
    let y = Math.min(Math.max(0, cam.offsetTop), wr.height - cam.offsetHeight);
    cam.style.left = x+"px"; cam.style.top = y+"px";
    cam.style.right = "auto"; cam.style.bottom = "auto";
  }
  cam.addEventListener("pointerdown", e=>{
    if(e.target===grip) return;
    drag = { dx: e.clientX - cam.offsetLeft, dy: e.clientY - cam.offsetTop };
    cam.setPointerCapture(e.pointerId);
  });
  grip.addEventListener("pointerdown", e=>{
    e.stopPropagation();
    resizing = true;
    drag = { sx: e.clientX, sy: e.clientY, w: cam.offsetWidth, h: cam.offsetHeight };
    grip.setPointerCapture(e.pointerId);
  });
  cam.addEventListener("pointermove", e=>{
    if(!drag) return;
    if(resizing){
      const w = Math.min(220, Math.max(64, drag.w + (e.clientX - drag.sx)));
      const h = Math.min(300, Math.max(80, drag.h + (e.clientY - drag.sy)));
      cam.style.width = w+"px"; cam.style.height = h+"px"; clamp();
    }else{
      const wr = wrap.getBoundingClientRect();
      cam.style.left = (e.clientX - wr.left - drag.dx)+"px";
      cam.style.top = (e.clientY - wr.top - drag.dy)+"px";
      cam.style.right = "auto"; cam.style.bottom = "auto"; clamp();
    }
  });
  ["pointerup","pointercancel"].forEach(ev=>cam.addEventListener(ev, ()=>{
    if(drag && (resizing || true)) save();
    drag = null; resizing = false;
  }));
})();

/* ---------------- COMMUNITY ---------------- */
const POLL_KEY = "tc_poll_v1";
let poll = { buy:7693, sell:4715, voted: null };
try{
  const s = JSON.parse(localStorage.getItem(POLL_KEY)||"null");
  if(s && s.voted) poll = s;
}catch(e){}
function renderPoll(){
  const total = poll.buy + poll.sell;
  const bp = Math.round(poll.buy/total*100), sp = 100-bp;
  $("pollBuyFill").style.width = bp+"%";
  $("pollSellFill").style.width = sp+"%";
  $("pollBuyPct").textContent = bp+"%";
  $("pollSellPct").textContent = sp+"%";
  $("pollVotes").textContent = total.toLocaleString("en-US")+" votes";
  if(poll.voted) $("pollBtns").classList.add("voted");
}
function vote(side){
  if(poll.voted){ toast("You already voted"); return; }
  poll[side]++; poll.voted = side;
  try{ localStorage.setItem(POLL_KEY, JSON.stringify(poll)); }catch(e){}
  renderPoll();
  toast("Vote counted: "+side.toUpperCase()+" — mock");
}
$("pollBuy").addEventListener("click", ()=>vote("buy"));
$("pollSell").addEventListener("click", ()=>vote("sell"));

const MOCK_POSTS = [
  { name:"Daud", handle:"@daudtradefx", time:"12m", g1:"#2F80FF", g2:"#1B5FD6", ini:"DR",
    body:"NFP Friday: expecting a hot print. DXY strength = gold pullback first, then dip-buy into 2640 liquidity. Not financial advice — sharing my read.",
    likes:214, liked:false },
  { name:"Sara Malik", handle:"@saramalik", time:"1h", g1:"#B678F0", g2:"#5E2B8A", ini:"SM",
    body:"EURUSD swept Asia lows and reclaimed 1.0840. If London holds above, targeting 1.0890. Invalidation: M15 close back below the lows.",
    likes:96, liked:false },
  { name:"Arjun Rao", handle:"@arjunfx", time:"3h", g1:"#5B8DEF", g2:"#2B4A8A", ini:"AR",
    body:"BTC funding neutral, spot bid on every dip. 98k is the line in the sand — lose it and I stand aside. Trade the plan, not the feeling.",
    likes:158, liked:false },
];
function renderPosts(){
  const list = $("postList"); list.innerHTML = "";
  MOCK_POSTS.forEach((p,i)=>{
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML =
      '<div class="post-head"><div class="avatar" style="--g1:'+p.g1+';--g2:'+p.g2+'">'+p.ini+'</div>'+
      '<div><b>'+p.name+'</b><span>'+p.handle+' · '+p.time+'</span></div></div>'+
      '<div class="post-body"></div>'+
      '<div class="post-actions"><button class="like-btn'+(p.liked?" liked":"")+'" data-like="'+i+'">'+
      '♥ <span>'+p.likes+'</span></button></div>';
    c.querySelector(".post-body").textContent = p.body;
    list.appendChild(c);
  });
}
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-like]"); if(!b) return;
  const p = MOCK_POSTS[+b.dataset.like];
  p.liked = !p.liked; p.likes += p.liked?1:-1;
  b.classList.toggle("liked", p.liked);
  b.querySelector("span").textContent = p.likes;
});

/* ---------------- PROFILE ---------------- */
const BROKERS = [
  { name:"Exness",    sub:"MT4 / MT5", g1:"#2F80FF", g2:"#1B5FD6", ini:"EX", connected:false },
  { name:"Vantage",   sub:"MT4 / MT5", g1:"#22C55E", g2:"#166534", ini:"VA", connected:false },
  { name:"IC Markets",sub:"MT4 / MT5 · cTrader", g1:"#5B8DEF", g2:"#2B4A8A", ini:"IC", connected:false },
  { name:"XM",        sub:"MT4 / MT5", g1:"#B678F0", g2:"#5E2B8A", ini:"XM", connected:false },
];
let customBrokers = 0;
function renderBrokers(){
  const list = $("brokerList"); list.innerHTML = "";
  BROKERS.forEach((b,i)=>{
    const r = document.createElement("div");
    r.className = "broker-row";
    r.innerHTML =
      '<div class="broker-ic" style="--g1:'+b.g1+';--g2:'+b.g2+'">'+b.ini+'</div>'+
      '<div><b>'+b.name+'</b><span>'+b.sub+'</span></div>'+
      '<button class="conn-btn'+(b.connected?" connected":"")+'" data-broker="'+i+'">'+
      (b.connected?"Connected":"Connect")+'</button>';
    list.appendChild(r);
  });
}
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-broker]"); if(!b) return;
  const br = BROKERS[+b.dataset.broker];
  br.connected = !br.connected;
  renderBrokers();
  toast(br.name+(br.connected?" connected — mock":" disconnected"));
});
$("addBroker").addEventListener("click", ()=>{
  customBrokers++;
  BROKERS.push({ name:"My Broker "+customBrokers, sub:"Custom connection", g1:"#8A94A8", g2:"#3A4356", ini:"MB", connected:true });
  renderBrokers();
  toast("Custom broker added — mock");
});

/* ---------------- INIT ---------------- */
renderPoll();
renderPosts();
renderBrokers();
renderPositions();
loadTV("tvChart", meta(state.sym).tv, state.tf);
renderTradeTick();
setInterval(tick, 700);

})();
