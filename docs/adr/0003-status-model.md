# 0003 · Seven status tones

> Note: this project was previously named Bloom; it is now Faun. See [ADR 0010](0010-rename-to-faun.md).

- Status: accepted
- Date: 2026-10-18

## Context

Products commonly fold dozens of status strings into five colours through a regex fallback, and lifecycle enums disagree. Agentic products have two states generic systems lack: an agent working right now, and work waiting on a person.

## Decision

Seven tones: `neutral`, `info`, `success`, `warning`, `danger`, `running`, `attention`.

- `running` (lagoon) is only for machine execution in progress, paired with the pulse motion token.
- `attention` (plum) is only for work waiting on a person: approvals, reviews, sign-off.
- Each tone has five tokens: `fg`, `bg`, `border`, `solid`, `on-solid`, all in the contrast contract.
- `status-map.json` maps every domain state (lifecycle, task, run, progress, approval, data quality) to a tone, an icon and a label. Products extend the map; they do not add tones.

## Consequences

- Status always renders with an icon and a label.
- "Blocked" and "deprecated" are `warning`, not `danger`: they need action, not alarm. `danger` is for failure, rejection and missing data.
