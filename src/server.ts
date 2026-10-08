import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ProxmoxClient } from "./proxmox/client.js";
import { formatContainer, formatNode } from "./proxmox/format.js";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function ok(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function fail(err: unknown) {
  return { isError: true, content: [{ type: "text" as const, text: errorMessage(err) }] };
}

/**
 * Rakentaa MCP-palvelimen, jossa on neljä vain-luku-työkalua Proxmoxille.
 * Yksikään työkalu ei käynnistä, sammuta tai muuta mitään.
 */
export function createServer(client: ProxmoxClient): McpServer {
  const server = new McpServer({ name: "mcp-homelab", version: "0.1.0" });

  server.registerTool(
    "list_nodes",
    {
      title: "Listaa solmut",
      description: "Listaa Proxmox-klusterin solmut (palvelimet) sekä niiden tilan ja resurssien käytön.",
      inputSchema: {},
    },
    async () => {
      try {
        const nodes = await client.listNodes();
        return ok(nodes.length === 0 ? "Ei solmuja." : nodes.map(formatNode).join("\n\n"));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "node_status",
    {
      title: "Solmun tila",
      description: "Palauttaa yhden solmun yksityiskohtaisen tilan JSON-muodossa.",
      inputSchema: { node: z.string().min(1).describe("Solmun nimi, esim. 'pve'") },
    },
    async ({ node }) => {
      try {
        return ok(JSON.stringify(await client.nodeStatus(node), null, 2));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "list_containers",
    {
      title: "Listaa LXC-kontit",
      description: "Listaa solmun LXC-kontit, niiden tilan sekä prosessorin, muistin ja levyn käytön.",
      inputSchema: { node: z.string().min(1).describe("Solmun nimi, esim. 'pve'") },
    },
    async ({ node }) => {
      try {
        const containers = await client.listContainers(node);
        return ok(containers.length === 0 ? "Ei LXC-kontteja." : containers.map(formatContainer).join("\n\n"));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "container_status",
    {
      title: "Kontin tila",
      description: "Palauttaa yhden LXC-kontin nykyisen tilan ja resurssien käytön.",
      inputSchema: {
        node: z.string().min(1).describe("Solmun nimi, esim. 'pve'"),
        vmid: z.number().int().positive().describe("Kontin numero (VMID), esim. 100"),
      },
    },
    async ({ node, vmid }) => {
      try {
        return ok(formatContainer(await client.containerStatus(node, vmid)));
      } catch (err) {
        return fail(err);
      }
    },
  );

  return server;
}
