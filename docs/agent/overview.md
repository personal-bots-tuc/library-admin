---
type: Overview
version: <sha-corto>
validated: 2026-10-05
update_when: when purpose, capabilities, or ownership change
scope:
  - src/pages
  - src/components
  - src/hooks
  - src/api
---

# Overview - Library System Admin

## Purpose
Panel de administración para gestión completa del sistema de biblioteca escolar. Permite a directivos y bibliotecarios gestionar productos, clientes, ventas, créditos, turnos de caja, escuelas, usuarios y bots.

## Capabilities
- **Dashboard**: KPIs, gráficos de ventas, productos bajos de stock, resumen de créditos
- **Productos**: CRUD completo, categorías, stock, precios
- **Clientes**: CRUD, historial de compras, gestión de deudas
- **Ventas**: Listado, detalle, notas de crédito, filtros avanzados
- **Créditos**: Deudores, KPIs, badges, historial, liquidación de deudas
- **Caja**: Turnos, movimientos, arqueo, resumen diario
- **Escuelas**: Multi-tenant, configuración, cambio de escuela
- **Usuarios**: CRUD, roles, permisos, admins
- **Bots**: Configuración, métricas, entrenamiento, órdenes
- **Configuración**: Parámetros globales del sistema

## Users
- **Administradores**: Acceso completo (rol: admin)
- **Directivos**: Reportes y métricas (rol: director)
- **Bibliotecarios**: Gestión operativa (rol: librarian)
- **Sistema**: Consume API backend (Express + Mongoose)

## Tech Stack
- React 19 + TypeScript + Vite 6
- Tailwind CSS 4 + React Router 7
- Vitest + React Testing Library (≥80% coverage)
- ESLint (flat config) + Prettier + Husky
- Docker multi-stage (node:22 → nginx:alpine)
- Railway deployment (auto-deploy on push)

## Code Map
```
src/
├── pages/
│   ├── dashboard/     # Dashboard principal con KPIs y gráficos
│   ├── products/      # Gestión de productos
│   ├── clients/       # Gestión de clientes
│   ├── sales/         # Ventas y notas de crédito
│   ├── credits/       # Gestión de créditos/deudas
│   ├── cash-register/ # Turnos de caja y movimientos
│   ├── schools/       # Gestión multi-tenant escuelas
│   ├── users/         # Gestión de usuarios y admins
│   ├── bots/          # Configuración y métricas de bots
│   ├── settings/      # Configuración global
│   └── LoginPage.tsx
├── components/        # Shared UI (Toast, Modal, Table, Form, KPI cards, Charts)
├── hooks/             # Shared hooks (useAuth, useSchool, useToast)
├── api/               # Axios client + endpoints por dominio
├── test/              # Vitest setup + utils
└── main.tsx           # Entry point
```

## Ownership
- Team: Personal Bots TUC
- Maintainer: @ariel