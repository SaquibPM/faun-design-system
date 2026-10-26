import { useState } from "react";
import { citations } from "../../utils/fixtures";
import { CitationMarker, SourceList } from "./Citation";

export function Thumbnail() {
  return (
    <p style={{ margin: 0, maxInlineSize: 260, fontSize: "var(--faun-type-body-sm-font-size)" }}>
      Scope 3 category 1 is 41,820 tCO₂e<CitationMarker citation={citations[0]!} /><CitationMarker citation={citations[1]!} />
    </p>
  );
}

export function Overview() {
  return (
    <div style={{ display: "grid", gap: 16, inlineSize: "min(100%, 560px)" }}>
      <p style={{ margin: 0 }}>
        Purchased goods and services made up 41,820 tCO₂e in FY2025, covering 148 of 163 suppliers by spend
        <CitationMarker citation={citations[0]!} />. Factors follow the 2025 conversion set<CitationMarker citation={citations[1]!} />.
      </p>
      <SourceList aria-label="Sources" citations={citations.slice(0, 2)} />
    </div>
  );
}

export function Marker() {
  return (
    <p style={{ margin: 0 }}>
      March electricity was 112.4 MWh<CitationMarker citation={citations[2]!} />.
    </p>
  );
}

export function LinkedToList() {
  const [active, setActive] = useState<number | undefined>();
  return (
    <div style={{ display: "grid", gap: 16, inlineSize: "min(100%, 560px)" }}>
      <p style={{ margin: 0 }}>
        Spend covers 148 suppliers<CitationMarker citation={citations[0]!} onOpen={(c) => setActive(c.index)} /> and March electricity was 112.4 MWh
        <CitationMarker citation={citations[2]!} onOpen={(c) => setActive(c.index)} />.
      </p>
      <SourceList aria-label="Sources" citations={[citations[0]!, citations[2]!]} activeIndex={active} />
    </div>
  );
}

export function DoCiteTheClaim() {
  return <p style={{ margin: 0 }}>Spend covers 148 suppliers<CitationMarker citation={citations[0]!} />.</p>;
}

export function DontCiteTheParagraph() {
  return <p style={{ margin: 0 }}>Spend covers 148 suppliers, factors follow the 2025 set and March electricity was 112.4 MWh. [1] [2] [3]</p>;
}
