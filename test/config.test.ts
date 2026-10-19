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

  it("vaatii HTTPS-osoitteen oletuksena", () => {
    expect(() => loadConfig({ ...base, PROXMOX_URL: "http://pve.local:8006" })).toThrow(
      "PROXMOX_URL must use HTTPS",
    );
  });

  it("sallii HTTP:n vain nimenomaisella PROXMOX_ALLOW_HTTP-asetuksella", () => {
    expect(() => loadConfig({ ...base, PROXMOX_URL: "http://pve.local:8006" })).toThrow(
      "PROXMOX_ALLOW_HTTP=true",
    );
    expect(
      loadConfig({
        ...base,
        PROXMOX_URL: "http://pve.local:8006",
        PROXMOX_ALLOW_HTTP: "true",
      }).baseUrl,
    ).toBe("http://pve.local:8006");
  });

  it.each(["not-a-url", "ftp://pve.local:8006", "https:/pve.local:8006"])(
    "hylkää virheellisen tai tukemattoman Proxmox URL:n %s",
    (url) => {
      expect(() => loadConfig({ ...base, PROXMOX_URL: url })).toThrow("Invalid PROXMOX_URL");
    },
  );

  it("listaa puuttuvat muuttujat", () => {
    expect(() => loadConfig({ PROXMOX_URL: "https://x" })).toThrow(
      "PROXMOX_TOKEN_ID, PROXMOX_TOKEN_SECRET",
    );
  });

  it("tunnistaa PROXMOX_INSECURE_TLS=true myös ympäröivien välilyöntien kanssa", () => {
    expect(loadConfig({ ...base, PROXMOX_INSECURE_TLS: " true " }).insecureTls).toBe(true);
  });

  it("merkitsee salaamattoman http:n (plainHttp) ja https:n ei", () => {
    expect(loadConfig(base).plainHttp).toBe(false);
    expect(
      loadConfig({ ...base, PROXMOX_URL: "http://pve.local:8006", PROXMOX_ALLOW_HTTP: "true" }).plainHttp,
    ).toBe(true);
  });

  it.each([
    "https://pve.local:8006/?x=1",
    "https://pve.local:8006/#osa",
    "https://kayttaja:salasana@pve.local:8006",
  ])("hylkää osoitteen, jossa on kysely, osa tai tunnukset: %s", (url) => {
    expect(() => loadConfig({ ...base, PROXMOX_URL: url })).toThrow("Invalid PROXMOX_URL");
  });

  it("säilyttää käänteisen välityspalvelimen polun ja poistaa lopun kauttaviivat", () => {
    expect(loadConfig({ ...base, PROXMOX_URL: "https://host.example/pve//" }).baseUrl).toBe(
      "https://host.example/pve",
    );
  });
});
