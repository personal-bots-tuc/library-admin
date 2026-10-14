import { NavLink, Outlet, useLocation } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { SearchProvider, useSearchContext } from './SearchContext';

function ProductsLayoutContent() {
  const location = useLocation();
  const { search, setSearch } = useSearchContext();
  const isListView = location.pathname === '/products';

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Productos"
        subtitle="Gestión de productos, servicios y etiquetas de precios"
        searchPlaceholder="Buscar productos..."
        searchValue={isListView ? search : ''}
        onSearchChange={isListView ? setSearch : undefined}
      />

      <nav className="flex gap-4 border-b border-neutral-200 pb-4" aria-label="Tabs de productos">
        <NavLink
          to="/products"
          end
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              isActive
                ? 'bg-primary-600 text-white'
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
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
                ? 'bg-primary-600 text-white'
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
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

export default function ProductsLayout() {
  return (
    <SearchProvider>
      <ProductsLayoutContent />
    </SearchProvider>
  );
}
