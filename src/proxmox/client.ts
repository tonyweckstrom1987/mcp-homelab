import { Agent, fetch as undiciFetch } from "undici";
import type { ProxmoxConfig } from "../config.js";

export interface NodeSummary {
  node: string;
  status?: string;
  cpu?: number;
  maxcpu?: number;
  mem?: number;
  maxmem?: number;
  disk?: number;
  maxdisk?: number;
  uptime?: number;
}

export interface ContainerSummary {
  vmid: number;
  name?: string;
  status?: string;
  cpu?: number;
  cpus?: number;
  mem?: number;
  maxmem?: number;
  disk?: number;
  maxdisk?: number;
  uptime?: number;
}

export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; signal?: AbortSignal },
) => Promise<{ ok: boolean; status: number; statusText: string; json(): Promise<unknown> }>;

function defaultFetch(insecureTls: boolean): FetchLike {
  const dispatcher = insecureTls ? new Agent({ connect: { rejectUnauthorized: false } }) : undefined;
  return (url, init) =>
    undiciFetch(url, { ...init, dispatcher }) as unknown as ReturnType<FetchLike>;
}

function describeFetchError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause = err.cause;
  if (cause instanceof Error) {
    const code = (cause as NodeJS.ErrnoException).code;
    return code ? `${cause.message} (${code})` : cause.message;
  }
  return err.message;
}

/**
 * Pieni vain-luku-asiakas Proxmoxin API:lle.
 * Käyttää AINOASTAAN GET-pyyntöjä, joten se ei voi muuttaa palvelimen tilaa.
 */
export class ProxmoxClient {
  private readonly fetchImpl: FetchLike;

  constructor(
    private readonly config: ProxmoxConfig,
    fetchImpl?: FetchLike,
    private readonly timeoutMs = 10_000,
  ) {
    this.fetchImpl = fetchImpl ?? defaultFetch(config.insecureTls);
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${this.config.baseUrl}/api2/json${path}`;
    let response: Awaited<ReturnType<FetchLike>>;
    try {
      response = await this.fetchImpl(url, {
        method: "GET",
        headers: {
          Authorization: `PVEAPIToken=${this.config.tokenId}=${this.config.tokenSecret}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      // undici kätkee todellisen syyn (esim. itse allekirjoitettu sertifikaatti) kenttään `cause`.
      throw new Error(`Yhteys Proxmoxiin epäonnistui (${path}): ${describeFetchError(err)}`);
    }
    if (!response.ok) {
      // Ei sisällytetä pyyntöotsakkeita virheeseen, jotta salaisuus ei vuoda.
      throw new Error(`Proxmox vastasi virheellä ${response.status} ${response.statusText} (${path})`);
    }
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new Error(`Proxmoxin vastaus ei ollut JSON-muotoista (${path})`);
    }
    if (typeof body !== "object" || body === null || !("data" in body) || body.data == null) {
      throw new Error(`Proxmoxin vastauksesta puuttuu data-kenttä (${path})`);
    }
    return body.data as T;
  }

  listNodes(): Promise<NodeSummary[]> {
    return this.get<NodeSummary[]>("/nodes");
  }

  nodeStatus(node: string): Promise<Record<string, unknown>> {
    return this.get<Record<string, unknown>>(`/nodes/${encodeURIComponent(node)}/status`);
  }

  listContainers(node: string): Promise<ContainerSummary[]> {
    return this.get<ContainerSummary[]>(`/nodes/${encodeURIComponent(node)}/lxc`);
  }

  containerStatus(node: string, vmid: number): Promise<ContainerSummary> {
    return this.get<ContainerSummary>(
      `/nodes/${encodeURIComponent(node)}/lxc/${encodeURIComponent(String(vmid))}/status/current`,
    );
  }
}
