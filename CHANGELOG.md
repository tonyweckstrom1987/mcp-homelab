# Changelog

## [Julkaisematon]
- Korjaukset yöjonon koodikatselmoinnin (19.10.2026) löydöksistä:
  - Varoitus käynnistyksessä, kun `PROXMOX_ALLOW_HTTP=true` ja osoite on `http:` (token kulkee selkotekstinä).
  - Verkko- ja TLS-virheet näyttävät todellisen syyn (esim. `self-signed certificate`) eikä pelkkää `fetch failed`.
  - Proxmoxin vastaus validoidaan: ei-JSON ja puuttuva `data` antavat selkeän virheen.
  - `PROXMOX_URL` jäsennetään `URL`-oliolla; kysely, osa (`#`) ja tunnukset osoitteessa hylätään käynnistyksessä. Kuollut koodi poistettu.
  - `PROXMOX_INSECURE_TLS` trimmataan kuten `PROXMOX_ALLOW_HTTP`.
  - Julkaisutyönkulku: tagin nimi annetaan ympäristömuuttujana (ei shell-injektiota) ja tagin on vastattava `package.json`-versiota.
  - GitHub Actions kiinnitetty commit-tarkisteeseen; `mcp-doctor` päivitetty versioon 0.3.0.
- Päivitetty vitest 5:een (korjaa kehitysriippuvuuksien npm audit -löydökset).
- Node.js 20 poistettu tuettujen versioiden listalta (vitest 5 vaatii Node 22.12+).

## [0.1.1] - 2026-10-12

### Added
- Testattu oikealla Proxmox VE 9.2 -palvelimella PVEAuditor-tokenilla Tailscale HTTPS -yhteyden kautta; kaikki neljä MCP-työkalua toimivat.
- Lisätty ohje MCP-asiakkaan `env`-asetuksista sekä smoke-testi oikeaa Proxmoxia vastaan.

## [0.1.0] - 2026-10-12

First working version.

### Added
- Vain-luku-MCP-palvelin, jolla voi tarkastella Proxmoxin solmuja ja LXC-konttien tilaa sekä resurssien käyttöä.
- Asetukset lukevat Proxmox-yhteystiedot ympäristömuuttujista, ja asiakas hoitaa todennetut API-pyynnöt.
- Yksikkötestit varmistavat asetusten tarkistuksen, tietojen muotoilun, Proxmox-pyynnöt ja MCP-palvelimen työkalut sekä virhetilanteet.
- CI-työnkulku ajaa tyyppitarkistuksen, koonnin ja testit jokaisella pushilla ja pull requestilla kolmella Node.js-versiolla, jotta virheet havaitaan ennen muutosten yhdistämistä.
- Julkaisutyönkulku tekee GitHub-julkaisun `v*`-versiotagin pushista ja luo julkaisutiedot automaattisesti onnistuneiden tarkistusten jälkeen.
