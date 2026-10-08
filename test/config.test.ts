import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/config.js";

const base = {
  PROXMOX_URL: "https://pve.local:8006/",
  PROXMOX_TOKEN_ID: "mcp@pve!homelab",
  PROXMOX_TOKEN_SECRET: "salainen",
};

describe("loadConfig", () => {
  it("lukee asetukset ja poistaa lopun kauttaviivan", () => {
    const config = loadConfig(base);
    expect(config.baseUrl).toBe("https://pve.local:8006");
    expect(config.tokenId).toBe("mcp@pve!homelab");
    expect(config.insecureTls).toBe(false);
  });

  it("tunnistaa PROXMOX_INSECURE_TLS=true", () => {
    expect(loadConfig({ ...base, PROXMOX_INSECURE_TLS: "true" }).insecureTls).toBe(true);
  });

  it("listaa puuttuvat muuttujat", () => {
    expect(() => loadConfig({ PROXMOX_URL: "https://x" })).toThrow(
      "PROXMOX_TOKEN_ID, PROXMOX_TOKEN_SECRET",
    );
  });
});
