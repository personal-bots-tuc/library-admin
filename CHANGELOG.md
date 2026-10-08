# Changelog

All notable changes to this project will be documented in this format.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Pipeline staging→production: workflow `smoke-staging.yml` (smoke tests automáticos post-deploy en staging), checklist de validación manual obligatorio (`docs/STAGING_VALIDATION_CHECKLIST.md`), PR template con sección RELEASE, branch protection (`develop`/`main`) y GitHub Environments (`staging`/`production`). [[ADMIN-100](https://github.com/personal-bots-tuc/library-admin/pull/2)], [[#3](https://github.com/personal-bots-tuc/library-admin/pull/3)]
- `docs/DEPLOYMENT_PIPELINE.md` — fuente de verdad del mecanismo de deploy de este repo. [ADMIN-102](https://github.com/personal-bots-tuc/library-admin/pull/TBD)
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
- Initial release