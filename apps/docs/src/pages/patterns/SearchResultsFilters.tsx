import { IconFileText, IconOrchestrator } from "@faun-ds/icons";
import { Button, CheckboxGroup, EmptyState, Pagination, SearchField, Select, Tag, VisuallyHidden } from "@faun-ds/react";
import { useMemo, useState } from "react";
import { H2 } from "../foundations/shared";
import "./patterns-b3.css";

type Result = { id: string; title: string; kind: "Filing" | "Agent" | "Evidence"; framework: string; status: string; updated: string; snippet: string };

const RESULTS: Result[] = [
  { id: "1", title: "CSRD sustainability statement FY2026", kind: "Filing", framework: "CSRD", status: "In review", updated: "Today", snippet: "ESRS E1-6 reports gross Scope 1, 2 and 3 emissions with the Scope 3 category 1 estimate flagged." },
  { id: "2", title: "CDP climate response 2026", kind: "Filing", framework: "CDP", status: "Draft", updated: "Yesterday", snippet: "Question C6.5 lists Scope 3 categories with the calculation method and the share of emissions evaluated." },
  { id: "3", title: "Scope 3 Sub-agent", kind: "Agent", framework: "CSRD", status: "Running", updated: "2 min ago", snippet: "Calculates category 1 purchased goods and services from supplier spend and measured data." },
  { id: "4", title: "Supplier survey 2026", kind: "Evidence", framework: "CDP", status: "Approved", updated: "18 Oct", snippet: "Total spend on purchased goods and services across 148 suppliers, with Scope 3 data requests." },
  { id: "5", title: "GRI 305 emissions disclosure", kind: "Filing", framework: "GRI", status: "Draft", updated: "17 Oct", snippet: "Disclosures 305-1 to 305-3 for Scope 1, Scope 2 and other indirect Scope 3 emissions." },
  { id: "6", title: "Factor library audit", kind: "Evidence", framework: "CSRD", status: "Approved", updated: "12 Oct", snippet: "DEFRA 2025 factors checked against the Scope 3 category 1 material mapping." },
  { id: "7", title: "TCFD metrics and targets", kind: "Filing", framework: "TCFD", status: "Approved", updated: "9 Oct", snippet: "Cross-industry metrics including Scope 3 and the internal carbon price." },
];
const KINDS = ["Filing", "Agent", "Evidence"] as const;
const FRAMEWORKS = ["CSRD", "CDP", "GRI", "TCFD"];
const PAGE = 3;

function highlight(text: string, q: string) {
  const term = q.trim();
  if (!term) return text;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return parts.map((p, i) => (p.toLowerCase() === term.toLowerCase() ? <mark key={i}>{p}</mark> : p));
}

