import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { FaunData } from "./types.js";

/** Where the generated dataset lives: next to dist, or wherever FAUN_MCP_DATA points. */
export function defaultDataPath(): string {
  return process.env.FAUN_MCP_DATA ?? fileURLToPath(new URL("../data/faun.json", import.meta.url));
}

/** Parses and sanity-checks the dataset. Throws a message that says how to regenerate it. */
export function parseData(json: string): FaunData {
  let data: Partial<FaunData>;
  try {
    data = JSON.parse(json);
  } catch (e) {
    throw new Error(`Faun MCP data is not valid JSON: ${(e as Error).message}`);
  }
  if (data.schema !== 1 || !Array.isArray(data.components) || !Array.isArray(data.tokens) || !Array.isArray(data.icons) || !data.statusMap) {
    throw new Error("Faun MCP data has an unexpected shape. Rebuild it with `pnpm --filter @faun-ds/mcp data`.");
  }
  return data as FaunData;
}

export function loadData(path = defaultDataPath()): FaunData {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    throw new Error(`Faun MCP data not found at ${path}. Build it with \`pnpm --filter @faun-ds/mcp data\`.`);
  }
  return parseData(text);
}
