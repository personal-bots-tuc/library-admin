# Changelog

All notable changes to this project will be documented in this format.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Products: botón "Imprimir listado"** — Genera reporte A4 portrait (tabla Producto/Código/Tipo/Precio/Costo/Margen/Stock) tomando TODOS los ítems de los filtros activos (búsqueda, tipo, solo stock bajo, orden). `src/pages/products/utils/printProductsReport.ts` + botón en toolbar del listado. Nombre del negocio en header via `useSchool().schoolName`.
- **Settings: `labelBusinessName`** — Campo nuevo en Configuración → General para personalizar el nombre mostrado en etiquetas/impresiones. Fallback chain centralizado en `useSchool`: `school.name → settings.labelBusinessName → 'Mi Negocio'`. Tests de la cadena completa (`src/hooks/useSchool.test.tsx`).
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
