#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { ProxmoxClient } from "./proxmox/client.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const server = createServer(new ProxmoxClient(config));
  await server.connect(new StdioServerTransport());
}

main().catch((err) => {
  console.error("mcp-homelab käynnistys epäonnistui:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
