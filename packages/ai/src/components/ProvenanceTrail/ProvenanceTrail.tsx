import { IconCalculator, IconDisclosure, IconEmissionFactor, IconFileSearch, IconFileText, IconSigma, IconSignature, type FaunIcon } from "@faun-ds/icons";
import { Link, StatusBadge, cx } from "@faun-ds/react";
import { forwardRef, type HTMLAttributes } from "react";
import { formatRelative } from "../../utils/format.js";
import { SOURCE_KIND_LABEL } from "../../utils/source-kind.js";
import type { ProvenanceNode } from "../../utils/types.js";
import { ActorChip } from "../ActorChip/ActorChip.js";

const KIND: Record<ProvenanceNode["kind"], { label: string; icon: FaunIcon }> = {
  source: { label: "Source", icon: IconFileText },
  extraction: { label: "Extraction", icon: IconFileSearch },
  factor: { label: "Emission factor", icon: IconEmissionFactor },
  calculation: { label: "Calculation", icon: IconCalculator },
  estimate: { label: "Estimate", icon: IconSigma },
  review: { label: "Review", icon: IconSignature },
  datapoint: { label: "Reported value", icon: IconDisclosure },
};

export interface ProvenanceTrailProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  /** Lineage in order, from the original source to the reported value. */
  nodes: ProvenanceNode[];
  /** Reference time (ms since epoch) for relative times. Defaults to the time of the first render. */
  now?: number;
}

/**
 * How a reported figure was produced: source, extraction, factor, calculation, review and the final value,
 * each with who or what did it, when, and the value it carried. Estimates are flagged in words, not only colour.
 */
export const ProvenanceTrail = forwardRef<HTMLOListElement, ProvenanceTrailProps>(function ProvenanceTrail({ nodes, now, className, ...props }, ref) {
  return (
    <ol ref={ref} className={cx("faun-provenance", className)} {...props}>
      {nodes.map((n, i) => {
        const { label, icon: Icon } = KIND[n.kind];
        return (
          <li key={n.id} className="faun-prov-node" data-kind={n.kind} data-last={i === nodes.length - 1 ? "" : undefined}>
            <span className="faun-prov-marker" aria-hidden="true"><Icon size="sm" /></span>
            <div className="faun-prov-content">
              <p className="faun-prov-kind">
                <span>{label}</span>
                {n.kind === "estimate" ? <StatusBadge size="sm" domain="data-quality" state="estimated" /> : null}
              </p>
              <div className="faun-prov-head">
                <p className="faun-prov-title">{n.title}</p>
                {n.value ? <p className="faun-prov-value">{n.value}</p> : null}
              </div>
              {n.detail ? <p className="faun-prov-detail">{n.detail}</p> : null}
              {n.source || n.actor || n.at ? (
                <p className="faun-prov-meta">
                  {n.actor ? <ActorChip actor={n.actor} size="sm" /> : null}
                  {n.source ? (
                    <span className="faun-prov-source">
                      {SOURCE_KIND_LABEL[n.source.kind ?? "document"]}:{" "}
                      {n.source.href ? <Link href={n.source.href} external>{n.source.title}</Link> : n.source.title}
                      {n.source.locator ? `, ${n.source.locator}` : ""}
                    </span>
                  ) : null}
                  {n.at ? <time dateTime={n.at}>{formatRelative(n.at, now)}</time> : null}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
});
