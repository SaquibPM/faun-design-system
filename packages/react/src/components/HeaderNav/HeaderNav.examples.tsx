import { HeaderNav } from "./HeaderNav";

const ITEMS = [
  { label: "Overview", href: "#overview" },
  { label: "Filings", href: "#filings", current: true },
  { label: "Data", children: [{ label: "Factor library", href: "#factors", description: "DEFRA 2025, IEA 2025" }, { label: "Evidence", href: "#evidence", description: "2,316 items" }, { label: "Sources", href: "#sources" }] },
  { label: "Agents", href: "#agents" },
];

const Bar = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "stretch", minBlockSize: "var(--faun-layout-topbar-height)", paddingInline: "var(--faun-space-4)", background: "var(--faun-bg-surface)", border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", borderRadius: "var(--faun-radius-md)", inlineSize: "min(100%, 640px)" }}>{children}</div>
);

export function Thumbnail() {
  return <Bar><HeaderNav items={ITEMS.slice(0, 3)} /></Bar>;
}

export function Overview() {
  return <div style={{ minBlockSize: 220 }}><Bar><HeaderNav items={ITEMS} /></Bar></div>;
}

export function SubMenuCurrent() {
  return (
    <div style={{ minBlockSize: 120 }}>
      <Bar><HeaderNav items={[{ label: "Overview", href: "#overview" }, { label: "Data", children: [{ label: "Factor library", href: "#factors" }, { label: "Evidence", href: "#evidence", current: true }] }]} /></Bar>
    </div>
  );
}

export function DoFewLinks() {
  return <Bar><HeaderNav items={ITEMS.slice(0, 3)} /></Bar>;
}

export function DontManyLinks() {
  return <Bar><HeaderNav items={[...ITEMS, { label: "Targets", href: "#t" }, { label: "Materiality", href: "#m" }, { label: "Suppliers", href: "#s" }]} /></Bar>;
}
