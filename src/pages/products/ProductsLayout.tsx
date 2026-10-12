import { NavLink, Outlet } from "react-router-dom";
import PageHeader from "../../components/PageHeader";

export default function ProductsLayout() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Productos"
        subtitle="Gestión de productos, servicios y etiquetas de precios"
        searchPlaceholder=""
        searchValue=""
        onSearchChange={() => {}}
      />

      <nav className="flex gap-4 border-b border-neutral-200 pb-4" aria-label="Tabs de productos">
        <NavLink
          to="/products"
          end
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              isActive
                ? "bg-primary-600 text-white"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
            }`
          }
        >
          Listado
        </NavLink>
        <NavLink
          to="/products/preciero"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              isActive
                ? "bg-primary-600 text-white"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
            }`
          }
        >
          Preciero
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}