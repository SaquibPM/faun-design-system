import { IconBuilding } from "@faun-ds/icons";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

const prevent = (e: { preventDefault: () => void }) => e.preventDefault();

const TRAIL: BreadcrumbItem[] = [
  { label: "Acme Industrial", href: "#", icon: <IconBuilding />, onClick: prevent },
  { label: "Reports", href: "#", onClick: prevent },
  { label: "CSRD FY2026", href: "#", onClick: prevent },
  { label: "E1 Climate change", href: "#", onClick: prevent },
  { label: "E1-6 Gross Scopes 1, 2, 3 and total GHG emissions", href: "#", onClick: prevent },
  { label: "Scope 1" },
];

export function Thumbnail() {
  return <Breadcrumbs items={[{ label: "Reports", href: "#", onClick: prevent }, { label: "CSRD FY2026", href: "#", onClick: prevent }, { label: "E1 Climate" }]} />;
}

export function Overview() {
  return <Breadcrumbs items={[...TRAIL.slice(0, 3), { label: "E1 Climate change" }]} />;
}

export function Collapsed() {
  return <Breadcrumbs items={TRAIL} />;
}

export function LongLabels() {
  return (
    <Breadcrumbs
      items={[
        { label: "Supplier engagement", href: "#", onClick: prevent },
        { label: "Northwind Logistics International Freight Services Ltd.", href: "#", onClick: prevent },
        { label: "2026 Scope 3 category 4 questionnaire response" },
      ]}
    />
  );
}

export function DoHierarchy() {
  return <Breadcrumbs items={[{ label: "Reports", href: "#", onClick: prevent }, { label: "CSRD FY2026", href: "#", onClick: prevent }, { label: "E1 Climate change" }]} />;
}

export function DontHistory() {
  return <Breadcrumbs items={[{ label: "Dashboard", href: "#", onClick: prevent }, { label: "Search results", href: "#", onClick: prevent }, { label: "Inbox", href: "#", onClick: prevent }, { label: "E1 Climate change" }]} />;
}
