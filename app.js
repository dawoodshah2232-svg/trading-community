/* ============================================================
   Trading Community — static prototype logic
   EVERYTHING below is mock data / simulated behavior.
   No real broker, streaming, or auth integrations exist here.
   ============================================================ */
(function(){
"use strict";

/* ---------------- MOCK DATA ---------------- */
const MOCK_CREATORS = [
  { id:1, name:"Daud",      handle:"@daudtradefx", pair:"XAUUSD", live:true,  viewers:"2.4k", pl:"+18.2%", win:"67%", trades:312, g1:"#2F80FF", g2:"#1B5FD6", initials:"DR" },
  { id:2, name:"Arjun Rao", handle:"@arjunfx",     pair:"BTCUSD", live:true,  viewers:"1.1k", pl:"+24.7%", win:"71%", trades:486, g1:"#5B8DEF", g2:"#2B4A8A", initials:"AR" },
  { id:3, name:"Sara Malik",handle:"@saramalik",   pair:"EURUSD", live:true,  viewers:"860",  pl:"+9.4%",  win:"63%", trades:198, g1:"#B678F0", g2:"#5E2B8A", initials:"SM" },
  { id:4, name:"Vikram",    handle:"@viktrade",    pair:"XAUUSD", live:false, viewers:"",     pl:"+31.5%", win:"69%", trades:521, g1:"#4ADE80", g2:"#166534", initials:"VK" },
  { id:5, name:"Layla H.",  handle:"@laylahfx",    pair:"GBPUSD", live:false, viewers:"",     pl:"+12.8%", win:"65%", trades:264, g1:"#F472B6", g2:"#831843", initials:"LH" },
];

const MOCK_CHAT = [
  ["goldrush_99","That entry was clean 🔥"],
  ["fxnoob","how do you set your stop loss?"],
  ["DubaiTrader","buy the dip let's gooo"],
  ["sniperfx","TP hit already?? insane"],
  ["Ayesha","watching from Abu Dhabi 👋"],
  ["pipmaster","this is why live > signals"],
  ["omar_trades","spread widening a bit careful"],
  ["NFP_queen","holding my buy from 2648"],
  ["chartwizard","double bottom on M5 forming"],
  ["riyadhfx","copied, let's eat 📈"],
  ["quietstorm","risk 1% only guys"],
  ["trendrider","that wick rejection though"],
];

const MOCK_POSTS = [
  { name:"Daud", handle:"@daudtradefx", time:"2h", pair:"XAUUSD", g1:"#2F80FF", g2:"#1B5FD6", ini:"DR",
    text:"Gold holding above 2,648 into NFP. My base case: a hot print flushes weak longs first, then real buyers step in. I will NOT chase the first spike — waiting for the flush, then looking for longs on the live stream." },
  { name:"Arjun Rao", handle:"@arjunfx", time:"5h", pair:"BTCUSD", g1:"#5B8DEF", g2:"#2B4A8A", ini:"AR",
    text:"BTC funding rates are flat while price grinds up — that's healthy. Break and hold above the range high and I start scaling into momentum longs. Invalidation is a daily close back inside." },
  { name:"Sara Malik", handle:"@saramalik", time:"8h", pair:"EURUSD", g1:"#B678F0", g2:"#5E2B8A", ini:"SM",
    text:"ECB speakers all week and nobody moved the needle. EURUSD is a range until NFP reprices the dollar. Playing edges only, 0.5% risk per idea." },
];

const MOCK_HISTORY = [
  { pair:"XAUUSD", dir:"BUY",  entry:"2,641.20", exit:"2,653.80", pl:"+$126.00", t:"Today · 14:32" },
  { pair:"XAUUSD", dir:"SELL", entry:"2,659.40", exit:"2,651.10", pl:"+$83.00",  t:"Today · 11:05" },
  { pair:"BTCUSD", dir:"BUY",  entry:"97,410",   exit:"98,220",   pl:"+$162.00", t:"Yesterday" },
  { pair:"XAUUSD", dir:"BUY",  entry:"2,647.90", exit:"2,644.30", pl:"−$36.00",  t:"Yesterday", loss:true },
  { pair:"EURUSD", dir:"SELL", entry:"1.0842",   exit:"1.0801",   pl:"+$41.00",  t:"2 days ago" },
];

const MOCK_BROKERS = [
  { name:"Exness",    sub:"MetaTrader 4 · MetaTrader 5",       c1:"#FFD200", c2:"#B78A00", ini:"EX" },
  { name:"Vantage",   sub:"MetaTrader 4 · MetaTrader 5",       c1:"#E31837", c2:"#7A0E1D", ini:"VA" },
  { name:"IC Markets",sub:"MetaTrader 4 · cTrader",            c1:"#00A651", c2:"#005C2E", ini:"IC" },
  { name:"XM",        sub:"MetaTrader 4 · MetaTrader 5",       c1:"#D22630", c2:"#6E1219", ini:"XM" },
  { name:"OctaFX",    sub:"MetaTrader 4 · MetaTrader 5",       c1:"#1E88E5", c2:"#0D3C66", ini:"OC" },
  { name:"FBS",       sub:"MetaTrader 4 · MetaTrader 5 · FBS app", c1:"#7B1FA2", c2:"#3E0F52", ini:"FB" },
];

/* ---------------- helpers ---------------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

let toastTimer;
function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove("show"), 2400);
}

function openSheet(title, body, extraHTML){
  $("#sheetTitle").textContent = title;
  $("#sheetBody").textContent = body;
  $("#sheetExtra").innerHTML = extraHTML || "";
  $("#sheetBackdrop").classList.add("show");
  $("#sheet").classList.add("show");
}
function closeSheet(){
  $("#sheetBackdrop").classList.remove("show");
  $("#sheet").classList.remove("show");
}
$("#sheetClose").addEventListener("click", closeSheet);
$("#sheetBackdrop").addEventListener("click", closeSheet);
$("#sheetPrimary").addEventListener("click", closeSheet);

const verifiedBadge = '<span class="verified"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 2.4 3.4-.5.9 3.3 3 1.7-1.5 3.1 1.5 3.1-3 1.7-.9 3.3-3.4-.5L12 22l-2.4-2.4-3.4.5-.9-3.3-3-1.7L3.8 12 2.3 8.9l3-1.7.9-3.3 3.4.5z"/><path d="M10.6 14.6l-2.1-2.1-1.4 1.4 3.5 3.5 7.1-7.1-1.4-1.4z" fill="#05080F"/></svg></span>';

/* ---------------- status bar clock (mock) ---------------- */
function tickClock(){
  const d = new Date();
  let h = d.getHours(), m = String(d.getMinutes()).padStart(2,"0");
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  $("#sbTime").textContent = h + ":" + m + " " + ap;
}
tickClock(); setInterval(tickClock, 30000);

/* ---------------- navigation ---------------- */
const TABS = ["home","live","golive","community","profile"];
let currentScreen = "home";
let liveTimers = [];

function showScreen(name){
  currentScreen = name;
  $$(".screen").forEach(s => s.classList.remove("active"));
  const el = $("#screen-" + name);
  if(el) el.classList.add("active");
  $$(".tab[data-screen]").forEach(t => t.classList.toggle("active", t.dataset.screen === name));
  $("#fabWrap").classList.toggle("active", name === "golive");
  if(name === "live") startLiveSim(); else stopLiveSim();
  if(name === "live") $("#app").scrollTop = 0;
  const scr = $("#screen-" + name);
  if(scr && scr.classList.contains("scroll")) scr.scrollTop = 0;
}
$$(".tab[data-screen], .tab-fab[data-screen]").forEach(b =>
  b.addEventListener("click", () => showScreen(b.dataset.screen))
);
$$("[data-goto]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault(); showScreen(a.dataset.goto);
}));
$$("[data-toast]").forEach(el => el.addEventListener("click", e => {
  if(el.tagName === "A") e.preventDefault();
  toast(el.dataset.toast);
}));
$("#liveBack").addEventListener("click", () => showScreen("home"));
$("#brokerBack").addEventListener("click", () => showScreen("profile"));

