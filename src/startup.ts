type WriteStderr = (message: string) => void;

const defaultWrite: WriteStderr = (message) => {
  process.stderr.write(message);
};

export function warnIfInsecureTls(insecureTls: boolean, writeStderr: WriteStderr = defaultWrite): void {
  if (insecureTls) {
    writeStderr(
      "VAROITUS: PROXMOX_INSECURE_TLS=true ohittaa TLS-varmenteen tarkistuksen; yhteys voidaan siepata.\n",
    );
  }
}

export function warnIfPlainHttp(plainHttp: boolean, writeStderr: WriteStderr = defaultWrite): void {
  if (plainHttp) {
    writeStderr(
      "VAROITUS: PROXMOX_URL käyttää salaamatonta HTTP:tä; API-token kulkee verkossa selkotekstinä.\n",
    );
  }
}
