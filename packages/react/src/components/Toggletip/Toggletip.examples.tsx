import { Link } from "../Link/Link";
import { Toggletip } from "./Toggletip";

export function Thumbnail() {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--faun-space-1)" }}>Confidence <Toggletip label="About confidence" defaultOpen={false}>Share of inputs with evidence.</Toggletip></span>;
}

export function Overview() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--faun-space-1)" }}>
      Evidence coverage
      <Toggletip label="About evidence coverage" title="Evidence coverage" actions={<Link href="#coverage">How it is calculated</Link>}>
        The share of reported figures that link to at least one piece of evidence. Estimated figures count as uncovered.
      </Toggletip>
    </span>
  );
}

export function Placement() {
  return (
    <div style={{ display: "flex", gap: "var(--faun-space-8)", flexWrap: "wrap", alignItems: "center" }}>
      <span>Below <Toggletip label="Below" side="bottom" align="start" icon="help">Opens below, aligned to the start of the trigger.</Toggletip></span>
      <span>Right <Toggletip label="Right" side="right">Opens to the side.</Toggletip></span>
    </div>
  );
}

export function DoShortAndOptional() {
  return <span>Market-based <Toggletip label="About market-based">Uses supplier-specific factors where a contract exists.</Toggletip></span>;
}

export function DontEssential() {
  return <span>Approver <Toggletip label="Approver is required">You must name an approver before you can submit.</Toggletip></span>;
}
