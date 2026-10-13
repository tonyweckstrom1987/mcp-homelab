import { describe, it, expect, vi } from "vitest";
import { warnIfInsecureTls } from "../src/startup.js";

describe("TLS-varoitus", () => {
  it("kirjoittaa yhden varoituksen TLS-varmennuksen ohituksesta", () => {
    const writeStderr = vi.fn();

    warnIfInsecureTls(true, writeStderr);

    expect(writeStderr).toHaveBeenCalledOnce();
    expect(writeStderr).toHaveBeenCalledWith(expect.stringContaining("TLS"));
  });

  it("ei kirjoita varoitusta kun TLS-varmennusta ei ohiteta", () => {
    const writeStderr = vi.fn();

    warnIfInsecureTls(false, writeStderr);

    expect(writeStderr).not.toHaveBeenCalled();
  });
});
