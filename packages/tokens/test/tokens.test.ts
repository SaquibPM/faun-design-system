import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createAccent } from "../runtime/accent.ts";
import { contrastReport } from "../scripts/contrast.ts";
import { dE } from "./cvd.ts";
import {
  SCALE_NAMES, THEMES, collectComponentTokens, collectFoundations, collectSemantic, composite, contrast, rgba, scales, semanticSource, statusMap, viz,
} from "../scripts/lib.ts";

const DIST = resolve(import.meta.dirname, "../dist");
const semantic = collectSemantic();
const by = new Map(semantic.map((s) => [s.name, s]));
const APS = ["light", "dark", "light-hc", "dark-hc"] as const;

describe("scales", () => {
  for (const name of SCALE_NAMES) {
    for (const ap of APS) {
      const s = scales[name][ap].steps;
      it(`${name}/${ap}: step 11 is readable text and step 12 is high-contrast text on steps 1–3`, () => {
        for (const bg of ["1", "2", "3"]) {
          expect(contrast(s["11"], s[bg]), `11 on ${bg}`).toBeGreaterThanOrEqual(ap.endsWith("hc") ? 7 : 4.5);
          expect(contrast(s["12"], s[bg]), `12 on ${bg}`).toBeGreaterThanOrEqual(ap.endsWith("hc") ? 12 : 10);
        }
      });
      it(`${name}/${ap}: backgrounds and borders step monotonically (1→8)`, () => {
        const lum = (h: string) => { const [r, g, b] = rgba(h); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        for (let i = 1; i < 8; i++) {
          const a = lum(s[String(i)]), b = lum(s[String(i + 1)]);
          if (ap.startsWith("light")) expect(b, `step ${i + 1}`).toBeLessThan(a); else expect(b, `step ${i + 1}`).toBeGreaterThan(a);
        }
      });
      it(`${name}/${ap}: alpha twins composite back to the solid steps`, () => {
        const bg = ap.startsWith("light") ? "#ffffff" : scales.gray[ap].steps["1"];
        for (let i = 1; i <= 12; i++) {
          const [r1, g1, b1] = rgba(composite(s[`a${i}`], bg));
          const [r2, g2, b2] = rgba(s[String(i)]);
          expect(Math.max(Math.abs(r1 - r2), Math.abs(g1 - g2), Math.abs(b1 - b2)), `a${i}`).toBeLessThanOrEqual(3);
        }
      });
    }
  }
});

describe("semantic colour", () => {
  it("references scales only (no raw hex)", () => {
    expect(JSON.stringify(semanticSource).match(/"#[0-9a-fA-F]{3,8}"/g) ?? []).toEqual([]);
  });
  it("meets the contrast contract in all five themes", () => {
    const { rows } = contrastReport(semantic);
    expect(rows.filter((r) => !r.pass).map((r) => `[${r.theme}] ${r.fg} on ${r.bg} ${r.ratio.toFixed(2)}<${r.min}`)).toEqual([]);
    expect(rows.length).toBeGreaterThan(800);
  });
  it("keeps text hierarchy default > muted > subtle in every theme", () => {
    for (const t of THEMES) {
      const bg = by.get("bg.surface")!.value[t];
      const r = (n: string) => contrast(by.get(n)!.value[t], bg);
      expect(r("fg.default"), t).toBeGreaterThan(r("fg.muted"));
      expect(r("fg.muted"), t).toBeGreaterThan(r("fg.subtle"));
    }
  });
  it("gives every status tone the seven-part set and every domain state a real tone", () => {
    const tones = Object.keys(statusMap.tones);
    for (const t of tones) for (const p of ["fg", "bg", "bg-hover", "border", "solid", "solid-hover", "on-solid"]) expect(by.has(`status.${t}.${p}`), `${t}.${p}`).toBe(true);
    for (const [domain, states] of Object.entries<any>(statusMap.domains)) for (const [k, e] of Object.entries<any>(states)) {
      if (k.startsWith("$")) continue;
      expect(tones, `${domain}.${k}`).toContain(e.tone);
      expect(e.icon, `${domain}.${k}`).toMatch(/^status-/);
    }
  });
  it("routes every brand-coloured role through the tenant-replaceable accent scale", () => {
    for (const n of ["bg.brand", "fg.brand", "fg.link", "focus.ring", "accent.solid-bg", "bg.selected"]) expect(by.get(n)!.css.light, n).toContain("--faun-accent-");
  });
});

describe("data viz", () => {
  for (const mode of ["light", "dark"] as const) {
    const slots = viz.order.map((n: string) => viz[mode][n]);
    it(`${mode}: adjacent categorical slots separate for protan/deutan (ΔE ≥ 8) and normal vision (ΔE ≥ 15)`, () => {
      for (let i = 0; i < slots.length - 1; i++) {
        for (const k of ["protan", "deutan"] as const) expect(dE(slots[i], slots[i + 1], k), `${k} ${i + 1}↔${i + 2}`).toBeGreaterThanOrEqual(8);
        expect(dE(slots[i], slots[i + 1]), `${i + 1}↔${i + 2}`).toBeGreaterThanOrEqual(15);
      }
    });
    it(`${mode}: GHG scopes are pairwise distinct under CVD`, () => {
      const s = [1, 2, 3].map((i) => by.get(`dataviz.scope-${i}`)!.value[mode]);
      for (const [a, b] of [[0, 1], [0, 2], [1, 2]] as const) for (const k of ["protan", "deutan"] as const) expect(dE(s[a]!, s[b]!, k)).toBeGreaterThanOrEqual(8);
    });
  }
});

describe("foundations", () => {
  const f = collectFoundations();
  it("never sets type below 11px, and running text roles below 12px", () => {
    for (const t of f.filter((x) => x.path[2] === "font-size")) {
      const px = parseFloat(t.css);
      expect(px, t.name).toBeGreaterThanOrEqual(t.path[1] === "micro" ? 11 : 12);
    }
  });
  it("keeps line heights on the 2px grid and spacing on the 1px/2px/4px scale", () => {
    for (const t of f.filter((x) => x.path[2] === "line-height")) expect(parseFloat(t.css) % 2, t.name).toBe(0);
    for (const t of f.filter((x) => x.path[0] === "space")) expect([0, 1, 2].includes(parseFloat(t.css) % 4) || parseFloat(t.css) % 2 === 0, t.name).toBe(true);
  });
  it("uses three weights only", () => expect(f.filter((x) => x.path[0] === "font" && x.path[1] === "weight")).toHaveLength(3));
  it("resolves every component token", () => {
    for (const c of collectComponentTokens()) expect(c.css, c.name).toMatch(/^(var\(--faun-[a-z0-9-]+\)|\d+px)$/);
  });
});

describe("tenant theming", () => {
  for (const seed of ["#0057B8", "#E4002B", "#FFD100", "#6E44FF", "#00A3E0", "#FF6B00", "#1a5e3e", "#111111"]) {
    it(`createAccent(${seed}) produces a passing scale for every appearance`, () => {
      const a = createAccent(seed);
      expect(a.report.filter((r) => !r.pass)).toEqual([]);
      expect(a.css).toContain("--faun-accent-9:");
      expect(a.css).toContain('[data-faun-theme="dark"]');
    });
  }
});

describe("build output", () => {
  const css = readFileSync(resolve(DIST, "css/faun.css"), "utf8");
  it("declares semantic tokens inside every theme block so nested themes resolve correctly", () => {
    for (const t of THEMES) {
      const sel = t === "light" ? '[data-faun-theme="light"] {' : `[data-faun-theme="${t}"] {`;
      const block = css.slice(css.indexOf(sel), css.indexOf("}", css.indexOf(sel)));
      expect(block, t).toContain("--faun-fg-default:");
      expect(block, t).toContain("--faun-gray-12:");
    }
  });
  it("ships system, P3, print, density, motion, calm and forced-colours handling", () => {
    for (const s of ['[data-faun-theme="system"]', "color-gamut: p3", "color(display-p3", "@media print", '[data-faun-density="compact"]', '[data-faun-density="spacious"]', "prefers-reduced-motion", "[data-faun-calm]", "forced-colors: active"]) expect(css, s).toContain(s);
  });
  it("emits every artefact", () => {
    for (const p of ["css/base.css", "css/fonts.css", "tailwind/faun.css", "tailwind/faun-strict.css", "js/index.js", "js/index.d.ts", "json/tokens.json", "json/scales.json", "json/status-map.json", "json/contrast.json", "docs/contrast.md", "runtime/accent.js", "runtime/accent.d.ts"]) expect(existsSync(resolve(DIST, p)), p).toBe(true);
  });
  it("compiles with real Tailwind v4, and the strict preset blocks the default palette", () => {
    const base = resolve(import.meta.dirname, "../.tw-test"); if (!existsSync(base)) execFileSync("mkdir", ["-p", base]);
    const dir = mkdtempSync(join(base, "run-"));
    writeFileSync(join(dir, "in.css"), `@import "${resolve(DIST, "css/faun.css")}";\n@import "tailwindcss";\n@import "${resolve(DIST, "tailwind/faun-strict.css")}";\n`);
    writeFileSync(join(dir, "page.html"), `<div class="bg-surface text-fg border-line-control rounded-md shadow-3 text-body-md font-serif bg-accent-solid hover:bg-accent-solid-hover text-accent-solid-fg text-status-success bg-status-success-soft bg-gray-a3 bg-accent-9 z-modal h-control numeric bg-blue-100 rounded-2xl"></div>`);
    const cli = resolve(import.meta.dirname, "../node_modules/.bin/tailwindcss");
    execFileSync(cli, ["-i", join(dir, "in.css"), "-o", join(dir, "out.css"), "--content", join(dir, "page.html")], { cwd: resolve(import.meta.dirname, ".."), stdio: "pipe" });
    const out = readFileSync(join(dir, "out.css"), "utf8");
    for (const c of ["bg-surface", "text-fg", "border-line-control", "rounded-md", "shadow-3", "text-body-md", "font-serif", "bg-accent-solid", "text-status-success", "bg-status-success-soft", "bg-gray-a3", "bg-accent-9", "z-modal", "h-control", "numeric"]) expect(out, c).toContain(`.${c}`);
    expect(out).not.toContain(".bg-blue-100");
    expect(out).not.toContain(".rounded-2xl");
  });
});
