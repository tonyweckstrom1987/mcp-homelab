export function warnIfInsecureTls(
  insecureTls: boolean,
  writeStderr: (message: string) => void = (message) => {
    process.stderr.write(message);
  },
): void {
  if (insecureTls) {
    writeStderr(
      "VAROITUS: PROXMOX_INSECURE_TLS=true ohittaa TLS-varmenteen tarkistuksen; yhteys voidaan siepata.\n",
    );
  }
}
