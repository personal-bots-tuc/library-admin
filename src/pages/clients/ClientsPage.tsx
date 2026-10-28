import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { DataTable, type ColumnDef } from '../../components/DataTable';
import { CreateClientModal } from '../../components/CreateClientModal';
import { exportToCSV } from '../../lib/exportToCSV';
import { listClients, type Client, type ListClientsParams } from '../../api/clients';
import { useToast } from '../../components/Toast/useToast';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<ListClientsParams>({ page: 1, limit: 10 });
  const [reloadKey, setReloadKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { error: showError } = useToast();

  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      try {
        const result = await listClients(params);
        setClients(result.items || []);
      } catch {
        showError('No se pudieron cargar los clientes');
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, [params, reloadKey, showError]);

  const handleExport = () => {
    const flatClients = clients.map(c => ({
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

  const columns: ColumnDef<Client>[] = [
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
      cell: row => (
        <span className={`font-semibold ${row.balance < 0 ? 'text-red-500' : 'text-neutral-600'}`}>
          ${Math.abs(row.balance).toFixed(2)}
          {row.balance < 0 && (
            <span className="ml-1 text-xs font-normal bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
              Pendiente
            </span>
          )}
        </span>
      ),
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

  return (
    <div className="p-6">
      <PageHeader
        title="Clientes"
        primaryAction={{
          label: 'Nuevo cliente',
          icon: 'person_add',
          onClick: () => setIsModalOpen(true),
        }}
        secondaryAction={{ label: 'Exportar', icon: 'download', onClick: handleExport }}
      />

      <div className="my-6 flex gap-4 items-center bg-white p-4 rounded-xl border border-neutral-200">
        <input
          type="text"
          placeholder="Buscar clientes por nombre o DNI..."
          className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1 max-w-sm"
          onChange={e => setParams(p => ({ ...p, search: e.target.value, page: 1 }))}
        />
        <select
          className="px-4 py-2 border border-neutral-300 rounded-lg outline-none"
          onChange={e => {
            const val = e.target.value;
            setParams(p => ({ ...p, hasBalance: val === 'deudores' ? true : undefined, page: 1 }));
          }}
        >
          <option value="todos">Estado: Todos</option>
          <option value="deudores">Con Saldo Pendiente</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-neutral-500">Cargando clientes...</div>
      ) : (
        <DataTable data={clients} columns={columns} keyExtractor={row => row.id} pageSize={10} />
      )}

      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => setReloadKey(key => key + 1)}
      />
    </div>
  );
}
