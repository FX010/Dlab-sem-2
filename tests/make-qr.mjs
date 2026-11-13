// Genera el QR del «Mi código Hunter» (enlace a la demo) y lo incrusta en el HTML indicado. Verifica que el QR se lea.
import QRCode from "qrcode";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";
const file = process.argv[2], url = process.argv[3] || "https://fx010.github.io/Dlab-sem-2/";
const png = await QRCode.toBuffer(url, { width: 264, margin: 2, errorCorrectionLevel: "M", color: { dark: "#1E1E24", light: "#FFFFFF" } });
const img = PNG.sync.read(png), dec = jsQR(new Uint8ClampedArray(img.data), img.width, img.height);
if (!dec || dec.data !== url) { console.error("El QR no se lee bien: " + (dec && dec.data)); process.exit(1); }
const html = readFileSync(file, "utf8"), re = /var QR_DATA_URI = "data:image\/png;base64,[^"]+"/;
if (!re.test(html)) { console.error("No encontré QR_DATA_URI"); process.exit(1); }
writeFileSync(file, html.replace(re, 'var QR_DATA_URI = "data:image/png;base64,' + png.toString("base64") + '"'));
console.log("QR listo y verificado: " + dec.data);
