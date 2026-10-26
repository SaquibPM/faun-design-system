import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../src/server.js";
import { fixture } from "./fixture.js";

let client: Client;

beforeAll(async () => {
  const [a, b] = InMemoryTransport.createLinkedPair();
  await createServer(fixture).connect(a);
  client = new Client({ name: "test", version: "0" });
  await client.connect(b);
});
afterAll(async () => { await client.close(); });

const call = async (name: string, args: Record<string, unknown> = {}) => {
  const r = (await client.callTool({ name, arguments: args })) as { isError?: boolean; content: Array<{ type: string; text: string }> };
  return { isError: !!r.isError, body: JSON.parse(r.content[0]!.text) };
};

describe("faun MCP server", () => {
  it("registers the five tools as read-only", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(["get_component", "get_status_map", "list_components", "resolve_icon", "search_tokens"]);
    expect(tools.every((t) => t.annotations?.readOnlyHint === true)).toBe(true);
    expect(tools.find((t) => t.name === "get_component")!.inputSchema.required).toEqual(["name"]);
  });

  it("list_components", async () => {
    const { body } = await call("list_components", { category: "Actions" });
    expect(body.count).toBe(2);
    expect(body.components[0].name).toBe("Button");
  });

  it("get_component returns the component, and an error with suggestions on a miss", async () => {
    const ok = await call("get_component", { name: "icon-button" });
    expect(ok.isError).toBe(false);
    expect(ok.body.component.props.IconButton.props[0].required).toBe(true);
    const miss = await call("get_component", { name: "Buton" });
    expect(miss.isError).toBe(true);
    expect(miss.body.suggestions).toContain("Button");
  });

  it("search_tokens", async () => {
    const { body } = await call("search_tokens", { query: "muted" });
    expect(body.tokens[0].cssVar).toBe("--faun-fg-muted");
  });

  it("get_status_map with and without a domain", async () => {
    expect((await call("get_status_map", { domain: "run" })).body.map.states).toHaveLength(4);
    expect((await call("get_status_map")).body.map.domains).toHaveLength(2);
    const miss = await call("get_status_map", { domain: "zzz" });
    expect(miss.isError).toBe(true);
    expect(miss.body.suggestions).toEqual(["run", "data-quality"]);
  });

  it("resolve_icon", async () => {
    const { body } = await call("resolve_icon", { name: "trash" });
    expect(body.icon.component).toBe("IconDelete");
    expect((await call("resolve_icon", { name: "qqqqqqqq" })).isError).toBe(true);
  });

  it("rejects invalid input", async () => {
    await expect(client.callTool({ name: "search_tokens", arguments: { query: "" } })).resolves.toMatchObject({ isError: true });
  });
});
