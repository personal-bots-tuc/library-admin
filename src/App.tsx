import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Layout from './layout/Layout';
import DashboardPage from './pages/dashboard';
import ProductsLayout from './pages/products/ProductsLayout';
import ProductsListPage from './pages/products/ProductsListPage';
import SalesPage from './pages/sales/SalesPage';
import ClientesPage from './pages/clients/ClientsPage';
import CreditosPage from './pages/credits/CreditsPage';
import ArqueoPage from './pages/cash-register/CashRegisterPage';
import UsuariosPage from './pages/users/UsersPage';
import ConfigPage from './pages/settings/ConfigPage';
import PriceLabelsPage from './pages/products/PriceLabelsPage/PriceLabelsPage';
import BotPage from './pages/bot/BotPage';
import BotConfigTab from './pages/bot/BotConfigTab';
import MessagesPage from './pages/bot/MessagesPage';
import BotTrainingTab from './pages/bot/BotTrainingTab';
import BotOrdersPage from './pages/bot/BotOrdersPage';
import BotMetricsTab from './pages/bot/BotMetricsTab';
import AdminsPage from './pages/admins/AdminsPage';
import PosPage from './pages/pos/PosPage';
import SchoolsPage from './pages/schools/SchoolsPage';
import BotsPage from './pages/bots/BotsPage';
import AccountantsPage from './pages/accountants/AccountantsPage';

type RouteDef = { path: string; element: ReactNode; children?: RouteDef[] };

const protectedRoutes: RouteDef[] = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard', element: <DashboardPage /> },
  {
    path: '/products',
    element: <ProductsLayout />,
    children: [
      { path: '', element: <ProductsListPage /> },
      { path: 'preciero', element: <PriceLabelsPage /> },
    ],
  },
  { path: '/sales', element: <SalesPage /> },
  { path: '/clients', element: <ClientesPage /> },
  { path: '/credits', element: <CreditosPage /> },
  { path: '/cash-register', element: <ArqueoPage /> },
  { path: '/users', element: <UsuariosPage /> },
  {
    path: '/bot',
    element: <BotPage />,
    children: [
      { path: '', element: <BotConfigTab /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'training', element: <BotTrainingTab /> },
      { path: 'orders', element: <BotOrdersPage /> },
      { path: 'metrics', element: <BotMetricsTab /> },
    ],
  },
  { path: '/settings', element: <ConfigPage /> },
  { path: '/schools', element: <SchoolsPage /> },
];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {protectedRoutes.map(r => (
        <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element!}</ProtectedRoute>}>
          {(r.children ?? []).map(c => (
            <Route key={c.path} path={c.path} element={c.element} />
          ))}
        </Route>
      ))}
      <Route
        path="/admins"
        element={
          <SuperAdminRoute>
            <AdminsPage />
          </SuperAdminRoute>
        }
      />
      <Route
        path="/bots"
        element={
          <SuperAdminRoute>
            <BotsPage />
          </SuperAdminRoute>
        }
      />
      <Route
        path="/accountants"
        element={
          <SuperAdminRoute>
            <AccountantsPage />
          </SuperAdminRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <PosPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