/* ---------------- HOME: rail + feed (mock) ---------------- */
function renderHome(){
  const rail = $("#liveRail");
  rail.innerHTML = MOCK_CREATORS.filter(c => c.live).map(c => `
    <div class="rail-card" data-open-live="${c.id}">
      <div class="avatar" style="--g1:${c.g1};--g2:${c.g2}">${c.initials}</div>
      <div class="rail-name">${esc(c.name)}</div>
      <div class="rail-pair">${c.pair}</div>
      <div class="rail-viewers"><span class="pulse"></span>${c.viewers}</div>
    </div>`).join("");

  const feed = $("#creatorFeed");
  feed.innerHTML = MOCK_CREATORS.map(c => `
    <div class="creator-card">
      <div class="cc-top">
        <div class="avatar sm" style="--g1:${c.g1};--g2:${c.g2}">${c.initials}</div>
        <div class="cc-id">
          <div class="cc-name">${esc(c.name)} ${verifiedBadge}</div>
          <div class="cc-sub">${esc(c.handle)} · ${c.pair}</div>
        </div>
        <button class="follow-btn" data-follow>Follow</button>
      </div>
      <div class="cc-live-row">
        ${c.live ? '<span class="live-badge"><span class="pulse"></span>LIVE</span><span class="cc-pair">' + c.viewers + ' watching</span>'
                 : '<span class="cc-pair">Last live 3h ago</span>'}
      </div>
      <div class="cc-stats">
        <div class="cc-stat"><b class="pos">${c.pl}</b><span>P/L 30d</span></div>
        <div class="cc-stat"><b>${c.win}</b><span>Win rate</span></div>
        <div class="cc-stat"><b>${c.trades}</b><span>Live trades</span></div>
      </div>
      ${c.live ? `<button class="watch-btn" data-open-live="${c.id}">Watch live</button>` : ""}
    </div>`).join("");

  $$("[data-open-live]", feed).concat($$("[data-open-live]", rail)).forEach(b =>
    b.addEventListener("click", () => openLiveRoom(Number(b.dataset.openLive)))
  );
  $$("[data-follow]").forEach(b => b.addEventListener("click", () => {
    b.classList.toggle("following");
    b.textContent = b.classList.contains("following") ? "Following" : "Follow";
  }));
}

