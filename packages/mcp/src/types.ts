export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  default: string | null;
  description: string;
}

export interface ExampleInfo {
  ref: string | null;
  title: string | null;
  description: string | null;
  code: string;
}

export interface ComponentData {
  /** Display name from the docs page, e.g. "Icon button". */
  name: string;
  /** Source folder, e.g. "IconButton". */
  folder: string;
  slug: string;
  package: string;
  category: string;
  status: string;
  description: string;
  related: string[];
  /** Exported component names documented on the page, e.g. ["Dialog", "DialogContent"]. */
  exports: string[];
  props: Record<string, { description: string; props: PropInfo[] }>;
  tokens: string[];
  componentTokens: string[];
  examples: ExampleInfo[];
  /** The docs page as Markdown. */
  docs: string;
}

export interface TokenData {
  name: string;
  /** Null for composite tokens such as type roles, which are exposed as classes. */
  cssVar: string | null;
  type: string;
  category: string;
  description: string | null;
  /** Per-theme values for colour tokens. */
  values?: Record<string, string>;
  /** Single value for non-themed tokens; an object for composite tokens (typography). */
  value?: string | Record<string, unknown>;
}

export interface StatusState {
  tone: string;
  icon: string;
  label: string;
}

export interface StatusMapData {
  $description?: string;
  tones: Record<string, { icon: string; meaning: string }>;
  domains: Record<string, Record<string, StatusState | string>>;
}

export interface IconData {
  name: string;
  component: string;
  category: string;
  keywords: string[];
  source?: string;
}

export interface FaunData {
  schema: 1;
  name: string;
  version: string;
  prefix: string;
  themes: string[];
  components: ComponentData[];
  tokens: TokenData[];
  statusMap: StatusMapData;
  icons: IconData[];
}

export type Result<T> = ({ ok: true } & T) | { ok: false; error: string; suggestions: string[] };
