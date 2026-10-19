import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";
import { ProxmoxClient, type FetchLike } from "../src/proxmox/client.js";

const config = { baseUrl: "https://pve.local:8006", tokenId: "t@pve!x", tokenSecret: "s", insecureTls: false, plainHttp: false };

function fakeProxmox(calls: string[] = []): FetchLike {
  return async (url) => {
    const path = url.replace("https://pve.local:8006/api2/json", "");
    calls.push(path);
    const routes: Record<string, unknown> = {
      "/nodes": [{ node: "pve", status: "online", cpu: 0.1, maxcpu: 4, mem: 2 * 1024 ** 3, maxmem: 8 * 1024 ** 3, uptime: 100000 }],
      "/nodes/pve/lxc": [{ vmid: 100, name: "agent-1", status: "running", cpu: 0.02, cpus: 2, mem: 512 * 1024 ** 2, maxmem: 1024 ** 3 }],
      "/nodes/pve/lxc/100/status/current": { vmid: 100, name: "agent-1", status: "running" },
      "/nodes/pve/status": { uptime: 100000 },
    };
    const data = routes[path];
    return {
      ok: data !== undefined,
      status: data !== undefined ? 200 : 404,
      statusText: data !== undefined ? "OK" : "Not Found",
      json: async () => ({ data }),
    };
  };
}

async function connect(calls: string[] = []): Promise<Client> {
  const server = createServer(new ProxmoxClient(config, fakeProxmox(calls)));
  const client = new Client({ name: "test", version: "0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(b), client.connect(a)]);
  return client;
}

function text(result: { content?: unknown }): string {
  return ((result.content as { text?: string }[])[0]?.text) ?? "";
}

describe("MCP-palvelin", () => {
  it("tarjoaa neljä vain-luku-työkalua", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(["container_status", "list_containers", "list_nodes", "node_status"]);
  });

  it("list_nodes näyttää solmun", async () => {
    const client = await connect();
    const result = await client.callTool({ name: "list_nodes", arguments: {} });
    expect(text(result)).toContain("pve (online)");
  });

  it("list_containers näyttää kontin", async () => {
    const client = await connect();
    const result = await client.callTool({ name: "list_containers", arguments: { node: "pve" } });
    expect(text(result)).toContain("100 agent-1 (running)");
  });

  it("container_status palauttaa kontin tilan", async () => {
    const client = await connect();
    const result = await client.callTool({ name: "container_status", arguments: { node: "pve", vmid: 100 } });
    expect(text(result)).toContain("agent-1");
  });

  it("palauttaa virheen kun kontti puuttuu", async () => {
    const client = await connect();
    const result = await client.callTool({ name: "container_status", arguments: { node: "pve", vmid: 999 } });
    expect(result.isError).toBe(true);
    expect(text(result)).toContain("404");
  });

  it.each(["..", "../pve", "pve/node", "pve?node", "pve#node", "pve%2fnode", "-pve", "pve-"])(
    "hylkää virheellisen solmunimen %s ennen API-kutsua",
    async (node) => {
      const calls: string[] = [];
      const client = await connect(calls);
      const requests = [
        { name: "node_status", arguments: { node } },
        { name: "list_containers", arguments: { node } },
        { name: "container_status", arguments: { node, vmid: 100 } },
      ];

      for (const request of requests) {
        const result = await client.callTool(request);
        expect(result.isError).toBe(true);
      }
      expect(calls).toEqual([]);
    },
  );

  it.each([99, 100.5, 1_000_000_000])("hylkää VMID:n %s sallitun alueen ulkopuolella", async (vmid) => {
    const calls: string[] = [];
    const client = await connect(calls);
    const result = await client.callTool({
      name: "container_status",
      arguments: { node: "pve", vmid },
    });

    expect(result.isError).toBe(true);
    expect(calls).toEqual([]);
  });
});