function SearchResults() {
  const [query, setQuery] = useState("scope 3");
  const [kinds, setKinds] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = RESULTS.filter((r) => (!q || `${r.title} ${r.snippet}`.toLowerCase().includes(q)) && (!kinds.length || kinds.includes(r.kind)) && (!frameworks.length || frameworks.includes(r.framework)));
    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [query, kinds, frameworks, sort]);
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE));
  const shown = matches.slice((Math.min(page, pageCount) - 1) * PAGE, Math.min(page, pageCount) * PAGE);
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };
  const applied = [...kinds.map((k) => ({ group: "Type", value: k, clear: () => reset(setKinds)(kinds.filter((x) => x !== k)) })), ...frameworks.map((f) => ({ group: "Framework", value: f, clear: () => reset(setFrameworks)(frameworks.filter((x) => x !== f)) }))];

  return (
    <div className="pt-find">
      <div className="pt-find-top">
        <SearchField aria-label="Search filings, agents and evidence" placeholder="Search filings, agents and evidence" value={query} onValueChange={reset(setQuery)} />
        <div className="pt-find-sort">
          <Select aria-label="Sort results" size="md" value={sort} onValueChange={setSort} options={[{ value: "relevance", label: "Most relevant" }, { value: "title", label: "Title, A to Z" }]} />
        </div>
      </div>
      <div className="pt-find-layout">
        <aside className="pt-find-facets" aria-label="Filters">
          <CheckboxGroup label="Type" options={KINDS.map((k) => ({ value: k, label: k }))} value={kinds} onValueChange={reset(setKinds)} />
          <CheckboxGroup label="Framework" options={FRAMEWORKS.map((f) => ({ value: f, label: f }))} value={frameworks} onValueChange={reset(setFrameworks)} />
        </aside>
        <div className="pt-find">
          {applied.length ? (
            <div className="pt-find-applied">
              <span className="pt-note">Filters:</span>
              {applied.map((a) => <Tag key={a.group + a.value} variant="filter" onRemove={a.clear} removeLabel={`Remove filter ${a.group}: ${a.value}`}>{`${a.group}: ${a.value}`}</Tag>)}
              <Button size="sm" variant="ghost" onClick={() => { setKinds([]); setFrameworks([]); setPage(1); }}>Clear all</Button>
            </div>
          ) : null}
          <p className="pt-find-count" role="status">{matches.length === 0 ? "No results" : `${matches.length} ${matches.length === 1 ? "result" : "results"}${query.trim() ? ` for “${query.trim()}”` : ""}`}</p>
          {matches.length === 0 ? (
            <EmptyState kind="no-results" size="sm" title="Nothing matches these filters" description={query.trim() ? `No filing, agent or evidence mentions “${query.trim()}” with these filters.` : "Try removing a filter."} action={<Button onClick={() => { setKinds([]); setFrameworks([]); setPage(1); }}>Clear all filters</Button>} secondaryAction={<Button variant="ghost" onClick={() => { setQuery(""); setPage(1); }}>Clear the search</Button>} />
          ) : (
            <ul className="pt-find-results">
              {shown.map((r) => (
                <li key={r.id} className="pt-find-item">
                  <h3 className="pt-find-title"><a href={`#${r.id}`}>{highlight(r.title, query)}</a></h3>
                  <p className="pt-find-snippet">{highlight(r.snippet, query)}</p>
                  <p className="pt-find-meta">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--faun-space-1)" }}>{r.kind === "Agent" ? <IconOrchestrator size="sm" /> : <IconFileText size="sm" />}{r.kind}</span>
                    <Tag variant="framework" size="sm">{r.framework}</Tag>
                    <span>{r.status}</span>
                    <span>Updated {r.updated}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
          {matches.length > PAGE ? <div className="pt-find-foot"><Pagination page={Math.min(page, pageCount)} onPageChange={setPage} total={matches.length} pageSize={PAGE} itemLabel="results" /></div> : null}
        </div>
      </div>
      <VisuallyHidden role="status">{shown.length ? `Showing ${shown.length} of ${matches.length} results` : ""}</VisuallyHidden>
    </div>
  );
}

export function SearchResultsPattern() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="Search first, then narrow with filters that show their effect. Try removing a filter chip, then choose filters that match nothing.">Example</H2>
        <SearchResults />
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Keep the query in the field and the results in step with it. Show the count of results in words and announce changes politely: “3 results for “scope 3””.</li>
          <li>Group facets under plain headings and use checkboxes for multiple choice. A facet changes the results at once; there is no Apply button on a page that searches as you type.</li>
          <li>Show every applied filter as a removable tag above the results, named with its group (“Framework: CDP”), and offer Clear all when there are two or more.</li>
          <li>A filter or a new query returns to page 1. Keep the sort when filters change.</li>
          <li>Highlight the matched words in titles and snippets, and mark them with the <code>mark</code> element so they are not colour alone.</li>
          <li>Each result is a heading that links to the object, with its kind, framework, status and time in one line below. Do not make the whole card a second link.</li>
          <li>When nothing matches, say what was searched, name the filters in the way, and offer Clear all filters and Clear the search. Never show an empty list with no explanation.</li>
          <li>On narrow screens move the facets above the results or into a sheet; keep the applied tags and the count visible.</li>
        </ul>
      </section>
    </div>
  );
}
