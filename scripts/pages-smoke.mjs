#!/usr/bin/env node
// Smoke test for the documentation site under a GitHub Pages subpath. Two modes:
//
//   node scripts/pages-smoke.mjs --dist apps/docs/dist --base /<repo>/     serve dist under the subpath, like Pages
//   node scripts/pages-smoke.mjs --url https://<owner>.github.io/<repo>/    check the live, deployed site [--wait 240]
//
// For several hash routes it asserts: every asset in index.html returns 200 with a non-HTML content type, the page
// renders a heading, and there are no console errors, page errors, failed requests or HTTP errors from the site's own
// origin. In --dist mode it also checks the 404.html fallback (/<repo>/foundations/colour -> #/foundations/colour) and
// that nothing is requested outside the subpath. Needs Chromium (`pnpm exec playwright install chromium`, or set
// PLAYWRIGHT_CHROMIUM=/path/to/chrome).
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const ROUTES = ["/", "/foundations/colour", "/components/button", "/components/data-table", "/patterns", "/guides/getting-started"];
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".txt": "text/plain", ".woff2": "font/woff2", ".png": "image/png" };

let origin;
let base;
let server;
if (opt("url")) {
  const u = new URL(opt("url"));
  origin = u.origin;
  base = u.pathname.endsWith("/") ? u.pathname : `${u.pathname}/`;
} else {
  const dist = resolve(opt("dist") ?? "apps/docs/dist");
  base = opt("base") ?? "/";
  // Behaves like GitHub Pages: files under the base are served, unknown paths under it get 404.html with status 404,
  // anything outside the base is a plain 404.
  server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const send = (code, file) => { res.writeHead(code, { "content-type": MIME[extname(file)] ?? "application/octet-stream" }); res.end(readFileSync(file)); };
    if (!path.startsWith(base)) { res.writeHead(404, { "content-type": "text/plain" }); return res.end(`outside base: ${path}`); }
    let rel = normalize(path.slice(base.length)).replace(/^(\.\.[/\\])+/, "");
    if (rel === "." || rel === "" || rel.endsWith("/")) rel = join(rel === "." ? "" : rel, "index.html");
    const file = join(dist, rel);
    if (existsSync(file) && statSync(file).isFile()) return send(200, file);
    if (existsSync(join(dist, "404.html"))) return send(404, join(dist, "404.html"));
    res.writeHead(404); res.end("not found");
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  origin = `http://127.0.0.1:${server.address().port}`;
}
const site = `${origin}${base}`;
const failures = [];
const fail = (m) => { failures.push(m); console.log(`  FAIL ${m}`); };
const ok = (m) => console.log(`  ok   ${m}`);

try {
  console.log(`Pages smoke test: ${site}`);
  // 0. wait for the site (live mode: CDN propagation after a deploy)
  const deadline = Date.now() + Number(opt("wait") ?? 0) * 1000;
  let html;
  for (;;) {
    try { const r = await fetch(site); if (r.ok) { html = await r.text(); break; } } catch { /* retry */ }
    if (Date.now() > deadline) throw new Error(`${site} did not return 200`);
    await new Promise((r) => setTimeout(r, 5000));
  }

  // 1. every asset referenced by index.html resolves under the subpath
  const urls = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((u) => !/^(?:https?:|data:|mailto:|#)/i.test(u));
  if (!urls.some((u) => /\.js(\?|$)/.test(u))) fail("index.html references no script");
  for (const u of urls) {
    const abs = new URL(u, site).href;
    const r = await fetch(abs);
    const type = r.headers.get("content-type") ?? "";
    if (r.status !== 200 || (/\.(js|css)$/.test(u) && type.includes("text/html"))) fail(`asset ${u} -> HTTP ${r.status} ${type}`);
    else if (!abs.startsWith(site)) fail(`asset ${u} resolves outside ${site}`);
  }
  ok(`${urls.length} asset URL(s) in index.html resolve under ${base}`);
  for (const f of ["llms.txt", "llms-full.txt"]) { const r = await fetch(new URL(f, site)); if (r.status !== 200) fail(`${f} -> HTTP ${r.status}`); }

  // 2. real browser
  const { chromium } = createRequire(join(root, "package.json"))("playwright");
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
  const browser = await chromium.launch({ executablePath });
  try {
    const visit = async (label, url, expectHash) => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      const problems = [];
      page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) problems.push(`console error: ${m.text()}`); });
      page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
      page.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith(origin) && !r.url().endsWith("/favicon.ico") && !(label.startsWith("fallback") && r.url() === url)) problems.push(`HTTP ${r.status()} ${r.url()}`); });
      // ERR_ABORTED is the 404.html page navigating away to the hash route; any other failure is real.
      page.on("requestfailed", (r) => { if (r.url().startsWith(origin) && !(label.startsWith("fallback") && /ERR_ABORTED/.test(r.failure()?.errorText ?? ""))) problems.push(`requestfailed ${r.url()} ${r.failure()?.errorText ?? ""}`); });
      try {
        await page.goto(url, { waitUntil: "networkidle" });
        await page.locator("h1").first().waitFor({ timeout: 15000 });
        const h1 = (await page.locator("h1").first().innerText()).replace(/\s+/g, " ").trim();
        const len = await page.evaluate(() => document.getElementById("root")?.innerText.length ?? 0);
        if (len < 80) problems.push(`page looks empty (${len} characters)`);
        if (/not found|404/i.test(h1)) problems.push(`router shows "${h1}"`);
        if (expectHash && !page.url().endsWith(expectHash)) problems.push(`ended at ${page.url()}, expected ...${expectHash}`);
        problems.length ? problems.forEach((p) => fail(`${label}: ${p}`)) : ok(`${label}: "${h1}"`);
      } catch (e) {
        fail(`${label}: ${String(e.message).split("\n")[0]}`);
      } finally { await page.close(); }
    };
    for (const r of ROUTES) await visit(`route #${r}`, `${site}#${r}`);
    // The 404.html fallback is only meaningful where we control the server or Pages serves it.
    await visit("fallback /foundations/colour", `${site}foundations/colour`, "#/foundations/colour");
  } finally { await browser.close(); }
} catch (e) {
  fail(String(e.message));
} finally { server?.close(); }

console.log(failures.length ? `\n${failures.length} problem(s).` : "\nPages smoke test passed.");
process.exit(failures.length ? 1 : 0);
