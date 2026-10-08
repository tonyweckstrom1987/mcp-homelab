import { describe, it, expect } from "vitest";
import { formatBytes, formatPercent, formatUptime, formatContainer } from "../src/proxmox/format.js";

describe("muotoilu", () => {
  it("muuntaa tavut GiB:ksi", () => {
    expect(formatBytes(1024 ** 3 * 2.5)).toBe("2.5 GiB");
    expect(formatBytes(undefined)).toBe("-");
  });

  it("muuntaa osuuden prosenteiksi", () => {
    expect(formatPercent(0.1234)).toBe("12.3 %");
  });

  it("muotoilee käyntiajan", () => {
    expect(formatUptime(90_000)).toBe("1 pv 1 h");
    expect(formatUptime(3_900)).toBe("1 h 5 min");
    expect(formatUptime(120)).toBe("2 min");
    expect(formatUptime(0)).toBe("-");
  });

  it("muotoilee kontin tiedot", () => {
    const text = formatContainer({ vmid: 100, name: "agent", status: "running", cpu: 0.05, cpus: 2, mem: 1024 ** 3, maxmem: 2 * 1024 ** 3 });
    expect(text).toContain("100 agent (running)");
    expect(text).toContain("Muisti: 1.0 GiB / 2.0 GiB");
  });
});
