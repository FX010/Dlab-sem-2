// Matriz de escenarios del gemelo: motor sin condiciones realistas (reglas v16) contra motor v19. Uso: node matriz19.mjs [archivo.html] [semillas]
import { chromium } from "playwright-core";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path"; import { writeFileSync } from "node:fs";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(HERE, process.argv[2] || "../Rappi_Hunter_v19.html"), N = +(process.argv[3] || 6);
const b = await chromium.launch({ channel: "msedge", headless: true });
const p = await b.newPage(); await p.goto(pathToFileURL(file).href); await p.waitForFunction(() => !!window.__rhDTO);
const rows = await p.evaluate(N => {
  const D = window.__rhDTO, out = [], avg = (a, k) => a.reduce((x, s) => x + s[k], 0) / a.length;
  const ids = ["base","punta","valle0","spam","saturada","frias","cupo","lanzamiento","feriado","enfermo","palancas","sinbono","sinpausa","fulltime","integracion","motivados","fraude"];
  for (const id of ids) for (const real of [false, true]) {
    const L = []; for (let sd = 0; sd < N; sd++) L.push(D.summary(D.run(D.scenario(id, { seed: 14 + sd, days: id === "lanzamiento" ? 60 : 30, riders: 600, realism: real }))));
    const o = { id, real, viol: L.reduce((x, s) => x + s.violations.length, 0) };
    ["leadsHunter","convHunterMaduro","adopcionSemanal","adopcion1","retencion","avgHoursToContact","slaOut","pauseBlocked","demoraEntrega","execWasteShare","motMedia","pertinentes","pertSinCierre","execLoad"].forEach(k => o[k] = avg(L, k));
    out.push(o);
  }
  return out;
}, N);
await b.close();
const f = (x, d = 1) => (x * 100).toFixed(d);
let md = "| Escenario | Motor | Leads Hunter | Conv. Hunter (madura) | Adopción ≥2/sem | Con ≥1/sem | Permanencia | Horas al 1.er contacto | Fuera de SLA | Pausas | Pertinentes sin cierre | Reglas rotas |\n|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n";
for (const o of rows) md += `| ${o.id} | ${o.real ? "**v19**" : "v16"} | ${Math.round(o.leadsHunter)} | ${o.real ? f(o.convHunterMaduro) + " %" : "—"} | ${o.real ? f(o.adopcionSemanal) + " %" : "—"} | ${o.real ? f(o.adopcion1) + " %" : "—"} | ${o.real ? f(o.retencion, 0) + " %" : "—"} | ${o.avgHoursToContact.toFixed(0)} | ${Math.round(o.slaOut)} | ${Math.round(o.pauseBlocked)} | ${o.real ? Math.round(o.pertSinCierre) : "—"} | ${o.viol} |\n`;
writeFileSync(path.join(HERE, "out", "matriz-v19.md"), md); writeFileSync(path.join(HERE, "out", "matriz-v19.json"), JSON.stringify(rows, null, 1));
console.log(md);
