import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Charts carry no literal colours. Every colour a chart draws comes from a `--faun-dataviz-*` token (categorical, scope, sequential,
 * diverging, grid, axis, surface), with `--faun-status-*` only in the components whose colour means a status. Chart chrome (text, tooltip,
 * focus) uses the foreground, background and border roles.
 */
const root = resolve(import.meta.dirname, "../src/components");
const NON_CHART = new Set(["DataTable", "FilterBar", "DataQualityCell", "JsonViewer"]);
const chartFolders = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory() && !NON_CHART.has(d.name)).map((d) => d.name);

type Source = { file: string; kind: "css" | "tsx" | "mdx"; text: string };
const sources: Source[] = chartFolders.flatMap((d) =>
  readdirSync(resolve(root, d)).flatMap((f): Source[] => {
    if (/\.test\.tsx?$/.test(f)) return [];
    const kind = f.endsWith(".css") ? "css" : f.endsWith(".mdx") ? "mdx" : /\.tsx?$/.test(f) ? "tsx" : null;
    return kind ? [{ file: `${d}/${f}`, kind, text: readFileSync(resolve(root, d, f), "utf8") }] : [];
  }),
);

const NAMED = new Set(("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen").split(" "));

const strip = (s: Source) => (s.kind === "css" ? s.text.replace(/\/\*[\s\S]*?\*\//g, "") : s.text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1"));
const COLOUR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|device-cmyk)\(/gi;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const COLOUR_PROPS = "fill|stroke|color|background|backgroundColor|background-color|borderColor|border-color|stopColor|stop-color|floodColor|outlineColor|outline-color|boxShadow|box-shadow|border|outline|textDecorationColor";

/** Colour names used as a value of a colour property, or as a whole string literal. */
function namedColours(s: Source) {
  const text = strip(s);
  const found: string[] = [];
  const check = (v: string) => { for (const tok of v.toLowerCase().split(/[\s,()/]+/)) if (NAMED.has(tok)) found.push(tok); };
  if (s.kind === "css") {
    for (const m of text.matchAll(new RegExp(`(?:^|[;{\\s])(?:${COLOUR_PROPS})\\s*:\\s*([^;}]+)`, "gi"))) check(m[1]!.replace(/var\([^)]*\)/g, ""));
  } else {
    for (const m of text.matchAll(new RegExp(`\\b(?:${COLOUR_PROPS})\\s*[=:]\\s*\\{?\\s*(["'\`])((?:\\\\.|(?!\\1).)*)\\1`, "gi"))) check(m[2]!.replace(/var\([^)]*\)/g, ""));
    for (const m of text.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g)) if (NAMED.has(m[2]!.trim().toLowerCase())) found.push(m[2]!.trim());
  }
  return [...new Set(found)];
}

describe("charts carry no literal colours", () => {
  it("scans every chart folder (the suite is never empty)", () => {
    expect(chartFolders).toEqual(expect.arrayContaining(["ChartKit", "BarChart", "LineChart", "StackedBarChart"]));
    expect(sources.filter((s) => s.kind === "tsx").length).toBeGreaterThan(40);
  });

  for (const s of sources) {
    it(`${s.file}: no hex, rgb, hsl, oklch or colour functions`, () => {
      const t = s.kind === "mdx" ? s.text : strip(s);
      expect([...(t.match(HEX) ?? []), ...(t.match(COLOUR_FN) ?? [])]).toEqual([]);
    });
    if (s.kind !== "mdx") {
      it(`${s.file}: no named colours`, () => {
        expect(namedColours(s)).toEqual([]);
      });
    }
  }
});

describe("chart colours come from the data-viz palette", () => {
  const allowedChrome = /^--faun-(?:fg|bg|border|space|radius|font|type|elevation|z|focus|density|motion|size|duration|easing)-/;
  const refs = (s: Source) => [...strip(s).replace(/\$\{[^}]*\}/g, "X").matchAll(/var\((--[a-z0-9-]+)/gi)].map((m) => m[1]!);

  for (const s of sources.filter((x) => x.kind !== "mdx")) {
    it(`${s.file}: only data-viz tokens, status tokens where colour means status, and neutral chrome roles`, () => {
      const bad = refs(s).filter((v) => v !== "--faun-X" && !v.startsWith("--faun-dataviz-") && !v.startsWith("--_") && !allowedChrome.test(v) && !v.startsWith("--faun-status-"));
      expect(bad).toEqual([]);
    });
  }

  it("status tokens appear only where the colour is a status (gauge, meter and the shared tone helper)", () => {
    const users = sources.filter((s) => s.kind !== "mdx" && !/\.examples\.tsx$/.test(s.file) && /--faun-status-/.test(strip(s))).map((s) => s.file);
    expect(users.sort()).toEqual(["ChartKit/tones.ts"]);
  });

  it("sequential and diverging ramps are used by the charts that need them", () => {
    const text = sources.filter((s) => s.kind === "tsx").map(strip).join("\n");
    expect(text).toMatch(/`seq-\$\{i\}`/); // ADR 0008: per-chart hues are `seq-<hue>-N`, moss is `seq-N`
    expect(text).toMatch(/`seq-\$\{hue\}-\$\{i\}`/);
    expect(text).toMatch(/dataviz-\$\{DIV\[/);
    for (const name of ["HeatmapChart", "TreemapChart", "CirclePackChart"]) expect(sources.find((s) => s.file === `${name}/${name}.tsx`)!.text).toMatch(/seqVar/);
    for (const name of ["HeatmapChart", "TreemapChart", "BarChart"]) expect(sources.find((s) => s.file === `${name}/${name}.tsx`)!.text).toMatch(/divVar/);
  });
});

describe("the detector itself", () => {
  it("catches hex, functions and named colours", () => {
    expect("fill: #fff; stroke: rgb(0 0 0)".match(HEX)).toEqual(["#fff"]);
    expect("a oklch(0.5 0.1 120) b".match(COLOUR_FN)).toEqual(["oklch("]);
    expect(namedColours({ file: "x.css", kind: "css", text: ".a { background: red; border: 1px solid var(--faun-border-default); }" })).toEqual(["red"]);
    expect(namedColours({ file: "x.tsx", kind: "tsx", text: `const a = <rect fill="steelblue" />; const b = { stroke: "black" }; const c = "tan";` }).sort()).toEqual(["black", "steelblue", "tan"]);
    expect(namedColours({ file: "x.tsx", kind: "tsx", text: `<rect style={{ fill: "none", stroke: "var(--faun-dataviz-axis)" }} />` })).toEqual([]);
  });
});