function openLiveRoom(id){
  const c = MOCK_CREATORS.find(x => x.id === id) || MOCK_CREATORS[0];
  $("#liveAvatar").textContent = c.initials;
  $("#liveAvatar").style.setProperty("--g1", c.g1);
  $("#liveAvatar").style.setProperty("--g2", c.g2);
  $("#liveName").textContent = c.name;
  $("#livePair").textContent = c.pair + " · live session";
  $("#liveViewers").textContent = c.viewers === "" ? "1,204" : c.viewers.replace("k",",") .replace("2,","2,").replace("1,","1,") + "";
  showScreen("live");
}

/* ---------------- LIVE ROOM simulation (mock) ---------------- */
let basePrice = 2652.40;
function fmt(n){ return n.toLocaleString("en-US",{minimumFractionDigits:2, maximumFractionDigits:2}); }

function pushTrade(){
  const feed = $("#tradeFeed");
  const isClose = Math.random() < 0.3;
  const dir = Math.random() < 0.55 ? "BUY" : "SELL";
  basePrice += (Math.random() - 0.5) * 3.2;
  const price = fmt(basePrice);
  let html;
  if(isClose){
    const win = Math.random() < 0.65;
    const amt = "$" + (20 + Math.random()*140).toFixed(2);
    html = `<div class="trade-row"><span class="dir close">CLOSE</span>
      <div class="trade-info"><b>XAUUSD ${dir} closed @ ${price}</b><small>just now · 0.50 lots</small></div>
      <span class="trade-pl ${win?"pos":"neg"}">${win?"+":"−"}${amt.slice(1)}</span></div>`;
  } else {
    html = `<div class="trade-row"><span class="dir ${dir.toLowerCase()}">${dir}</span>
      <div class="trade-info"><b>XAUUSD ${dir} @ ${price}</b><small>just now · 0.50 lots</small></div>
      <span class="trade-pl" style="color:var(--muted)">open</span></div>`;
  }
  feed.insertAdjacentHTML("afterbegin", html);
  while(feed.children.length > 18) feed.lastElementChild.remove();
}

function pushChat(){
  const feed = $("#chatFeed");
  const [u, m] = MOCK_CHAT[Math.floor(Math.random()*MOCK_CHAT.length)];
  feed.insertAdjacentHTML("beforeend",
    `<div class="chat-msg"><b>${esc(u)}</b> <span class="cm-text">${esc(m)}</span></div>`);
  while(feed.children.length > 30) feed.firstElementChild.remove();
  const pane = $("#panel-chat");
  if(pane.classList.contains("active")){
    const body = pane.closest(".lp-body");
    body.scrollTop = body.scrollHeight;
  }
}

