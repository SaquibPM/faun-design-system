// Screenshot docs routes in themes/widths. Usage:
//   node scripts/shoot.mjs --out /tmp/shots --routes "/components/button,/components/badge" --themes light,dark --widths 1440,390 [--full] [--density compact] [--palette meadow|dawn|harbour] [--scroll "#pastel"]
// --palette sets data-viz-palette on the root (ADR 0007); --scroll scrolls a CSS selector to the top of the viewport before the shot (the page is otherwise captured from the top).
// Requires a docs build (default apps/docs/dist; pass --dist <dir> for a private build). Serves it on a random port.
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]?.startsWith("--") || arr[i + 1] === undefined ? "true" : arr[i + 1]]] : a), []));
const dist = resolve(args.dist ?? resolve(import.meta.dirname, "../apps/docs/dist"));
const out = resolve(args.out ?? "/tmp/faun-shots");
mkdirSync(out, { recursive: true });
const routes = (args.routes ?? "/").split(",");
const themes = (args.themes ?? "light").split(",");
const widths = (args.widths ?? "1440").split(",").map(Number);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  let p = join(dist, decodeURIComponent(req.url.split("?")[0]));
  if (!existsSync(p) || statSync(p).isDirectory()) p = join(dist, "index.html");
  res.writeHead(200, { "content-type": types[extname(p)] ?? "application/octet-stream" });
  res.end(readFileSync(p));
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const errors = [];
for (const route of routes) for (const theme of themes) for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: w < 500 ? 2 : 1, colorScheme: theme.startsWith("dark") ? "dark" : "light", reducedMotion: "reduce" });
  page.on("pageerror", (e) => errors.push(`${route} ${theme}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${route} ${theme}: ${m.text()}`); });
  await page.goto(`http://localhost:${port}/#${route}`);
  await page.evaluate(([t, d, p]) => { document.documentElement.setAttribute("data-faun-theme", t); if (d) document.documentElement.setAttribute("data-faun-density", d); if (p) document.documentElement.setAttribute("data-viz-palette", p); }, [theme, args.density, args.palette]);
  await page.waitForTimeout(Number(args.wait ?? 700));
  if (args.scroll) { await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: "start" }), args.scroll); await page.waitForTimeout(250); }
  const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const name = `${route.replace(/\//g, "_").replace(/^_/, "") || "home"}${args.palette ? `--${args.palette}` : ""}--${theme}--${w}.png`;
  await page.screenshot({ path: join(out, name), fullPage: args.full === "true" });
  console.log(`${name}${sw > 0 ? `  OVERFLOW ${sw}px` : ""}`);
  await page.close();
}
await browser.close(); server.close();
if (errors.length) { console.log("ERRORS:\n" + [...new Set(errors)].join("\n")); process.exitCode = 1; }
