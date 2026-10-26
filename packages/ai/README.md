# @faun-ds/ai

> **Status: pre-1.0 (0.1.0).** APIs can change in minor releases. Verified in Chromium only (Firefox and Safari untested). Forced colours are covered by CSS tests, not a real session. No manual screen-reader pass. Many component states have not been reviewed by eye. ESM only. [What is tested and what is not](https://github.com/SaquibPM/faun-design-system/blob/main/docs/STATUS.md)

Components for agentic products, where agents do the work and people steer, review and sign off: `RunTrail`, `ApprovalCard`, `ProvenanceTrail`, `CitationMarker` and `SourceList`, `ConfidenceBadge`, `ActorChip`, `StreamingText`, `PromptComposer`, `AIChatList`, `AIChatMessage`, `ChatLayout`, `ProgressPanel`, `ArtifactPanel`, `AILabel`, `AISlot` and `AIFeedback`.

Part of [Faun](https://github.com/SaquibPM/faun-design-system), an open design system for agentic enterprise software.

## Install

```bash
npm install @faun-ds/ai @faun-ds/react @faun-ds/tokens react react-dom
```

`@faun-ds/react`, `@faun-ds/data`, `@faun-ds/icons` and `@faun-ds/tokens` are installed with it as dependencies. React 18.2 or 19 is a peer dependency.

## Load the styles

After the tokens and the React styles:

```tsx
import "@faun-ds/tokens/css";
import "@faun-ds/tokens/css/base";
import "@faun-ds/react/styles.css";
import "@faun-ds/ai/styles.css";
```

See [`@faun-ds/react`](https://github.com/SaquibPM/faun-design-system/tree/main/packages/react) for fonts, theme and density.

## Use

```tsx
import { useState } from "react";
import { PromptComposer } from "@faun-ds/ai";

export function Ask() {
  const [sent, setSent] = useState("");
  return (
    <>
      <PromptComposer label="Ask the agent" placeholder="Ask about a disclosure" onSend={setSent} />
      {sent ? <p>Sent: {sent}</p> : null}
    </>
  );
}
```

Inputs and outputs in `RunTrail` render as text; redact secrets before they reach the component. Components carry a `"use client"` directive and work in the Next.js App Router. Documentation and live examples: <https://saquibpm.github.io/faun-design-system>.

## License

Apache-2.0
