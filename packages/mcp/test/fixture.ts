import type { FaunData } from "../src/types.js";

/** A small dataset shaped like the generated one. */
export const fixture: FaunData = {
  schema: 1,
  name: "Faun Design System",
  version: "0.0.0-test",
  prefix: "faun",
  themes: ["light", "dark"],
  components: [
    {
      name: "Button", folder: "Button", slug: "button", package: "@faun-ds/react", category: "Actions", status: "stable",
      description: "Triggers an action.", related: ["icon-button"], exports: ["Button"],
      props: { Button: { description: "A button.", props: [{ name: "intent", type: '"accent" | "neutral" | "danger"', required: false, default: "neutral", description: "Colour intent." }] } },
      tokens: ["accent.solid-bg"], componentTokens: ["button"],
      examples: [
        { ref: "Button/Overview", title: null, description: null, code: "function Overview() { return <Button>Run</Button>; }" },
        { ref: "Button/Intents", title: "Intents", description: "Three intents.", code: "function Intents() { return null; }" },
      ],
      docs: "### Usage\n\nUse a button to start an action.",
    },
    {
      name: "Icon button", folder: "IconButton", slug: "icon-button", package: "@faun-ds/react", category: "Actions", status: "stable",
      description: "A square button with only an icon.", related: ["button"], exports: ["IconButton"],
      props: { IconButton: { description: "", props: [{ name: "label", type: "string", required: true, default: null, description: "Required accessible name." }] } },
      tokens: [], componentTokens: [], examples: [], docs: "### Usage\n\nAlways labelled.",
    },
    {
      name: "Dialog", folder: "Dialog", slug: "dialog", package: "@faun-ds/react", category: "Overlays", status: "stable",
      description: "A modal window.", related: [], exports: ["Dialog", "DialogContent", "DialogTrigger"],
      props: {}, tokens: [], componentTokens: [], examples: [], docs: "",
    },
    {
      name: "Run trail", folder: "RunTrail", slug: "run-trail", package: "@faun-ds/ai", category: "AI and agents", status: "new",
      description: "The steps an agent took.", related: [], exports: ["RunTrail"],
      props: {}, tokens: [], componentTokens: [], examples: [], docs: "",
    },
  ],
  tokens: [
    { name: "fg.muted", cssVar: "--faun-fg-muted", type: "color", category: "fg", description: "Secondary text.", values: { light: "#5c5a55", dark: "#a9a7a0" } },
    { name: "fg.default", cssVar: "--faun-fg-default", type: "color", category: "fg", description: "Primary text.", values: { light: "#1c1b19", dark: "#f2f1ef" } },
    { name: "bg.surface", cssVar: "--faun-bg-surface", type: "color", category: "bg", description: "Cards and panels.", values: { light: "#fbfaf8", dark: "#1a1a18" } },
    { name: "danger.solid-bg", cssVar: "--faun-danger-solid-bg", type: "color", category: "danger", description: "Destructive fill.", values: { light: "#7a1f1f", dark: "#c46060" } },
    { name: "space.4", cssVar: "--faun-space-4", type: "dimension", category: "space", description: null, value: "16px" },
    { name: "radius.md", cssVar: "--faun-radius-md", type: "dimension", category: "radius", description: "Buttons and inputs.", value: "9px" },
  ],
  statusMap: {
    $description: "Domain states.",
    tones: {
      neutral: { icon: "status-neutral", meaning: "Not started." },
      running: { icon: "status-running", meaning: "An agent is executing now." },
      attention: { icon: "status-attention", meaning: "Waiting on a person." },
      danger: { icon: "status-danger", meaning: "Failed." },
    },
    domains: {
      run: {
        $description: "Agent run states.",
        pending: { tone: "neutral", icon: "status-pending", label: "Pending" },
        running: { tone: "running", icon: "status-running", label: "Running" },
        awaiting_approval: { tone: "attention", icon: "status-attention", label: "Awaiting approval" },
        failed: { tone: "danger", icon: "status-danger", label: "Failed" },
      },
      "data-quality": {
        actual: { tone: "neutral", icon: "status-neutral", label: "Actual" },
      },
    },
  },
  icons: [
    { name: "home", component: "IconHome", category: "navigation", keywords: ["home", "building", "residence"] },
    { name: "delete", component: "IconDelete", category: "actions", keywords: ["trash", "bin", "remove"] },
    { name: "download", component: "IconDownload", category: "actions", keywords: ["save", "export"] },
    { name: "chevron-down", component: "IconChevronDown", category: "navigation", keywords: ["expand", "arrow"] },
    { name: "chevron-up", component: "IconChevronUp", category: "navigation", keywords: ["collapse", "arrow"] },
  ],
};
