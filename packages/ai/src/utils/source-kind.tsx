import { IconCalculator, IconDatabase, IconEmissionFactor, IconFileText, IconGlobe, IconHash, type FaunIcon } from "@faun-ds/icons";
import type { Source } from "./types.js";

type Kind = NonNullable<Source["kind"]>;

/** Words for source kinds, used in labels and screen-reader text. */
export const SOURCE_KIND_LABEL: Record<Kind, string> = {
  document: "Document",
  dataset: "Dataset",
  factor: "Emission factor",
  web: "Web page",
  datapoint: "Datapoint",
  calculation: "Calculation",
};

const ICONS: Record<Kind, FaunIcon> = {
  document: IconFileText,
  dataset: IconDatabase,
  factor: IconEmissionFactor,
  web: IconGlobe,
  datapoint: IconHash,
  calculation: IconCalculator,
};

/** Icon for a source kind. Decorative: always sits beside the kind's word. */
export function SourceKindIcon({ kind = "document", className }: { kind?: Source["kind"]; className?: string }) {
  const Icon = ICONS[kind ?? "document"];
  return <Icon size="sm" className={className} />;
}
