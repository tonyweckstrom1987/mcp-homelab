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

  if (!/^https?:\/\//i.test(baseUrl as string)) {
    throw new Error("Invalid PROXMOX_URL: provide a complete HTTPS URL.");
  }

  let proxmoxUrl: URL;
  try {
    proxmoxUrl = new URL(baseUrl as string);
  } catch {
    throw new Error("Invalid PROXMOX_URL: provide a complete HTTPS URL.");
  }

  const allowHttp = (env.PROXMOX_ALLOW_HTTP ?? "").trim().toLowerCase() === "true";
  if (proxmoxUrl.protocol === "http:" && !allowHttp) {
    throw new Error(
      "PROXMOX_URL must use HTTPS. Set PROXMOX_ALLOW_HTTP=true only for trusted isolated networks.",
    );
  }
  if (proxmoxUrl.protocol !== "https:" && proxmoxUrl.protocol !== "http:") {
    throw new Error("Invalid PROXMOX_URL: only HTTPS is supported unless HTTP is explicitly allowed.");
  }

  return {
    baseUrl: (baseUrl as string).replace(/\/+$/, ""),
    tokenId: tokenId as string,
    tokenSecret: tokenSecret as string,
    insecureTls: (env.PROXMOX_INSECURE_TLS ?? "").toLowerCase() === "true",
  };
}
