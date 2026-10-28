import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { DataTable, type ColumnDef } from '../../components/DataTable';
import { ClientFormModal } from '../../components/ClientFormModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast/useToast';
import { exportToCSV } from '../../lib/exportToCSV';
import { getApiErrorMessage } from '../../lib/apiError';
import { updateClient, type Client } from '../../api/clients';
import { useAuth } from '../../hooks/useAuth';
import { useClientsList } from './hooks/useClientsList';

const ACTION_BUTTON_CLASS =
  'ml-1 text-neutral-400 hover:bg-neutral-100 p-1 rounded-lg transition-colors disabled:opacity-40';

export default function ClientsPage() {
  const list = useClientsList();
  const { isAdmin, isSuperAdmin } = useAuth();
  const canManage = isAdmin || isSuperAdmin;
  const { success, error: showError } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [deactivateTarget, setDeactivateTarget] = useState<Client | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const openCreateForm = () => {
    setEditingClient(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const setClientActive = async (client: Client, active: boolean) => {
    setUpdatingId(client.id);
    try {
      await updateClient(client.id, { active });
      success(
        active
          ? `Cliente "${client.fullName}" reactivado`
          : `Cliente "${client.fullName}" desactivado`
      );
      list.refetch();
    } catch (err) {
      showError(getApiErrorMessage(err, 'No se pudo actualizar el cliente'));
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    await setClientActive(deactivateTarget, false);
    setDeactivateTarget(null);
  };

  const handleExport = () => {
    const flatClients = list.clients.map(c => ({
      ID: c.id,
      Nombre: c.fullName,
      DNI: c.dni || '',
      Telefono: c.phone || '',
      Deuda: c.balance,
      Estado: c.active ? 'Activo' : 'Inactivo',
      EsConsumidorFinal: c.isDefault ? 'SI' : 'NO',
    }));
    exportToCSV(flatClients, 'directorio_clientes');
  };

  const baseColumns: ColumnDef<Client>[] = [
    {
      header: 'Cliente',
      cell: row => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
            {row.fullName.substring(0, 2)}
          </div>
          <div>
            <div className="font-semibold text-neutral-900 flex items-center gap-2">
              {row.fullName}
              {row.isDefault && (
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                  Final
                </span>
              )}
            </div>
            <div className="text-xs text-neutral-500">DNI: {row.dni || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    { header: 'Celular', accessorKey: 'phone', cell: row => row.phone || '-' },
    {
      header: 'Deuda',
      cell: row => {
        const hasDebt = row.balance > 0;
        return (
          <span className={`font-semibold ${hasDebt ? 'text-red-500' : 'text-neutral-600'}`}>
            ${Math.abs(row.balance).toFixed(2)}
            {hasDebt && (
              <span className="ml-1 text-xs font-normal bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                Pendiente
              </span>
            )}
          </span>
        );
      },
    },
    {
      header: 'Estado',
      cell: row =>
        row.active ? (
          <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
            Activo
          </span>
        ) : (
          <span className="text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full text-xs font-medium">
            Inactivo
          </span>
        ),
    },
  ];

  const actionsColumn: ColumnDef<Client> = {
    header: 'Acciones',
    className: 'text-right',
    cell: row => {
      if (row.isDefault) return <span className="text-neutral-300">—</span>;
      const busy = updatingId === row.id;
      return (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => openEditForm(row)}
            disabled={busy}
            aria-label={`Editar ${row.fullName}`}
            className={`${ACTION_BUTTON_CLASS} hover:text-primary-600 hover:bg-primary-50`}
          >
            <span className="material-icons text-sm">edit</span>
          </button>
          {row.active ? (
            <button
              type="button"
              onClick={() => setDeactivateTarget(row)}
              disabled={busy}
              aria-label={`Desactivar ${row.fullName}`}
              className={`${ACTION_BUTTON_CLASS} hover:text-danger-600 hover:bg-danger-50`}
            >
              <span className="material-icons text-sm">person_off</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setClientActive(row, true)}
              disabled={busy}
              aria-label={`Reactivar ${row.fullName}`}
              className={`${ACTION_BUTTON_CLASS} hover:text-green-600 hover:bg-green-50`}
            >
              <span className="material-icons text-sm">restore</span>
            </button>
          )}
        </div>
      );
    },
  };

  const columns = canManage ? [...baseColumns, actionsColumn] : baseColumns;

  return (
    <div className="p-6">
      <PageHeader
        title="Clientes"
        primaryAction={{ label: 'Nuevo cliente', icon: 'person_add', onClick: openCreateForm }}
        secondaryAction={{ label: 'Exportar', icon: 'download', onClick: handleExport }}
      />

      <div className="my-6 flex gap-4 items-center bg-white p-4 rounded-xl border border-neutral-200">
        <input
          type="text"
          placeholder="Buscar clientes por nombre o DNI..."
          value={list.search}
          onChange={e => list.setSearch(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1 max-w-sm"
        />
        <select
          value={list.hasDebt ? 'deudores' : 'todos'}
          onChange={e => list.setHasDebt(e.target.value === 'deudores')}
          className="px-4 py-2 border border-neutral-300 rounded-lg outline-none"
        >
          <option value="todos">Estado: Todos</option>
          <option value="deudores">Con Saldo Pendiente</option>
        </select>
      </div>

      {list.loading ? (
        <div className="text-center py-10 text-neutral-500">Cargando clientes...</div>
      ) : (
        <DataTable
          data={list.clients}
          columns={columns}
          keyExtractor={row => row.id}
          pagination={{
            page: list.page,
            pageSize: list.pageSize,
            total: list.total,
            onPageChange: list.setPage,
          }}
        />
      )}

      <ClientFormModal
        key={editingClient?.id ?? 'new'}
        isOpen={isFormOpen}
        client={editingClient}
        onClose={() => setIsFormOpen(false)}
        onSaved={list.refetch}
      />

      <ConfirmModal
        isOpen={deactivateTarget !== null}
        title="Desactivar cliente"
        message={
          deactivateTarget
            ? `¿Desactivar a "${deactivateTarget.fullName}"?${
                deactivateTarget.balance > 0 ? ' Tiene deuda pendiente.' : ''
              }`
            : ''
        }
        variant="warning"
        confirmLabel="Desactivar"
        loading={deactivateTarget !== null && updatingId === deactivateTarget.id}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
