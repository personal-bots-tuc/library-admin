---
type: Traps
version: <sha-corto>
validated: 2026-10-05
update_when: when new non-obvious behavior is confirmed
---

# Traps - Library System Admin

## Runtime Config (CRÍTICO)
**Problema**: `VITE_*` variables se inyectan en build-time por Vite, pero Railway inyecta variables en runtime.
**Solución**: Usamos `config.template.js` + `entrypoint.sh` + `envsubst` para generar `config.js` en runtime.
**Evidencia**: `index.html` carga `<script src="/config.js">` ANTES de `<script type="module" src="/src/main.tsx">`.
**App accede**: `window.__ENV__.VITE_API_BASE_URL` (NO `import.meta.env.VITE_API_BASE_URL` en producción).

## Docker Multi-stage
**Problema**: `npm ci` en builder instala devDependencies, pero runtime usa nginx (no node).
**Solución**: Builder compila → copia `dist/` a nginx. No hay node en runtime.
**Verificación**: `docker exec <container> which node` → not found.

## Healthcheck
**Problema**: `wget /` siempre 200 (sirve index.html), aunque app falle en JS.
**Solución**: Endpoint real `/health` servido por nginx (location = /health → return 200 JSON).
**Verificación**: `curl /health` → `{"status":"ok"}` independiente de React.

## SPA Routing + Nginx
**Problema**: Refresh en `/ventas/123` → 404 si nginx no tiene fallback.
**Solución**: `try_files $uri $uri/ /index.html;` en location /.
**Verificación**: `docker run` → refresh en ruta profunda → 200 OK.

## Proxy Dev vs Prod
**Problema**: En dev, `/api` proxy a localhost:3000. En prod, NO hay proxy (nginx sirve estáticos, API en otro dominio).
**Solución**: `vite.config.ts` proxy solo en `mode !== 'production'`.
**Verificación**: Build production → no hay proxy config en dist.

## School Context (Multi-tenant)
**Problema**: `school_id` viene en JWT, pero hooks necesitan contexto reactivo.
**Solución**: `SchoolProvider` decodifica JWT en cliente + `x-school-id` header en axios interceptor.
**Evidencia**: `src/hooks/useSchool.ts` + `src/api/client.ts` interceptor.

## Axios Interceptors
**Problema**: 401 → refresh token → retry request original.
**Solución**: Interceptor response en `src/api/client.ts` con queue para evitar refresh loops.
**Verificación**: Test `useAuth.test.tsx` cubre flujo refresh.

## Tailwind 4 + Vite
**Problema**: Tailwind 4 usa `@import "tailwindcss"` en CSS, no `tailwind.config.js`.
**Solución**: `@tailwindcss/vite` plugin + `@import "tailwindcss"` en `index.css`.
**Evidencia**: `vite.config.ts` plugin + `src/index.css`.

## React 19 + StrictMode
**Problema**: StrictMode monta/desmonta doble en dev → efectos secundarios dobles.
**Solución**: Cleanup functions en useEffect + `AbortController` en fetches.
**Evidencia**: Hooks de data fetching usan AbortController.

## Husky + Commit Message
**Problema**: Commits sin ticket no trazables.
**Solución**: `.husky/commit-msg` valida formato `[TICKET-123]-descripcion`.
**Excepción**: Merge commits y reverts permitidos (validar en regex).

## React Router 7 + Data Loading
**Problema**: React Router 7 usa loaders/actions, pero la app usa hooks para data fetching.
**Solución**: Mantener hooks actuales (`useProducts`, `useClients`, etc.) para consistencia con POS.
**Migración futura**: Evaluar migración a loaders de RR7 cuando haya beneficio claro.

## Test Coverage Thresholds
**Problema**: Umbrales altos (≥80%) pueden fallar con código legacy.
**Solución**: Nuevos archivos deben cumplir umbrales; legacy documentado en `traps.md` con plan de mejora.
**Evidencia**: `vitest.config.ts` thresholds configurados.

## ESLint: regla base `no-unused-vars` vs TypeScript (2026-10-12)
**Problema**: Tener activas `no-unused-vars` (base) y `@typescript-eslint/no-unused-vars` a la vez dispara **falsospositivos** en firmas de tipos TS (`interface { fn: (_x: T) => void }`) que ni `// eslint-disable` ni prefijo `_` apagan.
**Solución**: `no-unused-vars: 'off'` en `eslint.config.js` — la regla TS la reemplaza (recomendación oficial de typescript-eslint).
**Evidencia**: ADMIN-108, warnings persistentes en `src/hooks/useSchool/types.ts` antes del fix.

## Impresión de listados — fetch all y nombre de negocio (2026-10-12)
**Problema (1)**: El print del listado necesita TODOS los productos filtrados, no solo la página actual. **Solución**: `fetchAllProducts` itera páginas con `limit=100` y safety cap de 50 páginas (`utils/printProductsReport.ts`).
**Problema (2)**: Nombre de negocio en impresiones no puede depender de fallbacks locales dispersos. **Solución**: fallback chain único en `useSchool` (`school.name → settings.labelBusinessName → 'Mi Negocio'`). NO usar `school.name` directo en componentes de impresión.
**Evidencia**: `src/hooks/useSchool/index.tsx`, `src/pages/products/ProductsPage.tsx` (botón Imprimir listado).

## `lint:ci` solo linta archivos del último commit
**Problema**: Archivos legacy acumulan errores ESLint invisibles hasta que alguien los toca (falla el propio commit). Regla: quien modifica un archivo errado lo corrige en el mismo cambio.
**Evidencia**: `ProductsPage.tsx` tenía 5 errores pre-existentes (complejidad, `any`, duplicate-imports, setState-in-effect) detectados al agregar el botón de impresión (ADMIN-108).

## Railway Deploy Manual — Environment Link Gotcha (2026-10-08)
**Problema**: `railway up` usa el **environment linkeado por defecto** en el directorio (puede ser `production`), no el que uno asume. Ejecutar `railway up` sin `railway link -e <env>` explícito previo puede deployar a producción accidentalmente (ocurrió en ADMIN-104).
**Solución**: **Siempre** ejecutar `railway link -s <servicio> -e <env> -p <project-id>` antes de `railway up`. Verificar con `railway status -e <env>` que el link apunta al entorno correcto.
**Evidencia**: ADMIN-104 deploy accidental a producción; doc maestro §8 y `docs/DEPLOYMENT_PIPELINE.md` actualizados con procedimiento explícito.

## Preciero/PriceLabels — useAllProducts Loop Limit (2026-10-12)
**Problema**: `useAllProducts` hace loop `limit=100` hasta `totalPages` para traer catálogo completo. Si catálogo >10k productos, la carga inicial puede tardar >5s y consumir memoria.
**Solución**: Para catálogos grandes, evaluar endpoint bulk en backend (`GET /products/bulk?ids=...` o export) y migrar hook. Mientras tanto, hook cachea en memoria durante la sesión.
**Evidencia**: `src/hooks/useAllProducts/index.tsx` + `src/pages/products/PriceLabelsPage/PriceLabelsPage.tsx`.