# Roadmap

Faun is pre-1.0. This page says where the project is heading; [STATUS.md](STATUS.md) says what has and has not been verified today.

## Identity

Faun's visual language is its own ([ADR 0004](adr/0004-faun-identity.md)): warm paper neutrals, a deep moss brand colour, oxblood for danger, lagoon for machine activity, plum for human attention, with IBM Plex Serif for display, IBM Plex Sans for the interface and IBM Plex Mono for identifiers.

IBM Carbon is used as a **structural reference only**: how foundations are organised, how a docs site is laid out and how a repository is run. No Carbon colours, type, radii or components are copied. Faun is not affiliated with or endorsed by IBM.

## Where it stands

- Tokens with a contrast contract checked on every build, five themes and three densities.
- A React component library with data, AI and grid packages, an ESLint plugin and an MCP server.
- A documentation site with foundations, components, patterns and guides.
- A published gap analysis against Carbon: [audit/carbon-parity.md](audit/carbon-parity.md) and [audit/carbon-chart-parity.md](audit/carbon-chart-parity.md).

## Next

Ordered by the priorities in the parity audit (P0 is needed by any product):

1. Close the P0 gaps: inline loading, menu button and combo button, overflow menu, password input, warn and read-only states on form controls, nested side navigation, data table toolbar and single selection.
2. Per-component CSS, so consumers do not pay for one stylesheet per package.
3. Cross-browser coverage (Firefox, WebKit) in CI and a manual screen-reader pass.
4. A 1.0 release once the public API has held for several minor releases.

## How decisions are made

See [GOVERNANCE.md](GOVERNANCE.md) and the architecture decision records in [adr/](adr/).
