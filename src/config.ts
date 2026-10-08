export interface ProxmoxConfig {
  /** Proxmoxin osoite, esim. https://192.168.1.10:8006 */
  baseUrl: string;
  /** API-tokenin tunniste muodossa käyttäjä@realmi!tokenin-nimi, esim. mcp@pve!homelab */
  tokenId: string;
  /** API-tokenin salaisuus (UUID). Älä kirjaa lokeihin. */
  tokenSecret: string;
  /** Sallii itse allekirjoitetun TLS-sertifikaatin (Proxmoxin oletus). */
  insecureTls: boolean;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ProxmoxConfig {
  const baseUrl = env.PROXMOX_URL?.trim();
  const tokenId = env.PROXMOX_TOKEN_ID?.trim();
  const tokenSecret = env.PROXMOX_TOKEN_SECRET?.trim();

  const missing: string[] = [];
  if (!baseUrl) missing.push("PROXMOX_URL");
  if (!tokenId) missing.push("PROXMOX_TOKEN_ID");
  if (!tokenSecret) missing.push("PROXMOX_TOKEN_SECRET");
  if (missing.length > 0) {
    throw new Error(`Puuttuvat ympäristömuuttujat: ${missing.join(", ")}`);
  }

  return {
    baseUrl: (baseUrl as string).replace(/\/+$/, ""),
    tokenId: tokenId as string,
    tokenSecret: tokenSecret as string,
    insecureTls: (env.PROXMOX_INSECURE_TLS ?? "").toLowerCase() === "true",
  };
}
