# 0004 · Faun has its own identity

> Note: this project was previously named Bloom; it is now Faun. See [ADR 0010](0010-rename-to-faun.md).

- Status: accepted
- Date: 2026-10-18

## Decision

Faun's identity is its own: warm paper neutrals, moss brand, oxblood danger, lagoon machine, plum human; IBM Plex Serif, IBM Plex Sans, IBM Plex Mono.

- **Type:** IBM Plex Serif (display) and IBM Plex Sans (UI), with IBM Plex Mono for identifiers. All three are OFL, so the open-source repo can recommend them freely. (Amended by [ADR 0009](0009-ibm-plex-and-moss-sidebar.md): the original choice was Newsreader, Inter and JetBrains Mono.)
- **Colour:** the moss brand (#3e4c3a → `moss.800` #3a4e35), oxblood danger, ochre, sage and slate hues and the warm paper neutrals are the anchors for the generated ramps. Lagoon marks machine activity and plum marks work waiting on a person.
- **Accessibility:** muted text meets 4.5:1 (`text.tertiary`), controls carry a 3:1 border, framework tags are neutral, and full dark, high-contrast and print themes ship with the system.

## Consequences

- One recognisable visual language across every product built on Faun, with no second identity to maintain.
- Products with an existing look adopt Faun in stages (see the guide "Adopting Faun in an existing product") by mapping their legacy variables with their own bridge.
