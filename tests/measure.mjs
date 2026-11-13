// Matriz de simulación del informe v16. Escribe docs/qa/resultados-v16.json.
// 10 escenarios × 20 semillas × {sin palancas, con palancas} + barridos (8 semillas). Todo es SIMULADO.
import { chromium } from "playwright-core";
import { pathToFileURL, fileURLToPath } from "node:url";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(HERE, process.argv[2] || "../Rappi_Hunter_v16.html");
const b = await chromium.launch({ channel: "msedge" }); const p = await b.newPage();
await p.goto(pathToFileURL(file).href); await p.waitForFunction(() => !!window.__rhDTO);
p.setDefaultTimeout(0);
const res = await p.evaluate(() => {
  const D = window.__rhDTO, KEYS = ["leadsHunter", "leadsTotal", "convIncorp", "avgHoursToContact", "slaOut", "cupoUtil", "dupBlocked", "dupEscaped", "escapeRate", "falseRate", "geoBlocked", "rejBlocked", "rejReadmit", "execLoad", "coldShare", "coldStartShare", "officeCapBlocked", "zoneCapBlocked"];
  const LEVERS = { officeCap: true, missions: .3, policy: "etapa" };
  function agg(id, extra, n, seed0) {
    const list = [];
    for (let i = 0; i < n; i++) { const s = D.summary(D.run(D.scenario(id, Object.assign({}, extra, { seed: seed0 + i })))); s.incorp = s.funnel.incorporado; list.push(s); }
    const o = { n, violations: list.reduce((a, s) => a + s.violations.length, 0) };
    KEYS.concat(["incorp"]).forEach(k => { const a = list.map(s => s[k]); o[k] = { mean: a.reduce((x, y) => x + y, 0) / n, min: Math.min(...a), max: Math.max(...a) }; });
    return o;
  }
  const ids = ["base", "punta", "valle0", "spam", "saturada", "frias", "cupo", "lanzamiento", "feriado", "enfermo"];
  const out = { simulado: true, generado: new Date().toISOString(), semillas: "14 a 33 (barridos: 14 a 21)", palancas: LEVERS, v15: {}, v16: {}, v16palancas: {}, barridos: {} };
  ids.forEach(id => {
    if (["lanzamiento", "feriado", "enfermo"].indexOf(id) < 0) out.v15[id] = agg(id, { legacy: true }, 20, 14);
    out.v16[id] = agg(id, {}, 20, 14);
    out.v16palancas[id] = agg(id, LEVERS, 20, 14);
  });
  out.barridos.dedupM = [25, 50, 75, 100, 150, 200].map(m => ({ m, r: agg("spam", { dedupM: m }, 8, 14) }));
  out.barridos.rejBlockDays = [0, 7, 15, 30, 60, 90].map(d => ({ d, r: agg("spam", { rejBlockDays: d }, 8, 14) }));
  out.barridos.zoneCap = [10, 20, 40, 60, 100].map(c => ({ c, r: agg("cupo", { zoneCap: c }, 8, 14) }));
  out.barridos.execs = [2, 4, 6, 8, 10, 12, 14].map(e => ({ e, sin: agg("base", { execs: e }, 8, 14), cola: agg("base", { execs: e, officeCap: true }, 8, 14) }));
  out.barridos.missions = [0, .15, .3, .5, .7].map(m => ({ m, r: agg("base", { missions: m }, 8, 14) }));
  out.barridos.policy = ["fifo", "sla", "etapa"].map(pol => ({ pol, r: agg("saturada", { policy: pol }, 8, 14) }));
  return out;
});
mkdirSync(path.join(HERE, "../docs/qa"), { recursive: true });
writeFileSync(path.join(HERE, "../docs/qa/resultados-v16.json"), JSON.stringify(res, null, 1));
const f = (x, pct) => pct ? (x * 100).toFixed(1) + "%" : Math.round(x);
const row = (lbl, r) => console.log(lbl.padEnd(26) + [f(r.leadsHunter.mean), f(r.avgHoursToContact.mean) + "h", f(r.slaOut.mean), f(r.convIncorp.mean, 1), f(r.incorp.mean), f(r.escapeRate.mean, 1), f(r.falseRate.mean, 1), f(r.coldStartShare.mean, 1), f(r.execLoad.mean, 1), "viol " + r.violations].join(" | "));
console.log("escenario                  leadsH | 1er contacto | fueraSLA | conv | incorp | colados | falsos+ | frias0 | carga");
for (const id of Object.keys(res.v16)) { if (res.v15[id]) row(id + " v15", res.v15[id]); row(id + " v16", res.v16[id]); row(id + " v16+palancas", res.v16palancas[id]); }
console.log("\nbarrido distancia (spam):"); res.barridos.dedupM.forEach(x => row("  " + x.m + " m", x.r));
console.log("barrido bloqueo descartados (spam):"); res.barridos.rejBlockDays.forEach(x => row("  " + x.d + " d", x.r));
console.log("barrido tope por comuna (cupo):"); res.barridos.zoneCap.forEach(x => row("  " + x.c + "/día", x.r));
console.log("barrido ejecutivos (base) sin / con pausa por cola:"); res.barridos.execs.forEach(x => { row("  " + x.e + " ej sin", x.sin); row("  " + x.e + " ej cola", x.cola); });
console.log("barrido misiones (base):"); res.barridos.missions.forEach(x => row("  " + x.m, x.r));
console.log("política (saturada):"); res.barridos.policy.forEach(x => row("  " + x.pol, x.r));
await b.close();
