import { useEffect, useState } from 'react';
import {
  listAccountants,
  createAccountant,
  updateAccountant,
  assignSchool,
  unassignSchool,
  type Accountant,
} from '../../api/accountants';
import { listSchools } from '../../api/schools';

interface SchoolOption {
  id: string;
  name: string;
  active?: boolean;
}

type ToastState = { message: string; kind: 'success' | 'error' } | null;
type ToastSetter = (toast: ToastState) => void;

function scheduleToast(
  setToast: ToastSetter,
  message: string,
  kind: 'success' | 'error' = 'success'
) {
  setToast({ message, kind });
  setTimeout(() => setToast(null), 3000);
}

function fetchData() {
  return Promise.all([listAccountants(), listSchools()] as const);
}

export default function AccountantsPage() {
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<Record<string, string>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  // Carga inicial: setState solo en callbacks de la promesa (regla react-hooks/set-state-in-effect).
  useEffect(() => {
    let cancelled = false;
    fetchData()
      .then(([items, schoolList]) => {
        if (cancelled) return;
        setAccountants(items);
        setSchools(schoolList.items);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        scheduleToast(
          setToast,
          'Error al cargar contadores (¿CONTAFLOW_ENABLED está activo?)',
          'error'
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = async () => {
    try {
      const [items, schoolList] = await fetchData();
      setAccountants(items);
      setSchools(schoolList.items);
    } catch {
      scheduleToast(setToast, 'Error al actualizar contadores', 'error');
    }
  };

  const handleCreate = async () => {
    setFormError(null);
    try {
      await createAccountant(form);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '' });
      scheduleToast(setToast, 'Contador creado');
      await reload();
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message;
      setFormError(message ?? 'No se pudo crear el contador');
    }
  };

  const handleToggleActive = async (accountant: Accountant) => {
    setBusyId(accountant.id);
    try {
      await updateAccountant(accountant.id, { active: !accountant.active });
      scheduleToast(setToast, accountant.active ? 'Contador desactivado' : 'Contador reactivado');
      await reload();
    } catch {
      scheduleToast(setToast, 'Error al actualizar el contador', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleAssign = async (accountant: Accountant) => {
    const schoolId = selectedSchool[accountant.id];
    if (!schoolId) return;
    setBusyId(accountant.id);
    try {
      await assignSchool(accountant.id, schoolId);
      scheduleToast(setToast, 'Escuela asignada');
      await reload();
    } catch {
      scheduleToast(setToast, 'Error al asignar la escuela', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleUnassign = async (accountant: Accountant, schoolId: string) => {
    setBusyId(accountant.id);
    try {
      await unassignSchool(accountant.id, schoolId);
      scheduleToast(setToast, 'Escuela desasignada');
      await reload();
    } catch {
      scheduleToast(setToast, 'Error al desasignar la escuela', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const availableSchoolsFor = (accountant: Accountant) =>
    schools.filter(
      s => s.active !== false && !accountant.assignments.some(a => a.schoolId === s.id)
    );

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-white border border-neutral-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl pb-24 relative">
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium shadow-md ${
            toast.kind === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Contadores</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Usuarios de ContaFlow: creá cada contador y asignale 1 o más escuelas (su cartera de
            clientes).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
        >
          <span className="material-icons text-base">person_add</span>
          Nuevo contador
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-6 py-3 font-medium">Contador</th>
              <th className="px-6 py-3 font-medium">Cartera de clientes</th>
              <th className="px-6 py-3 font-medium">Estado</th>
              <th className="px-6 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {accountants.map(accountant => {
              const available = availableSchoolsFor(accountant);
              return (
                <tr
                  key={accountant.id}
                  className="border-b border-neutral-100 last:border-0 align-top"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-neutral-900">{accountant.name}</p>
                    <p className="text-xs text-neutral-500">{accountant.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {accountant.assignments.map(assignment => (
                        <span
                          key={assignment.schoolId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"
                        >
                          {assignment.name}
                          <button
                            type="button"
                            disabled={busyId === accountant.id}
                            onClick={() => void handleUnassign(accountant, assignment.schoolId)}
                            className="hover:text-primary-900 disabled:opacity-40"
                            title="Quitar escuela"
                          >
                            <span className="material-icons text-xs">close</span>
                          </button>
                        </span>
                      ))}
                      {accountant.assignments.length === 0 && (
                        <span className="text-xs text-neutral-400">Sin escuelas asignadas</span>
                      )}
                    </div>
                    {available.length > 0 && (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedSchool[accountant.id] ?? ''}
                          onChange={e =>
                            setSelectedSchool(prev => ({
                              ...prev,
                              [accountant.id]: e.target.value,
                            }))
                          }
                          className="text-xs border border-neutral-300 rounded-lg px-2 py-1.5 bg-white"
                        >
                          <option value="">Asignar escuela…</option>
                          {available.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={busyId === accountant.id || !selectedSchool[accountant.id]}
                          onClick={() => void handleAssign(accountant)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40"
                        >
                          Asignar
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {accountant.active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        Desactivado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      disabled={busyId === accountant.id}
                      onClick={() => void handleToggleActive(accountant)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border disabled:opacity-40 ${
                        accountant.active
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-green-200 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {accountant.active ? 'Desactivar' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {accountants.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                  No hay contadores creados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-400 mt-3">
        Al desactivar un contador no puede iniciar sesión en ContaFlow; su cartera se conserva para
        reactivarlo. Cada contador ve solo las escuelas asignadas acá.
      </p>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Nuevo contador</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Nombre del estudio
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="GAN Consultora"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contador@estudio.com"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Contraseña (mín. 8 caracteres)
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              {formError && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleCreate()}
                className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
              >
                Crear contador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
