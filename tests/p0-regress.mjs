// P0 regression tests — audit findings F-01 (startup ReferenceError) and F-02/F-03
// (empty-volume crash + invented volume). Run: node tests/p0-regress.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const SRC = readFileSync(new URL("../app.js", import.meta.url), "utf8");
let failures = 0;
function ok(cond, name){
  console.log((cond ? "PASS" : "FAIL") + "  " + name);
  if(!cond) failures++;
}

// F-01: no orphaned `er` identifier reference at top level (was: `if(er) er.hidden = false;`)
{
  const hits = [...SRC.matchAll(/(^|[^a-zA-Z0-9_$])er([^a-zA-Z0-9_$])/g)]
    .filter(m => !/open\.er-api|filter|render|other|number|upper|lower|member|refer|server|never|timer|paper/i
      .test(SRC.slice(Math.max(0, m.index-14), m.index+16)));
  const orphan = hits.filter(m => /if\s*\(\s*er\s*\)/.test(SRC.slice(Math.max(0, m.index-6), m.index+4)));
  ok(orphan.length === 0, "F-01: no orphaned `er` reference remains");
}

// F-02/F-03: run the REAL updateChartTick from app.js in a stubbed VM.
// Scenario A (the crash): real-history path -> lw.vols = [] and lw.hasVol = false.
{
  const start = SRC.indexOf("function updateChartTick(){");
  const end = SRC.indexOf("/* ---------------- REPLAY MODE");
  if(start < 0 || end < 0) { ok(false, "F-02: updateChartTick located"); }
  else {
    const code = SRC.slice(start, end);
    function runTick({ bars, vols, hasVol }){
      const volCalls = [];
      const sandbox = {
        lw: {
          candles: { update(){} },
          bars, vols, hasVol,
          volume: { update(v){ volCalls.push(v); }, setData(){} },
          liveCandles: null, liveBars: [],
        },
        state: { sym: "XAUUSD", tf: "5m" },
        TF_MIN: { "5m": 5 },
        N_BARS: 200,
        px: () => ({ bid: 2650.20 }),
        replayActive: () => false,
        updateLegend: () => {},
        console,
      };
      const ctx = vm.createContext(sandbox);
      vm.runInContext(code + "\n;globalThis.__tick = updateChartTick;", ctx);
      ctx.__tick(); // must not throw
      return volCalls;
    }
    const nowBucket = Math.floor(Date.now()/1000/300)*300;
    // A: empty volume (real CoinGecko path) — previously threw TypeError
    let threw = null, calls = null;
    try{
      calls = runTick({
        bars: [{ time: nowBucket, open: 2650, high: 2651, low: 2649, close: 2650 }],
        vols: [], hasVol: false,
      });
    }catch(e){ threw = e; }
    ok(!threw, "F-02: updateChartTick does not throw with empty volume (threw: " + (threw && threw.message) + ")");
    ok(calls && calls.length === 0, "F-03: no invented volume written when provider has none");
    // B: genuine volume path still updates
    const callsB = runTick({
      bars: [{ time: nowBucket, open: 2650, high: 2651, low: 2649, close: 2650 }],
      vols: [{ time: nowBucket, value: 1.2 }],
      hasVol: true,
    });
    ok(callsB.length === 1, "F-02: genuine per-bar volume still updates normally");
  }
}

// F-13: validateOrder — one gate for every entry path
{
  const start = SRC.indexOf("function ticketPx(){");
  const end = SRC.indexOf("function renderAccount(){");
  const code = SRC.slice(start, end);
  function mkCtx(over){
    const toasts = [];
    const sandbox = Object.assign({
      LEVERAGE: 100, MIN_LOTS: undefined, MAX_LOTS: undefined,
      state: {
        sym: "XAUUSD", dir: "buy", ttype: "market", lots: 0.10, tpslOn: false,
        prices: { XAUUSD: { bid: 2650.20, ask: 2650.40 } },
        open: [], balance: 10000, orderSeq: 1,
      },
      mktOpen: () => true,
      meta: () => ({ spread: 0.20, contract: 100, perPoint: 100 }),
      px: (s) => sandbox.state.prices[s],
      $: () => ({ value: "", addEventListener(){}, classList: { toggle(){} }, textContent: "" }),
      toast: (m) => toasts.push(m),
      fmtP: (s, v) => String(v),
      fmt$: (v) => "$" + v.toFixed(2),
      replayActive: () => false,
      BROKERS: [],
      console,
      __toasts: toasts,
    }, over || {});
    const ctx = vm.createContext(sandbox);
    vm.runInContext(code + "\n;globalThis.__v = validateOrder;", ctx);
    return ctx;
  }
  // A: market closed -> rejected
  let ctx = mkCtx({ mktOpen: () => false });
  ok(/closed/i.test(ctx.__v() || ""), "F-13: market order rejected when market closed");
  // B: lot size out of range -> rejected
  ctx = mkCtx(); ctx.state.lots = 999;
  ok(/lot size/i.test(ctx.__v() || ""), "F-13: oversized lots rejected");
  // C: insufficient margin -> rejected
  ctx = mkCtx(); ctx.state.balance = 1;
  ok(/margin/i.test(ctx.__v() || ""), "F-13: insufficient margin rejected");
  // D: valid order passes
  ctx = mkCtx();
  ok(ctx.__v() === null, "F-13: valid order passes validation");
  // E: SL on wrong side -> rejected
  ctx = mkCtx({ $: () => ({ value: "2700", addEventListener(){}, classList: { toggle(){} }, textContent: "" }) });
  ctx.state.tpslOn = true;
  ok(/stop loss/i.test(ctx.__v() || ""), "F-13: stop loss on wrong side rejected");
}

process.exit(failures ? 1 : 0);
