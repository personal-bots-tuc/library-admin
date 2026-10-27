import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSchool } from '../hooks/useSchool';

const SIDEBAR_STORAGE_KEY = 'sidebarCollapsed';

const superAdminNav = [
  { to: '/admins', label: 'Administradores', icon: 'manage_accounts' },
  { to: '/schools', label: 'Escuelas', icon: 'school' },
  { to: '/bots', label: 'Bots de ventas', icon: 'smart_toy' },
  { to: '/accountants', label: 'Contadores', icon: 'calculate' },
];

const adminNav = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/products', label: 'Productos', icon: 'inventory_2' },
  { to: '/sales', label: 'Ventas', icon: 'receipt_long' },
  { to: '/clients', label: 'Clientes', icon: 'groups_2' },
  { to: '/credits', label: 'Créditos', icon: 'account_balance_wallet' },
  { to: '/cash-register', label: 'Arqueo de Caja', icon: 'account_balance' },
  { to: '/users', label: 'Usuarios', icon: 'people' },
  { to: '/pos', label: 'POS', icon: 'point_of_sale' },
  { to: '/bot', label: 'Bot de ventas', icon: 'smart_toy' },
  { to: '/settings', label: 'Configuración', icon: 'settings' },
];

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  } catch {
    // Sin almacenamiento disponible la preferencia dura solo la sesión actual.
  }
}

function getInitials(name: string | undefined): string {
  if (!name) return 'AD';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface BrandProps {
  collapsed: boolean;
  schoolName: string;
  onToggle: () => void;
}

function SidebarBrand({ collapsed, schoolName, onToggle }: BrandProps) {
  return (
    <div
      className={`p-4 border-b border-neutral-200 flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}
    >
      <div className="w-9 h-9 shrink-0 rounded-lg bg-primary-600 flex items-center justify-center">
        <span className="material-icons text-white text-lg">inventory_2</span>
      </div>
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="font-bold text-neutral-900 leading-tight truncate">{schoolName}</p>
          <p className="text-xs text-neutral-500">Administración Central</p>
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
        title={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
        className="p-1.5 shrink-0 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
      >
        <span className="material-icons text-base">
          {collapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>
    </div>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  icon: string;
  end: boolean;
  collapsed: boolean;
}

function SidebarNavItem({ to, label, icon, end, collapsed }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        `flex items-center gap-3 my-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
          collapsed ? 'mx-2 justify-center' : 'mx-3 px-3'
        } ${
          isActive
            ? `bg-primary-100 text-primary-800 ${collapsed ? '' : 'border-l-4 border-primary-600'}`
            : 'text-neutral-600 hover:bg-neutral-100'
        }`
      }
    >
      <span className="material-icons text-base shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

interface FooterProps {
  collapsed: boolean;
  name: string;
  role: string;
  initials: string;
  onLogout: () => void;
}

function SidebarFooter({ collapsed, name, role, initials, onLogout }: FooterProps) {
  return (
    <div className="p-4 border-t border-neutral-200">
      <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div
          className="w-10 h-10 shrink-0 rounded-full bg-primary-100 flex items-center justify-center"
          title={name}
        >
          <span className="text-sm font-bold text-primary-700">{initials}</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-900 truncate">{name}</p>
            <p className="text-xs text-neutral-500">{role}</p>
          </div>
        )}
      </div>
      <button
        onClick={onLogout}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className={`mt-3 w-full px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-2 ${
          collapsed ? 'justify-center' : 'text-left'
        }`}
      >
        <span className="material-icons text-base">logout</span>
        {!collapsed && 'Cerrar sesión'}
      </button>
    </div>
  );
}

export default function Sidebar() {
  const { user, logout, isSuperAdmin } = useAuth();
  const { schoolName } = useSchool();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const nav = isSuperAdmin ? superAdminNav : adminNav;

  useEffect(() => {
    writeCollapsed(collapsed);
  }, [collapsed]);

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0 overflow-hidden transition-[width] duration-200`}
    >
      <SidebarBrand
        collapsed={collapsed}
        schoolName={schoolName}
        onToggle={() => setCollapsed(value => !value)}
      />

      <nav className="flex-1 py-2">
        {nav.map(item => (
          <SidebarNavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            end={item.to === '/bot'}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <SidebarFooter
        collapsed={collapsed}
        name={user?.name ?? 'Admin Demo'}
        role={user?.role?.toUpperCase() ?? 'ADMIN'}
        initials={getInitials(user?.name)}
        onLogout={logout}
      />
    </aside>
  );
}
