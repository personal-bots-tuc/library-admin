# Checklist Validación Staging — Admin (library-admin)

**Ejecutar SIEMPRE antes de crear el PR `develop` → `main`.**
**Obligatorio para humanos e IAs. Sin este checklist completo NO se promueve a producción.**

**URL staging:** https://library-admin-staging.up.railway.app
**URL producción:** https://library-admin-prod.up.railway.app

## Pre-requisitos automáticos
- [x] CI verde en `develop` (lint-test-typecheck)
- [x] Workflow `Smoke Tests Staging` verde
- [x] Deploy en Railway muestra "Success" (environment: staging)

## Validaciones manuales
| # | Check | Cómo validar | Criterio | OK |
|---|-------|--------------|----------|----|
| 1 | Home carga | Abrir URL staging | 200, sin 5xx, HTML carga | [x] |
| 2 | Config runtime | DevTools → ver `config.js` o `/config.js` | `VITE_API_BASE_URL` apunta a **staging** (api-core-system-staging) | [x] |
| 3 | Health endpoint | `curl https://library-admin-staging.up.railway.app/health` | `{"status":"ok"}` | [x] |
| 4 | Navegación SPA | Click en 3 rutas internas (ej. dashboard, lista, detalle) | Sin 404, sin recarga completa de página | [x] |
| 5 | Login | Flujo login con credenciales de prueba | Token OK, redirige al dashboard | [x] |
| 6 | Llamada API real | Listado que consuma API staging | Datos cargan, 200 en Network | [x] |
| 7 | Consola limpia | DevTools → Console | Sin errores JS críticos (rojos) | [x] |
| 8 | Refresh en ruta profunda | F5 estando en una ruta interna | No da 404 (fallback SPA OK) | [x] |

## Decisión
- [x] **APROBADO** → crear PR `develop` → `main` (template de release)
- [ ] **RECHAZADO** → documentar en issue/comentario, fixear en rama nueva, repetir

**Ejecutado por (humano/IA):** arieltecay (login, navegación y consola) + agente IA (checks HTTP automatizados)  **Fecha:** 2026-10-21  **Commit develop:** 92dcca6
