// Regenerates every image used by README.md into docs/assets/ from the built documentation site.
//
//   pnpm readme:shots [--dist <dir>] [--out <dir>] [--only hero,gallery-colour] [--no-optimise]
//
// 1. Builds the docs into a private directory (default $TMPDIR/faun-docs-readme) unless --dist is given.
// 2. Captures real components and patterns from that build with Playwright (Chromium), in light and dark.
// 3. Composes the hero banner and gallery tiles from those captures in an HTML page that uses Faun's own tokens.
// 4. Builds the README quick start (the literal src/main.tsx and src/App.tsx blocks) as a Vite app and captures it.
// 5. Quantises the PNGs with sharp when it can be resolved (npm i -g sharp, or NODE_PATH), else leaves them as is.
//
// Deterministic: fixed viewport, reduced motion, fixed theme attributes, no timestamps. Needs network only for the
// IBM Plex fonts the docs already load from Google Fonts. See docs/assets/README.md.
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]?.startsWith("--") || arr[i + 1] === undefined ? "true" : arr[i + 1]]] : a), []));
const out = resolve(args.out ?? join(root, "docs/assets"));
const only = args.only ? new Set(args.only.split(",")) : null;
const want = (n) => !only || only.has(n);
const dist = resolve(args.dist ?? join(tmpdir(), "faun-docs-readme"));
mkdirSync(out, { recursive: true });

if (!args.dist) {
  console.log("building docs ->", dist);
  execFileSync("npx", ["vite", "build", "--outDir", dist, "--emptyOutDir"], { cwd: join(root, "apps/docs"), stdio: "ignore" });
}

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff" };
const serve = (dir) => new Promise((ok) => {
  const s = createServer((req, res) => {
    let p = join(dir, decodeURIComponent(req.url.split("?")[0]));
    if (!existsSync(p) || statSync(p).isDirectory()) p = join(dir, "index.html");
    res.writeHead(200, { "content-type": types[extname(p)] ?? "application/octet-stream" });
    res.end(readFileSync(p));
  }).listen(0, () => ok(s));
});
const docs = await serve(dist);
const base = `http://localhost:${docs.address().port}/`;
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined) });

/* ------------------------------------------------------------------ capture */
const section = (id) => `section.fd-section:has(h2#${id})`;
const stage = (n) => `figure.docs-example:nth-of-type(${n}) .docs-example-stage`;
/** name -> capture spec. `pre` runs on the page before the element is shot. */
const CAPTURES = {
  home: { route: "/patterns/assistant-home", sel: ".pt-frame" },
  homeCollapsed: { route: "/patterns/assistant-home", sel: ".pt-frame", pre: (p) => p.getByText("Panel collapsed", { exact: true }).click() },
  chat: { route: "/patterns/chat-with-panels", sel: ".pt-frame" },
  bar: { route: "/components/bar-chart", sel: stage(1) },
  line: { route: "/components/line-chart", sel: stage(1) },
  barGrouped: { route: "/components/bar-chart", sel: stage(2) },
  tableCompact: { route: "/components/data-table", sel: stage(1), density: "compact" },
  tableSpacious: { route: "/components/data-table", sel: stage(1), density: "spacious" },
  table: { route: "/components/data-table", sel: stage(1) },
  form: { route: "/components/field", sel: stage(4) },
  dialog: { route: "/components/dialog", sel: "[role=dialog]", pre: async (p) => { await p.locator(stage(2)).getByRole("button").first().click(); await p.waitForSelector("[role=dialog]"); } },
  button: { route: "/components/button", sel: stage(2) },
  colour: { route: "/foundations/colour", sel: ".fd-scales", pre: async (p, t) => { if (t === "dark") await p.locator(".fd-toolbar .fd-seg").first().getByText("Dark", { exact: true }).click(); } },
  type: { route: "/foundations/typography", sel: ".fd-families" },
  composer: { route: "/components/prompt-composer", sel: stage(1) },
  approval: { route: "/components/approval-card", sel: stage(2) },
  progress: { route: "/components/progress-panel", sel: stage(3) },
  run: { route: "/patterns/agent-run-viewer", sel: ".pt-frame, section.fd-section:has(h2#example) .pt-frame, section.fd-section:has(h2#example)" },
  ...Object.fromEntries(["light", "dark", "light-hc", "dark-hc", "print"].map((t) => [`theme-${t}`, { route: "/foundations/theming", sel: `figure.fd-theme[data-faun-theme="${t}"]` }])),
  phoneHome: { route: "/patterns/assistant-home", sel: ".pt-frame", width: 390 },
  phoneChat: { route: "/patterns/chat-with-panels", sel: ".pt-frame", width: 390 },
};
const cache = new Map();
async function capture(name, theme, over = {}) {
  const key = `${name}|${theme}|${JSON.stringify(over)}`;
  if (cache.has(key)) return cache.get(key);
  const c = { ...CAPTURES[name], ...over };
  const hc = theme.endsWith("-hc");
  const page = await browser.newPage({ viewport: { width: c.width ?? 1440, height: 1000 }, deviceScaleFactor: 2, colorScheme: theme.startsWith("dark") ? "dark" : "light", reducedMotion: "reduce", timezoneId: "UTC", locale: "en-US" });
  await page.clock.setFixedTime(new Date("2026-03-10T09:00:00Z")); // the assistant home greets by time of day
  await page.goto(`${base}#${c.route}`);
  await page.evaluate(([t, d, p]) => {
    const h = document.documentElement;
    h.setAttribute("data-faun-theme", t); h.setAttribute("data-faun-density", d);
    if (p) h.setAttribute("data-viz-palette", p); else h.removeAttribute("data-viz-palette");
  }, [theme, c.density ?? "comfortable", c.palette ?? null]);
  await page.waitForTimeout(900);
  if (c.pre) { await c.pre(page, theme); await page.waitForTimeout(500); }
  const buf = await page.locator(c.sel).first().screenshot();
  await page.close();
  void hc;
  cache.set(key, buf);
  return buf;
}
const uri = (buf) => `data:image/png;base64,${buf.toString("base64")}`;

