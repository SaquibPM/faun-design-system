import { useState } from "react";
import { DescriptionList } from "@faun-ds/react";
import { NOW, actors, approval } from "../../utils/fixtures";
import type { ApprovalRequest } from "../../utils/types";
import { ApprovalCard } from "./ApprovalCard";

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "min(100%, 320px)" }}>
      <ApprovalCard now={NOW} request={{ ...approval, summary: undefined, onApprove: undefined, onReject: undefined }} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "min(100%, 680px)" }}>
      <ApprovalCard now={NOW} request={approval} />
    </div>
  );
}

export function Interactive() {
  const [request, setRequest] = useState<ApprovalRequest>(approval);
  const decide = (state: "approved" | "rejected", comment?: string) =>
    setRequest({ ...request, state, comment, decidedBy: actors.priya, decidedAt: new Date(NOW).toISOString() });
  return (
    <div style={{ inlineSize: "min(100%, 680px)" }}>
      <ApprovalCard
        now={NOW}
        request={request}
        onApprove={() => decide("approved")}
        onReject={(_, comment) => decide("rejected", comment)}
        onRequestChanges={(_, comment) => setRequest({ ...request, comment })}
      />
    </div>
  );
}

export function WithEvidence() {
  return (
    <div style={{ inlineSize: "min(100%, 680px)" }}>
      <ApprovalCard now={NOW} request={approval}>
        <DescriptionList
          items={[
            { term: "Scope 3 category 1", value: "41,820 tCO₂e" },
            { term: "Supplier coverage", value: "148 of 163 by spend" },
            { term: "Estimated share", value: "9% of the total" },
          ]}
        />
      </ApprovalCard>
    </div>
  );
}

export function Approved() {
  return (
    <div style={{ inlineSize: "min(100%, 680px)" }}>
      <ApprovalCard
        now={NOW}
        request={{ ...approval, state: "approved", decidedBy: actors.priya, decidedAt: "2026-10-21T09:16:00Z", comment: "Checked the supplier coverage against the survey. Fine to proceed." }}
      />
    </div>
  );
}

export function Rejected() {
  return (
    <div style={{ inlineSize: "min(100%, 680px)" }}>
      <ApprovalCard
        now={NOW}
        request={{ ...approval, state: "rejected", decidedBy: actors.arjun, decidedAt: "2026-10-21T09:16:00Z", comment: "The boundary excludes the Pune plant. Rerun with all six entities." }}
      />
    </div>
  );
}

export function DoSayWhatHappensNext() {
  return <div style={{ inlineSize: "min(100%, 520px)" }}><ApprovalCard now={NOW} request={approval} /></div>;
}

export function DontHideConsequences() {
  return <div style={{ inlineSize: "min(100%, 520px)" }}><ApprovalCard now={NOW} request={{ ...approval, title: "Please review", summary: undefined, onApprove: undefined, onReject: undefined }} /></div>;
}
