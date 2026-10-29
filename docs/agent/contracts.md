---
type: Contracts
version: <sha-corto>
validated: 2026-10-29
update_when: when API contracts, env vars, or external dependencies change
scope:
  - src/api/
  - src/hooks/useAuth.ts
  - src/hooks/useSchool.ts
  - vite.config.ts
  - .env.example
---

# Contracts - Library System Admin

## Consumed APIs (Backend)

### Auth
- `POST /auth/login` → `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` → `{ accessToken }`
- `POST /auth/logout` → void

### Schools (Contexto multi-tenant)
- `GET /schools/current` → `{ id, name, settings }`
- `GET /schools` → `School[]`
- `POST /schools` → `School`
- `PUT /schools/:id` → `School`
- `DELETE /schools/:id` → void
- Headers: `x-school-id` (desde JWT)

### Products
- `GET /products` → `Product[]` (filtros: search, categoryId, type, lowStock, page, limit, sortBy, sortOrder)
- `GET /products/:id` → `Product`
- `POST /products` → `Product` (body incluye `categoryId?`: string o clave omitida; **`null` → 400**)
- `PATCH /products/:id` → `Product` (body parcial; mismo criterio para `categoryId?`)
- `DELETE /products/:id` → void
- Error de validación (400): `{ error: "VALIDATION_ERROR", message, details: { "body.<campo>": string[] } }`. El form muestra `details` por campo con `getApiFieldErrors` (`src/lib/apiError.ts`) y el `message` en el toast.
- `Product` shape: `{ id, name, description?, type, price, cost?, stock, minStock?, unit?, code?, active, categoryId?, createdAt, updatedAt }`

### Categories
- `GET /categories` → `Category[]` (filtros: activeOnly)
- `GET /categories/:id` → `Category`
- `POST /categories` → `Category` (body: `name`, `description?`, `order?`)
- `PATCH /categories/:id` → `Category` (el admin todavía no lo consume: no hay edición de categorías en el front)
- `DELETE /categories/:id` → void
- `Category` shape: `{ id, name, description?, active, order?, createdAt, updatedAt }`

### Clients
- `GET /clients` → `ClientListResponse` `{ items: Client[], total, page, limit, totalPages }` (search, page, limit, hasDebt, active, sortBy: fullName|dni|balance|createdAt, sortOrder). `hasBalance` no existe en el backend: se ignora en silencio.
- `GET /clients/:id` → `Client`
- `POST /clients` → `Client` (body `{ fullName, dni, phone? }`; 409 si el DNI ya existe en la escuela)
- `PATCH /clients/:id` → `Client` (solo admin; body `fullName`, `phone`, `dni`, `active`; 409 si el DNI ya existe). El admin usa `active: false` para "desactivar" (baja lógica).
- `DELETE /clients/:id` → 204 (solo admin; borrado definitivo). El admin NO lo usa: ver `traps.md`.

### Sales
- `GET /sales` → `Sale[]` (filtros: dateRange, clientId, status, page)
- `GET /sales/:id` → `Sale` (detalle completo para modal)
- `POST /sales` → `Sale` (desde POS, admin solo lectura)
- `POST /sales/:id/credit-note` → `CreditNote`

### Cash Shifts
- `GET /cash-shifts` → `CashShiftListResult` (`items`, `total`, `page`, `limit`, `totalPages`; filtros: `page`, `limit` (1-100, default 20), `status`, `hasDifference`, `sellerId`, `fromDate`, `toDate`, `sortBy` (`openedAt|closedAt`), `sortOrder`). `hasDifference` no pasa por zod y, sin `status=closed`, devuelve también turnos abiertos (ver `traps.md`).
- `GET /cash-shifts/active` → turno abierto actual o `null`
- `GET /cash-shifts/summary/daily` → `DailySummary` (acepta `date`; el front no lo envía, usa hoy)
- `GET /cash-shifts/:id` → `CashShift`
- `GET /cash-shifts/:id/detail` → `CashShiftDetail` (ventas, movimientos y agregados del turno)
- `POST /cash-shifts/:id/close` → `CashShiftDetail` (`closingAmount`, `note` obligatoria si hay diferencia)
- `GET /cash-shifts/:id/movements` y `GET /cash-shifts/:id/movements/aggregated`

### Cash Movements
- `GET /cash-movements` → `CashMovementListResult` (`page`, `limit`, `cashShiftId`, `type` (`in|out`), `category`, `sellerId`, `fromDate`, `toDate`, `sortBy`, `sortOrder`)
- `DELETE /cash-movements/:id` (solo admin/superadmin desde la UI)

### Credits (Devoluciones/Deudas)
- `GET /credits` → `Credit[]` (filtros: clientId, status, overdue, page)
- `GET /credits?search=&limit=` → `CreditsListResult` (consumido por `CreditsPage`; `search` filtra `fullName`/`dni` y se compila como `RegExp` en backend, ver `traps.md`)
- `GET /credits/kpis` → `CreditKPIs` (totalDebt, overdueCount, avgDaysOverdue)
- `GET /credits/:id` → `Credit`
- `POST /credits` → `Credit` (desde POS)
- `POST /credits/:id/settle` → `Credit` (liquidar deuda)
- `GET /credits/history/:clientId` → `Credit[]`

### Users/Admins
- `GET /users` → `User[]` (filtros: role, schoolId, page)
- `POST /users` → `User`
- `PUT /users/:id` → `User`
- `DELETE /users/:id` → void
- `GET /admins` → `Admin[]`
- `POST /admins` → `Admin`
- `PUT /admins/:id` → `Admin`
- `DELETE /admins/:id` → void

### Bots
- `GET /bots` → `Bot[]`
- `GET /bots/:id` → `Bot`
- `POST /bots` → `Bot`
- `PUT /bots/:id` → `Bot`
- `GET /bots/:id/metrics` → `BotMetrics`
- `GET /bots/:id/orders` → `BotOrder[]`
- `POST /bots/:id/train` → `BotTrainingResult`

### Dashboard
- `GET /dashboard/overview?from&to` → `DashboardOverview`. `lowStock` y `credit.clients` vienen acotados a 10; `lowStockTotal` y `credit.clientsWithDebt` son los totales reales (`lowStockTotal` es opcional: falta en APIs previas a API-201).
- Modales "Ver todos": `GET /products?lowStock=true&active=true&type=product` (mismo criterio que el overview) y `GET /credits?sortBy=balance&sortOrder=desc`, paginados.

### Settings
- `GET /settings` → `Settings`
- `PUT /settings` → `Settings`

## Environment Variables (Runtime via config.js)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ | Base URL del API backend | `https://api.tudominio.com` |
| `VITE_APP_NAME` | ❌ | Nombre mostrado en UI | `Library System Admin` |
| `VITE_POS_BASE_URL` | ✅ | URL del POS (para links cruzados) | `https://pos.tudominio.com` |

## External Dependencies
- **MercadoPago**: Solo backend (webhook + SDK)
- **Cloudinary**: Solo backend (upload imágenes)
- **Nodemailer**: Solo backend (emails)
- **OpenAI/Z.ai**: Solo backend (IA)

## Build-time Variables (vite define)
```typescript
define: {
  'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || '/api'),
  'import.meta.env.VITE_POS_BASE_URL': JSON.stringify(process.env.VITE_POS_BASE_URL || ''),
}
```

## Compatibility Rules
- **Breaking changes**: Requiere coordinación con backend + POS + bot
- **Versioning**: API versionada en URL (`/api/v1/...`)
- **Deprecation**: 2 versiones mínimas soportadas
- **Multi-tenant**: Todas las respuestas filtradas por `x-school-id`