/* ------------------------------------------------------------------ compose */
const MARK = `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><path d="M12 11.2C12 6.6 9.1 3 4.6 3 4.6 7.6 7.5 11.2 12 11.2Z" opacity="0.92"/><path d="M12.8 12C17.4 12 21 9.1 21 4.6 16.4 4.6 12.8 7.5 12.8 12Z" opacity="0.7"/><path d="M12 12.8C12 17.4 14.9 21 19.4 21 19.4 16.4 16.5 12.8 12 12.8Z" opacity="0.92"/><path d="M11.2 12C6.6 12 3 14.9 3 19.4 7.6 19.4 11.2 16.5 11.2 12Z" opacity="0.7"/></g></svg>`;
const CSS = `
  html,body{margin:0;padding:0;background:var(--faun-bg-canvas)!important;}
  #root{display:none!important}
  #cmp{position:fixed;left:0;top:0;overflow:hidden;background:var(--faun-bg-canvas);color:var(--faun-fg-default);font-family:var(--faun-font-family-sans,'IBM Plex Sans',sans-serif);}
  #cmp *{box-sizing:border-box}
  .dots{position:absolute;inset:0;background-image:radial-gradient(color-mix(in srgb,var(--faun-fg-default) 14%,transparent) 1px,transparent 1.2px);background-size:18px 18px;}
  .shot{position:absolute;border-radius:14px;overflow:hidden;border:1px solid var(--faun-border-default);background:var(--faun-bg-surface);box-shadow:0 1px 2px rgba(20,28,14,.10),0 18px 40px -14px rgba(20,28,14,.35);}
  .shot img{display:block;width:100%;height:100%;object-fit:cover;object-position:left top}
  .brand{display:flex;align-items:center;gap:14px;color:var(--faun-bg-brand)}
  .brand svg{width:56px;height:56px}
  .word{font-family:var(--faun-font-family-serif,'IBM Plex Serif',serif);font-weight:600;font-size:60px;letter-spacing:-.02em;color:var(--faun-fg-default)}
  .tag{font-family:var(--faun-font-family-serif,'IBM Plex Serif',serif);font-weight:500;font-size:34px;line-height:1.18;letter-spacing:-.01em;margin:30px 0 16px}
  .sub{font-size:17px;line-height:1.5;color:var(--faun-fg-muted);max-width:470px}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:26px}
  .chip{font-size:13px;font-weight:500;padding:6px 12px;border-radius:999px;border:1px solid var(--faun-border-strong);background:var(--faun-bg-surface);color:var(--faun-fg-default)}
  .chip b{font-family:var(--faun-font-family-mono,'IBM Plex Mono',monospace);font-weight:500;color:var(--faun-fg-brand)}
  .cap{position:absolute;right:8px;top:8px;font-size:12px;font-weight:500;padding:3px 9px;border-radius:999px;background:var(--faun-bg-brand);color:var(--faun-fg-on-brand,#fff)}
  .label{position:absolute;left:36px;top:26px;right:36px;display:flex;align-items:baseline;gap:14px}
  .label h3{margin:0;font-family:var(--faun-font-family-serif,'IBM Plex Serif',serif);font-size:25px;font-weight:600;letter-spacing:-.01em}
  .label p{margin:0;font-size:14px;color:var(--faun-fg-muted)}
`;
async function compose(file, theme, w, h, html, scale = 1) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale, colorScheme: theme === "dark" ? "dark" : "light", reducedMotion: "reduce", timezoneId: "UTC", locale: "en-US" });
  await page.goto(`${base}#/`);
  await page.evaluate(([t, css, markup, w, h]) => {
    document.documentElement.setAttribute("data-faun-theme", t);
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    const d = document.createElement("div"); d.id = "cmp"; d.style.width = w + "px"; d.style.height = h + "px"; d.innerHTML = markup; document.body.appendChild(d);
  }, [theme, CSS, html, w, h]);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
  await page.waitForTimeout(400);
  await page.locator("#cmp").screenshot({ path: join(out, file) });
  await page.close();
  console.log(file);
}
const pos = (x, y, w, h) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
const shot = (buf, x, y, w, h, o = {}) => `<div class="shot" style="${pos(x, y, w, h)}"><img alt="" src="${uri(buf)}" style="object-position:${o.at ?? "left top"};object-fit:${o.fit ?? "cover"}${o.w ? `;width:${o.w}px;height:auto;max-width:none${o.x ? `;margin-left:${o.x}px` : ""}` : ""}">${o.cap ? `<span class="cap">${o.cap}</span>` : ""}</div>`;

