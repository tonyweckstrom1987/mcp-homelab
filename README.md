# mcp-homelab

[![CI](https://github.com/tonyweckstrom1987/mcp-homelab/actions/workflows/ci.yml/badge.svg)](https://github.com/tonyweckstrom1987/mcp-homelab/actions/workflows/ci.yml) ![Lisenssi: MIT](https://img.shields.io/badge/lisenssi-MIT-blue.svg)

Vain-luku [MCP](https://modelcontextprotocol.io)-palvelin [Proxmox VE](https://www.proxmox.com/en/proxmox-virtual-environment/overview) -palvelimelle. Sen avulla tekoäly (esim. Claude) voi kysyä, mitkä LXC-kontit pyörivät, mikä on niiden tila ja paljonko ne käyttävät prosessoria, muistia ja levyä.

**English summary:** A read-only MCP server for Proxmox VE. It lets an AI assistant list nodes and LXC containers and read their status and resource usage. It only sends HTTP GET requests, so it cannot start, stop or change anything. Use a Proxmox API token with the `PVEAuditor` role for an extra layer of safety.

**Teknologiat:** TypeScript, Node.js 20/22/24, Model Context Protocol (stdio), Proxmox VE API, vitest. Lisenssi: [LICENSE](./LICENSE).

> **Tila:** Testattu yksikkötesteillä ja simuloidulla Proxmox-rajapinnalla. Oikeaa Proxmox-palvelinta vastaan sitä ei ole vielä kokeiltu.

## Työkalut

| Työkalu | Mitä tekee |
| --- | --- |
| `list_nodes` | Listaa solmut (palvelimet) sekä niiden tilan, prosessorin, muistin ja levyn käytön |
| `node_status` | Palauttaa yhden solmun yksityiskohtaisen tilan JSON-muodossa |
| `list_containers` | Listaa solmun LXC-kontit ja niiden resurssien käytön |
| `container_status` | Palauttaa yhden kontin nykyisen tilan |

## Turvallisuus

- Palvelin lähettää vain GET-pyyntöjä. Yksikään työkalu ei käynnistä, sammuta, luo tai poista mitään.
- Anna silti tokenille vain lukuoikeus (rooli `PVEAuditor`), jotta oikeudet rajoittuvat myös Proxmoxin puolella.
- Tokenin salaisuus annetaan ympäristömuuttujana, eikä sitä kirjata lokeihin tai virheilmoituksiin.

## Proxmoxin valmistelu

Aja Proxmox-palvelimella (solmun komentorivillä):

```bash
pveum user add mcp@pve
pveum user token add mcp@pve homelab --privsep 1
pveum acl modify / --tokens 'mcp@pve!homelab' --roles PVEAuditor
```

Toinen komento tulostaa tokenin salaisuuden vain kerran, joten kopioi se talteen.

## Asennus

```bash
git clone https://github.com/tonyweckstrom1987/mcp-homelab.git
cd mcp-homelab
npm install
npm run build
```

## Asetukset

| Ympäristömuuttuja | Merkitys |
| --- | --- |
| `PROXMOX_URL` | Proxmoxin osoite, esim. `https://192.168.1.10:8006` |
| `PROXMOX_TOKEN_ID` | Tokenin tunniste, esim. `mcp@pve!homelab` |
| `PROXMOX_TOKEN_SECRET` | Tokenin salaisuus |
| `PROXMOX_INSECURE_TLS` | `true`, jos Proxmox käyttää itse allekirjoitettua sertifikaattia (oletus `false`) |

### Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "mcp-homelab": {
      "command": "node",
      "args": ["/POLKU/mcp-homelab/dist/index.js"],
      "env": {
        "PROXMOX_URL": "https://192.168.1.10:8006",
        "PROXMOX_TOKEN_ID": "mcp@pve!homelab",
        "PROXMOX_TOKEN_SECRET": "TÄHÄN_SALAISUUS",
        "PROXMOX_INSECURE_TLS": "true"
      }
    }
  }
}
```

Korvaa `/POLKU/` omalla polullasi.

## Kehitys

```bash
npm test          # vitest
npm run typecheck # tyyppitarkistus
npm run dev       # käynnistys lähdekoodista
```

## Tunnetut rajoitukset

- Tukee toistaiseksi vain LXC-kontteja, ei virtuaalikoneita (QEMU).
- Ei ole kokeiltu oikeaa Proxmox-palvelinta vastaan.
