import { IconBrain, IconOrchestrator, IconSubAgent, IconTool, IconWorkflow, type FaunIcon } from "@faun-ds/icons";
import { Avatar, cx } from "@faun-ds/react";
import { forwardRef, type HTMLAttributes } from "react";
import type { Actor, ActorKind } from "../../utils/types.js";

export const ACTOR_KIND_LABEL: Record<ActorKind, string> = {
  agent: "Agent",
  "sub-agent": "Sub-agent",
  tool: "Tool",
  model: "Model",
  human: "Person",
  system: "System",
};

const ICONS: Record<Exclude<ActorKind, "human">, FaunIcon> = { agent: IconOrchestrator, "sub-agent": IconSubAgent, tool: IconTool, model: IconBrain, system: IconWorkflow };

export interface ActorChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Who did the work. */
  actor: Actor;
  /** `sm` for dense trails, `md` (default) elsewhere. */
  size?: "sm" | "md";
  /** Show the kind in words ("Sub-agent") after the name. The kind is always available to screen readers. */
  showKind?: boolean;
  /** Show the actor's role line after the name. */
  showRole?: boolean;
}

/**
 * Names who did something. Machines (Agents, Sub-agents, tools, models) are lagoon with a kind icon;
 * people are plum with their photo or initials, so work by an agent is never mistaken for a person's.
 */
export const ActorChip = forwardRef<HTMLSpanElement, ActorChipProps>(function ActorChip({ actor, size = "md", showKind = false, showRole = false, className, ...props }, ref) {
  const tone = actor.kind === "human" ? "human" : actor.kind === "system" ? "system" : "machine";
  const Icon = actor.kind === "human" ? null : ICONS[actor.kind];
  const kind = ACTOR_KIND_LABEL[actor.kind];
  return (
    <span ref={ref} className={cx("faun-actor-chip", className)} data-tone={tone} data-kind={actor.kind} data-size={size} {...props}>
      <span className="faun-actor-chip-mark" aria-hidden="true">
        {Icon ? <Icon size="sm" /> : <Avatar name={actor.name} src={actor.avatarUrl} size="xs" decorative />}
      </span>
      <span className="faun-actor-chip-name">{actor.name}</span>
      {showKind ? <span className="faun-actor-chip-kind" aria-hidden="true">{kind}</span> : null}
      <span className="faun-visually-hidden">, {kind}{actor.role ? `, ${actor.role}` : ""}</span>
      {showRole && actor.role ? <span className="faun-actor-chip-role" aria-hidden="true">{actor.role}</span> : null}
    </span>
  );
});
