---
type: Architecture
version: <sha-corto>
validated: 2026-10-27
update_when: when folder layout, layers, entrypoints, or critical flows change
scope:
  - src
  - vite.config.ts
  - Dockerfile
  - nginx.conf.template
  - entrypoint.sh
---

# Architecture - Library System Admin

## Layer Structure
```
src/
├── pages/           # Page components (route-level)
│   ├── dashboard/   # Dashboard + widgets
│   ├── products/    # Products CRUD + Preciero + impresión de listado
│   │   ├── ProductsLayout.tsx      # Tabs "Listado" | "Preciero" + <Outlet>
│   │   ├── ProductsListPage.tsx    # Listado paginado (useProducts) + botón imprimir (modal columnas)
│   │   ├── components/
│   │   │   └── PrintReportModal/       # Selector de columnas (default sin costo/margen)
│   │   ├── utils/printProductsReport.ts # Reporte A4 portrait (fetch all + registry de columnas + HTML print)
│   │   └── PriceLabelsPage/        # Preciero: etiquetas A4 10/20/30
│   │       ├── PriceLabelsPage.tsx
│   │       ├── components/         # PriceLabelsTable, PresetSelector, LabelPreview, etc.
│   │       ├── hooks/usePriceLabelsSelection.ts
│   │       ├── utils/printLabels.ts # window.open + inline CSS (patrón printTicket)
│   │       └── types.ts
│   ├── clients/     # Listado paginado (hooks/useClientsList), alta/edición (ClientFormModal), baja lógica con ConfirmModal
│   ├── sales/       # Sales + credit notes
│   ├── credits/     # Credits/debts management
│   ├── cash-register/ # Arqueo de caja: index.tsx (página), components/ (carpeta por componente), hooks/ (lista paginada, resumen, movimientos), utils/ (fechas, tabs, CSV)
│   ├── schools/     # Schools multi-tenant
│   ├── settings/    # Global settings
│   │   ├── ConfigPage.tsx          # Orquestador declarativo
│   │   └── hooks/useSettingsConfig/ # Estado de settings (load/save/discard)
│   └── users/       # Users + admins
├── layout/          # Shell autenticado
│   ├── Layout.tsx   # Header + <main>; monta Sidebar
│   └── Sidebar/     # Barra lateral plegable (index.tsx + types.ts)
│                    #   Estado "plegada" en localStorage `sidebarCollapsed`
├── components/      # Shared presentational components
├── hooks/           # Shared logic hooks (state, effects)
│   ├── useAuth.tsx  # Auth context (JWT, roles)
│   ├── useSchool/   # School context + schoolName con fallback chain
│   │                #   (school.name → settings.labelBusinessName → 'Mi Negocio')
│   ├── useProducts/      # Listado paginado server-side (debounce, filtros, sort)
│   └── useAllProducts/   # Catálogo completo client-side (loop limit=100)
├── api/             # API client + endpoint wrappers
│   ├── settings/    # Settings (JSON genérico; incluye labelBusinessName)
│   └── products/    # Products (list/counts/CRUD)
├── test/            # Test utilities + setup
└── main.tsx         # App bootstrap
```

## Convenciones de código
- **Componentes nuevos**: `const` + arrow function, export nombrado (`export const X = () => {}`), en carpeta propia con `index.tsx` + `types.ts`. Las interfaces de props y tipos van en `types.ts`, nunca en el mismo archivo del componente.
- **Código existente**: la mayoría de archivos aún usa `function` declarations. No reescribirlos solo por estilo; migrar cuando se toquen por otra razón.
- **Comentarios**: solo cuando explican un porqué no obvio. No describir lo que el código ya dice.

## Entry Points
- **Development**: `vite` (port 5174, proxy /api → localhost:3000)
- **Production**: `nginx` (port 5174, serves `dist/`, SPA fallback)
- **Docker Build**: `npm run build` → `dist/` → nginx static serve

## Critical Flows

### 1. Bootstrap
```
main.tsx → AuthProvider → SchoolProvider → ToastProvider → BrowserRouter → App
```

### 2. Data Fetching Pattern
```
Page Component → Custom Hook (useProducts, useClients, etc.) → API Client (axios) → Backend
                                    ↓
                              React Query / SWR pattern (manual)
                                    ↓
                              State + Loading + Error handling
                                    ↓
                              UI Render
```

### 3. Auth Flow
```
useAuth → API /auth/login → JWT en localStorage → axios interceptor adjunta Bearer
         → 401 → refresh token → retry
```

### 4. School Context (Multi-tenant)
```
SchoolProvider → Decodifica JWT → x-school-id header en axios
              → Contexto reactivo para toda la app
              → SchoolSwitch para cambiar escuela activa
```

## Data Flow
```
User Action → Page → Hook (use*) → API Client (axios) → Backend (Express) → MongoDB
                                    ↓
                              Response → Hook State → UI Update
```

## Deployment Architecture
```
GitHub Push → GitHub Actions (lint, test, build, push GHCR)
                    ↓
              Railway Auto-deploy (detecta imagen nueva)
                    ↓
              Docker: entrypoint.sh → envsubst config.js + nginx.conf
                    ↓
              nginx:80 → SPA + /health + /config.js
                    ↓
              Railway Proxy → Custom Domain (admin.tudominio.com)
```

## Security Boundaries
- **Frontend**: Solo variables `VITE_*` públicas (API URL, POS URL)
- **Secrets**: JWT, DB, MP tokens → SOLO en backend
- **CORS**: Backend permite origins de frontend (prod + staging + *.railway.app)
- **Auth**: JWT en localStorage + refresh token rotation
- **RBAC**: Roles verificados en frontend (UI) + backend (API)