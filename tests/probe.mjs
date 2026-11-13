import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";
const b = await chromium.launch({ channel: "msedge" }); const p = await b.newPage();
await p.goto(pathToFileURL(process.argv[2]).href); await p.waitForFunction(() => !!window.__rhDTO);
const r = await p.evaluate(new Function("return (" + process.argv[3] + ")()"));
console.log(JSON.stringify(r, null, 1)); await b.close();
