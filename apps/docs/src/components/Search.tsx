import { Dialog, DialogContent, DialogHeader, Input } from "@faun-ds/react";
import { IconArrowRight, IconSearch } from "@faun-ds/icons";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { components } from "../content/registry";
import { navSections } from "../nav";
import { patternPages } from "../pages/patterns";

type Entry = { label: string; to: string; section: string; text: string };

export function Search({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const entries = useMemo<Entry[]>(() => {
    const desc = new Map<string, string>([...components.map((c) => [`/components/${c.slug}`, c.meta.description] as [string, string]), ...patternPages.map((p) => [`/patterns/${p.slug}`, p.description] as [string, string])]);
    return navSections().flatMap((s) => s.items.map((i) => ({ label: i.label, to: i.to, section: s.title, text: `${i.label} ${s.title} ${desc.get(i.to) ?? ""}`.toLowerCase() })));
  }, []);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return entries.slice(0, 12);
    return entries
      .map((e) => ({ e, score: e.label.toLowerCase().startsWith(t) ? 3 : e.label.toLowerCase().includes(t) ? 2 : e.text.includes(t) ? 1 : 0 }))
      .filter((x) => x.score > 0).sort((a, b) => b.score - a.score).map((x) => x.e).slice(0, 20);
  }, [q, entries]);
  const go = (to: string) => { onOpenChange(false); setQ(""); nav(to); };
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setQ(""); }}>
      <DialogContent size="md" showClose={false} className="docs-search">
        <DialogHeader title="Search documentation" className="faun-visually-hidden" />
        <div className="docs-search-field">
          <Input
            autoFocus
            size="lg"
            prefix={<IconSearch />}
            placeholder="Search components, foundations, patterns"
            aria-label="Search documentation"
            role="combobox"
            aria-expanded="true"
            aria-controls="docs-search-results"
            aria-activedescendant={results[active] ? `docs-result-${active}` : undefined}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              if (e.key === "Enter" && results[active]) go(results[active].to);
            }}
          />
        </div>
        <ul id="docs-search-results" role="listbox" aria-label="Results" className="docs-search-results">
          {results.length === 0 ? <li className="docs-search-empty">No pages match “{q}”.</li> : null}
          {results.map((r, i) => (
            <li key={r.to} id={`docs-result-${i}`} role="option" aria-selected={i === active} className="docs-search-result" onMouseEnter={() => setActive(i)} onClick={() => go(r.to)}>
              <span className="docs-search-label">{r.label}</span>
              <span className="docs-search-section">{r.section}</span>
              <IconArrowRight size="sm" />
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
