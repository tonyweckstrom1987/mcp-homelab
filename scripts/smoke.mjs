import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
  env: { ...process.env },
});
const client = new Client({ name: "smoke", version: "0.1.1" });
await client.connect(transport);

const tools = await client.listTools();
console.log("Tyokalut:", tools.tools.map((t) => t.name).join(", "));

const calls = [
  ["list_nodes", {}],
  ["node_status", { node: "agenttifirma" }],
  ["list_containers", { node: "agenttifirma" }],
  ["container_status", { node: "agenttifirma", vmid: 110 }],
];
let hasErrors = false;
for (const [name, args] of calls) {
  const res = await client.callTool({ name, arguments: args });
  console.log("\n==", name, res.isError ? "(VIRHE)" : "(OK)");
  console.log(JSON.stringify(res.content, null, 2).slice(0, 1500));
  hasErrors ||= Boolean(res.isError);
}
await client.close();
if (hasErrors) process.exitCode = 1;