function tickViewers(){
  const el = $("#liveViewers");
  const n = parseInt(el.textContent.replace(/[^0-9]/g,"")) || 2400;
  el.textContent = (n + Math.floor(Math.random()*14 - 5)).toLocaleString();
}

function startLiveSim(){
  stopLiveSim();
  if(!$("#tradeFeed").children.length){ for(let i=0;i<5;i++) pushTrade(); }
  if(!$("#chatFeed").children.length){ for(let i=0;i<8;i++) pushChat(); }
  liveTimers.push(setInterval(pushTrade, 7000));
  liveTimers.push(setInterval(pushChat, 4200));
  liveTimers.push(setInterval(tickViewers, 5000));
}
function stopLiveSim(){ liveTimers.forEach(clearInterval); liveTimers = []; }

/* live panel tabs */
$$(".lp-tab[data-panel]").forEach(t => t.addEventListener("click", () => {
  $$(".lp-tab[data-panel]").forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  $$("#screen-live .lp-pane").forEach(p => p.classList.remove("active"));
  $("#panel-" + t.dataset.panel).classList.add("active");
  const isChat = t.dataset.panel === "chat";
  $("#chatInputRow").style.display = isChat ? "flex" : "none";
}));

/* like button (mock) */
let likes = 8200, liked = false;
$("#likeBtn").addEventListener("click", function(){
  liked = !liked; likes += liked ? 1 : -1;
  this.classList.toggle("liked", liked);
  this.classList.remove("pop"); void this.offsetWidth; this.classList.add("pop");
  $("#likeCount").textContent = (likes/1000).toFixed(1) + "k";
});

/* copy trades toggle (mock) */
$("#copyToggle").addEventListener("change", function(){
  toast(this.checked
    ? "Mock: copy-trading ON — no real orders are placed."
    : "Mock: copy-trading OFF.");
});

/* chat send (mock, local only) */
function sendChat(){
  const inp = $("#chatInput"), v = inp.value.trim();
  if(!v) return;
  $("#chatFeed").insertAdjacentHTML("beforeend",
    `<div class="chat-msg"><b style="color:#fff">you</b> <span class="cm-text">${esc(v)}</span></div>`);
  inp.value = "";
  const body = $("#panel-chat").closest(".lp-body");
  body.scrollTop = body.scrollHeight;
}
$("#chatSend").addEventListener("click", sendChat);
$("#chatInput").addEventListener("keydown", e => { if(e.key === "Enter") sendChat(); });

/* TradingView fallback: if the widget iframe never appears, show mock notice */
setTimeout(() => {
  if(!$("#chartWrap").querySelector("iframe")) $("#chartFallback").classList.add("show");
}, 8000);

/* ---------------- face-cam: drag + resize + persist (mock placeholder) ---------------- */
const cam = $("#facecam"), wrap = $("#chartWrap");
const CORNERS = ["tl","tr","bl","br"];
function setCorner(c){
  cam.classList.remove("free", ...CORNERS.map(x => "c-"+x));
  cam.classList.add("c-" + c);
  cam.style.left = cam.style.top = cam.style.right = cam.style.bottom = "";
  saveCam({ corner:c });
}
function saveCam(patch){
  const cur = loadCam();
  localStorage.setItem("tc_cam", JSON.stringify(Object.assign(cur, patch)));
}
function loadCam(){
  try { return JSON.parse(localStorage.getItem("tc_cam")) || { corner:"br", w:112, h:150 }; }
  catch(e){ return { corner:"br", w:112, h:150 }; }
}
(function initCam(){
  const s = loadCam();
  cam.style.width = s.w + "px"; cam.style.height = s.h + "px";
  setCorner(CORNERS.includes(s.corner) ? s.corner : "br");
})();

