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
const file = path.resolve(HERE, args.find(a => !a.startsWith("--")) || "../Rappi_Hunter_v20.html");
const only = (args.find(a => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
const want = k => !only.length || only.includes(k);
/* Mide texto y controles que el repartidor ve de verdad dentro de una raíz (misma regla que tests/measure-ui.mjs): visible, dentro de la pantalla, y con marcadores de campos vacíos */
const uiMeasure = (page, root) => page.evaluate(root => {
  const R = document.querySelector(root); const out = { chars: 0, words: 0, controls: 0, txt: [] };
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const hiddenAnc = e => { for (let n = e; n && n !== R; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === "none" || cs.visibility === "hidden" || n.hidden || (n.getAttribute("aria-hidden") === "true" && !n.matches(".bnav,.top,.top *"))) return true; } return false; };
  const w = document.createTreeWalker(R, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { const t = n.nodeValue.replace(/\s+/g, " ").trim(); if (!t) continue; const e = n.parentElement; if (e.closest("script,style,svg,.sr") || !vis(e) || hiddenAnc(e)) continue; out.chars += t.length; out.words += t.split(" ").length; out.txt.push(t); }
  R.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(e => { if (e.value || !vis(e) || hiddenAnc(e)) return; const t = e.getAttribute("placeholder").trim(); if (t) { out.chars += t.length; out.words += t.split(" ").length; out.txt.push(t); } });
  R.querySelectorAll("button,a[href],input,select,textarea,[role=tab],[role=radio],[role=switch]").forEach(e => { if (e.type !== "hidden" && vis(e) && !hiddenAnc(e) && !e.closest(".sr")) out.controls++; });
  return out;
}, root);
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

/* 2b. Formulario del repartidor: duplicados, descartado reciente, fotos obligatorias, envío y recarga */
if (want("form")) {
  const { ctx, page, errors } = await openPage();
  const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
  const setField = (id, v) => page.evaluate(([i, x]) => { const el = document.getElementById(i); el.value = x; el.dispatchEvent(new Event("input", { bubbles: true })); }, [id, v]);
  const state = () => page.evaluate(() => ({ dup: !document.getElementById("ls-dup").hidden, title: document.getElementById("ls-dup-t").textContent, sub: document.getElementById("ls-dup-sub").textContent, disabled: document.getElementById("ls-submit").disabled }));
  await setField("ls-phone", "9 8765 4321");
  await setField("ls-name", "Pizzería Plaza Ñuñoa");
  let s = await state();
  ok("formulario: local existente queda bloqueado", s.dup && s.disabled, s.sub);
  await setField("ls-name", "Pastas Ossa");
  s = await state();
  ok("formulario: local descartado hace 2 días queda bloqueado (H-02)", s.dup && /descartó/.test(s.title) && s.disabled, s.title);
  const NAME = "Empanadas Prueba Automática";
  await setField("ls-name", NAME);
  s = await state();
  ok("formulario: sin fotos no se puede enviar", !s.dup && s.disabled);
  await page.setInputFiles("#ls-ph-facade", { name: "f.png", mimeType: "image/png", buffer: PNG });
  await page.setInputFiles("#ls-ph-menu", { name: "m.png", mimeType: "image/png", buffer: PNG });
  await page.waitForTimeout(600);
  s = await state();
  ok("formulario: con nombre, teléfono y 2 fotos se habilita el envío", !s.dup && !s.disabled);
  await page.evaluate(() => document.getElementById("ls-form").requestSubmit());
  await page.waitForTimeout(3200);
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !!window.__rhDTO);
  await setField("ls-phone", "9 1111 0000");
  await setField("ls-name", NAME);
  s = await state();
  ok("formulario: el lead enviado sobrevive a recargar y luego cuenta como duplicado", s.dup, s.sub);
  ok("formulario: consola sin errores", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

/* 2c. El QR de «Mi código Hunter» abre la demo (H-05), no un perfil personal */
if (want("qr")) {
  const { default: jsQR } = await import("jsqr"), { PNG } = await import("pngjs");
  const html = readFileSync(file, "utf8"), m = html.match(/QR_DATA_URI = "data:image\/png;base64,([^"]+)"/);
  let data = null;
  if (m) { const img = PNG.sync.read(Buffer.from(m[1], "base64")); const d = jsQR(new Uint8ClampedArray(img.data), img.width, img.height); data = d && d.data; }
  ok("QR de Mi código Hunter apunta a la demo", data === "https://fx010.github.io/Dlab-sem-2/", String(data));
  ok("sin enlaces a perfiles personales", !/linktr\.ee/i.test(html));
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

/* 5. v17: feedback de Rappi (13-nov): pausa por demanda, bono por lead pertinente, piloto en todo Santiago */
if (want("v17")) {
  const { ctx, page, errors } = await openPage({ width: 420, height: 900 });
  const has = await page.evaluate(() => !!document.querySelector("#hunter-t2") && /v(1[789]|20)/.test(document.title));
  if (has) {
    const click = sel => page.evaluate(s => document.querySelector(s).click(), sel);
    await click("#hint-hunter"); await page.waitForTimeout(1200);
    await click("#invite-accept"); await page.waitForTimeout(3000);
    await click("#avatar-btn"); await page.waitForTimeout(600);
    await click('#pf-tabs [data-pt="ajustes"]'); await page.waitForTimeout(300);
    const txt = await page.evaluate(() => document.getElementById("pf-ajustes").textContent);
    const nFleet = await page.evaluate(() => document.querySelectorAll('#pf-ajustes [data-fleet]').length);
    const aj = await uiMeasure(page, "#pf-ajustes");
    ok("v20: Ajustes queda mínimo (Part/Full-time, GPS y Hunter; ≤ 40 caracteres)", nFleet === 2 && aj.chars >= 10 && aj.chars <= 40, aj.chars + " caracteres · " + aj.txt.join(" | "));
    await click('[data-fleet="full"]'); await page.waitForTimeout(300);
    await click("#pf-close"); await page.waitForTimeout(600);
    let r = await page.evaluate(() => { document.getElementById("hunter").click(); return { paused: document.getElementById("hunter").classList.contains("paused"), sheet: document.getElementById("lead-sheet").getAttribute("aria-hidden"), toast: document.getElementById("rtoast-txt").textContent }; });
    ok("v17: full-time en zona de alta demanda queda en pausa y no abre el formulario", r.paused && r.sheet === "true" && /Pausa Hunter/.test(r.toast), r.toast);
    await click("#avatar-btn"); await page.waitForTimeout(600);
    await click('#pf-tabs [data-pt="ajustes"]'); await page.waitForTimeout(300);
    await click('[data-fleet="part"]'); await page.waitForTimeout(300);
    await click("#pf-close"); await page.waitForTimeout(600);
    r = await page.evaluate(() => { document.getElementById("hunter").click(); return { paused: document.getElementById("hunter").classList.contains("paused"), sheet: document.getElementById("lead-sheet").getAttribute("aria-hidden") }; });
    ok("v17: part-time puede reportar en la misma zona", !r.paused && r.sheet === "false");
    await page.waitForTimeout(900);
    const src = await page.content();
    ok("v17: el seguimiento reconoce el lead pertinente aunque no cierre", /Pertinente · bono/.test(src) && /Conservas tu bono/.test(src));
    ok("v17: la oficina marca leads pertinentes y la sincronización con HubSpot", /pert-badge/.test(src) && /HubSpot: lead sincronizado/.test(src));
    ok("v17: consola sin errores", errors.length === 0, errors.slice(0, 3).join(" | "));
  } else ok("v17: no incluido en esta versión (se omite)", true);
  await ctx.close();
}

/* 6. v20: mitad de la mitad de información, con objetivos y misiones de actualizar leads a la vista */
if (want("v20")) {
  const { ctx, page, errors } = await openPage({ width: 420, height: 900 });
  const has = await page.evaluate(() => !!document.getElementById("obj-row") && /v20/.test(document.title));
  if (has) {
    const click = sel => page.evaluate(s => document.querySelector(s).click(), sel);
    const wnOpen = await page.evaluate(() => document.getElementById("wn").getAttribute("aria-hidden") === "false");
    ok("v20: las novedades no se abren solas", !wnOpen);
    await click("#order-skip"); await page.waitForTimeout(1200); await click("#order-skip"); await page.waitForTimeout(1200);
    await click("#hint-hunter"); await page.waitForTimeout(1200);
    await click("#invite-accept"); await page.waitForTimeout(3200);
    for (let i = 0; i < 4; i++) for (const id of ["#wn-skip", "#co-skip", "#geo-demo"]) { await click(id); await page.waitForTimeout(250); }
    await page.waitForTimeout(1200);
    const o = await page.evaluate(() => {
      const vis = e => e.getClientRects().length > 0;
      const objs = [...document.querySelectorAll("#obj-row .obj")].filter(vis);
      return { objs: objs.length, txt: objs.map(e => e.innerText.replace(/\s+/g, " ").trim()).join(" | "), nav: vis(document.getElementById("bnav")) };
    });
    const hm = await uiMeasure(page, "#view-ruta");
    ok("v20: objetivos a la vista en el panel Hunter (hoy, semana, actualizados)", o.objs === 3 && o.txt.includes("Hoy 0/3") && o.txt.includes("Actualizados 0/2"), o.txt);
    ok("v20: pantalla Hunter sin barra inferior y con ≤ 160 caracteres y ≤ 10 controles", !o.nav && hm.chars <= 160 && hm.controls <= 10, hm.chars + " caracteres · " + hm.controls + " controles");
    await click("#hunter"); await page.waitForTimeout(1500);
    const fm = await uiMeasure(page, "#lead-sheet");
    const hidOpt = await page.evaluate(() => { const hid = q => { const e = document.querySelector(q); return !e || e.getClientRects().length === 0; }; return hid("#sc-legend") && hid("#help-btn") && hid("#ls-dir") && hid("#ls-obs"); });
    ok("v20: el formulario muestra ≤ 115 caracteres (con marcadores) y sin campos opcionales", fm.chars >= 20 && fm.chars <= 115 && hidOpt, fm.chars + " caracteres · " + fm.txt.join(" | "));
    await click("#ls-backdrop"); await page.waitForTimeout(800);
    // actualizar dos leads (misión «Actualiza 2 leads») y ver que el objetivo y la misión suben
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => { const c = document.querySelectorAll("#carousel .lead:not(.visited) .lead-det")[0]; c.click(); });
      await page.waitForTimeout(700);
      await click("#ld-visit"); await page.waitForTimeout(900);
    }
    await click('.seg-b[data-tab="misiones"]'); await page.waitForTimeout(400);
    const m = await page.evaluate(() => ({ obj: document.querySelector("#obj-row .obj:nth-child(3)").innerText.replace(/\s+/g, " ").trim(), done: [...document.querySelectorAll("#mis-list .mis.done .mis-t")].map(e => e.textContent), all: [...document.querySelectorAll("#mis-list .mis-t")].map(e => e.textContent) }));
    ok("v20: actualizar 2 leads sube el objetivo a 2/2 y cumple la misión", m.obj.includes("2/2") && m.done.indexOf("Actualiza 2 leads") >= 0, m.obj + " · " + m.done.join(","));
    ok("v20: hay misiones de actualizar leads (frío y general)", m.all.some(t => /Actualiza 1 lead frío/.test(t)) && m.all.some(t => /Actualiza 2 leads/.test(t)), m.all.join(" | "));
    ok("v20: consola sin errores", errors.length === 0, errors.slice(0, 3).join(" | "));
  } else ok("v20: no incluido en esta versión (se omite)", true);
  await ctx.close();
}

await browser.close();
const fail = results.filter(r => !r.pass).length;
writeFileSync(path.join(OUT, "resultado.json"), JSON.stringify({ file: path.basename(file), at: new Date().toISOString(), results }, null, 1));
console.log("\n" + (fail ? "FALLAN " + fail + " de " + results.length : "TODO VERDE · " + results.length + " comprobaciones"));
process.exit(fail ? 1 : 0);
