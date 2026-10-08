---
type: Repository
app: librarysystem-admin
archetype: frontend
version: 9fae4ea
validated: 2026-10-08
update_when: when repo identity, reading order, or maintenance rules change
---

# AGENTS.md - Library System Admin

## Identity
Panel de administración para directivos y bibliotecarios. Gestión de productos, clientes, ventas, créditos, caja, escuelas, usuarios y bots.
Consumidores: administradores, directivos, bibliotecarios.
No hace: operaciones de punto de venta (eso es POS), chat con IA (eso es Bot).

## How to use this repository
Read these guides in order:
1. [overview.md](docs/agent/overview.md) — purpose and capability map.
2. [architecture.md](docs/agent/architecture.md) — layout and request/data flow.
3. [contracts.md](docs/agent/contracts.md) — exposed and consumed interfaces.
4. [runbook.md](docs/agent/runbook.md) — commands and Definition of Done.
5. [traps.md](docs/agent/traps.md) — non-obvious behavior.
6. [DEPLOYMENT_PIPELINE.md](docs/DEPLOYMENT_PIPELINE.md) — flujo develop→staging→prod de este repo + protocolo IA.
7. [STAGING_VALIDATION_CHECKLIST.md](docs/STAGING_VALIDATION_CHECKLIST.md) — gate manual obligatorio antes de promover a producción.

## Maintenance rule
When code changes, update the relevant guide in the same PR. Record new,
non-obvious gotchas in traps.md. Review consumers before breaking a contract.
Add a CHANGELOG.md entry ([Unreleased]) with ticket + PR links in the same PR.