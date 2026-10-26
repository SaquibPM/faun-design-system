import { Input } from "@faun-ds/react";
import { IconSearch } from "@faun-ds/icons";
import { icons } from "@faun-ds/icons/registry";
import manifest from "@faun-ds/icons/manifest.json";
import { useMemo, useState } from "react";
import { H2, useCopy } from "./shared";

type Entry = { name: string; component: string; category: string; source: string; keywords: string[] };

export function IconsPage() {
  const [q, setQ] = useState("");
  const [copied, copy] = useCopy();
  const list = (manifest as { icons: Entry[] }).icons;
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? list.filter((i) => [i.name, ...i.keywords].join(" ").toLowerCase().includes(t)) : list;
  }, [q, list]);
  const cats = [...new Set(list.map((i) => i.category))];
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="principles" lede={`${list.length} icons: a curated Lucide set with one glyph per meaning, plus ${list.filter((i) => i.source === "faun").length} glyphs drawn for ESG and agentic work.`}>Principles</H2>
        <div className="fd-principles">
          <div><h3>One meaning, one glyph</h3><p>Settings is always a gear. Curation stops screens drifting into synonyms that people have to learn twice.</p></div>
          <div><h3>Optical stroke</h3><p>Stroke weight scales inversely with size: 2 units at 16px and below, 1.75 at 20–24px, 1.5 at 32px, so icons look the same weight at every size.</p></div>
          <div><h3>Labelled when alone</h3><p>Icons are decorative by default. An icon that carries meaning on its own gets a label, and icon-only buttons require one.</p></div>
        </div>
      </section>
      <section className="fd-section">
        <div className="fd-toolbar">
          <div style={{ inlineSize: "min(360px, 100%)" }}>
            <Input prefix={<IconSearch />} placeholder="Search icons: scope, approval, ledger…" aria-label="Search icons" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <span className="fd-hint">{copied ? `Copied ${copied}` : `${filtered.length} icons · select to copy the import`}</span>
        </div>
        {cats.map((c) => {
          const items = filtered.filter((i) => i.category === c);
          if (!items.length) return null;
          return (
            <div key={c} className="fd-icon-cat">
              <h3 className="docs-h3">{c === "esg" ? "Faun glyphs · ESG and agentic" : c[0].toUpperCase() + c.slice(1)}</h3>
              <ul className="fd-icon-grid">
                {items.map((i) => {
                  const C = (icons as Record<string, React.ComponentType<{ size?: string }>>)[i.name];
                  return (
                    <li key={i.name}>
                      <button type="button" className="fd-icon" data-own={i.source === "faun" ? "" : undefined} onClick={() => copy(i.component)} title={i.keywords.join(", ")}>
                        {C ? <C size="xl" /> : null}
                        <span>{i.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
