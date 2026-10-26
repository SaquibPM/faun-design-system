import type { ComponentType } from "react";
import type { TabMap } from "../../components/SectionTabs";
import { AgentsPage } from "./Agents";
import { AccessibilityPage } from "./Accessibility";
import { ColourPage } from "./Colour";
import { GridPage } from "./Grid";
import { StatesPage } from "./States";
import { ContentPage } from "./Content";
import { IconsPage } from "./Icons";
import { MotionPage } from "./Motion";
import { ShapePage } from "./Shape";
import { SpacePage } from "./Space";
import { ThemingPage } from "./Theming";
import { TypographyPage } from "./Typography";

export type FoundationEntry = { slug: string; title: string; description: string; Component: ComponentType; tabs?: TabMap };
export const foundationPages: FoundationEntry[] = [
  { slug: "colour", title: "Colour", description: "Twelve-step scales, semantic roles, the interaction matrix, status tones, data visualisation palettes and the contrast contract.", Component: ColourPage, tabs: { overview: ["principles", "scales", "roles", "interaction", "status", "data-viz", "pastel"], accessibility: ["contrast"] } },
  { slug: "typography", title: "Typography", description: "IBM Plex Sans for the interface, IBM Plex Serif for display figures and titles, IBM Plex Mono for identifiers.", Component: TypographyPage, tabs: { overview: ["families", "weights", "roles", "numbers"], usage: ["rules"] } },
  { slug: "space-and-layout", title: "Space and layout", description: "The 4px grid, density modes and the application frame.", Component: SpacePage },
  { slug: "grid", title: "Grid", description: "A 12-column grid that collapses to 8 and 4, with gutters and margins from the space scale.", Component: GridPage, tabs: { overview: ["columns", "spans"], usage: ["rules"] } },
  { slug: "shape-and-elevation", title: "Shape and elevation", description: "Radius by role, five levels of depth, and borders that hold edges in every theme.", Component: ShapePage },
  { slug: "interaction-states", title: "Interaction states", description: "Rest, hover, pressed, selected, focus and disabled across every interactive surface.", Component: StatesPage, tabs: { overview: ["matrix", "disabled"], accessibility: ["focus"] } },
  { slug: "motion", title: "Motion", description: "Quick, directional, calm. Durations, easing curves and springs.", Component: MotionPage, tabs: { overview: ["principles", "curves", "durations"], accessibility: ["accessibility"] } },
  { slug: "iconography", title: "Iconography", description: "One glyph per meaning, drawn on a 24-unit grid with optical stroke weights.", Component: IconsPage },
  { slug: "theming", title: "Theming", description: "Five themes, nesting, modes, and tenant accents generated from a single brand colour.", Component: ThemingPage, tabs: { overview: ["themes", "modes"], code: ["tenant"] } },
  { slug: "agents", title: "Agents and AI", description: "Machine versus human, attribution, confidence and the status vocabulary for agentic work.", Component: AgentsPage, tabs: { overview: ["principles", "machine-human", "attribution", "confidence", "states"], usage: ["components"] } },
  { slug: "accessibility", title: "Accessibility", description: "WCAG 2.2 AA everywhere, AAA contrast in high-contrast themes, and patterns for accessible agentic interfaces.", Component: AccessibilityPage },
  { slug: "content", title: "Content", description: "Voice, mechanics and how to write about what agents do.", Component: ContentPage, tabs: { overview: ["voice", "mechanics"], usage: ["examples", "ai"] } },
];