const contrast = JSON.parse(readFileSync(join(root, "packages/tokens/dist/json/contrast.json"), "utf8"));
const PAIRS = contrast.length.toLocaleString("en-US");

const THEMES = ["light", "dark"];

/* hero ------------------------------------------------------------------ */
if (want("hero")) for (const t of THEMES) {
  const home = await capture("home", t);
  const bar = await capture("bar", t);
  const html = `<div class="dots"></div>
    <div style="position:absolute;left:64px;top:84px;width:470px">
      <div class="brand">${MARK}<span class="word">Faun</span></div>
      <div class="tag">An open design system for agentic enterprise software.</div>
      <div class="sub">Tokens, components and patterns for products where agents do the work and people steer, review and sign off.</div>
      <div class="chips"><span class="chip"><b>${PAIRS}</b> contrast pairs checked</span><span class="chip"><b>5</b> themes</span><span class="chip">Apache-2.0</span></div>
    </div>
    ${shot(home, 580, 64, 760, 640)}
    ${shot(bar, 548, 392, 520, 300)}`;
  await compose(`hero-${t}.png`, t, 1280, 640, html);
}

/* gallery tiles ---------------------------------------------------------- */
const W = 1000, H = 625;
const tile = (label, caption, inner) => `<div class="dots"></div><div class="label"><h3>${label}</h3><p>${caption}</p></div>${inner}`;
const TILES = {
  "gallery-foundations": async (t) => tile("Foundations", "Twelve-step scales, IBM Plex, warm paper",
    shot(await capture("colour", t), 36, 84, 928, 250) + shot(await capture("type", t), 36, 350, 928, 250)),
  "gallery-components": async (t) => tile("Components", "Table, form, dialog and buttons",
    shot(await capture("table", t), 36, 84, 928, 370) + shot(await capture("form", t), 36, 470, 290, 130, { w: 430 }) +
    shot(await capture("dialog", t), 355, 470, 290, 130, { w: 430 }) + shot(await capture("button", t), 674, 470, 290, 130, { w: 520, x: -170 })),
  "gallery-dataviz": async (t) => tile("Data visualisation", "Textured marks and pastel palettes",
    shot(await capture("bar", t), 36, 84, 450, 300, { fit: "contain", at: "center" }) + shot(await capture("line", t), 514, 84, 450, 300, { fit: "contain", at: "center" }) +
    shot(await capture("barGrouped", t, { palette: "meadow" }), 36, 410, 290, 190, { cap: "Meadow" }) + shot(await capture("barGrouped", t, { palette: "dawn" }), 355, 410, 290, 190, { cap: "Dawn" }) + shot(await capture("barGrouped", t, { palette: "harbour" }), 674, 410, 290, 190, { cap: "Harbour" })),
  "gallery-ai": async (t) => tile("AI components", "Approval gate, composer, run progress",
    shot(await capture("approval", t), 36, 84, 540, 340) + shot(await capture("composer", t), 36, 440, 540, 160, { at: "left center" }) + shot(await capture("progress", t), 596, 84, 368, 516)),
  "gallery-patterns": async (t) => tile("Patterns", "Assistant home, panel open and collapsed",
    shot(await capture("home", t), 36, 84, 560, 510) + shot(await capture("homeCollapsed", t), 620, 84, 344, 510)),
  "gallery-chat": async (t) => tile("Chat with panels", "Thread, progress and artifact side by side",
    shot(await capture("chat", t), 36, 84, 928, 516)),
  "gallery-themes": async (t) => {
    const names = ["light", "dark", "light-hc", "dark-hc", "print"];
    let h = "";
    for (let i = 0; i < 5; i++) h += shot(await capture(`theme-${names[i]}`, t), 36 + i * 189, 84, 172, 190, { at: "center top" });
    h += shot(await capture("tableCompact", t), 36, 300, 290, 300, { cap: "Compact", w: 640 }) + shot(await capture("table", t), 355, 300, 290, 300, { cap: "Comfortable", w: 640 }) + shot(await capture("tableSpacious", t), 674, 300, 290, 300, { cap: "Spacious", w: 640 });
    return tile("Themes and density", "Light, dark, two high-contrast themes, print", h);
  },
  "gallery-mobile": async (t) => tile("Mobile at 390", "The same patterns on a phone",
    shot(await capture("phoneHome", t), 120, 84, 340, 520) + shot(await capture("phoneChat", t), 540, 84, 340, 520)),
};
for (const [name, fn] of Object.entries(TILES)) if (want(name) || want("gallery")) for (const t of THEMES) await compose(`${name}-${t}.png`, t, W, H, await fn(t));

