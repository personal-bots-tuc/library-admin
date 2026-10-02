import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { DisabledScreen } from "../components/shared/DisabledScreen";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDisabledScreen, setShowDisabledScreen] = useState(false);
  const [disabledVariant, setDisabledVariant] = useState<'admin' | 'pos'>('admin');
  const [disabledMessage, setDisabledMessage] = useState("");

  function extractErrorInfo(err: unknown): { code?: string; message: string } {
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response?: { data?: { error?: string; message?: string } } }).response;
      if (response?.data) {
        return {
          code: response.data.error,
          message: response.data.message || 'Error al iniciar sesión',
        };
      }
    }
    if (err instanceof Error) return { message: err.message };
    return { message: 'Error al iniciar sesión' };
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    setShowDisabledScreen(false);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const { code, message } = extractErrorInfo(err);
      if (code === 'SCHOOL_DISABLED' || code === 'POS_DISABLED') {
        setDisabledVariant(code === 'SCHOOL_DISABLED' ? 'admin' : 'pos');
        setDisabledMessage(message);
        setShowDisabledScreen(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (showDisabledScreen) {
    return (
      <DisabledScreen
        variant={disabledVariant}
        message={disabledMessage}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-800 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary-700/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm mx-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-5">
              <span className="text-white text-3xl font-extrabold">C</span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-1">Administración Central</h1>
            <p className="text-neutral-500">Panel de administración</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email <span className="text-danger-500">*</span>
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none"
                placeholder="admin@library.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Contraseña <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <span className="material-icons text-base">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="mt-1 text-xs text-neutral-500">Mínimo 8 caracteres</p>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                Recordarme
              </label>
              <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && <p className="text-sm text-danger-600 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 mt-1 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? "Verificando..." : (
                <>
                  Iniciar sesión
                  <span className="material-icons text-base">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} Panel de Administración
        </p>
        <p className="mt-1 text-center text-xs text-neutral-500">
          ¿Problemas para acceder? Contactá al administrador del sistema.
        </p>
      </div>
    </div>
  );
}
