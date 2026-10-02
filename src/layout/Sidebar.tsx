import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSchool } from "../hooks/useSchool";

const superAdminNav = [
  { to: "/admins", label: "Administradores", icon: "manage_accounts" },
  { to: "/schools", label: "Escuelas", icon: "school" },
  { to: "/bots", label: "Bots de ventas", icon: "smart_toy" },
];

const adminNav = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/products", label: "Productos", icon: "inventory_2" },
  { to: "/sales", label: "Ventas", icon: "receipt_long" },
  { to: "/clients", label: "Clientes", icon: "groups_2" },
  { to: "/credits", label: "Créditos", icon: "account_balance_wallet" },
  { to: "/cash-register", label: "Arqueo de Caja", icon: "account_balance" },
  { to: "/users", label: "Usuarios", icon: "people" },
  { to: "/pos", label: "POS", icon: "point_of_sale" },
  { to: "/bot", label: "Bot de ventas", icon: "smart_toy" },
  { to: "/settings", label: "Configuración", icon: "settings" },
];

export default function Sidebar() {
  const { user, logout, isSuperAdmin } = useAuth();
  const { schoolName } = useSchool();
  const nav = isSuperAdmin ? superAdminNav : adminNav;
  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="material-icons text-white text-lg">inventory_2</span>
          </div>
          <div>
            <p className="font-bold text-neutral-900 leading-tight">{schoolName}</p>
            <p className="text-xs text-neutral-500">Administración Central</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/bot"}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-3 my-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary-100 text-primary-800 border-l-4 border-primary-600"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`
            }
          >
            <span className="material-icons text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-bold text-primary-700">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-900 truncate">{user?.name ?? "Admin Demo"}</p>
            <p className="text-xs text-neutral-500">{user?.role?.toUpperCase() ?? "ADMIN"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-3 w-full text-left px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <span className="material-icons text-base">logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
