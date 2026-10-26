import { ShowMore } from "./ShowMore";

const narrative = "Scope 2 emissions fell 8.4 percent year on year, driven by the switch of 14 UK sites to a renewable tariff with supplier-specific factors. Market-based emissions are reported alongside location-based emissions as required by ESRS E1-6. Two sites in Poland remain on the national grid mix, and a procurement plan is in place to move them in FY2027. Estimated data covers 3 percent of consumption and is marked in the evidence trail.";

export function Thumbnail() {
  return <div style={{ inlineSize: "14rem" }}><ShowMore lines={2}>{narrative}</ShowMore></div>;
}

export function Overview() {
  return <div style={{ inlineSize: "min(100%, 460px)" }}><ShowMore lines={3}>{narrative}</ShowMore></div>;
}

export function NamedToggle() {
  return (
    <div style={{ inlineSize: "min(100%, 460px)" }}>
      <ShowMore lines={2} moreLabel="Read full narrative" lessLabel="Collapse narrative">{narrative}</ShowMore>
    </div>
  );
}

export function ShortContent() {
  return <div style={{ inlineSize: "min(100%, 460px)" }}><ShowMore lines={3}>No restatements this year.</ShowMore></div>;
}

export function DoLongText() {
  return <div style={{ inlineSize: "min(100%, 460px)" }}><ShowMore lines={2}>{narrative}</ShowMore></div>;
}

export function DontHideCritical() {
  return <div style={{ inlineSize: "min(100%, 460px)" }}><ShowMore lines={1}>Warning: this filing will be locked for editing once submitted and cannot be reopened without auditor approval.</ShowMore></div>;
}