let dragState = null;
cam.addEventListener("pointerdown", e => {
  if(e.target.closest("#camHandle")) return;           // resize handled separately
  e.preventDefault();
  const wr = wrap.getBoundingClientRect(), cr = cam.getBoundingClientRect();
  cam.classList.remove(...CORNERS.map(x => "c-"+x));
  cam.classList.add("free");
  cam.style.left = (cr.left - wr.left) + "px";
  cam.style.top  = (cr.top  - wr.top)  + "px";
  cam.style.right = cam.style.bottom = "auto";
  dragState = {
    dx: e.clientX - cr.left, dy: e.clientY - cr.top,
    wrapRect: wr, w: cr.width, h: cr.height
  };
  cam.setPointerCapture(e.pointerId);
});
cam.addEventListener("pointermove", e => {
  if(!dragState || dragState.resize) return;
  const wr = wrap.getBoundingClientRect();
  let x = e.clientX - wr.left - dragState.dx;
  let y = e.clientY - wr.top  - dragState.dy;
  x = Math.max(4, Math.min(x, wr.width  - dragState.w - 4));
  y = Math.max(4, Math.min(y, wr.height - dragState.h - 4));
  cam.style.left = x + "px"; cam.style.top = y + "px";
});
cam.addEventListener("pointerup", e => {
  if(dragState && dragState.resize){ dragState = null; return; }
  if(!dragState) return;
  dragState = null;
  // snap to nearest corner
  const wr = wrap.getBoundingClientRect(), cr = cam.getBoundingClientRect();
  const cx = cr.left + cr.width/2 - wr.left, cy = cr.top + cr.height/2 - wr.top;
  const corner = (cy < wr.height/2 ? "t" : "b") + (cx < wr.width/2 ? "l" : "r");
  setCorner(corner);
  syncCamPicker();
});

/* resize via handle */
$("#camHandle").addEventListener("pointerdown", e => {
  e.preventDefault(); e.stopPropagation();
  dragState = { resize:true, startX:e.clientX, startY:e.clientY,
                w:cam.offsetWidth, h:cam.offsetHeight };
  cam.setPointerCapture(e.pointerId);
  const move = ev => {
    if(!dragState || !dragState.resize) return;
    const w = Math.max(80, Math.min(200, dragState.w + ev.clientX - dragState.startX));
    const h = Math.max(100, Math.min(260, dragState.h + ev.clientY - dragState.startY));
    cam.style.width = w + "px"; cam.style.height = h + "px";
  };
  const up = () => {
    saveCam({ w:cam.offsetWidth, h:cam.offsetHeight });
    cam.removeEventListener("pointermove", move);
    cam.removeEventListener("pointerup", up);
    dragState = null;
  };
  cam.addEventListener("pointermove", move);
  cam.addEventListener("pointerup", up);
});

/* ---------------- GO LIVE setup (mock) ---------------- */
$$("#glPairs .chip").forEach(ch => ch.addEventListener("click", () => {
  $$("#glPairs .chip").forEach(x => x.classList.remove("active"));
  ch.classList.add("active");
}));
function syncCamPicker(){
  const { corner } = loadCam();
  $$("#camPicker .campick").forEach(b =>
    b.classList.toggle("active", b.dataset.corner === corner));
}
$$("#camPicker .campick").forEach(b => b.addEventListener("click", () => {
  setCorner(b.dataset.corner); syncCamPicker();
}));
$$(".dest-toggle").forEach(t => t.addEventListener("change", () => {
  toast(t.checked ? "Mock: destination connected." : "Mock: destination disconnected.");
}));
$("#startLiveBtn").addEventListener("click", () => {
  const title = $("#glTitle").value.trim() || "Live trading session";
  const pair = ($$("#glPairs .chip.active")[0] || {}).textContent || "XAUUSD";
  $("#liveName").textContent = "You";
  $("#liveAvatar").textContent = "YOU";
  $("#livePair").textContent = pair + " · " + title.slice(0, 34);
  toast("Mock: you are now LIVE (no real stream).");
  showScreen("live");
});

/* ---------------- COMMUNITY: poll + posts (mock) ---------------- */
const poll = { buy: 6842, sell: 3215, voted: null };
function renderPoll(){
  const total = poll.buy + poll.sell;
  const bp = Math.round(poll.buy/total*100), sp = 100 - bp;
  $("#buyBar").style.width = bp + "%";
  $("#sellBar").style.width = sp + "%";
  $("#buyPct").textContent = bp + "%";
  $("#sellPct").textContent = sp + "%";
  $("#pollVotes").textContent = total.toLocaleString() + " votes";
}
$("#pollBuy").addEventListener("click", () => vote("buy"));
$("#pollSell").addEventListener("click", () => vote("sell"));
function vote(side){
  if(poll.voted){ toast("Mock: vote already counted."); return; }
  poll.voted = side; poll[side]++;
  $("#pollBuy").disabled = $("#pollSell").disabled = true;
  $("#pollMsg").textContent = "You voted " + side.toUpperCase() + " · mock";
  renderPoll();
}
setTimeout(renderPoll, 400);

