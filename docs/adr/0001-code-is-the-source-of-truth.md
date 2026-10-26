# 0001 · Code is the source of truth

> Note: this project was previously named Bloom; it is now Faun. See [ADR 0010](0010-rename-to-faun.md).

- Status: accepted
- Date: 2026-10-18

## Context

Most design systems keep a design-tool library as the master and sync code from it. Many products have no design-tool library; their UI is written from specs by coding agents, which is how they accumulate 207 distinct hex values and 40 button recipes. Faun takes no design-tool dependency.

## Decision

Token sources (DTCG JSON) and component code are the only source of truth. Review happens on generated surfaces: the foundations preview, Storybook (from v0.3) and Playwright screenshots. Coding agents read machine-readable outputs (`tokens.json`, `status-map.json`, icon manifest, `AGENTS.md`) instead of interpreting prose.

## Consequences

- No drift between a design file and shipped values.
- Visual review needs tooling: the preview is generated on every build and uploaded by CI.
- Designers contribute through the same PR flow as engineers.
