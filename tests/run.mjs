// Pruebas automáticas de Rappi Hunter (capa C de la estrategia v16).
// Uso: node run.mjs [archivo.html] [--baseline-write] [--only=selftest,flows,regression,visual]
// Abre la página en Edge sin ventana, corre las autopruebas internas, recorre flujos clave,
// compara el gemelo contra la línea base de la v15 y guarda capturas en tests/out/.
import { chromium } from "playwright-core";
import { pathToFileURL, fileURLToPath } from "node:url";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const file = path.resolve(HERE, args.find(a => !a.startsWith("--")) || "../Rappi_Hunter_v16.html");
const only = (args.find(a => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
const want = k => !only.length || only.includes(k);
const BASE = path.join(HERE, "baseline-v15.json");
const OUT = path.join(HERE, "out");
mkdirSync(OUT, { recursive: true });

const results = [];
const ok = (name, pass, detail = "") => { results.push({ name, pass, detail }); console.log((pass ? "  OK   " : "  FALLA") + "  " + name + (detail ? "  · " + detail : "")); };

const browser = await chromium.launch({ channel: "msedge", headless: true });
async function openPage(vp = { width: 1024, height: 768 }, scheme = "light") {
  const ctx = await browser.newContext({ viewport: vp, colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/tile|openstreetmap|Failed to load resource/i.test(m.text())) errors.push("console: " + m.text()); });
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.__rhDTO, null, { timeout: 15000 });
  return { ctx, page, errors };
}

console.log("Archivo: " + file);

/* 1. Autopruebas internas (completas, incluidas las lentas) */
if (want("selftest")) {
  const { ctx, page, errors } = await openPage();
  const r = await page.evaluate(() => window.__rhDTO.selfTest());
  ok("autopruebas internas " + r.pass + "/" + (r.pass + r.fail), r.fail === 0, r.failures.map(f => f.name + ": " + f.msg).join(" | "));
  ok("consola sin errores durante autopruebas", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

/* 2. Flujos de la app (repartidor, oficina, gemelo) en escritorio y móvil */
if (want("flows")) {
  for (const [label, vp, scheme] of [["escritorio claro", { width: 1024, height: 768 }, "light"], ["móvil oscuro", { width: 375, height: 812 }, "dark"]]) {
    const { ctx, page, errors } = await openPage(vp, scheme);
    for (const v of ["ruta", "oficina", "gemelo"]) {
      const tab = page.locator('.tab[data-view="' + v + '"]');
      if (await tab.count()) {
        await tab.first().click();
        await page.waitForTimeout(400);
        const shown = await page.evaluate(x => document.getElementById("device").dataset.view === x, v);
        ok(label + ": pestaña " + v, shown);
        await page.screenshot({ path: path.join(OUT, label.replace(/\s/g, "-") + "-" + v + ".png") });
      }
    }
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(label + ": sin scroll horizontal", scroll <= 1, "sobra " + scroll + " px");
    ok(label + ": consola sin errores", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }
}

/* 3. Regresión del gemelo: con las mejoras v16 apagadas debe dar exactamente lo mismo que la v15 */
if (want("regression")) {
  const { ctx, page } = await openPage();
  const cur = await page.evaluate(() => {
    const D = window.__rhDTO, ids = ["base", "punta", "valle0", "spam", "saturada", "frias", "cupo"], out = {};
    const keys = ["leadsHunter", "leadsTotal", "convIncorp", "avgHoursToContact", "slaOut", "cupoUtil", "dupBlocked", "dupEscaped", "execLoad", "lockBlocked", "cupoBlocked"];
    ids.forEach(id => [14, 15, 16].forEach(seed => {
      const s = D.summary(D.run(D.scenario(id, { seed, days: 30, riders: 600, legacy: true })));
      const o = {}; keys.forEach(k => o[k] = Math.round(s[k] * 1e6) / 1e6); o.funnel = s.funnel; o.violations = s.violations.length;
      out[id + ":" + seed] = o;
    }));
    return out;
  });
  await ctx.close();
  if (args.includes("--baseline-write") || !existsSync(BASE)) {
    writeFileSync(BASE, JSON.stringify(cur, null, 1));
    ok("línea base escrita (" + Object.keys(cur).length + " corridas)", true, path.basename(BASE));
  } else {
    const base = JSON.parse(readFileSync(BASE, "utf8")), diffs = [];
    for (const k of Object.keys(base)) if (JSON.stringify(base[k]) !== JSON.stringify(cur[k])) diffs.push(k);
    ok("regresión: 7 escenarios × 3 semillas idénticos a la v15", diffs.length === 0, diffs.slice(0, 5).join(", "));
  }
}

/* 4. Escenario virtual (solo si la versión lo trae) */
if (want("virtual")) {
  const { ctx, page, errors } = await openPage({ width: 1024, height: 768 });
  const has = await page.evaluate(() => !!(window.__rhVS));
  if (has) {
    const r = await page.evaluate(async () => {
      const snapLs = () => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k !== "rh_sim16") o[k] = localStorage.getItem(k); } return JSON.stringify(o); };
      const z0 = window.__rhVS.realSnap(), ls0 = snapLs();
      document.querySelector('.tab[data-view="oficina"]').click();
      window.__rhVS.start({ seed: 21, riders: 300 });
      window.__rhVS.advance(24 * 7);
      const st = window.__rhVS.state();
      const shown = document.getElementById("device").classList.contains("vs-on");
      window.__rhVS.stop();
      return { same: window.__rhVS.realSnap() === z0, lsSame: snapLs() === ls0, leads: st.leads, shown, off: !document.getElementById("device").classList.contains("vs-on") };
    });
    ok("escenario virtual: genera leads en 7 días", r.leads > 0, r.leads + " leads");
    ok("escenario virtual: se ve encendido y se apaga", r.shown && r.off);
    ok("escenario virtual: datos reales intactos al apagar", r.same && r.lsSame);
    await page.screenshot({ path: path.join(OUT, "escenario-virtual.png") });
    ok("escenario virtual: consola sin errores", errors.length === 0, errors.slice(0, 3).join(" | "));
  } else ok("escenario virtual: no incluido en esta versión (se omite)", true);
  await ctx.close();
}

await browser.close();
const fail = results.filter(r => !r.pass).length;
writeFileSync(path.join(OUT, "resultado.json"), JSON.stringify({ file: path.basename(file), at: new Date().toISOString(), results }, null, 1));
console.log("\n" + (fail ? "FALLAN " + fail + " de " + results.length : "TODO VERDE · " + results.length + " comprobaciones"));
process.exit(fail ? 1 : 0);
