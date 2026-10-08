import { describe, it, expect } from "vitest";
import { ProxmoxClient, type FetchLike } from "../src/proxmox/client.js";

const config = {
  baseUrl: "https://pve.local:8006",
  tokenId: "mcp@pve!homelab",
  tokenSecret: "salainen",
  insecureTls: false,
};

function mockFetch(data: unknown, status = 200) {
  const calls: { url: string; method: string; headers: Record<string, string> }[] = [];
  const fn: FetchLike = async (url, init) => {
    calls.push({ url, method: init.method, headers: init.headers });
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? "OK" : "Virhe",
      json: async () => ({ data }),
    };
  };
  return { fn, calls };
}

describe("ProxmoxClient", () => {
  it("käyttää vain GET-pyyntöjä ja lähettää tokenin otsakkeessa", async () => {
    const { fn, calls } = mockFetch([{ node: "pve" }]);
    const client = new ProxmoxClient(config, fn);
    await client.listNodes();
    await client.listContainers("pve");
    await client.containerStatus("pve", 100);
    await client.nodeStatus("pve");
    expect(calls.map((c) => c.method)).toEqual(["GET", "GET", "GET", "GET"]);
    expect(calls[0]?.headers.Authorization).toBe("PVEAPIToken=mcp@pve!homelab=salainen");
  });

  it("kutsuu oikeita polkuja", async () => {
    const { fn, calls } = mockFetch({});
    const client = new ProxmoxClient(config, fn);
    await client.listNodes();
    await client.listContainers("pve");
    await client.containerStatus("pve", 101);
    expect(calls.map((c) => c.url)).toEqual([
      "https://pve.local:8006/api2/json/nodes",
      "https://pve.local:8006/api2/json/nodes/pve/lxc",
      "https://pve.local:8006/api2/json/nodes/pve/lxc/101/status/current",
    ]);
  });

  it("heittää virheen ilman salaisuutta kun Proxmox vastaa virheellä", async () => {
    const { fn } = mockFetch(null, 401);
    const client = new ProxmoxClient(config, fn);
    await expect(client.listNodes()).rejects.toThrow("401");
    await expect(client.listNodes()).rejects.not.toThrow("salainen");
  });
});
