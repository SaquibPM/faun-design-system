import { Link, Popover, PopoverContent, PopoverTrigger, cx } from "@faun-ds/react";
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { formatRelative } from "../../utils/format.js";
import { SOURCE_KIND_LABEL, SourceKindIcon } from "../../utils/source-kind.js";
import type { Citation, Source } from "../../utils/types.js";

function SourceMeta({ source }: { source: Source }) {
  const kind = SOURCE_KIND_LABEL[source.kind ?? "document"];
  const parts = [source.publisher, source.locator].filter(Boolean);
  return (
    <p className="faun-source-meta">
      <SourceKindIcon kind={source.kind} className="faun-source-kind-icon" />
      <span>{kind}</span>
      {parts.map((p) => <span key={p}>{p}</span>)}
      {source.retrievedAt ? <time dateTime={source.retrievedAt}>Retrieved {formatRelative(source.retrievedAt)}</time> : null}
    </p>
  );
}

function SourceBody({ source, headingTag: H = "p" }: { source: Source; headingTag?: "p" | "h3" | "h4" }) {
  return (
    <>
      <H className="faun-source-title">
        {source.href ? <Link href={source.href} external>{source.title}</Link> : source.title}
      </H>
      <SourceMeta source={source} />
      {source.excerpt ? <blockquote className="faun-source-excerpt">{source.excerpt}</blockquote> : null}
    </>
  );
}

export interface CitationMarkerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** The numbered reference and the source it points to. */
  citation: Citation;
  /** Called when the marker opens, so a product can highlight the source in a SourceList. */
  onOpen?: (citation: Citation) => void;
}

/** A small numbered reference inside AI text. Opens a card with the source, its locator and the quoted passage. */
export const CitationMarker = forwardRef<HTMLButtonElement, CitationMarkerProps>(function CitationMarker({ citation, onOpen, className, ...props }, ref) {
  return (
    <Popover onOpenChange={(o) => { if (o) onOpen?.(citation); }}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          className={cx("faun-citation-marker", className)}
          aria-label={`Source ${citation.index}: ${citation.source.title}`}
          {...props}
        >
          <span aria-hidden="true">{citation.index}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent size="sm" className="faun-citation-card" aria-label={`Source ${citation.index}: ${citation.source.title}`}>
        <SourceBody source={citation.source} />
        {citation.source.href ? (
          <p className="faun-source-open">
            <Link href={citation.source.href} external underline="hover">Open source</Link>
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
});

export interface SourceListProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  /** Citations in the order they are numbered. */
  citations: Citation[];
  /** Highlight one entry, e.g. the source whose marker is open. */
  activeIndex?: number;
  /** Prefix for entry ids (`<prefix>-1`) so markers and links can point at an entry. Defaults to a generated id. */
  idPrefix?: string;
}

/** The numbered sources behind an AI statement, with kind, locator and quoted passage. */
export const SourceList = forwardRef<HTMLOListElement, SourceListProps>(function SourceList({ citations, activeIndex, idPrefix = "source", className, ...props }, ref) {
  return (
    <ol ref={ref} className={cx("faun-source-list", className)} {...props}>
      {citations.map((c) => (
        <li key={c.index} id={`${idPrefix}-${c.index}`} className="faun-source-item" data-active={c.index === activeIndex ? "" : undefined} value={c.index}>
          <span className="faun-source-number" aria-hidden="true">{c.index}</span>
          <div className="faun-source-body">
            <SourceBody source={c.source} />
          </div>
        </li>
      ))}
    </ol>
  );
});
