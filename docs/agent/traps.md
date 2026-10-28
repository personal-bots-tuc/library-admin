---
type: Traps
version: <sha-corto>
validated: 2026-10-27
update_when: when new non-obvious behavior is confirmed
---

# Traps - Library System Admin

## Bootstrap anónimo + interceptor 401 = bucle de recarga (2026-10-13)
**Problema**: Un provider global montado en `main.tsx` (ej. `SchoolProvider`, que envuelve también `/login`) fetcheó un endpoint protegido (`GET /settings`, `authMiddleware + requireAdmin`) sin sesión → 401 → interceptor de axios ejecutaba `window.location.href = '/login'` (recarga dura aun estando en `/login`) → remount del provider → refetch → **loop infinito que impedía loguearse**.
**Solución**: (1) fetches de bootstrap gateados con `useAuth` (`isAuthenticated`) dentro del provider; (2) el interceptor 401 no limpia storage ni redirige si `window.location.pathname === '/login'`.
**Regla**: ningún fetch a endpoint protegido puede dispararse en bootstrap sin sesión. Si se necesita "branding público" pre-login (ej. nombre del negocio en `/login`), requiere un endpoint público en backend que exponga solo campos no sensibles.
**Evidencia**: ADMIN-109 — `src/hooks/useSchool/index.tsx`, `src/api/client.ts` + tests.

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
## Polling, cache local y costos Railway (ADMIN-111, 2026-10-13)
**Problema**: `MessagesPage` corría 2×`setInterval` de 8s sin importar visibilidad (~900 req/hora/tab en background), bloqueando App Sleep.
**Reglas vigentes** (mismas que POS — mantener alineadas):
1. **PROHIBIDO `setInterval` para refetch fuera de `src/hooks/useSyncGate.ts`** — CI falla (`npm run guardrails`).
2. Queries de lectura estable se persisten en IndexedDB namespaced `schoolId:userId` (whitelist `shouldPersistQuery`: `products`, `school`). Volátiles (conversaciones del bot, ventas, caja) NUNCA se persisten.
3. La bandeja del bot usa backoff 8s→60s cuando la firma de la lista no cambia + compuertas; pause/resume/reply invalidan queries (push-like inmediato) en vez de esperar el próximo tick — ojo: NO confundir `refetchInterval` con polling manual.
4. **Sin health-pings de conectividad** (badge pasivo). Un ping rompe App Sleep.
5. Service Worker hand-rolled (`public/sw.js`): passthrough obligatorio de `/config.js` (inyección runtime de VITE_API_BASE_URL), `/health`, `/api/*`. Update de versión solo con confirmación del usuario.
6. Si el 401 del interceptor fuerza logout, el cache persistido NO se purga en ese path (bootstrap redirect); se evita fuga de datos entre usuarios porque el namespace incluye `userId` — un usuario distinto nunca hidrata el store del anterior.

## IndexedDB: object stores NO se crean en runtime (ADMIN-112, 2026-10-14)
**Problema**: `idb-keyval` `createStore(db, name)` crea el store SOLO en
`onupgradeneeded` (primera apertura de la DB con ese schema). Un store por
namespace (`rq-anon` en login, `rq-<school>:<user>` post-login) explotaba en el
segundo namespace con `NotFoundError: object store not found` en cada persistencia
— y las rejection no se capturaban → errores "fantasma" en consola.
**Regla**: IndexedDB usa UN store fijo y los namespaces van en el PREFIJO de la key
(`admin-query:<schoolId>:<userId>`). Al cambiar la forma de la DB, NO intentar
upgrades: renombrar la DB (`*-v2`) y borrar la legacy (best-effort).
**Evidencia**: `src/lib/persistence.ts`, regression test multi-namespace en
`src/lib/persistence.test.ts`.

## Valor de contexto sin memo re-dispara efectos que dependen de una función del contexto (2026-10-28)
**Problema**: `ToastProvider` construía el objeto `value` en cada render, así que `error`/`success` cambiaban de identidad en cada render del provider. Un `useEffect` de carga que tenía `showError` como dependencia, al fallar mostraba un toast → el provider re-renderiza → nueva identidad → el efecto vuelve a pedir la lista → falla de nuevo → bucle de requests (`ClientsPage`).
**Regla**: los valores de contexto que exponen funciones se memorizan (`useMemo` sobre `show`, que es `useCallback` estable). Y un efecto que dispara una petición no debe depender de funciones que disparen toasts sin estar memorizadas.
**Evidencia**: `src/components/Toast/useToast.tsx`, test "no debería volver a pedir la lista cuando la carga falla" en `src/pages/clients/ClientsPage.test.tsx`.

## Merge a `develop` no implica deploy a staging (2026-10-27)
**Problema**: el PR #28 (ADMIN-203) se mergeó a `develop` y staging no se desplegó. El auto-deploy de Railway estaba deshabilitado; el último deployment de staging era del 2026-10-15.
**Regla**: un merge no está entregado hasta que aparece un deployment nuevo en Railway para el ambiente correspondiente. Verificar con `railway deployment list -e staging` tras cada merge a `develop`.
**Excepción documentada**: deploy manual desde `develop` con link explícito (`railway link -s library-admin -e staging -p <project-id>`, luego `railway up -e staging`). `railway status` sin `-e` apunta a **production**.
**Evidencia**: `docs/DEPLOYMENT_PIPELINE.md` (estado del watcher), `railway deployment list -e staging`.

## Husky pre-commit reformatea los archivos staged (2026-10-27)
**Problema**: `.husky/pre-commit` ejecuta `eslint --fix` y `prettier --write` sobre los archivos staged. El contenido que se commitea puede diferir de lo que se escribió (comillas, saltos de línea de JSX), y el editor muestra el archivo "cambiado en disco".
**Regla**: tras un commit, releer el archivo antes de seguir editándolo. El formato del commit es el válido; no revertirlo a mano.
**Evidencia**: commits `c5af8c4` y `6afb5ae` de ADMIN-203 (`src/layout/Sidebar/index.tsx`, `src/layout/Layout.tsx`).

## `GET /credits?search=` compila regex sin escapar (2026-10-27)
**Problema**: `ListCreditAccounts` (`api/internal/service/credits/list-credit-accounts.ts`) hace `new RegExp(input.search, 'i')`. Un término con `(`, `+`, `[` o `\` lanza `SyntaxError` (500) o cambia el significado de la búsqueda.
**Solución**: el front escapa el término antes de enviarlo (`src/pages/credits/utils/debtorSearch.ts` → `toDebtorSearchTerm`). Si se consume este endpoint desde otro lugar, replicar el escape o arreglar el backend (escapar en el service).
**Evidencia**: `src/pages/credits/utils/debtorSearch.test.ts`, `src/pages/credits/CreditsPage.test.tsx` ("envía el término escapado").
