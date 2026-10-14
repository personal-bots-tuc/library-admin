# Changelog

All notable changes to this project will be documented in this format.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Login con bucle de recarga infinito (`GET /settings` → 401)** — `SchoolProvider` fetcheaba `/settings` (endpoint protegido con `authMiddleware + requireAdmin`) sin sesión desde el bootstrap, incluyendo la pantalla `/login`; el interceptor de axios respondía al 401 con `window.location.href = '/login'` (recarga dura incluso estando en `/login`), generando un loop que impedía iniciar sesión. Fixes: (1) `useSchool` solo fetchea settings cuando hay sesión (`isAuthenticated` de `useAuth`) y limpia el estado al cerrar sesión; (2) el interceptor 401 no limpia storage ni redirige cuando ya se está en `/login`. [ADMIN-109]

### Added
- **Products: botón "Imprimir listado" con columnas dinámicas** — Modal selector de columnas (default: Producto/Código/Tipo/Precio/Stock; opcionales: Costo, Margen) y reporte A4 portrait con TODOS los ítems de los filtros activos (búsqueda, tipo, solo stock bajo, orden). `src/pages/products/utils/printProductsReport.ts` + `components/PrintReportModal/` + botón en toolbar del listado. Nombre del negocio en header via `useSchool().schoolName`.
- **Settings: `labelBusinessName`** — Campo nuevo en Configuración → General para personalizar el nombre mostrado en etiquetas/impresiones. Fallback chain centralizado en `useSchool`: `school.name → settings.labelBusinessName → 'Mi Negocio'`. Tests de la cadena completa (`src/hooks/useSchool.test.tsx`).
- **Products: Preciero/PriceLabels tab** — Nueva pestaña en `/products/preciero` para impresión de etiquetas de precios en hojas A4 con presets 10/20/30 etiquetas por hoja, vista previa live y selección con cantidad configurable por producto. [ADMIN-105]
- **Hooks: useProducts / useAllProducts** — Hooks reutilizables para listado paginado (server-side) y catálogo completo (client-side, loop limit=100). Tests ≥80% coverage.
- **Routing anidado en Products** — `ProductsLayout` con tabs "Listado" | "Preciero" + `<Outlet>`, extracción de `ProductsListPage` desde `ProductsPage` original.
- Pipeline staging→production: workflow `smoke-staging.yml` (smoke tests automáticos post-deploy en staging), checklist de validación manual obligatorio (`docs/STAGING_VALIDATION_CHECKLIST.md`), PR template con sección RELEASE, branch protection (`develop`/`main`) y GitHub Environments (`staging`/`production`). [[ADMIN-100](https://github.com/personal-bots-tuc/library-admin/pull/2)], [[#3](https://github.com/personal-bots-tuc/library-admin/pull/3)]
- `docs/DEPLOYMENT_PIPELINE.md` — fuente de verdad del mecanismo de deploy de este repo. [ADMIN-102](https://github.com/personal-bots-tuc/library-admin/pull/5)

### Changed
- **ESLint**: regla base `no-unused-vars` desactivada — la reemplaza `@typescript-eslint/no-unused-vars` (recomendación oficial; la base disparaba falsos positivos en firmas de tipos TS).
- **ProductsPage**: refactor — estado/efectos extraídos a `hooks/useProductsList.ts` (debounce + microtasks conformes a `react-hooks/set-state-in-effect`), paginación extraída a `components/Pagination`, imports duplicados unificados, `err: any` → `unknown`. Complejidad del componente dentro de límites.

### Changed
- Dashboard: eliminada card `PaymentMethodBreakdown` (gráfico de torta con errores visuales); `ProfitabilityCard` ahora ocupa ancho completo en fila 2 para mejor legibilidad. [ADMIN-104](https://github.com/personal-bots-tuc/library-admin/pull/9)
- Initial Docker + Railway deployment setup
- Runtime configuration via nginx + envsubst
- Healthcheck endpoint /health
- GitHub Actions CI/CD pipeline
- Documentation structure (docs/agent/)
- Complete test suite (Vitest + React Testing Library)
- ESLint + Prettier + Husky tooling

### Changed
- Migrated from Vercel to Railway
- Unified package manager to npm
- Aligned TypeScript configs to project references
- Added comprehensive test coverage (≥80%)

### Fixed
- SPA routing in production via nginx try_files
- CORS configuration for preview deployments

## [1.0.0] - 2026-10-05
### Added
- Initial release# Auto-deploy validation jueves,  8 de octubre de 2026, 22:36:02 -03
