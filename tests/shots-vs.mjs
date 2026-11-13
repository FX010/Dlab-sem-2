// Capturas del escenario virtual (escritorio claro y móvil oscuro) para revisión visual.
import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";
import path from "node:path";
const file = path.resolve(process.argv[2] || "../Rappi_Hunter_v16.html");
const b = await chromium.launch({ channel: "msedge" });
for (const [name, vp, cs] of [["vs-escritorio", { width: 1280, height: 860 }, "light"], ["vs-movil", { width: 375, height: 812 }, "dark"]]) {
  const p = await (await b.newContext({ viewport: vp, colorScheme: cs })).newPage();
  await p.goto(pathToFileURL(file).href); await p.waitForFunction(() => !!window.__rhVS);
  await p.click('.tab[data-view="oficina"]'); await p.waitForTimeout(400);
  await p.click("#io-vs"); await p.evaluate(() => window.__rhVS.advance(24 * 3 + 5));
  const real = p.locator('#od-mm button[data-m="real"]');
  await p.evaluate(() => document.getElementById("od-sec-mapa").scrollIntoView());
  if (await real.count()) { await real.first().click(); await p.waitForTimeout(3500); }
  await p.screenshot({ path: path.join("out", name + "-mapa.png") });
  await p.evaluate(() => document.getElementById("od-sec-resumen").scrollIntoView());
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join("out", name + "-resumen.png") });
}
await b.close();
