# Changelog

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
