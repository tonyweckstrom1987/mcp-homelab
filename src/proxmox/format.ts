import type { ContainerSummary, NodeSummary } from "./client.js";

const GIB = 1024 ** 3;

export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return "-";
  return `${(bytes / GIB).toFixed(1)} GiB`;
}

export function formatPercent(fraction: number | undefined): string {
  if (fraction === undefined) return "-";
  return `${(fraction * 100).toFixed(1)} %`;
}

export function formatUptime(seconds: number | undefined): string {
  if (seconds === undefined || seconds <= 0) return "-";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days} pv ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
}

export function formatNode(n: NodeSummary): string {
  return [
    `${n.node} (${n.status ?? "tuntematon"})`,
    `  CPU: ${formatPercent(n.cpu)} (${n.maxcpu ?? "-"} ydintä)`,
    `  Muisti: ${formatBytes(n.mem)} / ${formatBytes(n.maxmem)}`,
    `  Levy: ${formatBytes(n.disk)} / ${formatBytes(n.maxdisk)}`,
    `  Käynnissä: ${formatUptime(n.uptime)}`,
  ].join("\n");
}

export function formatContainer(c: ContainerSummary): string {
  return [
    `${c.vmid} ${c.name ?? "(nimetön)"} (${c.status ?? "tuntematon"})`,
    `  CPU: ${formatPercent(c.cpu)} (${c.cpus ?? "-"} ydintä)`,
    `  Muisti: ${formatBytes(c.mem)} / ${formatBytes(c.maxmem)}`,
    `  Levy: ${formatBytes(c.disk)} / ${formatBytes(c.maxdisk)}`,
    `  Käynnissä: ${formatUptime(c.uptime)}`,
  ].join("\n");
}