function postCard(p){
  return `<div class="post-card">
    <div class="post-head">
      <div class="avatar sm" style="--g1:${p.g1};--g2:${p.g2}">${p.ini}</div>
      <div class="grow"><b>${esc(p.name)} ${verifiedBadge}</b><small>${esc(p.handle)} · ${p.time} ago</small></div>
    </div>
    <p class="post-text">${esc(p.text)}</p>
    <span class="post-pair">${p.pair}</span>
    <div class="post-actions">
      <button data-like>♡ <span>0</span></button>
      <button data-toast="Comments are mocked in this prototype.">💬 Comment</button>
      <button data-toast="Sharing is mocked in this prototype.">↗ Share</button>
    </div>
  </div>`;
}
function renderCommunity(){
  $("#analysisList").innerHTML = MOCK_POSTS.map(postCard).join("");
  $("#profileAnalysis").innerHTML = MOCK_POSTS.slice(0,1).map(postCard).join("");
  $$("[data-like]").forEach(b => b.addEventListener("click", () => {
    const s = b.querySelector("span");
    const on = b.classList.toggle("liked");
    s.textContent = Number(s.textContent) + (on ? 1 : -1);
    b.firstChild.textContent = on ? "♥ " : "♡ ";
  }));
}

/* ---------------- PROFILE: trade history (mock) ---------------- */
function renderHistory(){
  $("#tradeHistory").innerHTML = MOCK_HISTORY.map(h => `
    <div class="hist-row">
      <span class="dir ${h.dir.toLowerCase()}">${h.dir}</span>
      <div class="grow"><b>${h.pair} · ${h.entry} → ${h.exit}</b><small>${h.t}</small></div>
      <span class="trade-pl ${h.loss ? "neg" : "pos"}">${h.pl}</span>
    </div>`).join("");
}
$$(".pf-tab").forEach(t => t.addEventListener("click", () => {
  $$(".pf-tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  $("#ptrades").classList.toggle("active", t.dataset.ppanel === "ptrades");
  $("#panalysis").classList.toggle("active", t.dataset.ppanel === "panalysis");
}));
$("#connectBrokerBtn").addEventListener("click", () => showScreen("brokers"));

/* ---------------- BROKERS (mock) ---------------- */
function renderBrokers(){
  $("#brokerList").innerHTML = MOCK_BROKERS.map((b,i) => `
    <div class="broker-row">
      <div class="broker-ic" style="background:linear-gradient(135deg,${b.c1},${b.c2})">${b.ini}</div>
      <div class="grow"><b>${esc(b.name)}</b><small>${esc(b.sub)}</small></div>
      <button class="connect-btn" data-broker="${i}">Connect</button>
    </div>`).join("");
  $$("[data-broker]").forEach(btn => btn.addEventListener("click", () => {
    const b = MOCK_BROKERS[Number(btn.dataset.broker)];
    if(btn.classList.contains("connected")){
      btn.classList.remove("connected"); btn.textContent = "Connect";
      toast("Mock: " + b.name + " disconnected.");
      return;
    }
    openSheet(b.name + " connection",
      "In the real app this opens the broker's secure OAuth login. This prototype only simulates the UI — no credentials are asked for and nothing is connected.",
      "");
    $("#sheetPrimary").onclick = () => {
      btn.classList.add("connected"); btn.textContent = "Connected";
      closeSheet(); toast("Mock: " + b.name + " marked as connected.");
      $("#sheetPrimary").onclick = closeSheet;
    };
  }));
}
$("#addBrokerRow").addEventListener("click", () => {
  openSheet("Add new broker",
    "Request a broker integration. In the real app the team reviews requests and adds an official connector.",
    `<input class="text-input" id="nbName" placeholder="Broker name, e.g. Axi" style="margin-bottom:14px">`);
  $("#sheetPrimary").onclick = () => {
    const v = ($("#nbName") || {}).value || "";
    if(v.trim()){
      MOCK_BROKERS.push({ name:v.trim(), sub:"Pending connector", c1:"#5B6478", c2:"#2A3350", ini:v.trim().slice(0,2).toUpperCase() });
      renderBrokers(); toast("Mock: broker request added.");
    }
    closeSheet(); $("#sheetPrimary").onclick = closeSheet;
  };
});

/* ---------------- boot ---------------- */
renderHome();
renderCommunity();
renderHistory();
renderBrokers();
syncCamPicker();

})();
