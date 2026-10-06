---
type: Contracts
version: <sha-corto>
validated: 2026-10-05
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
- `GET /products` → `Product[]` (filtros: search, category, page, limit)
- `GET /products/:id` → `Product`
- `POST /products` → `Product`
- `PUT /products/:id` → `Product`
- `DELETE /products/:id` → void

### Clients
- `GET /clients` → `Client[]` (search, page, limit)
- `GET /clients/:id` → `Client`
- `POST /clients` → `Client`
- `PUT /clients/:id` → `Client`
- `DELETE /clients/:id` → void

### Sales
- `GET /sales` → `Sale[]` (filtros: dateRange, clientId, status, page)
- `GET /sales/:id` → `Sale` (detalle completo para modal)
- `POST /sales` → `Sale` (desde POS, admin solo lectura)
- `POST /sales/:id/credit-note` → `CreditNote`

### Cash Shifts
- `GET /cash-shifts` → `CashShift[]` (filtros: dateRange, status, page)
- `GET /cash-shifts/current` → `CashShift | null`
- `GET /cash-shifts/:id` → `CashShift` (detalle con movimientos)
- `POST /cash-shifts/open` → `CashShift`
- `POST /cash-shifts/:id/close` → `CashShift`

### Cash Movements
- `GET /cash-movements` → `CashMovement[]` (filtros: shiftId, type, page)
- `POST /cash-movements` → `CashMovement` (type: income/expense, amount, reason)

### Credits (Devoluciones/Deudas)
- `GET /credits` → `Credit[]` (filtros: clientId, status, overdue, page)
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
- `GET /dashboard/stats` → `DashboardStats` (totalSales, totalRevenue, activeClients, lowStockCount)
- `GET /dashboard/sales-chart` → `SalesChartData[]`
- `GET /dashboard/top-products` → `TopProduct[]`
- `GET /dashboard/credit-summary` → `CreditSummary`
- `GET /dashboard/profitability` → `ProfitabilityData`

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