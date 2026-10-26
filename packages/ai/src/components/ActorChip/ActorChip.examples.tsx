import { actors } from "../../utils/fixtures";
import { ActorChip } from "./ActorChip";

export function Thumbnail() {
  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <ActorChip actor={actors.scope3} />
      <ActorChip actor={actors.priya} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <ActorChip actor={actors.orchestrator} />
      <ActorChip actor={actors.scope3} />
      <ActorChip actor={actors.calc} />
      <ActorChip actor={actors.model} />
      <ActorChip actor={actors.priya} />
      <ActorChip actor={actors.scheduler} />
    </div>
  );
}

export function WithKindAndRole() {
  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <ActorChip actor={actors.narrative} showKind />
      <ActorChip actor={actors.priya} showRole />
    </div>
  );
}

export function Small() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <ActorChip size="sm" actor={actors.collector} />
      <ActorChip size="sm" actor={actors.arjun} />
    </div>
  );
}

export function DoNameTheActor() {
  return <ActorChip actor={actors.narrative} showKind />;
}

export function DontAnonymousAgent() {
  return <ActorChip actor={{ id: "x", name: "AI", kind: "model" }} />;
}