/* Build-an-app storyboard panels: one rendered result per step -------------- */
const PW = 640, PH = 400;
const PANELS = {
  "step-1-form": async (t) => shot(await capture("button", t), 24, 24, PW - 48, 150) + shot(await capture("form", t), 24, 190, PW - 48, 186, { at: "left center" }),
  "step-2-table": async (t) => shot(await capture("table", t), 24, 24, PW - 48, PH - 48),
  "step-3-chart": async (t) => shot(await capture("bar", t), 24, 24, PW - 48, PH - 48, { fit: "contain", at: "center" }),
  "step-4-home": async (t) => shot(await capture("home", t), 24, 24, PW - 48, PH - 48),
};
for (const [name, fn] of Object.entries(PANELS)) if (want(name) || want("steps")) for (const t of THEMES) await compose(`${name}-${t}.png`, t, PW, PH, `<div class="dots"></div>${await fn(t)}`);

/* Quick start result: the literal README blocks, built as a Vite app ------------ */
if (want("quickstart")) {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const blocks = [...readme.matchAll(/```(\w+)\n([\s\S]*?)```/g)].map((m) => ({ lang: m[1], code: m[2] }));
  const find = (first) => blocks.find((b) => b.lang === "tsx" && b.code.startsWith(first))?.code;
  const mainTsx = find('import { StrictMode } from "react";');
  const appTsx = find('import { useState } from "react";\nimport {\n  AppShell');
  if (!mainTsx || !appTsx) throw new Error("README.md quick start blocks not found");
  const work = mkdtempSync(join(tmpdir(), "faun-readme-app-"));
  mkdirSync(join(work, "src"));
  writeFileSync(join(work, "src/main.tsx"), mainTsx);
  writeFileSync(join(work, "src/App.tsx"), appTsx);
  writeFileSync(join(work, "index.html"), `<!doctype html><html lang="en" data-faun-theme="light" data-faun-density="comfortable"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>my-app</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`);
  // Component stylesheets come straight from package sources (as the docs do), so no package build is needed for them.
  const cssFiles = [join(root, "packages/react/src/utils/shared.css")];
  const walk = (d) => readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).forEach((e) => { const f = join(d, e.name); if (e.isDirectory()) walk(f); else if (e.name.endsWith(".css") && !cssFiles.includes(f)) cssFiles.push(f); });
  for (const p of ["react", "data", "ai"]) for (const sub of ["utils", "components"]) if (existsSync(join(root, "packages", p, "src", sub))) walk(join(root, "packages", p, "src", sub));
  writeFileSync(join(work, "components.css"), cssFiles.map((f) => readFileSync(f, "utf8")).join("\n"));
  mkdirSync(join(work, "node_modules/@faun-ds"), { recursive: true });
  for (const p of ["tokens", "icons", "grid"]) symlinkSync(join(root, "packages", p), join(work, "node_modules/@faun-ds", p));
  const docsNm = join(root, "apps/docs/node_modules");
  const pnpm = join(root, "node_modules/.pnpm");
  const fontDir = (n) => join(pnpm, readdirSync(pnpm).find((d) => d.startsWith(`@fontsource+ibm-plex-${n}@`)), "node_modules/@fontsource", `ibm-plex-${n}`);
  const rq = createRequire(join(docsNm, "vite/package.json"));
  const vite = rq("vite");
  const reactPlugin = createRequire(join(docsNm, "@vitejs/plugin-react/package.json"))("@vitejs/plugin-react").default;
  const pkg = (p) => join(root, "packages", p);
  await vite.build({
    root: work, logLevel: "error", base: "./", configFile: false, plugins: [reactPlugin()],
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: [
        { find: /^react$/, replacement: join(docsNm, "react") }, { find: /^react\/(.*)$/, replacement: join(docsNm, "react") + "/$1" },
        { find: /^react-dom$/, replacement: join(docsNm, "react-dom") }, { find: /^react-dom\/(.*)$/, replacement: join(docsNm, "react-dom") + "/$1" },
        { find: /^@faun-ds\/react$/, replacement: pkg("react/src/index.ts") }, { find: /^@faun-ds\/data$/, replacement: pkg("data/src/index.ts") }, { find: /^@faun-ds\/ai$/, replacement: pkg("ai/src/index.ts") },
        { find: /^@faun-ds\/(react|data|ai)\/styles\.css$/, replacement: join(work, "components.css") },
        ...["sans", "serif", "mono"].map((n) => ({ find: new RegExp(`^@fontsource/ibm-plex-${n}/`), replacement: fontDir(n) + "/" })),
      ],
    },
    build: { outDir: join(work, "dist"), emptyOutDir: true },
  }).catch(async (e) => { console.log("quickstart build failed:", e.message.split("\n")[0]); throw e; });
  const app = await serve(join(work, "dist"));
  for (const t of THEMES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, colorScheme: t, reducedMotion: "reduce", timezoneId: "UTC", locale: "en-US" });
    const problems = [];
    page.on("console", (m) => { if (m.type() === "error") problems.push(m.text()); });
    page.on("pageerror", (e) => problems.push(e.message));
    await page.goto(`http://localhost:${app.address().port}/`);
    await page.evaluate((t) => document.documentElement.setAttribute("data-faun-theme", t), t);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(out, `quickstart-${t}.png`) });
    if (problems.length) console.log("quickstart console problems:", [...new Set(problems)].join(" | "));
    await page.close();
    console.log(`quickstart-${t}.png`);
  }
  app.close();
  rmSync(work, { recursive: true, force: true });
}

await browser.close();
docs.close();

/* ------------------------------------------------------------------ optimise */
if (args["no-optimise"] !== "true") {
  let sharp;
  try { sharp = createRequire(import.meta.url)("sharp"); } catch { try { sharp = createRequire(join(root, "package.json"))("sharp"); } catch {} }
  if (!sharp) console.log("sharp not found: PNGs left unoptimised (npm i -g sharp, then set NODE_PATH to the global node_modules).");
  else {
    let total = 0;
    for (const f of readdirSync(out).filter((f) => f.endsWith(".png"))) {
      const p = join(out, f);
      const buf = await sharp(p).png({ palette: true, quality: 90, effort: 10, colours: 256, compressionLevel: 9 }).toBuffer();
      writeFileSync(p, buf);
      total += buf.length;
    }
    console.log(`optimised, total ${(total / 1024).toFixed(0)} KB`);
  }
}
