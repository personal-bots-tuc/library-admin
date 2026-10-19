import { useEffect, useState } from 'react';
import {
  listSchoolReports,
  schoolReportPdfUrl,
  type SchoolReportRow,
} from '../../api/schoolReports';
import { MONTHS } from '../../api/schoolReports/types';
import { downloadFile } from '../../lib/download';

const FECHA = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export default function SchoolReportsPage() {
  const [reports, setReports] = useState<SchoolReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSchoolReports()
      .then(items => {
        if (!cancelled) setReports(items);
      })
      .catch(() => {
        if (!cancelled)
          setError('No se pudieron cargar los informes (¿ContaFlow está habilitado?)');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Informes del contador</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Informes mensuales generados por tu contador para esta escuela. Vista de solo lectura:
          para consultas, contactá a tu contador.
        </p>
      </div>

      {loading && (
        <div className="h-48 bg-white border border-neutral-200 rounded-xl animate-pulse" />
      )}

      {!loading && error && (
        <div className="rounded-xl bg-red-50 text-red-700 p-4 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-6 py-3 font-medium">Periodo</th>
                <th className="px-6 py-3 font-medium">Generado</th>
                <th className="px-6 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.periodId} className="border-b border-neutral-100 last:border-0">
                  <td className="px-6 py-4 font-medium text-neutral-900">
                    {MONTHS[report.month - 1]} {report.year}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    {FECHA.format(new Date(report.generatedAt))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        void downloadFile(schoolReportPdfUrl(report.periodId), 'informe.pdf')
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline"
                    >
                      <span className="material-icons text-sm">download</span>
                      Ver PDF
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-neutral-500">
                    Todavía no hay informes generados para tu escuela.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
