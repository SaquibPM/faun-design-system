import * as RC from "@radix-ui/react-collapsible";
import { IconChevronRight } from "@faun-ds/icons";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Avatar } from "../Avatar/Avatar.js";
import { StatusBadge } from "../Badge/Badge.js";

export interface TimelineItem {
  id: string;
  /** Who did it. Agents render with the agent mark, people with initials. */
  actor: { name: string; kind?: "person" | "agent"; src?: string };
  /** What happened, as a sentence fragment after the actor's name: "approved the materiality matrix". */
  action: ReactNode;
  /** Machine-readable time (ISO 8601). */
  time: string;
  /** Human time, e.g. "2 min ago" or "14 Oct, 09:12". Defaults to `time`. */
  timeLabel?: string;
  /** Optional status from the status map. */
  status?: { domain: string; state: string };
  /** Extra detail revealed on demand: diffs, notes, tool inputs. */
  details?: ReactNode;
  /** Open details initially. */
  defaultOpen?: boolean;
}

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
  /** `comfortable` (default) or `dense` for audit trails in side panels. */
  density?: "comfortable" | "dense";
}

/** A chronological list of what people and agents did: the audit trail of a filing, a run or a record. */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline({ items, density = "comfortable", className, ...props }, ref) {
  return (
    <ol ref={ref} className={cx("faun-timeline", className)} data-density={density} {...props}>
      {items.map((it) => {
        const body = (
          <>
            <p className="faun-timeline-line">
              <span className="faun-timeline-actor">{it.actor.name}</span> <span className="faun-timeline-action">{it.action}</span>
            </p>
            <div className="faun-timeline-meta">
              <time dateTime={it.time}>{it.timeLabel ?? it.time}</time>
              {it.status ? <StatusBadge size="sm" domain={it.status.domain} state={it.status.state} /> : null}
            </div>
          </>
        );
        return (
          <li key={it.id} className="faun-timeline-item">
            <span className="faun-timeline-marker"><Avatar name={it.actor.name} kind={it.actor.kind} src={it.actor.src} size={density === "dense" ? "xs" : "sm"} decorative /></span>
            <div className="faun-timeline-content">
              {it.details ? (
                <RC.Root defaultOpen={it.defaultOpen} className="faun-timeline-collapsible">
                  {body}
                  <RC.Trigger className="faun-timeline-toggle">
                    <IconChevronRight size="sm" className="faun-timeline-chevron" />
                    <span className="faun-timeline-toggle-label">Details</span>
                  </RC.Trigger>
                  <RC.Content className="faun-timeline-details">{it.details}</RC.Content>
                </RC.Root>
              ) : body}
            </div>
          </li>
        );
      })}
    </ol>
  );
});
