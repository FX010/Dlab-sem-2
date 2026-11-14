// Mide texto visible, botones y bloques de información de la app del repartidor, por pantalla.
// Uso: node measure-ui.mjs [archivo.html]
import { chromium } from "playwright-core";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(HERE, process.argv[2] || "../Rappi_Hunter_v17.html");
const b = await chromium.launch({ channel: "msedge", headless: true });
const p = await b.newPage({ viewport: { width: 420, height: 900 } });
await p.goto(pathToFileURL(file).href); await p.waitForFunction(() => !!window.__rhDTO);
const click = q => p.evaluate(s => { const e = document.querySelector(s); if (e) e.click(); }, q);
const W = ms => p.waitForTimeout(Math.max(ms, 1100));
// mide lo visible dentro de la vista del repartidor (excluye barra de pestañas demo y oficina/gemelo)
const measure = (label, root) => p.evaluate(([label, root]) => {
  const R = document.querySelector(root || "#view-ruta"); const out = { label, chars: 0, words: 0, buttons: 0, items: 0 };
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const hiddenAnc = e => { for (let n = e; n && n !== R; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === "none" || cs.visibility === "hidden" || n.hidden || n.getAttribute("aria-hidden") === "true" && !n.matches(".bnav,.top,.top *")) return true; } return false; };
  const w = document.createTreeWalker(R, NodeFilter.SHOW_TEXT);
  let n; while ((n = w.nextNode())) { const t = n.nodeValue.replace(/\s+/g, " ").trim(); if (!t) continue; const e = n.parentElement; if (e.closest("script,style,svg,.sr")) continue; if (!vis(e) || hiddenAnc(e)) continue; out.chars += t.length; out.words += t.split(" ").length; }
  R.querySelectorAll("button,a[href],input,select,textarea,[role=tab],[role=radio],[role=switch]").forEach(e => { if (e.type === "hidden") return; if (vis(e) && !hiddenAnc(e) && !e.closest(".sr")) out.buttons++; });
  return out;
}, [label, root]);
const rows = []; const ROOTS = {"3 Carta":"#invite","5 Formulario reportar":"#lead-sheet","6 Formulario":"#lead-sheet","7 Perfil":"#profile","8 Perfil":"#profile","9 Perfil":"#profile","10 Metas":"#pg-metas","11 Pedidos":"#pg-pedidos","12 Soporte":"#faq"};
const SHOT = process.argv[3]; let si = 0; const snap = async (l, r) => { for (const k in ROOTS) if (l.startsWith(k)) r = ROOTS[k]; const m = await measure(l, r); rows.push(m); if (SHOT) await p.screenshot({ path: "out/ui-" + SHOT + "-" + String(++si).padStart(2, "0") + ".png" }); };
await W(500);
await snap("1 Inicio (repartidor, pedido en curso)");
await click("#order-skip"); await W(500); await click("#order-skip"); await W(600);
await snap("2 Inicio (valle, sin pedido)");
await click("#hint-hunter"); await W(1200); await snap("3 Carta de invitación");
await click("#invite-accept"); await W(3200);
for (let i = 0; i < 4; i++) for (const id of ["#wn-skip", "#co-skip", "#geo-demo"]) { await click(id); await W(300); }
await W(600);
await snap("4 Modo Hunter (mapa + panel)");
await click("#hunter"); await W(900); await snap("5 Formulario reportar local");
await p.evaluate(() => { document.getElementById("ls-example").click(); }); await W(700); await snap("6 Formulario lleno");
await click("#ls-backdrop"); await W(500);
await click("#avatar-btn"); await W(700); await snap("7 Perfil › Perfil");
await click('#pf-tabs [data-pt="leads"]'); await W(500); await snap("8 Perfil › Mis leads");
await click('#pf-tabs [data-pt="ajustes"]'); await W(500); await snap("9 Perfil › Ajustes");
await click("#pf-close"); await W(600);
await click('[data-nav="metas"]'); await W(600); await snap("10 Metas");
await click('[data-nav="pedidos"]'); await W(600); await snap("11 Pedidos");
await click('[data-nav="inicio"]'); await W(400);
await click("#help-btn"); await W(700); await snap("12 Soporte (FAQ)");
await b.close();
let tc = 0, tb = 0, tw = 0;
for (const r of rows) { tc += r.chars; tb += r.buttons; tw += r.words; console.log(r.label.padEnd(42), String(r.chars).padStart(5) + " car", String(r.words).padStart(4) + " pal", String(r.buttons).padStart(3) + " controles"); }
console.log("TOTAL".padEnd(42), String(tc).padStart(5) + " car", String(tw).padStart(4) + " pal", String(tb).padStart(3) + " controles");
